import * as THREE from "three";
import type { GalleryItem } from "../../lib/gallery";
import { loadPixels, type Pixels } from "./images";
import { clamp, lightboxInsets } from "./layout";
import * as glsl from "./shaders";

/**
 * The lightbox's depth view on its own, for the grid: the shader the corridor hands off to, on a canvas of its own laid
 * over the dialog's <img>. Nothing is loaded until a photo is opened; then only that photo's lg texture and depth map,
 * plus its two neighbours, fetched and decoded ahead so browsing cross-fades at once. The loop runs only while the
 * dialog shows a photo. The <img> stays underneath and carries the photo whenever the depth view can't: still loading,
 * no depth map, or a texture that failed (e.g. no CORS).
 *
 * Nothing heavy happens while something moves: a neighbour reaches the GPU only when it's shown, and a photo's depth
 * effect starts only once the canvas fully covers the <img>, so the two are identical while one fades over the other.
 */

THREE.ColorManagement.enabled = false;

/** Same as the corridor's lightbox, so a photo moves the same way in both views. */
const STRENGTH = 0.03;
const SWAP_MS = 1300;
/** The canvas fades in flat over the same photo, so this only hides tiny resampling differences. */
const FADE_MS = 400;

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

function blankTexture(value: number) {
  const tex = new THREE.DataTexture(new Uint8Array([value, value, value, 255]), 1, 1);
  tex.needsUpdate = true;
  return tex;
}

type Loaded = { map: THREE.Texture; depth: THREE.Texture; aspect: number; focus: number };
type Decoded = { map: Pixels; depth: Pixels; aspect: number; focus: number };
/** One photo: fetched and decoded ahead (off the main thread), uploaded to the GPU only when shown. */
type Entry = { decoded: Promise<Decoded | null>; settled?: Decoded | null; gpu?: Loaded };

