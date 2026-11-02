export type Insets = { top: number; right: number; bottom: number; left: number };

/** Where the lightbox photo may sit (CSS px). The corridor zooms to the same box so the hand-off is seamless. */
export function lightboxInsets(width: number, height: number): Insets {
  if (width >= 960) {
    return { top: 76, right: 380, bottom: 76, left: 76 };
  }
  return { top: 68, right: 14, bottom: Math.round(Math.min(250, height * 0.36)), left: 14 };
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
