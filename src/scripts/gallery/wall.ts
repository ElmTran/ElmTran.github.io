const MAX_PER_ROW = 6;
const ONE_COLUMN = "(max-width: 720px)";

/**
 * Row height for every photo, choosing the line breaks that keep rows closest to `target`.
 * The last row may stop short rather than blow up to fill the width.
 */
function rowHeights(aspects: number[], width: number, gap: number, target: number) {
  const n = aspects.length;
  const cost = new Array<number>(n + 1).fill(Infinity);
  const start = new Array<number>(n + 1).fill(0);
  cost[0] = 0;
  for (let end = 1; end <= n; end++) {
    let sum = 0;
    for (let i = end - 1; i >= Math.max(0, end - MAX_PER_ROW); i--) {
      sum += aspects[i];
      const gaps = gap * (end - i - 1);
      const height = (width - gaps) / sum;
      const shortLast = end === n && height > target;
      const penalty = shortLast ? (1 - (sum * target + gaps) / width) ** 2 : Math.log(height / target) ** 2;
      if (cost[i] + penalty < cost[end]) {
        cost[end] = cost[i] + penalty;
        start[end] = i;
      }
    }
  }

  const heights = new Array<number>(n);
  for (let end = n; end > 0; end = start[end]) {
    const i = start[end];
    const sum = aspects.slice(i, end).reduce((a, b) => a + b, 0);
    const height = (width - gap * (end - i - 1)) / sum;
    // Rounded down so a row can never overflow and wrap; flex-grow takes up the fraction of a pixel left over.
    heights.fill(Math.floor(Math.min(height, end === n ? target : height) * 100) / 100, i, end);
  }
  return heights;
}

/** CSS alone gives greedy rows; this only picks better line breaks, by setting each tile's --row-h. */
export function initPhotoWall(root: HTMLElement) {
  const wall = root.querySelector<HTMLElement>("[data-photo-wall]");
  if (!wall) {
    return;
  }
  const tiles = [...wall.children] as HTMLElement[];
  const aspects = tiles.map((tile) => Number(tile.style.getPropertyValue("--aspect")));
  const oneColumn = matchMedia(ONE_COLUMN);
  let applied = "";

  const layout = () => {
    const style = getComputedStyle(wall);
    const width = wall.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const gap = parseFloat(style.columnGap);
    const target = parseFloat(style.getPropertyValue("--row-target"));
    const key = `${width}/${gap}/${target}`;
    if (width <= 0 || !Number.isFinite(target) || oneColumn.matches || key === applied) {
      return;
    }
    applied = key;
    rowHeights(aspects, width, gap, target).forEach((height, i) => {
      tiles[i].style.setProperty("--row-h", `${height}px`);
    });
  };

  new ResizeObserver(layout).observe(wall);
  addEventListener("resize", layout, { passive: true });

  for (const tile of tiles) {
    const img = tile.querySelector("img");
    if (img && !img.complete) {
      tile.classList.add("is-loading");
      const done = () => tile.classList.remove("is-loading");
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  }
}
