/**
 * /essays/ index: filtering (header search, ?q= / ?tag= / ?category=, the Notes chips), the lit line in 片语,
 * and the preview card in 开卷. The view and font switch lives in EssaysChrome.astro.
 */

const root = document.documentElement;
const notes = document.querySelector<HTMLElement>("[data-essays-notes]")!;
const chips = notes.querySelectorAll<HTMLButtonElement>(".essays-chip[data-cat]");
const rows = document.querySelectorAll<HTMLElement>("[data-essays-row]");
const search = document.getElementById("site-essay-search") as HTMLInputElement | null;
const form = document.querySelector<HTMLFormElement>("form.site-nav-search");
const filterBars = document.querySelectorAll<HTMLElement>("[data-essays-filter]");
const writingEmpty = document.querySelector<HTMLElement>("[data-essays-writing-empty]")!;
const notesEmpty = notes.querySelector<HTMLElement>("[data-essays-notes-empty]")!;
const noteCats = new Set([...chips].map((c) => c.dataset.cat).filter(Boolean));

const state = { q: "", tag: "", category: "" };

function readUrl() {
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") ?? "";
  state.tag = params.get("tag") ?? "";
  // Older links also used ?category=writing; only the notes categories filter anything.
  const category = params.get("category") ?? "";
  state.category = noteCats.has(category) ? category : "";
  if (search) search.value = state.q;
}

function syncUrl() {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.tag) params.set("tag", state.tag);
  if (state.category) params.set("category", state.category);
  const qs = params.toString();
  history.replaceState(null, "", `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`);
}

function renderFilterBars() {
  const parts: string[] = [];
  if (state.tag) parts.push(`#${state.tag}`);
  if (state.q.trim()) parts.push(`“${state.q.trim()}”`);
  filterBars.forEach((bar) => {
    bar.hidden = parts.length === 0;
    bar.replaceChildren();
    if (!parts.length) return;
    const label = document.createElement("span");
    label.className = "essays-mono";
    label.textContent = "Showing";
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "essays-chip essays-chip--clear";
    clear.textContent = parts.join(" + ");
    clear.setAttribute("aria-label", `Clear filter ${parts.join(" ")}`);
    clear.addEventListener("click", () => {
      state.q = "";
      state.tag = "";
      if (search) search.value = "";
      apply();
    });
    bar.append(label, clear);
  });
}

function apply() {
  const q = state.q.trim().toLowerCase();
  rows.forEach((row) => {
    const tags: string[] = JSON.parse(row.dataset.tags || "[]");
    const inNotes = notes.contains(row);
    row.hidden = !(
      (!q || (row.dataset.search ?? "").includes(q)) &&
      (!state.tag || tags.includes(state.tag)) &&
      (!inNotes || !state.category || row.dataset.cat === state.category)
    );
  });

  notes.querySelectorAll<HTMLElement>("[data-essays-series]").forEach((li) => {
    const any = li.querySelector("[data-essays-row]:not([hidden])");
    li.hidden = !any;
    li.querySelector("details")!.open = Boolean(any && (q || state.tag));
  });
  document.querySelectorAll<HTMLElement>("[data-essays-group]").forEach((group) => {
    group.hidden = !group.querySelector("[data-essays-row]:not([hidden])");
  });

  writingEmpty.hidden = Boolean(document.querySelector("[data-essays-frag]:not([hidden])"));
  notesEmpty.hidden = Boolean(notes.querySelector("[data-essays-group]:not([hidden])"));
  chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.cat === state.category)));
  renderFilterBars();
  syncUrl();
  updateFocus();
  keepPreviewVisible();
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    state.category = chip.dataset.cat ?? "";
    apply();
  });
});

if (search) {
  search.placeholder = "Search writing & notes…";
  search.addEventListener("input", () => {
    state.q = search.value;
    apply();
  });
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (search) state.q = search.value;
  apply();
});

window.addEventListener("popstate", () => {
  readUrl();
  apply();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
  const target = e.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  ) {
    return;
  }
  e.preventDefault();
  search?.focus();
  search?.select();
});

/* ---------- 片语: the line nearest the middle of the screen is lit ---------- */

const frags = document.querySelectorAll<HTMLElement>("[data-essays-frag]");
let focusQueued = false;

function updateFocus() {
  focusQueued = false;
  if ((root.dataset.essaysView ?? "lines") !== "lines") return;
  const mid = window.innerHeight * 0.5;
  const reach = window.innerHeight * 0.42;
  frags.forEach((el) => {
    if (el.hidden) return;
    const r = el.getBoundingClientRect();
    const d = Math.abs(r.top + r.height / 2 - mid);
    el.style.setProperty("--focus", Math.max(0, 1 - d / reach).toFixed(3));
  });
}

function queueFocus() {
  if (!focusQueued) {
    focusQueued = true;
    requestAnimationFrame(updateFocus);
  }
}

window.addEventListener("scroll", queueFocus, { passive: true });
window.addEventListener("resize", queueFocus);
document.addEventListener("essays:view", queueFocus);

/* ---------- 开卷: the card follows the hovered or focused piece ---------- */

const previewLinks = document.querySelectorAll<HTMLAnchorElement>("[data-pv]");
const previewCards = document.querySelectorAll<HTMLElement>("[data-pv-card]");

function showPreview(slug: string) {
  previewLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.pv === slug));
  previewCards.forEach((c) => c.classList.toggle("is-active", c.dataset.pvCard === slug));
}

function keepPreviewVisible() {
  const active = document.querySelector<HTMLElement>("[data-pv].is-active");
  if (active && !active.closest("[hidden]")) return;
  const first = [...previewLinks].find((l) => !l.closest("[hidden]"));
  if (first) showPreview(first.dataset.pv!);
}

previewLinks.forEach((link) => {
  const show = () => showPreview(link.dataset.pv!);
  link.addEventListener("mouseenter", show);
  link.addEventListener("focus", show);
});

readUrl();
apply();