export function createDepthViewer(dialog: HTMLDialogElement, items: GalleryItem[]) {
  const canvas = document.createElement("canvas");
  canvas.className = "lightbox-canvas";
  canvas.setAttribute("aria-hidden", "true");
  // After the <img>, so it paints over it while fading in.
  (dialog.querySelector("[data-lightbox-stage]") ?? dialog).append(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const blank: Loaded = { map: blankTexture(0), depth: blankTexture(128), aspect: 1.5, focus: 0.5 };
  const uniforms = {
    uMapA: { value: blank.map },
    uDepthA: { value: blank.depth },
    uAspectA: { value: blank.aspect },
    uFocusA: { value: blank.focus },
    uMapB: { value: blank.map },
    uDepthB: { value: blank.depth },
    uAspectB: { value: blank.aspect },
    uFocusB: { value: blank.focus },
    uMix: { value: 0 },
    uOpacity: { value: 0 },
    uCanvas: { value: new THREE.Vector2(1, 1) },
    uInset: { value: new THREE.Vector4() },
    uPointer: { value: new THREE.Vector2() },
    uStrength: { value: 0 },
    uTime: { value: 0 },
  };
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: glsl.screenVertex,
      fragmentShader: glsl.viewerFragment,
      transparent: true,
      depthTest: false,
    }),
  );
  quad.frustumCulled = false;
  scene.add(quad);
  // Compile while the first photo downloads, not on the fade's first frame. compileAsync only helps (and otherwise warns)
  // where the browser compiles in parallel.
  if (renderer.extensions.has("KHR_parallel_shader_compile")) {
    void renderer.compileAsync(scene, camera).catch(() => {});
  } else {
    renderer.compile(scene, camera);
  }

  function texture(pixels: Pixels, color: boolean) {
    const tex = new THREE.Texture(pixels.image);
    tex.flipY = pixels.flipY;
    if (color) {
      tex.anisotropy = anisotropy;
    } else {
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
    }
    tex.needsUpdate = true;
    renderer.initTexture(tex);
    return tex;
  }

  // ---------- Photos: the one on screen and its neighbours are decoded; only what's shown is on the GPU ----------

  const entries = new Map<number, Entry>();

  function fetchPhoto(index: number) {
    const known = entries.get(index);
    if (known) {
      return known;
    }
    const item = items[index];
    const entry: Entry = {
      decoded: item?.depth
        ? Promise.all([loadPixels(item.lg), loadPixels(item.depth)]).then(
            ([map, depth]): Decoded => ({
              map,
              depth,
              aspect: map.width / map.height || item.aspect,
              focus: item.focus,
            }),
            () => null,
          )
        : Promise.resolve(null),
    };
    void entry.decoded.then((d) => (entry.settled = d));
    entries.set(index, entry);
    return entry;
  }

  /** The photo's textures, uploaded now if they aren't yet. null = no depth view for it. */
  function upload(entry: Entry) {
    const d = entry.settled;
    if (!d) {
      return null;
    }
    entry.gpu ??= { map: texture(d.map, true), depth: texture(d.depth, false), aspect: d.aspect, focus: d.focus };
    return entry.gpu;
  }

  function dropExcept(keep: number) {
    const n = items.length;
    for (const [index, entry] of entries) {
      const distance = Math.min(Math.abs(index - keep), n - Math.abs(index - keep));
      if (distance > 1) {
        entries.delete(index);
        void entry.decoded.then((d) => {
          entry.gpu?.map.dispose();
          entry.gpu?.depth.dispose();
          d?.map.close();
          d?.depth.close();
        });
      }
    }
  }

  function prefetchAround(index: number) {
    const n = items.length;
    fetchPhoto((index + 1) % n);
    fetchPhoto((index - 1 + n) % n);
  }

  function assign(slot: "A" | "B", t: Loaded) {
    uniforms[`uMap${slot}`].value = t.map;
    uniforms[`uDepth${slot}`].value = t.depth;
    uniforms[`uAspect${slot}`].value = t.aspect;
    uniforms[`uFocus${slot}`].value = t.focus;
  }

  function settleSwap() {
    uniforms.uMapA.value = uniforms.uMapB.value;
    uniforms.uDepthA.value = uniforms.uDepthB.value;
    uniforms.uAspectA.value = uniforms.uAspectB.value;
    uniforms.uFocusA.value = uniforms.uFocusB.value;
    assign("B", blank);
    uniforms.uMix.value = 0;
    swapStart = -1;
  }

  // ---------- State ----------

  /** The photo the dialog shows; a load that arrives for any other is ignored. */
  let wanted = -1;
  /** The photo the canvas shows, or is dissolving to; -1 when it's off. */
  let shown = -1;
  let visible = false;
  let opacity = 0;
  let swapStart = -1;
  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  let lastPointerMove = 0;

  /** The <img> under the canvas is hidden only once the canvas really covers it. */
  const cover = (on: boolean) => dialog.classList.toggle("has-depth", on);

  /** Hand the photo straight back to the <img>. */
  function off() {
    visible = false;
    shown = -1;
    opacity = 0;
    swapStart = -1;
    uniforms.uOpacity.value = 0;
    uniforms.uStrength.value = 0;
    uniforms.uMix.value = 0;
    // Let go of the textures, so none is drawn again after its photo has been dropped.
    assign("A", blank);
    assign("B", blank);
    cover(false);
    stop();
    renderer.clear();
  }

  /** Fade the depth view in over the <img>; it starts flat (see tick) so the two line up exactly. */
  function fadeIn(t: Loaded, index: number) {
    assign("A", t);
    shown = index;
    visible = true;
    start();
  }

  function crossFade(t: Loaded, index: number) {
    if (swapStart >= 0) settleSwap();
    assign("B", t);
    shown = index;
    uniforms.uMix.value = 0;
    swapStart = performance.now();
  }

  async function show(index: number) {
    wanted = index;
    const entry = fetchPhoto(index);
    if (entry.settled === undefined) {
      // Not here yet: the <img> shows this photo meanwhile, rather than the canvas holding on to the last one.
      off();
      await entry.decoded;
      if (wanted !== index || entries.get(index) !== entry) return;
    }
    const t = upload(entry);
    if (!t) off();
    else if (shown !== index) (visible ? crossFade : fadeIn)(t, index);
    dropExcept(index);
    prefetchAround(index);
  }

  function hide() {
    wanted = -1;
    off();
  }

  // ---------- Size and pointer ----------

  function resize() {
    const width = canvas.clientWidth || innerWidth;
    const height = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, width > 900 ? 1.75 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    uniforms.uCanvas.value.copy(renderer.getDrawingBufferSize(new THREE.Vector2()));
    const inset = lightboxInsets(width, height);
    uniforms.uInset.value.set(inset.top * dpr, inset.right * dpr, inset.bottom * dpr, inset.left * dpr);
  }
  new ResizeObserver(resize).observe(canvas);

  dialog.addEventListener(
    "pointermove",
    (e) => {
      pointer.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
      lastPointerMove = performance.now();
    },
    { passive: true },
  );

  // ---------- Loop ----------

  let raf = 0;
  let running = false;
  let last = 0;
  const t0 = performance.now();

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const time = (now - t0) / 1000;
    uniforms.uTime.value = time;

    // Same as the corridor's lightbox: follow the pointer, and drift slowly when it rests (or on touch).
    const idle = now - lastPointerMove > 2500;
    const gx = idle ? Math.sin(time * 0.45) * 0.7 : pointer.x;
    const gy = idle ? Math.sin(time * 0.31) * 0.45 : pointer.y;
    smooth.x = damp(smooth.x, gx, idle ? 1.2 : 3.5, dt);
    smooth.y = damp(smooth.y, gy, idle ? 1.2 : 3.5, dt);
    uniforms.uPointer.value.copy(smooth).clampLength(0, 1);

    if (swapStart >= 0) {
      const t = clamp((now - swapStart) / SWAP_MS, 0, 1);
      uniforms.uMix.value = t;
      if (t >= 1) settleSwap();
    }

    // The <img> goes only after a frame with the canvas fully opaque over it, and the depth effect waits for that too:
    // until then both show the same flat photo, so neither the fade nor the hand-over can be seen.
    const covered = opacity >= 1;
    cover(covered);
    opacity = clamp(opacity + (dt * 1000) / FADE_MS, 0, 1);
    uniforms.uOpacity.value = opacity;
    uniforms.uStrength.value = covered ? damp(uniforms.uStrength.value, STRENGTH, 2.5, dt) : 0;

    renderer.render(scene, camera);
  }

  function start() {
    if (!running && !document.hidden) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : visible && start()));

  return { show, hide };
}

export type DepthViewer = ReturnType<typeof createDepthViewer>;
