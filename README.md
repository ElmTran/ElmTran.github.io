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
  | `photo`   | Photo above the title — a `content/photos` src adds its caption and EXIF, any URL also works |
  | `series`  | Same name links posts as a series; in Notes they fold into one row                          |
- Photos: one YAML file per photo in `content/photos/` — `src`, `rating` (1–5), `title`, `place`, `date`, `exif`.
  Photos rated `galleryFeaturedRating` (5, in `src/site.ts`) walk the 3D corridor; every photo is in the grid
  (`/photos/?view=grid`). Add photos straight from local files or folders (Windows paths such as `E:\…` work too):

  ```bash
  ONNXRUNTIME_NODE_INSTALL=skip npm --prefix tools/gallery install   # once
  pnpm photos add <files or folders…> --dry-run                      # preview names, metadata and sizes
  pnpm photos add <files or folders…> [--place 杭州] [--date 2022-10-31]
  ```

  For each image it reads title, city, rating and EXIF with exiftool (missing → 无题 / 未知 / 3★), names the upload
  `YYYYMMDD-<file>`, keeps the original under 10 MB, removes GPS from the uploaded copy, makes the textures and the
  depth map, uploads it all to R2 with rclone (originals at the bucket root, the rest under `gallery/`; an existing
  original is never overwritten), and writes `content/photos/<name>.yaml` and `src/data/gallery-assets.json`. Fill in
  the YAML afterwards, then commit both. `--place` / `--date` set the place / date of every photo in the run, over
  what the files say (say, when the camera clock was wrong). Needs exiftool, rclone with an `r2:` remote, and
  `R2_BUCKET`.
  `pnpm photos sync` makes the assets of any photo that has none (`--force` redoes them all) and prunes the manifest.
  The asset host (`galleryAssetBase`) must allow CORS for every origin the site is served from, otherwise `/photos/`
  falls back to the grid.
- About: the places, photos and the notes on the back of each print are `aboutStops` in `src/site.ts` (photos must be
  in `content/photos`). The globe's land dots come from `src/data/globe-land.json`; regenerate with
  `node tools/about/land-dots.mjs` only if you change the dot count.

## Deploy

Example (Cloudflare Pages): build command `pnpm run build`, output directory `dist`.

## License

MIT — see [`LICENSE`](LICENSE).

[![License][license-shield]][license-url]

[license-shield]: https://img.shields.io/github/license/ElmTran/elmtran.github.io
[license-url]: https://github.com/ElmTran/elmtran.github.io/blob/master/LICENSE
