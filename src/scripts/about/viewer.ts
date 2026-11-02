import { clamp } from "../gallery/layout";

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/**
 * The print viewer: the small print in the copy flies to the middle of the screen, grows, and turns over to the note
 * on its back. Closing sends it back to where it came from. With reduced motion it simply fades in, already turned.
 */
export function createPrintViewer(root: HTMLElement, dialog: HTMLDialogElement) {
  const card = dialog.querySelector<HTMLElement>("[data-about-card]")!;
  const veil = dialog.querySelector<HTMLElement>("[data-about-veil]")!;
  const tiltEl = dialog.querySelector<HTMLElement>("[data-about-tilt]")!;
  const front = dialog.querySelector<HTMLElement>("[data-card-front]")!;
  const back = dialog.querySelector<HTMLElement>("[data-card-back]")!;
  const turnButton = dialog.querySelector<HTMLButtonElement>("[data-about-turn]")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  let source: HTMLElement | null = null;
  let busy = false;
  let flipped = false;
  let raf = 0;
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };

  /** Transform that puts the card exactly over the small print (same centre, size and angle). */
  function fromSource(el: HTMLElement) {
    const sheet = el.querySelector<HTMLElement>(".print-sheet") ?? el;
    const from = sheet.getBoundingClientRect();
    const to = card.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    // Read the angle off the live transform: the print may be mid-way through its hover straighten.
    const matrix = new DOMMatrixReadOnly(getComputedStyle(sheet).transform.replace("none", ""));
    const angle = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    return `translate(${dx}px, ${dy}px) scale(${sheet.offsetWidth / card.offsetWidth}) rotate(${angle}deg)`;
  }

  function fadeVeil(to: 0 | 1, duration: number) {
    veil.getAnimations().forEach((a) => a.cancel());
    return veil.animate([{ opacity: 1 - to }, { opacity: to }], { duration, easing: "ease-out", fill: "forwards" });
  }

  function setFlipped(next: boolean, animate = true) {
    flipped = next;
    card.classList.toggle("is-flipped", next);
    card.classList.toggle("no-transition", !animate);
    // Whichever side faces away stays out of the tab order.
    front.inert = next;
    back.inert = !next;
    turnButton.textContent = next ? "See the photo ↻" : "Turn over ↻";
  }

  function followPointer() {
    raf = requestAnimationFrame(followPointer);
    tilt.x += (pointer.x - tilt.x) * 0.08;
    tilt.y += (pointer.y - tilt.y) * 0.08;
    tiltEl.style.transform = `rotateX(${(-tilt.y * 12).toFixed(2)}deg) rotateY(${(tilt.x * 14).toFixed(2)}deg)`;
    card.style.setProperty("--glare-x", `${50 + tilt.x * 45}%`);
    card.style.setProperty("--glare-y", `${40 + tilt.y * 45}%`);
  }

  async function open(index: number) {
    if (busy || dialog.open) return;
    const button = root.querySelector<HTMLElement>(`[data-about-print="${index}"]`);
    const note = root.querySelector<HTMLElement>(`[data-about-back="${index}"]`);
    if (!button || !note) return;
    busy = true;
    source = button;
    front.replaceChildren(...button.querySelector(".print-front")!.cloneNode(true).childNodes);
    back.replaceChildren(...note.cloneNode(true).childNodes);
    card.getAnimations().forEach((a) => a.cancel());

    setFlipped(false, false);
    document.documentElement.classList.add("is-print-open");
    dialog.showModal();
    tiltEl.style.transform = "";
    pointer.x = pointer.y = tilt.x = tilt.y = 0;

    if (reduce.matches) {
      setFlipped(true, false);
      fadeVeil(1, 200);
      await card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }).finished;
    } else {
      button.style.visibility = "hidden";
      const fly = card.animate([{ transform: fromSource(button) }, { transform: "none" }], {
        duration: 760,
        easing: EASE,
      });
      fadeVeil(1, 500);
      // Start turning over once the print is clear of the column.
      setTimeout(() => dialog.open && setFlipped(true), 260);
      await fly.finished;
      raf = requestAnimationFrame(followPointer);
    }
    busy = false;
  }

  async function close() {
    if (busy || !dialog.open) return;
    busy = true;
    cancelAnimationFrame(raf);
    const target = source;
    if (!reduce.matches && target) {
      tiltEl.style.transition = "transform 400ms ease";
      tiltEl.style.transform = "";
      setFlipped(false);
      fadeVeil(0, 700);
      await card.animate([{ transform: "none" }, { transform: fromSource(target) }], {
        duration: 720,
        delay: 140,
        easing: "cubic-bezier(0.55, 0, 0.25, 1)",
        fill: "forwards",
      }).finished;
      tiltEl.style.transition = "";
    }
    dialog.close();
    finish();
  }

  /** Put everything back, whichever way the dialog closed. */
  function finish() {
    cancelAnimationFrame(raf);
    document.documentElement.classList.remove("is-print-open");
    if (source) {
      source.style.visibility = "";
      source.focus({ preventScroll: true });
    }
    source = null;
    busy = false;
  }

  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    void close();
  });
  dialog.addEventListener("close", () => {
    if (source) finish();
  });
  dialog.addEventListener("click", (e) => {
    const target = e.target as Element;
    if (target.closest("a")) return;
    if (target.closest("[data-about-close], [data-about-veil]") || target === dialog) {
      void close();
    } else if (target.closest("[data-about-card], [data-about-turn]") && !busy) {
      setFlipped(!flipped);
    }
  });
  dialog.addEventListener("pointermove", (e) => {
    pointer.x = clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1);
    pointer.y = clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1);
  });

  root.querySelectorAll<HTMLElement>("[data-about-print]").forEach((button) =>
    button.addEventListener("click", () => void open(Number(button.dataset.aboutPrint))),
  );

  return { open, close };
}
