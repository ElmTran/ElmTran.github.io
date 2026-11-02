// Builds src/data/globe-land.json for the /about/ globe: which points of an even (Fibonacci) sphere sit on land.
// The result is a bitset, so the page needs neither map data nor a geo library at runtime.
//
//   node tools/about/land-dots.mjs
//
// Land shapes: Natural Earth 1:110m via world-atlas (fetched once, nothing to install).
// Keep COUNT in step with src/scripts/about/globe.ts, which rebuilds the same sphere.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const COUNT = 42000;
const SOUTH_LIMIT = -63; // drop Antarctica: it only crowds the bottom of the globe
const SOURCE = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../src/data/globe-land.json");

/** TopoJSON → rings of [lon, lat]. Arcs are quantised and delta-encoded; a negative index means a reversed arc. */
function decodeRings(topology, object) {
  const { scale, translate } = topology.transform;
  const arcs = topology.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
  const ring = (indexes) =>
    indexes.flatMap((i, k) => {
      const points = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
      return k === 0 ? points : points.slice(1);
    });
  const polygons = [];
  for (const geometry of object.geometries) {
    const list = geometry.type === "Polygon" ? [geometry.arcs] : geometry.type === "MultiPolygon" ? geometry.arcs : [];
    for (const polygon of list) {
      polygons.push(polygon.map(ring));
    }
  }
  return polygons;
}

function bounds(rings) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of rings[0]) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/** Even-odd test over every ring of a polygon, so holes (lakes, inland seas) stay empty. */
function inside(rings, x, y) {
  let hit = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        hit = !hit;
      }
    }
  }
  return hit;
}

const topology = await fetch(SOURCE).then((r) => {
  if (!r.ok) throw new Error(`${SOURCE}: ${r.status}`);
  return r.json();
});
const polygons = decodeRings(topology, topology.objects.land).map((rings) => ({ rings, box: bounds(rings) }));

const bits = new Uint8Array(Math.ceil(COUNT / 8));
const golden = Math.PI * (3 - Math.sqrt(5));
let land = 0;
for (let i = 0; i < COUNT; i++) {
  const y = 1 - (i / (COUNT - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = (Math.atan2(Math.cos(theta) * r, Math.sin(theta) * r) * 180) / Math.PI;
  if (lat < SOUTH_LIMIT) continue;
  const onLand = polygons.some(
    ({ rings, box }) =>
      lon >= box.minX && lon <= box.maxX && lat >= box.minY && lat <= box.maxY && inside(rings, lon, lat),
  );
  if (onLand) {
    bits[i >> 3] |= 1 << (i & 7);
    land++;
  }
}

fs.writeFileSync(OUT, `${JSON.stringify({ count: COUNT, land: Buffer.from(bits).toString("base64") })}\n`);
console.log(`${land} of ${COUNT} points on land → ${path.relative(process.cwd(), OUT)}`);
