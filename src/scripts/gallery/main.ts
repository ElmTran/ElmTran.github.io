import type { GalleryItem } from "../../lib/gallery";
import { loadImage } from "./images";
import { smoothstep } from "./layout";
import { createLightbox, type Presenter } from "./lightbox";
import { initPhotoWall } from "./wall";

const pad = (n: number) => String(n).padStart(2, "0");

function fallbackToGrid() {
  document.documentElement.dataset.gallery = "grid";
  document.body.classList.remove("page-home-photo", "gallery-3d");
}

async function boot() {
  const root = document.querySelector<HTMLElement>("[data-gallery]");
  const dialog = document.querySelector<HTMLDialogElement>("[data-lightbox]");
  const items = JSON.parse(document.getElementById("gallery-data")?.textContent ?? "[]") as GalleryItem[];
  if (!root || !dialog || items.length === 0) {
    return;
  }

  initPhotoWall(root);

  let lightbox: ReturnType<typeof createLightbox> | undefined;
  let presenter: Presenter | undefined;

  if (document.documentElement.dataset.gallery === "3d") {
    try {
      const { createGalleryScene } = await import("./corridor");
      // If the asset host doesn't allow this origin (CORS), every texture fails; the first one tells us before we build.
      await loadImage(items[0].sm);
      const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
      const outro = q<HTMLElement>("[data-gallery-outro]");
      const caption = q<HTMLButtonElement>("[data-gallery-caption]");
      const captionNo = q<HTMLElement>("[data-caption-no]");
      const captionTitle = q<HTMLElement>("[data-caption-title]");
      const captionMeta = q<HTMLElement>("[data-caption-meta]");
      const dots = [...root.querySelectorAll<HTMLButtonElement>("[data-gallery-dot]")];
      let shown = -2;

      const scene = createGalleryScene(
        q<HTMLCanvasElement>("[data-gallery-canvas]"),
        q<HTMLElement>("[data-gallery-track]"),
        items,
        {
          onFrame(progress, index) {
            root.style.setProperty("--intro", String(1 - smoothstep(-0.92, -0.5, progress)));
            outro.style.opacity = String(smoothstep(items.length - 0.5, items.length - 0.05, progress));
            outro.inert = progress < items.length - 0.3;
            if (index === shown) {
              return;
            }
            shown = index;
            caption.hidden = index < 0;
            dots.forEach((dot, i) => dot.toggleAttribute("aria-current", i === index));
            if (index >= 0) {
              const item = items[index];
              captionNo.textContent = `${pad(index + 1)} / ${pad(items.length)}`;
              captionTitle.textContent = item.title;
              captionMeta.textContent = [item.place, item.date?.replaceAll("-", ".")].filter(Boolean).join("  ·  ");
              caption.animate(
                [
                  { opacity: 0, transform: "translateY(12px)" },
                  { opacity: 1, transform: "none" },
                ],
                { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
              );
            }
          },
          onSelect(index) {
            void lightbox?.open(index);
          },
        },
      );

      presenter = {
        open: scene.openPhoto,
        show: scene.showPhoto,
        close: scene.closePhoto,
      };
      caption.addEventListener("click", () => shown >= 0 && void lightbox?.open(shown));
      dots.forEach((dot, i) =>
        dot.addEventListener("click", () => (scene.current === i ? void lightbox?.open(i) : scene.scrollToIndex(i))),
      );
      root.querySelector("[data-gallery-restart]")?.addEventListener("click", () => scene.scrollToIndex(-1));
      document.addEventListener("keydown", (e) => {
        if (dialog.open || e.defaultPrevented || (e.target as Element).closest("input, textarea, select, button, a")) {
          return;
        }
        const current = scene.current >= 0 ? scene.current : shown;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          scene.scrollToIndex(Math.min(items.length, current + 1));
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          scene.scrollToIndex(Math.max(-1, current - 1));
        } else if (e.key === "Enter" && current >= 0) {
          void lightbox?.open(current);
        }
      });
    } catch (err) {
      console.error("3D gallery failed, falling back to grid", err);
      fallbackToGrid();
    }
  }

  lightbox = createLightbox(dialog, items, presenter);
  root.querySelectorAll<HTMLButtonElement>("[data-photo-index]").forEach((btn) =>
    btn.addEventListener("click", () => void lightbox?.open(Number(btn.dataset.photoIndex))),
  );
}

void boot();
