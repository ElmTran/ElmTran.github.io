import * as THREE from "three";
import type { GalleryItem } from "../../lib/gallery";
import { loadImage } from "./images";
import { clamp, easeInOutCubic, lightboxInsets, smoothstep } from "./layout";
import * as glsl from "./shaders";

// Every texture and colour here is plain sRGB; shaders write it straight out.
THREE.ColorManagement.enabled = false;

/** Distance between consecutive photos along the corridor (world units). */
const GAP = 6;
const FLOOR_Y = -1.75;
/** Frames share roughly the same area whatever their orientation. */
const FRAME_AREA = 4.6;
/** Depth of the parallax relief in world units, and the most a frame may shift (uv). */
const RELIEF = 0.32;
const MAX_SHIFT = 0.045;
const VIEWER_STRENGTH = 0.03;
const OPEN_MS = 1150;
const CLOSE_MS = 950;
const SWAP_MS = 1300;
const BASE_BG = new THREE.Color("#060608");
const DUST_WARM = new THREE.Color("#fff4e6");

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

export type GalleryHooks = {
  /** Called every frame with the eased corridor progress (-1 intro … N outro) and the photo in focus (-1 for none). */
  onFrame(progress: number, index: number): void;
  onSelect(index: number): void;
};

export type GalleryScene = ReturnType<typeof createGalleryScene>;

function blankTexture(value: number) {
  const tex = new THREE.DataTexture(new Uint8Array([value, value, value, 255]), 1, 1);
  tex.needsUpdate = true;
  return tex;
}

function frameSize(aspect: number) {
  const w = Math.sqrt(FRAME_AREA * aspect);
  const h = Math.sqrt(FRAME_AREA / aspect);
  const s = Math.min(1, 3.1 / w, 2.7 / h);
  return { w: w * s, h: h * s };
}

function glyphTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 560;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `300 470px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif`;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 20);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

