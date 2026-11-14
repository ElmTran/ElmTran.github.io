import * as THREE from "three";
import type { GalleryItem } from "../../lib/gallery";
import { loadImage } from "./images";
import { clamp, lightboxInsets } from "./layout";
import * as glsl from "./shaders";

/**
 * The lightbox's depth view on its own, for the grid: the shader the corridor hands off to, on a canvas of its own laid
 * over the dialog's <img>. Nothing is loaded until a photo is opened; then only that photo's lg texture and depth map
 * (plus its two neighbours, so browsing cross-fades at once). The loop runs only while the dialog shows a photo.
 * The <img> stays underneath and carries the photo whenever the depth view can't: still loading, no depth map, or a
 * texture that failed (e.g. no CORS).
 */

THREE.ColorManagement.enabled = false;

/** Same as the corridor's lightbox, so a photo moves the same way in both views. */
const STRENGTH = 0.03;
const SWAP_MS = 1300;
const FADE_MS = 700;

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

function blankTexture(value: number) {
  const tex = new THREE.DataTexture(new Uint8Array([value, value, value, 255]), 1, 1);
  tex.needsUpdate = true;
  return tex;
}

type Loaded = { map: THREE.Texture; depth: THREE.Texture; aspect: number; focus: number };

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

  const blankMap = blankTexture(0);
  const blankDepth = blankTexture(128);
  const uniforms = {
    uMapA: { value: blankMap as THREE.Texture },
    uDepthA: { value: blankDepth as THREE.Texture },
    uAspectA: { value: 1.5 },
    uFocusA: { value: 0.5 },
    uMapB: { value: blankMap as THREE.Texture },
    uDepthB: { value: blankDepth as THREE.Texture },
    uAspectB: { value: 1.5 },
    uFocusB: { value: 0.5 },
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

  function texture(img: HTMLImageElement, color: boolean) {
    const tex = new THREE.Texture(img);
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

  // ---------- Textures: the photo on screen and its neighbours stay on the GPU ----------

  const pending = new Map<number, Promise<Loaded | null>>();
  /** Settled loads; a photo missing here is still on its way. null = no depth view for it. */
  const ready = new Map<number, Loaded | null>();

  function load(index: number) {
    let p = pending.get(index);
    if (!p) {
      const item = items[index];
      p = (
        item?.depth
          ? Promise.all([loadImage(item.lg), loadImage(item.depth)]).then(
              ([map, depth]): Loaded => ({
                map: texture(map, true),
                depth: texture(depth, false),
                aspect: map.naturalWidth / map.naturalHeight || item.aspect,
                focus: item.focus,
              }),
              () => null,
            )
          : Promise.resolve(null)
      ).then((t) => {
        if (pending.get(index) === p) ready.set(index, t);
        return t;
      });
      pending.set(index, p);
    }
    return p;
  }

  function dropExcept(keep: number) {
    const n = items.length;
    for (const [index, p] of pending) {
      const distance = Math.min(Math.abs(index - keep), n - Math.abs(index - keep));
      if (distance > 1) {
        pending.delete(index);
        ready.delete(index);
        void p.then((t) => {
          t?.map.dispose();
          t?.depth.dispose();
        });
      }
    }
  }

  function preloadAround(index: number) {
    const n = items.length;
    void load((index + 1) % n);
    void load((index - 1 + n) % n);
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
    uniforms.uMix.value = 0;
    swapStart = -1;
  }

  // ---------- State ----------

  /** The photo the dialog shows; a load that arrives for any other is ignored. */
  let wanted = -1;
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
    opacity = 0;
    swapStart = -1;
    uniforms.uOpacity.value = 0;
    uniforms.uStrength.value = 0;
    uniforms.uMix.value = 0;
    cover(false);
    stop();
    renderer.clear();
  }

  /** Fade the depth view in over the <img>, starting flat so the two line up exactly. */
  function fadeIn(t: Loaded) {
    assign("A", t);
    uniforms.uMix.value = 0;
    uniforms.uStrength.value = 0;
    swapStart = -1;
    visible = true;
    start();
  }

  function crossFade(t: Loaded) {
    if (swapStart >= 0) settleSwap();
    assign("B", t);
    uniforms.uMix.value = 0;
    swapStart = performance.now();
  }

  async function show(index: number) {
    wanted = index;
    if (ready.has(index)) {
      const t = ready.get(index)!;
      if (!t) off();
      else if (visible) crossFade(t);
      else fadeIn(t);
    } else {
      // Not here yet: the <img> shows this photo meanwhile, rather than the canvas holding on to the last one.
      off();
      const t = await load(index);
      if (wanted !== index || !t) return;
      fadeIn(t);
    }
    dropExcept(index);
    preloadAround(index);
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

    opacity = clamp(opacity + (dt * 1000) / FADE_MS, 0, 1);
    uniforms.uOpacity.value = opacity;
    uniforms.uStrength.value = damp(uniforms.uStrength.value, STRENGTH, 2.5, dt);
    cover(opacity > 0.6);

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
