/**
 * GLSL for the /photos/ corridor and lightbox.
 * Depth maps are "near = white"; parallax marches from the nearest layer back so foreground occludes background.
 */

const NOISE = /* glsl */ `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float dissolveNoise(vec2 uv) {
    return noise(uv * vec2(7.0, 5.0)) * 0.65 + noise(uv * 38.0) * 0.35;
  }
`;

/**
 * Find q with q = uv + (depth(q) - focus) * shift: the texel that lands on this pixel once every texel is pushed
 * by its own depth. `shift` is the uv displacement of the nearest layer relative to the focal plane.
 */
const PARALLAX = /* glsl */ `
  vec2 parallaxUv(sampler2D depthMap, vec2 uv, vec2 shift, float focus) {
    if (dot(shift, shift) < 1e-8) {
      return uv;
    }
    const int STEPS = 18;
    vec2 prevQ = uv + (1.0 - focus) * shift;
    float prevDiff = texture2D(depthMap, prevQ).r - 1.0;
    for (int i = 1; i <= STEPS; i++) {
      float layer = 1.0 - float(i) / float(STEPS);
      vec2 q = uv + (layer - focus) * shift;
      float diff = texture2D(depthMap, q).r - layer;
      if (diff >= 0.0) {
        return mix(prevQ, q, prevDiff / min(prevDiff - diff, -1e-4));
      }
      prevQ = q;
      prevDiff = diff;
    }
    return prevQ;
  }
`;

export const photoVertex = /* glsl */ `
  uniform float uVelocity;
  varying vec2 vUv;
  varying float vViewDepth;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Frames flex like paper when you scroll fast.
    p.z += sin(uv.x * 3.14159) * uVelocity * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const photoFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  uniform vec3 uColor;
  uniform float uReveal;
  uniform float uFocus;
  uniform float uHover;
  uniform float uBlur;
  uniform vec2 uShift;
  uniform float uDepthFocus;
  uniform float uVelocity;
  uniform float uMirror;
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uDim;

  varying vec2 vUv;
  varying float vViewDepth;

  ${NOISE}
  ${PARALLAX}

  vec3 sampleBlurred(vec2 uv) {
    float r = uBlur * 0.0025;
    vec3 c = texture2D(uMap, uv, uBlur).rgb * 0.4;
    c += texture2D(uMap, uv + vec2(r, r * 0.6), uBlur).rgb * 0.15;
    c += texture2D(uMap, uv + vec2(-r, -r * 0.6), uBlur).rgb * 0.15;
    c += texture2D(uMap, uv + vec2(-r * 0.6, r), uBlur).rgb * 0.15;
    c += texture2D(uMap, uv + vec2(r * 0.6, -r), uBlur).rgb * 0.15;
    return c;
  }

  void main() {
    // Leave a margin so shifted samples never leave the photo.
    float margin = length(uShift) * 0.6 + 0.004;
    vec2 base = 0.5 + (vUv - 0.5) * (1.0 - 2.0 * margin);
    vec2 uv = parallaxUv(uDepth, base, uShift, uDepthFocus);

    vec3 photo = sampleBlurred(uv);
    vec2 split = vec2(uVelocity * 0.012, 0.0);
    photo.r = mix(photo.r, texture2D(uMap, uv + split, uBlur).r, 0.85);
    photo.b = mix(photo.b, texture2D(uMap, uv - split, uBlur).b, 0.85);

    // Frames out of focus sit back in the dark, half developed.
    float luma = dot(photo, vec3(0.2126, 0.7152, 0.0722));
    photo = mix(vec3(luma), photo, mix(0.45, 1.0, uFocus));
    photo *= mix(0.68, 1.0, uFocus) + uHover * 0.08;

    vec3 placeholder = uColor * (0.3 + 0.08 * sin(uTime * 1.6 + vUv.x * 5.0 + vUv.y * 3.0));

    // Noise dissolve from placeholder to photo, with a warm burn line, like paper catching light.
    float n = dissolveNoise(vUv);
    float t = uReveal * 1.25 - 0.12;
    float shown = smoothstep(-0.03, 0.03, t - n);
    float burn = (1.0 - smoothstep(0.0, 0.07, abs(t - n))) * step(uReveal, 0.999);
    vec3 col = mix(placeholder, photo, shown) + burn * vec3(1.0, 0.72, 0.42) * 0.9;

    // Hairline frame so dark photos still read as objects.
    vec2 edge = min(vUv, 1.0 - vUv);
    float frame = 1.0 - smoothstep(0.0, 0.004, min(edge.x, edge.y));
    col = mix(col, vec3(1.0), frame * (0.06 + uHover * 0.3) * (1.0 - uMirror));

    float fog = clamp(1.0 - exp(-pow(uFogDensity * vViewDepth, 2.0)), 0.0, 1.0);
    col = mix(col, uFogColor, fog);
    col *= 1.0 - uDim * (1.0 - uFocus * (1.0 - uMirror));

    // Reflection copies fade out away from the floor line (uv.y = 0 is the edge touching the floor).
    float alpha = mix(1.0, (1.0 - smoothstep(0.0, 0.45, vUv.y)) * 0.22, uMirror);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const dustVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vViewDepth;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.15 + aSeed * 40.0) * 0.35;
    p.y += sin(uTime * 0.11 + aSeed * 90.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewDepth = -mv.z;
    vAlpha = (0.35 + 0.65 * fract(aSeed * 7.31)) * (0.6 + 0.4 * sin(uTime * (0.6 + aSeed) + aSeed * 20.0));
    gl_PointSize = (1.4 + aSeed * 2.6) * uPixelRatio * (6.0 / max(vViewDepth, 0.5));
    gl_Position = projectionMatrix * mv;
  }
`;

