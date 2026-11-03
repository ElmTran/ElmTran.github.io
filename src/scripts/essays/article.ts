/** Essays articles: the reading progress line (writing) and the current section in the contents (notes). */

const bar = document.querySelector<HTMLElement>("[data-read-progress]");
const body = document.querySelector<HTMLElement>("[data-read-body]");

if (bar && body) {
  let queued = false;
  const update = () => {
    queued = false;
    // Full once the last lines of the piece are on screen.
    const end = body.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.7;
    const progress = end > 0 ? window.scrollY / end : 1;
    bar.style.setProperty("--read-progress", Math.min(1, Math.max(0, progress)).toFixed(4));
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
}

const tocLinks = document.querySelectorAll<HTMLAnchorElement>("[data-toc]");
const sections = [...tocLinks]
  .map((a) => document.getElementById(a.dataset.toc!))
  .filter((el): el is HTMLElement => Boolean(el));

if (sections.length && "IntersectionObserver" in window) {
  const mark = () => {
    let current = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top < window.innerHeight * 0.3) current = s;
    }
    tocLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.toc === current.id));
  };
  const io = new IntersectionObserver(mark, { rootMargin: "0px 0px -60% 0px" });
  sections.forEach((s) => io.observe(s));
}
