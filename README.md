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

- Blog posts: `content/blog/*.md`
- Photos: list them in `galleryPhotos` (`src/site.ts`), then generate textures and depth maps for the 3D gallery:

  ```bash
  ONNXRUNTIME_NODE_INSTALL=skip npm --prefix tools/gallery install   # once
  npm --prefix tools/gallery run prepare-assets                      # new photos only; add -- --force to redo all
  ```

  This writes `public/gallery/*` (git-ignored) and `src/data/gallery-assets.json` (commit it). Upload the new files from
  `public/gallery/` to `https://img.elmtran.com/gallery/` — the site loads them from there (`galleryAssetBase` in `src/site.ts`).
  The host must allow CORS for every origin the site is served from, otherwise `/photos/` falls back to the grid.
  `/photos/?view=grid` shows the grid.

## Deploy

Example (Cloudflare Pages): build command `pnpm run build`, output directory `dist`.

## License

MIT — see [`LICENSE`](LICENSE).

[![License][license-shield]][license-url]

[license-shield]: https://img.shields.io/github/license/ElmTran/elmtran.github.io
[license-url]: https://github.com/ElmTran/elmtran.github.io/blob/master/LICENSE
