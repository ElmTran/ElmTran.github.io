import * as THREE from "three";
import land from "../../data/globe-land.json";
import { clamp, smoothstep } from "../gallery/layout";

/** One stop on the /about/ walk. `null` for stops that sit back and show the whole globe (the intro). */
export type GlobePlace = { name: string; label: string; lat: number; lon: number; now: boolean } | null;

type Hooks = {
  /** The nearest stop changed. */
  onStop(index: number): void;
  /** Every frame, with the eased scroll progress in stops. */
  onFrame?(progress: number): void;
};

const INK = "vec3(.93, .9, .84)";
const EMBER = "vec3(.88, .4, .23)";
const OVERVIEW = { lat: 34, lon: 75 };

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

function toVector(lat: number, lon: number, radius = 1) {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)).multiplyScalar(radius);
}

/** Rotation that brings (lat, lon) round to face the camera. */
function facing(lat: number, lon: number) {
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(THREE.MathUtils.degToRad(lat), -THREE.MathUtils.degToRad(lon), 0, "XYZ"),
  );
}

/** The same Fibonacci sphere tools/about/land-dots.mjs sampled, keeping the points it marked as land. */
function landPoints() {
  const bits = Uint8Array.from(atob(land.land), (c) => c.charCodeAt(0));
  const golden = Math.PI * (3 - Math.sqrt(5));
  const positions: number[] = [];
  const shade: number[] = [];
  for (let i = 0; i < land.count; i++) {
    if (!(bits[i >> 3] & (1 << (i & 7)))) continue;
    const y = 1 - (i / (land.count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
    shade.push(Math.random());
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aShade", new THREE.Float32BufferAttribute(shade, 1));
  return geometry;
}

export function createAboutGlobe(
  canvas: HTMLCanvasElement,
  track: HTMLElement,
  pin: HTMLElement,
  places: GlobePlace[],
  hooks: Hooks,
) {
  const count = places.length;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const tilt = new THREE.Group();
  const globe = new THREE.Group();
  tilt.add(globe);
  scene.add(tilt);

  // Body: a dark sphere hides the far side; a soft rim catches the light at the edge.
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.985, 64, 48), new THREE.MeshBasicMaterial({ color: 0x0e0e10 })));
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 64, 48),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float f = pow(1. - abs(dot(vNormal, vView)), 4.);
            gl_FragColor = vec4(${INK} * f * .3, f);
          }`,
      }),
    ),
  );

  // Land: one dot per sample point. Dots near the current place warm up and swell a little.
  const dots = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uSize: { value: 15 }, uFocus: { value: new THREE.Vector3() } },
    vertexShader: /* glsl */ `
      uniform float uSize;
      uniform vec3 uFocus;
      attribute float aShade;
      varying float vFace;
      varying float vShade;
      varying float vNear;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        vFace = dot(normalize(normalMatrix * position), normalize(-mv.xyz));
        vShade = aShade;
        vNear = smoothstep(.985, .9995, dot(normalize(position), uFocus));
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (1. + vNear * .6) / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      varying float vFace;
      varying float vShade;
      varying float vNear;
      void main() {
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        float a = smoothstep(.5, .22, d) * smoothstep(0., .45, vFace);
        vec3 col = mix(${INK} * (.5 + .35 * vShade), vec3(1., .62, .4), vNear * .85);
        gl_FragColor = vec4(col, a * (.55 + .45 * vNear));
      }`,
  });
  globe.add(new THREE.Points(landPoints(), dots));

  // Places: a dot with a ring that pulses outward. The current one and "now" are ember.
  const stops = places.flatMap((place, index) => (place ? [{ ...place, index }] : []));
  const markerGeometry = new THREE.BufferGeometry();
  markerGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(stops.flatMap((s) => toVector(s.lat, s.lon, 1.004).toArray()), 3),
  );
  markerGeometry.setAttribute("aNow", new THREE.Float32BufferAttribute(stops.map((s) => (s.now ? 1 : 0)), 1));
  markerGeometry.setAttribute("aIndex", new THREE.Float32BufferAttribute(stops.map((s) => s.index), 1));
  const markers = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uScale: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uScale;
      uniform float uProgress;
      attribute float aNow;
      attribute float aIndex;
      varying float vNow;
      varying float vOn;
      varying float vFace;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        vFace = dot(normalize(normalMatrix * position), normalize(-mv.xyz));
        vNow = aNow;
        vOn = 1. - clamp(abs(aIndex - uProgress), 0., 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (70. + vOn * 50.) * uScale / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying float vNow;
      varying float vOn;
      varying float vFace;
      void main() {
        float d = length(gl_PointCoord - .5) * 2.;
        float core = smoothstep(.3, .18, d);
        float pulse = fract(uTime * .6);
        float ring = smoothstep(.07, 0., abs(d - (.35 + pulse * .6))) * (1. - pulse) * (.35 + vOn * .65);
        vec3 col = mix(${INK}, ${EMBER}, max(vNow, vOn));
        float a = max(core, ring) * smoothstep(.05, .35, vFace);
        if (a < .01) discard;
        gl_FragColor = vec4(col, a);
      }`,
  });
  globe.add(new THREE.Points(markerGeometry, markers));

  // Routes between consecutive places, drawn in as you travel; the head of each line glows.
  const routes: { material: THREE.ShaderMaterial; to: number }[] = [];
  for (let k = 1; k < stops.length; k++) {
    const a = toVector(stops[k - 1].lat, stops[k - 1].lon);
    const b = toVector(stops[k].lat, stops[k].lon);
    const height = 0.03 + (a.angleTo(b) / Math.PI) * 0.42;
    const points: number[] = [];
    const along: number[] = [];
    const SEGMENTS = 96;
    for (let s = 0; s <= SEGMENTS; s++) {
      const t = s / SEGMENTS;
      const v = a.clone().lerp(b, t).normalize().multiplyScalar(1.002 + height * Math.sin(Math.PI * t));
      points.push(v.x, v.y, v.z);
      along.push(t);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute("aAlong", new THREE.Float32BufferAttribute(along, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uDraw: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aAlong;
        varying float vAlong;
        void main() {
          vAlong = aAlong;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uDraw;
        varying float vAlong;
        void main() {
          if (vAlong > uDraw) discard;
          float head = smoothstep(uDraw - .18, uDraw, vAlong);
          gl_FragColor = vec4(mix(${INK}, vec3(1., .6, .38), head), .28 + .6 * head);
        }`,
    });
    globe.add(new THREE.Line(geometry, material));
    routes.push({ material, to: stops[k].index });
  }

  // ---------- Scroll ↔ progress ----------

  /** Raw scroll → progress in stops, with a dwell at each so the globe settles while you read. */
  function readProgress() {
    const rect = track.getBoundingClientRect();
    const range = Math.max(1, rect.height - innerHeight);
    const raw = clamp(-rect.top / range, 0, 1) * (count - 1);
    const base = Math.floor(raw);
    return base + smoothstep(0.2, 0.8, raw - base);
  }

  function scrollToStop(index: number, behavior: ScrollBehavior = "smooth") {
    const rect = track.getBoundingClientRect();
    const range = Math.max(1, rect.height - innerHeight);
    scrollTo({ top: rect.top + scrollY + (clamp(index, 0, count - 1) / Math.max(1, count - 1)) * range, behavior });
  }

  // ---------- Layout ----------

  let narrow = false;
  /** Camera distances that fit the globe to the viewport: whole globe for overviews, close in for places. */
  let far = 6.2;
  let near = 4.4;

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    narrow = w < 760;
    const ratio = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Wide screens: globe to the right of the copy. Narrow: up, above it.
    camera.setViewOffset(w, h, narrow ? 0 : -w * 0.16, narrow ? h * 0.17 : 0, w, h);
    camera.updateProjectionMatrix();
    const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
    const half = Math.min(halfV, Math.atan(Math.tan(halfV) * camera.aspect));
    far = 1 / Math.sin(half * 0.58);
    near = 1 / Math.sin(half * (narrow ? 0.86 : 0.82));
    dots.uniforms.uSize.value = 15 * ratio;
    markers.uniforms.uScale.value = ratio;
  }

  // ---------- Frame ----------

  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  addEventListener("pointermove", (e) => {
    pointer.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
  });

  const views = places.map((place) => (place ? facing(place.lat, place.lon) : facing(OVERVIEW.lat, OVERVIEW.lon)));
  const focus = places.map((place) => (place ? toVector(place.lat, place.lon) : new THREE.Vector3()));
  const target = new THREE.Quaternion();
  const sway = new THREE.Quaternion();
  const yAxis = new THREE.Vector3(0, 1, 0);
  const projected = new THREE.Vector3();
  const toCamera = new THREE.Vector3();
  let progress = readProgress();
  let distance = places[Math.round(progress)] ? near : far;
  let stop = -1;
  let last = performance.now();
  let raf = 0;
  let running = false;
  let shown = false;

  globe.quaternion.copy(views[Math.round(progress)]);

  function updatePin(index: number) {
    const place = places[index];
    if (!place) {
      pin.style.opacity = "0";
      return;
    }
    projected.copy(toVector(place.lat, place.lon, 1.01)).applyMatrix4(globe.matrixWorld);
    toCamera.copy(camera.position).sub(projected).normalize();
    const visible = projected.clone().normalize().dot(toCamera) > 0.2 && Math.abs(progress - index) < 0.3;
    projected.project(camera);
    pin.style.opacity = visible ? "1" : "0";
    pin.style.transform = `translate(${((projected.x + 1) / 2) * canvas.clientWidth + 8}px, ${((1 - projected.y) / 2) * canvas.clientHeight - 8}px)`;
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    progress = damp(progress, readProgress(), 5, dt);
    pointerSmooth.x = damp(pointerSmooth.x, pointer.x, 3, dt);
    pointerSmooth.y = damp(pointerSmooth.y, pointer.y, 3, dt);

    const i0 = Math.floor(progress);
    const i1 = Math.min(count - 1, i0 + 1);
    const f = smoothstep(0, 1, progress - i0);
    target.copy(views[i0]).slerp(views[i1], f);
    // Overviews drift slowly from side to side.
    const idle = (places[i0] ? 0 : 1 - f) + (places[i1] ? 0 : f);
    if (idle > 0) {
      target.multiply(sway.setFromAxisAngle(yAxis, Math.sin(t * 0.15) * 0.25 * idle));
    }
    globe.quaternion.slerp(target, 1 - Math.exp(-6 * dt));
    tilt.rotation.set(pointerSmooth.y * 0.18, pointerSmooth.x * 0.3, 0);

    distance = damp(distance, THREE.MathUtils.lerp(places[i0] ? near : far, places[i1] ? near : far, f), 4, dt);
    camera.position.set(0, 0, distance);

    const nearest = Math.round(progress);
    if (focus[nearest].lengthSq() > 0) dots.uniforms.uFocus.value.copy(focus[nearest]);
    else dots.uniforms.uFocus.value.set(0, 0, 0);
    markers.uniforms.uTime.value = t;
    markers.uniforms.uProgress.value = progress;
    for (const route of routes) {
      route.material.uniforms.uDraw.value = clamp(progress - (route.to - 1), 0, 1);
    }

    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      canvas.classList.add("is-ready");
    }

    if (nearest !== stop) {
      stop = nearest;
      const place = places[nearest];
      pin.replaceChildren();
      if (place) {
        const name = document.createElement("span");
        const label = document.createElement("small");
        name.textContent = place.name;
        label.textContent = place.label;
        pin.append(name, label);
        pin.classList.toggle("is-now", place.now);
      }
      hooks.onStop(nearest);
    }
    updatePin(nearest);
    hooks.onFrame?.(progress);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Only draw while the stage is on screen and the tab is visible.
  let onScreen = true;
  const sync = () => (onScreen && !document.hidden ? start() : stopLoop());
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  io.observe(track);
  document.addEventListener("visibilitychange", sync);
  new ResizeObserver(resize).observe(canvas);
  resize();
  sync();

  return {
    scrollToStop,
    get current() {
      return stop;
    },
  };
}