export const dustFragment = /* glsl */ `
  uniform vec3 uTint;
  uniform float uFogDensity;
  varying float vAlpha;
  varying float vViewDepth;

  void main() {
    float soft = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    float fog = exp(-pow(uFogDensity * vViewDepth * 0.8, 2.0));
    float nearFade = smoothstep(0.4, 1.8, vViewDepth);
    gl_FragColor = vec4(uTint, soft * vAlpha * fog * nearFade * 0.6);
  }
`;

export const basicVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vViewDepth;

  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

/** Big year numerals: a canvas texture, faded as the camera closes in so it never clips through the lens. */
export const glyphFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec2 vUv;
  varying float vViewDepth;

  void main() {
    float a = texture2D(uMap, vUv).a * uOpacity;
    float fog = exp(-pow(uFogDensity * vViewDepth * 0.7, 2.0));
    gl_FragColor = vec4(mix(uFogColor, vec3(0.95, 0.93, 0.9), fog), a * fog);
  }
`;

/** Soft glow at the end of the corridor, tinted with the current photo's mood. */
export const glowFragment = /* glsl */ `
  uniform vec3 uTint;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - vec2(0.5, 0.42));
    gl_FragColor = vec4(uTint, smoothstep(0.5, 0.0, d) * 0.5);
  }
`;

export const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** Lightbox: contain-fit two photos inside an inset box, depth parallax on each, dissolve from A to B. */
export const viewerFragment = /* glsl */ `
  uniform sampler2D uMapA;
  uniform sampler2D uDepthA;
  uniform float uAspectA;
  uniform float uFocusA;
  uniform sampler2D uMapB;
  uniform sampler2D uDepthB;
  uniform float uAspectB;
  uniform float uFocusB;
  uniform float uMix;
  uniform float uOpacity;
  uniform vec2 uCanvas;
  uniform vec4 uInset;
  uniform vec2 uPointer;
  uniform float uStrength;
  uniform float uTime;

  varying vec2 vUv;

  ${NOISE}
  ${PARALLAX}

  // Canvas uv → image uv for a contain-fit box. uInset = top, right, bottom, left in device px.
  vec2 fitUv(vec2 uv, float aspect, float zoom) {
    vec2 px = uv * uCanvas;
    vec2 boxMin = vec2(uInset.w, uInset.z);
    vec2 boxSize = max(uCanvas - vec2(uInset.y + uInset.w, uInset.x + uInset.z), vec2(1.0));
    vec2 size = boxSize.x / boxSize.y > aspect ? vec2(boxSize.y * aspect, boxSize.y) : vec2(boxSize.x, boxSize.x / aspect);
    size *= zoom;
    vec2 origin = boxMin + (boxSize - size) * 0.5;
    return (px - origin) / size;
  }

  vec4 layer(sampler2D map, sampler2D depthMap, float aspect, float focus, float zoom) {
    vec2 uv = fitUv(vUv, aspect, zoom);
    vec2 aa = fwidth(uv) * 0.75;
    vec2 inside = smoothstep(vec2(0.0), aa, uv) * smoothstep(vec2(0.0), aa, 1.0 - uv);
    float alpha = inside.x * inside.y;
    vec2 shift = uPointer * uStrength;
    float margin = uStrength * 0.75;
    vec2 base = 0.5 + (clamp(uv, 0.0, 1.0) - 0.5) * (1.0 - 2.0 * margin);
    vec2 puv = parallaxUv(depthMap, base, shift, focus);
    return vec4(texture2D(map, puv).rgb, alpha);
  }

  void main() {
    float t = uMix * 1.25 - 0.12;
    vec4 a = layer(uMapA, uDepthA, uAspectA, uFocusA, 1.0 + uMix * 0.04);
    vec4 b = layer(uMapB, uDepthB, uAspectB, uFocusB, 1.04 - uMix * 0.04);
    float n = dissolveNoise(vUv * 1.4);
    float shown = smoothstep(-0.03, 0.03, t - n);
    float burn = (1.0 - smoothstep(0.0, 0.06, abs(t - n))) * step(0.001, uMix) * step(uMix, 0.999);
    vec4 col = mix(a, b, shown);
    col.rgb += burn * vec3(1.0, 0.72, 0.42) * 0.8 * max(a.a, b.a);
    gl_FragColor = vec4(col.rgb, col.a * uOpacity);
  }
`;
