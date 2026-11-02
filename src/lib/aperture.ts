/**
 * Brand mark: six aperture blades. Each blade edge runs from a corner of the inner hexagon (tangent to a circle of
 * radius `inner`) out to the rim. Scaling the whole set about the centre is the same as opening the aperture, which is
 * what the header's hover animation does (clipped to the rim).
 */
export function aperturePath(inner = 3.6, rotation = 0.35, rim = 9.3, cx = 12, cy = 12) {
  const half = Math.tan(Math.PI / 6);
  const reach = Math.sqrt(rim * rim - inner * inner);
  let d = "";
  for (let i = 0; i < 6; i++) {
    const angle = rotation + (i * Math.PI) / 3;
    const tx = cx + inner * Math.cos(angle);
    const ty = cy + inner * Math.sin(angle);
    const dx = -Math.sin(angle);
    const dy = Math.cos(angle);
    const x0 = tx - inner * half * dx;
    const y0 = ty - inner * half * dy;
    d += `M${x0.toFixed(2)} ${y0.toFixed(2)}L${(tx + reach * dx).toFixed(2)} ${(ty + reach * dy).toFixed(2)}`;
  }
  return d;
}
