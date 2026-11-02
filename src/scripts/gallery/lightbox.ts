import type { GalleryItem } from "../../lib/gallery";

/** What actually draws the photo: the WebGL corridor, or a plain <img> fallback. */
export type Presenter = {
  open(index: number): Promise<void>;
  show(index: number): void;
  close(): Promise<void>;
};

const pad = (n: number) => String(n).padStart(2, "0");

function exposureLine(exif: NonNullable<GalleryItem["exif"]>) {
  return [exif.focalLength, exif.aperture, exif.shutter, exif.iso && `ISO ${exif.iso}`].filter(Boolean).join("  ·  ");
}

function specRows(item: GalleryItem): [string, string][] {
  const exif = item.exif;
  if (!exif) {
    return [];
  }
  const rows: [string, string][] = [];
  if (exif.camera) rows.push(["Camera", exif.camera]);
  if (exif.lens) rows.push(["Lens", exif.lens]);
  const exposure = exposureLine(exif);
  if (exposure) rows.push(["Exposure", exposure]);
  if (exif.exposureComp && Number.parseFloat(exif.exposureComp) !== 0) rows.push(["Comp.", `${exif.exposureComp} EV`]);
  if (exif.flash && !/^no flash/i.test(exif.flash)) rows.push(["Flash", exif.flash]);
  return rows;
}

export function createLightbox(dialog: HTMLDialogElement, items: GalleryItem[], presenter?: Presenter) {
  const q = <T extends Element>(selector: string) => dialog.querySelector<T>(selector)!;
  const img = q<HTMLImageElement>("[data-lightbox-img]");
  const label = q<HTMLElement>("[data-lightbox-label]");
  const no = q<HTMLElement>("[data-label-no]");
  const title = q<HTMLElement>("[data-label-title]");
  const meta = q<HTMLElement>("[data-label-meta]");
  const spec = q<HTMLDListElement>("[data-label-spec]");
  const counter = q<HTMLElement>("[data-lightbox-counter]");
  const count = items.length;
  let index = 0;
  let closing = false;

  const showImage = (item: GalleryItem) => {
    img.src = item.lg;
    img.alt = item.alt;
  };
  const plain: Presenter = {
    async open(i) {
      showImage(items[i]);
    },
    show(i) {
      img.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
      showImage(items[i]);
    },
    async close() {},
  };
  const view = presenter ?? plain;
  dialog.classList.toggle("lightbox--plain", !presenter);

  function fill(i: number) {
    const item = items[i];
    no.textContent = `No. ${pad(i + 1)}`;
    title.textContent = item.title;
    meta.textContent = [item.place, item.date?.replaceAll("-", ".")].filter(Boolean).join("  ·  ");
    spec.replaceChildren(
      ...specRows(item).map(([k, v]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = k;
        dd.textContent = v;
        row.append(dt, dd);
        return row;
      }),
    );
    spec.hidden = spec.childElementCount === 0;
    counter.textContent = `${pad(i + 1)} / ${pad(count)}`;
    if (!dialog.classList.contains("is-ready")) {
      return;
    }
    label.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }

  async function open(i: number) {
    if (dialog.open || closing) {
      return;
    }
    index = i;
    fill(i);
    document.documentElement.classList.add("is-lightbox-open");
    dialog.classList.remove("is-ready");
    dialog.showModal();
    await view.open(i);
    if (dialog.open && !closing) {
      dialog.classList.add("is-ready");
    }
  }

  function go(step: number) {
    if (!dialog.open || closing || count < 2) {
      return;
    }
    index = (index + step + count) % count;
    fill(index);
    view.show(index);
  }

  async function close() {
    if (!dialog.open || closing) {
      return;
    }
    closing = true;
    dialog.classList.remove("is-ready");
    await view.close();
    dialog.close();
    document.documentElement.classList.remove("is-lightbox-open");
    closing = false;
  }

  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    void close();
  });
  // The browser may still force the dialog shut (e.g. Escape pressed twice without other input); tidy up after it.
  dialog.addEventListener("close", () => {
    if (!closing) {
      dialog.classList.remove("is-ready");
      document.documentElement.classList.remove("is-lightbox-open");
      void view.close();
    }
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  });
  q("[data-lightbox-close]").addEventListener("click", () => void close());
  q("[data-lightbox-prev]").addEventListener("click", () => go(-1));
  q("[data-lightbox-next]").addEventListener("click", () => go(1));

  // Swipe to browse; a tap on the backdrop or the photo closes.
  let downX = 0;
  let downY = 0;
  let swiped = false;
  dialog.addEventListener("pointerdown", (e) => {
    downX = e.clientX;
    downY = e.clientY;
    swiped = false;
  });
  dialog.addEventListener("pointerup", (e) => {
    const dx = e.clientX - downX;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - downY) * 1.4) {
      swiped = true;
      go(dx < 0 ? 1 : -1);
    }
  });
  dialog.addEventListener("click", (e) => {
    const target = e.target as Element;
    if (!swiped && (target === dialog || target.closest("[data-lightbox-stage]"))) {
      void close();
    }
  });

  return { open, close };
}
