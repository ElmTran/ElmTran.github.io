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
