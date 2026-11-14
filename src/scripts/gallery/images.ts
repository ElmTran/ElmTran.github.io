const cache = new Map<string, Promise<HTMLImageElement>>();

/**
 * WebGL needs cross-origin images fetched in CORS mode. The grid view loads the same files as plain <img>s, and a
 * browser may answer a CORS request from that cached no-CORS copy (which has no Access-Control-Allow-Origin) and fail
 * it. A separate query string gives the CORS fetch its own cache entry, so the grid never depends on CORS.
 */
function corsUrl(url: string) {
  const parsed = new URL(url, location.href);
  if (parsed.origin === location.origin) {
    return null;
  }
  parsed.searchParams.set("cors", "1");
  return parsed.href;
}

/** Decoded image, shared between the corridor and lightbox so each file is fetched once. */
export function loadImage(url: string): Promise<HTMLImageElement> {
  let pending = cache.get(url);
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const cors = corsUrl(url);
      if (cors) {
        img.crossOrigin = "anonymous";
      }
      img.decoding = "async";
      img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
      img.onerror = () => reject(new Error(`Failed to load ${url}`));
      img.src = cors ?? url;
    });
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}

/** A photo ready to become a WebGL texture. */
export type Pixels = {
  image: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  /** False when the pixels are already upside down, the way WebGL wants them. */
  flipY: boolean;
  /** Frees a bitmap's memory now rather than whenever it's garbage-collected. */
  close(): void;
};

/** What three.js asks of an <img> upload (flipped, no colour conversion), done at decode time instead. */
const BITMAP_OPTIONS: ImageBitmapOptions = {
  imageOrientation: "flipY",
  premultiplyAlpha: "none",
  colorSpaceConversion: "none",
};

let bitmapCheck: Promise<boolean> | undefined;

/**
 * Whether createImageBitmap honours those options for an encoded image. Some browsers have ignored them (three.js
 * avoids bitmaps in Safari before 17 and Firefox before 98), which would turn photos upside down, so check once on a
 * 1×2 PNG: white over black, flipped.
 */
function bitmapsWork() {
  bitmapCheck ??= (async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 2;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 1, 1, 1);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    const bitmap = await createImageBitmap(blob!, BITMAP_OPTIONS);
    ctx.clearRect(0, 0, 1, 2);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return ctx.getImageData(0, 0, 1, 1).data[0] < 128;
  })().catch(() => false);
  return bitmapCheck;
}

/**
 * A photo for a texture that is uploaded later. Chrome decodes an <img> all over again when it's uploaded without
 * colour conversion, on the main thread: tens of ms per photo, a visible stall. A bitmap is decoded off the main thread
 * with those settings already applied, and uploads in a few ms. Falls back to the shared <img> where bitmaps fail the
 * check above.
 */
export async function loadPixels(url: string): Promise<Pixels> {
  if (await bitmapsWork()) {
    const response = await fetch(corsUrl(url) ?? url, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Failed to load ${url}`);
    }
    const image = await createImageBitmap(await response.blob(), BITMAP_OPTIONS);
    return { image, width: image.width, height: image.height, flipY: false, close: () => image.close() };
  }
  const image = await loadImage(url);
  return { image, width: image.naturalWidth, height: image.naturalHeight, flipY: true, close() {} };
}
