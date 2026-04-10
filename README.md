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

- Blog posts: `docs/blog/_posts/*.md`
- Optional page markdown: `docs/about.md` (not used by the live About page; kept as reference text)

## Deploy

Example (Cloudflare Pages): build command `pnpm run build`, output directory `dist`.

## License

MIT — see [`LICENSE`](LICENSE).

[![License][license-shield]][license-url]

[license-shield]: https://img.shields.io/github/license/ElmTran/elmtran.github.io
[license-url]: https://github.com/ElmTran/elmtran.github.io/blob/master/LICENSE
