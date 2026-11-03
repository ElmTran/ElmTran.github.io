# elmtran.github.io

Personal site and blog, built with [Astro](https://astro.build/). Essays live under `/essays/`, photos under `/photos/`.

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Local dev server         |
| `pnpm run build` | Static build → `dist/`   |
| `pnpm preview`   | Preview production build |
| `pnpm check`     | Astro type/content check |

## Content

- Blog posts: `content/blog/*.md`. Posts in category `writing` or `reflection` are **Writing**; everything else is a
  **Note**. `/essays/` shows Writing in three views — 片语 (each piece by one line; the default for a new visit), 成章
  (chapters) and 开卷 (list + opening lines) — with Notes below. The 宋 / 楷 switch picks the reading font. Optional
  frontmatter:

  | Field     | Used for                                                                                     |
  | --------- | -------------------------------------------------------------------------------------------- |
  | `chapter` | Writing: an `essayChapters` id in `src/site.ts` (missing → last chapter)                     |
  | `place`   | Writing: where the story happens, shown above the title                                      |
  | `line`    | Writing: the one line kept from the piece (片语); falls back to `description`                |
  | `photo`   | Photo above the title — a `galleryPhotos` src adds its caption and EXIF, any URL also works |
  | `series`  | Same name links posts as a series; in Notes they fold into one row                          |
- Photos: list them in `galleryPhotos` (`src/site.ts`), then generate textures and depth maps for the 3D gallery:

  ```bash
  ONNXRUNTIME_NODE_INSTALL=skip npm --prefix tools/gallery install   # once
  npm --prefix tools/gallery run prepare-assets                      # new photos only; add -- --force to redo all
  ```

  This writes `public/gallery/*` (git-ignored) and `src/data/gallery-assets.json` (commit it). Upload the new files from
  `public/gallery/` to `https://img.elmtran.com/gallery/` — the site loads them from there (`galleryAssetBase` in `src/site.ts`).
  The host must allow CORS for every origin the site is served from, otherwise `/photos/` falls back to the grid.
  `/photos/?view=grid` shows the grid.
- About: the places, photos and the notes on the back of each print are `aboutStops` in `src/site.ts` (photos must be
  in `galleryPhotos`). The globe's land dots come from `src/data/globe-land.json`; regenerate with
  `node tools/about/land-dots.mjs` only if you change the dot count.

## Deploy

Example (Cloudflare Pages): build command `pnpm run build`, output directory `dist`.

## License

MIT — see [`LICENSE`](LICENSE).

[![License][license-shield]][license-url]

[license-shield]: https://img.shields.io/github/license/ElmTran/elmtran.github.io
[license-url]: https://github.com/ElmTran/elmtran.github.io/blob/master/LICENSE
