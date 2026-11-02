import type { GlobePlace } from "./globe";
import { createPrintViewer } from "./viewer";

/** html[data-about] is set before first paint: "3d" for the globe walk, "flat" for a plain column of prints. */
function fallbackToFlat() {
  document.documentElement.dataset.about = "flat";
}

async function boot() {
  const root = document.querySelector<HTMLElement>("[data-about]");
  const dialog = document.querySelector<HTMLDialogElement>("[data-about-viewer]");
  if (!root || !dialog) return;

  createPrintViewer(root, dialog);

  if (document.documentElement.dataset.about !== "3d") return;

  const stops = [...root.querySelectorAll<HTMLElement>("[data-about-stop]")];
  const stepButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-about-step]")];
  const hint = root.querySelector<HTMLElement>("[data-about-hint]");
  const places: GlobePlace[] = stops.map((el) =>
    el.dataset.lat
      ? {
          name: el.dataset.name ?? "",
          label: el.dataset.label ?? "",
          lat: Number(el.dataset.lat),
          lon: Number(el.dataset.lon),
          now: el.hasAttribute("data-now"),
        }
      : null,
  );

  try {
    const { createAboutGlobe } = await import("./globe");
    const globe = createAboutGlobe(
      root.querySelector<HTMLCanvasElement>("[data-about-canvas]")!,
      root.querySelector<HTMLElement>("[data-about-track]")!,
      root.querySelector<HTMLElement>("[data-about-pin]")!,
      places,
      {
        onStop(index) {
          stops.forEach((el, i) => {
            el.classList.toggle("is-current", i === index);
            el.classList.toggle("is-past", i < index);
            // Only the visible stop can take focus; the others are stacked underneath it.
            el.inert = i !== index;
          });
          stepButtons.forEach((btn, i) => btn.toggleAttribute("aria-current", i === index));
          hint?.classList.toggle("is-hidden", index > 0);
        },
      },
    );
    stepButtons.forEach((btn, i) => btn.addEventListener("click", () => globe.scrollToStop(i)));
    document.addEventListener("keydown", (e) => {
      if (dialog.open || e.defaultPrevented || (e.target as Element).closest("input, textarea, select")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        globe.scrollToStop(Math.min(stops.length - 1, globe.current + 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        globe.scrollToStop(Math.max(0, globe.current - 1));
      }
    });
  } catch (err) {
    console.error("About globe failed, falling back to the flat layout", err);
    fallbackToFlat();
    stops.forEach((el) => (el.inert = false));
  }
}

void boot();