export function createGalleryScene(canvas: HTMLCanvasElement, track: HTMLElement, items: GalleryItem[], hooks: GalleryHooks) {
  const count = items.length;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(BASE_BG);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  scene.add(camera);

  const blankMap = blankTexture(0);
  const blankDepth = blankTexture(128);

  const shared = {
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uFogColor: { value: BASE_BG.clone() },
    uFogDensity: { value: 0.045 },
    /** 0 in the corridor, 1 with the lightbox open: everything but the photo in focus sinks into the dark. */
    uDim: { value: 0 },
  };

  // ---------- Photo frames ----------

  function photoUniforms(item: GalleryItem) {
    return {
      uMap: { value: blankMap as THREE.Texture },
      uDepth: { value: blankDepth as THREE.Texture },
      uColor: { value: new THREE.Color(item.color) },
      uReveal: { value: 0 },
      uFocus: { value: 0 },
      uHover: { value: 0 },
      uBlur: { value: 2 },
      uShift: { value: new THREE.Vector2() },
      uDepthFocus: { value: item.focus },
      uMirror: { value: 0 },
      ...shared,
    };
  }

  const frames = items.map((item, index) => {
    const { w, h } = frameSize(item.aspect);
    const geometry = new THREE.PlaneGeometry(1, 1, 24, 1);
    const uniforms = photoUniforms(item);
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({ uniforms, vertexShader: glsl.photoVertex, fragmentShader: glsl.photoFragment }),
    );
    const mirrorUniforms = { ...uniforms, uMirror: { value: 1 }, uShift: { value: new THREE.Vector2() } };
    const mirror = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({
        uniforms: mirrorUniforms,
        vertexShader: glsl.photoVertex,
        fragmentShader: glsl.photoFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    mesh.userData.index = index;
    scene.add(mesh, mirror);
    return {
      index,
      item,
      baseWidth: w,
      baseHeight: h,
      /** Current size in world units; layout() scales frames down on narrow screens. */
      width: w,
      height: h,
      mesh,
      mirror,
      uniforms,
      mirrorShift: mirrorUniforms.uShift.value,
      center: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      right: new THREE.Vector3(),
      map: null as THREE.Texture | null,
      depth: null as THREE.Texture | null,
      large: null as THREE.Texture | null,
      revealing: false,
    };
  });
  type Frame = (typeof frames)[number];

  // ---------- Year numerals ----------

  const glyphs = frames
    .filter((f, i) => f.item.year && f.item.year !== frames[i - 1]?.item.year)
    .map((f) => {
      const uniforms = {
        uMap: { value: glyphTexture(f.item.year!) },
        uOpacity: { value: 0 },
        uFogColor: shared.uFogColor,
        uFogDensity: shared.uFogDensity,
      };
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.6, 5.6 * (560 / 1600)),
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: glsl.basicVertex,
          fragmentShader: glsl.glyphFragment,
          transparent: true,
          depthWrite: false,
        }),
      );
      mesh.renderOrder = -1;
      scene.add(mesh);
      return { mesh, uniforms, first: f.index };
    });

  // ---------- Dust ----------

  const dustCount = innerWidth > 900 ? 1400 : 600;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSeeds = new Float32Array(dustCount);
  const zNear = GAP * 3;
  const zFar = -(count - 1) * GAP - GAP * 3;
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 16;
    dustPositions[i * 3 + 1] = FLOOR_Y + Math.random() * 6.5;
    dustPositions[i * 3 + 2] = zFar + Math.random() * (zNear - zFar);
    dustSeeds[i] = Math.random();
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("aSeed", new THREE.BufferAttribute(dustSeeds, 1));
  const dustUniforms = {
    uTime: shared.uTime,
    uPixelRatio: { value: 1 },
    uTint: { value: new THREE.Color("#ffffff") },
    uFogDensity: shared.uFogDensity,
  };
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: glsl.dustVertex,
      fragmentShader: glsl.dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  dust.frustumCulled = false;
  scene.add(dust);

  // ---------- Glow at the end of the corridor (rides with the camera) ----------

  const glowUniforms = { uTint: { value: new THREE.Color("#000000") } };
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.ShaderMaterial({
      uniforms: glowUniforms,
      vertexShader: glsl.basicVertex,
      fragmentShader: glsl.glowFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  glow.position.set(0, 0, -100);
  glow.renderOrder = -10;
  camera.add(glow);

  // ---------- Lightbox layer (same renderer, so textures are shared) ----------

  const viewerScene = new THREE.Scene();
  const viewerCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const viewerUniforms = {
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
    uTime: shared.uTime,
  };
  const viewerQuad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: viewerUniforms,
      vertexShader: glsl.screenVertex,
      fragmentShader: glsl.viewerFragment,
      transparent: true,
      depthTest: false,
    }),
  );
  viewerQuad.frustumCulled = false;
  viewerScene.add(viewerQuad);

  // ---------- Layout ----------

  type Stop = { pos: THREE.Vector3; target: THREE.Vector3 };
  let stops: Stop[] = [];
  let width = 1;
  let height = 1;

  function fitDistance(w: number, h: number, fillW: number, fillH: number) {
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tanH = tanV * camera.aspect;
    return Math.max(h / (2 * tanV * fillH), w / (2 * tanH * fillW));
  }

  function layout() {
    const wide = camera.aspect >= 1.15;
    const fillW = wide ? 0.62 : 0.86;
    const fillH = wide ? 0.62 : 0.5;
    const xOffset = wide ? 1.9 : 0.35;
    const turn = wide ? 0.3 : 0.08;
    // The camera must stay in front of the previous frame, so shrink every frame if any would need it further back.
    const furthest = Math.max(...frames.map((f) => fitDistance(f.baseWidth, f.baseHeight, fillW, fillH)));
    const scale = Math.min(1, (GAP * 0.55) / furthest);
    for (const f of frames) {
      f.width = f.baseWidth * scale;
      f.height = f.baseHeight * scale;
      f.mesh.scale.set(f.width, f.height, 1);
      f.mirror.scale.set(f.width, -f.height, 1);
      const side = f.index % 2 === 0 ? -1 : 1;
      const rotY = -side * turn;
      const y = 0.15 + Math.sin(f.index * 2.17) * 0.12;
      f.center.set(side * xOffset, y, -f.index * GAP);
      f.normal.set(Math.sin(rotY), 0, Math.cos(rotY));
      f.right.set(Math.cos(rotY), 0, -Math.sin(rotY));
      f.mesh.position.copy(f.center);
      f.mesh.rotation.y = rotY;
      f.mirror.position.set(f.center.x, 2 * FLOOR_Y - y, f.center.z);
      f.mirror.rotation.y = rotY;
      f.mesh.updateMatrixWorld();
      f.mirror.updateMatrixWorld();
    }
    for (const g of glyphs) {
      g.mesh.position.set(0, 0.35, -g.first * GAP + GAP * 0.5);
    }

    const photoStops = frames.map((f) => {
      const d = fitDistance(f.width, f.height, fillW, fillH);
      return { pos: f.center.clone().addScaledVector(f.normal, d), target: f.center.clone() };
    });
    const first = photoStops[0]?.pos ?? new THREE.Vector3(0, 0, 5);
    const lastZ = frames.at(-1)?.center.z ?? 0;
    stops = [
      { pos: new THREE.Vector3(0, 0.75, first.z + GAP * 1.4), target: new THREE.Vector3(0, 0.25, -GAP * 1.5) },
      ...photoStops,
      { pos: new THREE.Vector3(0, 0.5, lastZ - GAP * 0.9), target: new THREE.Vector3(0, 0.3, lastZ - GAP * 5) },
    ];
  }

  function resize() {
    width = canvas.clientWidth || innerWidth;
    height = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, width > 900 ? 1.75 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect >= 1 ? 42 : 56;
    camera.updateProjectionMatrix();
    dustUniforms.uPixelRatio.value = dpr;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    viewerUniforms.uCanvas.value.copy(size);
    const inset = lightboxInsets(width, height);
    viewerUniforms.uInset.value.set(inset.top * dpr, inset.right * dpr, inset.bottom * dpr, inset.left * dpr);
    layout();
  }

  // ---------- Scroll ↔ progress ----------

  /** Raw scroll → eased progress with a dwell at each photo, so the camera settles in front of it. */
  function readProgress() {
    const rect = track.getBoundingClientRect();
    const range = Math.max(1, rect.height - innerHeight);
    const raw = -1 + clamp(-rect.top / range, 0, 1) * (count + 1);
    const base = Math.floor(raw);
    return base + smoothstep(0.2, 0.8, raw - base);
  }

  function scrollToIndex(index: number, behavior: ScrollBehavior = "smooth") {
    const rect = track.getBoundingClientRect();
    const range = Math.max(1, rect.height - innerHeight);
    const top = rect.top + scrollY + ((clamp(index, -1, count) + 1) / (count + 1)) * range;
    scrollTo({ top, behavior });
  }

  function poseAt(p: number, pos: THREE.Vector3, target: THREE.Vector3) {
    const k = clamp(p + 1, 0, stops.length - 1);
    const i0 = Math.floor(k);
    const i1 = Math.min(i0 + 1, stops.length - 1);
    const t = k - i0;
    pos.lerpVectors(stops[i0].pos, stops[i1].pos, t);
    pos.y += Math.sin(t * Math.PI) * 0.3;
    target.lerpVectors(stops[i0].target, stops[i1].target, clamp(t * 1.15, 0, 1));
  }

  /** Camera pose whose view of the frame matches the lightbox's contain-fit box exactly. */
  function lightboxPose(f: Frame, pos: THREE.Vector3, target: THREE.Vector3) {
    const inset = lightboxInsets(width, height);
    const boxW = width - inset.left - inset.right;
    const boxH = height - inset.top - inset.bottom;
    const fitH = Math.min(boxH, boxW / (f.width / f.height));
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const d = (f.height * height) / (2 * tanV * fitH);
    const unitsPerPx = (2 * d * tanV) / height;
    const offsetX = (inset.left + boxW / 2 - width / 2) * unitsPerPx;
    const offsetY = (height / 2 - (inset.top + boxH / 2)) * unitsPerPx;
    target.copy(f.center).addScaledVector(f.right, -offsetX).add(new THREE.Vector3(0, -offsetY, 0));
    pos.copy(target).addScaledVector(f.normal, d);
  }

  // ---------- Textures ----------

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

  async function loadFrame(f: Frame) {
    const [map, depth] = await Promise.allSettled([
      loadImage(f.item.sm),
      f.item.depth ? loadImage(f.item.depth) : Promise.reject(new Error("no depth")),
    ]);
    if (depth.status === "fulfilled") {
      f.depth = texture(depth.value, false);
      f.uniforms.uDepth.value = f.depth;
    }
    if (map.status === "fulfilled") {
      f.map = texture(map.value, true);
      f.uniforms.uMap.value = f.map;
    }
  }

  async function loadAll() {
    const queue = [...frames];
    const worker = async () => {
      for (let f = queue.shift(); f; f = queue.shift()) {
        await loadFrame(f);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  }

  async function loadLarge(f: Frame) {
    if (f.large || f.item.lg === f.item.sm) {
      return;
    }
    try {
      const img = await loadImage(f.item.lg);
      f.large ??= texture(img, true);
      for (const slot of ["A", "B"] as const) {
        if (viewer[slot] === f.index) {
          viewerUniforms[`uMap${slot}`].value = f.large;
        }
      }
    } catch {
      // Keep the corridor texture.
    }
  }

  function dropLargeExcept(keep: number) {
    for (const f of frames) {
      if (f.large && Math.abs(f.index - keep) > 1) {
        f.large.dispose();
        f.large = null;
      }
    }
  }

  // ---------- Lightbox state ----------

  const viewer = {
    index: -1,
    A: -1,
    B: -1,
    /** 0 = corridor, 1 = lightbox fully open. */
    open: 0,
    openFrom: 0,
    openTo: 0,
    openStart: 0,
    openDuration: 1,
    swapStart: -1,
    pointer: new THREE.Vector2(),
  };

  function assignSlot(slot: "A" | "B", index: number) {
    const f = frames[index];
    viewer[slot] = index;
    viewerUniforms[`uMap${slot}`].value = f.large ?? f.map ?? blankMap;
    viewerUniforms[`uDepth${slot}`].value = f.depth ?? blankDepth;
    viewerUniforms[`uAspect${slot}`].value = f.width / f.height;
    viewerUniforms[`uFocus${slot}`].value = f.item.focus;
  }

  function animateOpen(to: number, duration: number) {
    viewer.openFrom = viewer.open;
    viewer.openTo = to;
    viewer.openStart = performance.now();
    viewer.openDuration = duration * Math.abs(to - viewer.open);
    return new Promise<void>((resolve) => setTimeout(resolve, viewer.openDuration));
  }

  function openPhoto(index: number) {
    viewer.index = index;
    assignSlot("A", index);
    viewerUniforms.uMix.value = 0;
    viewer.swapStart = -1;
    void loadLarge(frames[index]);
    return animateOpen(1, OPEN_MS);
  }

  function showPhoto(index: number) {
    if (viewer.swapStart >= 0) {
      assignSlot("A", viewer.B);
    }
    viewer.index = index;
    assignSlot("B", index);
    viewerUniforms.uMix.value = 0;
    viewer.swapStart = performance.now();
    void loadLarge(frames[index]);
    scrollToIndex(index, "instant");
  }

  function closePhoto() {
    return animateOpen(0, CLOSE_MS);
  }

  // ---------- Pointer ----------

  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  let pointerInside = false;
  let lastPointerMove = 0;
  let hovered = -1;
  const raycaster = new THREE.Raycaster();

  const ndc = (e: MouseEvent, out: THREE.Vector2) => out.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  const meshes = frames.map((f) => f.mesh);
  const pick = (at: THREE.Vector2) => {
    raycaster.setFromCamera(at, camera);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    return hit ? (hit.object.userData.index as number) : -1;
  };

  const onPointerMove = (e: PointerEvent) => {
    ndc(e, pointer);
    pointerInside = e.target === canvas && e.pointerType === "mouse";
    lastPointerMove = performance.now();
  };
  // Pick on click as well: on touch there is no hover before the tap.
  const onClick = (e: MouseEvent) => {
    const index = pick(ndc(e, new THREE.Vector2()));
    if (index >= 0 && viewer.open === 0) {
      hooks.onSelect(index);
    }
  };
  addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("click", onClick);

  // ---------- Frame loop ----------

  const pos = new THREE.Vector3();
  const target = new THREE.Vector3();
  const flyPos = new THREE.Vector3();
  const flyTarget = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const right = new THREE.Vector3();
  const mood = new THREE.Color();
  const moodTarget = new THREE.Color("#3a3a3a");
  const bg = BASE_BG.clone();
  let progress = readProgress();
  let velocity = 0;
  let last = performance.now();
  let running = false;
  let raf = 0;

  function updateParallax(mesh: THREE.Mesh, shift: THREE.Vector2, f: Frame, scale: number) {
    mesh.worldToLocal(tmp.copy(camera.position));
    if (tmp.z < 0.3) {
      shift.set(0, 0);
      return;
    }
    shift.set(((tmp.x / tmp.z) * RELIEF) / f.width, ((tmp.y / tmp.z) * RELIEF) / f.height);
    if (shift.length() > MAX_SHIFT) {
      shift.setLength(MAX_SHIFT);
    }
    shift.multiplyScalar(scale);
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    shared.uTime.value += dt;

    // Lightbox open/close tween.
    if (viewer.open !== viewer.openTo) {
      const t = clamp((now - viewer.openStart) / Math.max(1, viewer.openDuration), 0, 1);
      viewer.open = t >= 1 ? viewer.openTo : viewer.openFrom + (viewer.openTo - viewer.openFrom) * t;
    }
    if (viewer.open === 0 && viewer.openTo === 0 && viewer.index >= 0) {
      viewer.index = -1;
      viewer.swapStart = -1;
      dropLargeExcept(-10);
    }
    const fly = easeInOutCubic(viewer.open);

    // Corridor progress follows the scroll position.
    const prev = progress;
    progress = damp(progress, readProgress(), 4.5, dt);
    velocity = damp(velocity, (progress - prev) / Math.max(dt, 1e-3), 6, dt);
    shared.uVelocity.value = clamp(velocity * 0.14, -0.45, 0.45) * (1 - fly);

    pointerSmooth.x = damp(pointerSmooth.x, pointer.x, 3, dt);
    pointerSmooth.y = damp(pointerSmooth.y, pointer.y, 3, dt);

    poseAt(progress, pos, target);
    right.subVectors(target, pos).cross(camera.up).normalize();
    pos.addScaledVector(right, pointerSmooth.x * 0.4 * (1 - fly));
    pos.y += pointerSmooth.y * 0.22 * (1 - fly);
    if (viewer.index >= 0 && fly > 0) {
      lightboxPose(frames[viewer.index], flyPos, flyTarget);
      pos.lerp(flyPos, fly);
      target.lerp(flyTarget, fly);
    }
    camera.position.copy(pos);
    camera.lookAt(target);
    camera.updateMatrixWorld();

    // Hover.
    hovered = pointerInside && viewer.open === 0 ? pick(pointer) : -1;
    canvas.style.cursor = hovered >= 0 ? "pointer" : "";

    const nearest = Math.round(progress);
    const inRange = progress > -0.5 && progress < count - 0.5;
    const focusIndex = viewer.index >= 0 ? viewer.index : hovered >= 0 ? hovered : inRange ? nearest : -1;
    const focusDist = focusIndex >= 0 ? camera.position.distanceTo(frames[focusIndex].center) : 6;

    for (const f of frames) {
      const u = f.uniforms;
      const dist = camera.position.distanceTo(f.center);
      const focused = f.index === focusIndex;
      u.uFocus.value = damp(u.uFocus.value, focused ? 1 : 0, 4, dt);
      u.uHover.value = damp(u.uHover.value, f.index === hovered ? 1 : 0, 8, dt);
      u.uBlur.value = damp(u.uBlur.value, focused ? 0 : clamp(Math.abs(dist - focusDist) * 0.45, 0.8, 3.5), 4, dt);
      updateParallax(f.mesh, u.uShift.value, f, 1 - fly);
      updateParallax(f.mirror, f.mirrorShift, f, 1 - fly);
      if (f.map && !f.revealing && dist < 22) {
        f.revealing = true;
      }
      if (f.revealing && u.uReveal.value < 1) {
        u.uReveal.value = Math.min(1, u.uReveal.value + dt / 1.6);
      }
    }

    // Year numerals announce a new year from a distance and get out of the way before the camera reaches them.
    const afterIntro = smoothstep(-0.5, -0.1, progress);
    for (const g of glyphs) {
      const dz = camera.position.z - g.mesh.position.z;
      g.uniforms.uOpacity.value = 0.17 * smoothstep(3.5, 6.5, dz) * (1 - smoothstep(15, 22, dz)) * afterIntro * (1 - fly);
    }

    // Scene mood follows the photo in focus.
    const moodIndex = focusIndex >= 0 ? focusIndex : clamp(nearest, 0, count - 1);
    if (frames[moodIndex]) {
      moodTarget.set(frames[moodIndex].item.color);
    }
    const k = 1 - Math.exp(-2 * dt);
    mood.lerp(moodTarget, k);
    bg.copy(BASE_BG).lerp(mood, 0.07 * (1 - fly * 0.6));
    shared.uDim.value = fly;
    renderer.setClearColor(bg);
    shared.uFogColor.value.copy(bg);
    dustUniforms.uTint.value.copy(mood).lerp(DUST_WARM, 0.55).multiplyScalar(1 - fly);
    glowUniforms.uTint.value.copy(mood).multiplyScalar(0.22 * (1 - fly));

    // Lightbox layer.
    const idle = now - lastPointerMove > 2500;
    const drift = shared.uTime.value;
    const goal = idle ? tmp.set(Math.sin(drift * 0.45) * 0.7, Math.sin(drift * 0.31) * 0.45, 0) : tmp.set(pointer.x, pointer.y, 0);
    viewer.pointer.x = damp(viewer.pointer.x, goal.x, idle ? 1.2 : 3.5, dt);
    viewer.pointer.y = damp(viewer.pointer.y, goal.y, idle ? 1.2 : 3.5, dt);
    viewerUniforms.uPointer.value.copy(viewer.pointer).clampLength(0, 1);
    if (viewer.swapStart >= 0) {
      const t = clamp((now - viewer.swapStart) / SWAP_MS, 0, 1);
      viewerUniforms.uMix.value = t;
      if (t >= 1) {
        assignSlot("A", viewer.B);
        viewerUniforms.uMix.value = 0;
        viewer.swapStart = -1;
        dropLargeExcept(viewer.index);
      }
    }
    viewerUniforms.uOpacity.value = smoothstep(0.7, 1, viewer.open);
    viewerUniforms.uStrength.value = damp(viewerUniforms.uStrength.value, viewer.open === 1 ? VIEWER_STRENGTH : 0, 2.5, dt);

    if (viewer.open < 1) {
      renderer.render(scene, camera);
    }
    if (viewer.open > 0) {
      renderer.autoClear = viewer.open >= 1;
      renderer.render(viewerScene, viewerCamera);
      renderer.autoClear = true;
    }

    hooks.onFrame(progress, viewer.index >= 0 ? viewer.index : inRange ? nearest : -1);
  }

  function start() {
    if (!running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Only animate while the corridor is on screen and the tab is visible.
  let onScreen = true;
  const sync = () => (onScreen && !document.hidden ? start() : stop());
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  io.observe(track);
  document.addEventListener("visibilitychange", sync);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  resize();
  mood.set(items[0]?.color ?? "#3a3a3a");
  void loadAll();
  sync();

  return {
    count,
    scrollToIndex,
    openPhoto,
    showPhoto,
    closePhoto,
    /** Index of the photo the corridor is resting on, or -1. */
    get current() {
      const p = Math.round(progress);
      return p >= 0 && p < count && Math.abs(progress - p) < 0.35 ? p : -1;
    },
  };
}
