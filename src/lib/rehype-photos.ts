import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { galleryAssetBase } from "../site";

/**
 * Photos inside a post. A Markdown image on a line of its own whose URL is a photo in content/photos (the same src as
 * in its YAML, like `photo:` in the frontmatter)
 *
 *   ![](https://img.elmtran.com/20221217-DSC02581.png)
 *
 * becomes a <figure class="read-photo"> with the web-size WebP instead of the original, its real proportions (no jump
 * while it loads) and the photo's title as the caption. Alt text written in the Markdown replaces the title; a photo
 * still called 无题 gets no caption. Any other image is left as it is.
 */

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type Photo = { title?: string; lg: string; sm: string; smWidth: number; lgWidth: number; ratio: number; color: string };

const PHOTOS_DIR = path.join(process.cwd(), "content/photos");
const ASSETS_FILE = path.join(process.cwd(), "src/data/gallery-assets.json");
const ASSET_BASE = galleryAssetBase.replace(/\/?$/, "/");
/** Widest a photo is shown in an article (see .read-photo in essays.css). */
const SIZES = "(min-width: 48rem) 48rem, 100vw";

/** Read fresh for every post, so `pnpm dev` picks up new photos and titles. */
function loadPhotos() {
  const assets = JSON.parse(fs.readFileSync(ASSETS_FILE, "utf8"));
  const photos = new Map<string, Photo>();
  for (const file of fs.readdirSync(PHOTOS_DIR)) {
    if (!/\.ya?ml$/.test(file)) continue;
    const data = parse(fs.readFileSync(path.join(PHOTOS_DIR, file), "utf8"));
    const prepared = data?.src && assets[data.src];
    if (!prepared) continue;
    photos.set(data.src, {
      title: data.title,
      lg: ASSET_BASE + prepared.lg,
      sm: ASSET_BASE + prepared.sm,
      smWidth: prepared.smWidth,
      lgWidth: prepared.lgWidth,
      ratio: prepared.width / prepared.height,
      color: prepared.color,
    });
  }
  return photos;
}

const isBlank = (node: HastNode) => node.type === "text" && !node.value?.trim();

/** The <img> a paragraph holds and nothing else. */
function loneImage(node: HastNode) {
  if (node.type !== "element" || node.tagName !== "p") return undefined;
  const content = (node.children ?? []).filter((child) => !isBlank(child));
  const [img] = content;
  return content.length === 1 && img.type === "element" && img.tagName === "img" ? img : undefined;
}

function figure(photo: Photo, written: string): HastNode {
  const title = photo.title && photo.title !== "无题" ? photo.title : "";
  const caption = written || title;
  const height = Math.round(photo.lgWidth / photo.ratio);
  return {
    type: "element",
    tagName: "figure",
    properties: {
      className: photo.ratio < 1 ? ["read-photo", "is-tall"] : ["read-photo"],
      style: `--ratio: ${photo.ratio.toFixed(4)}`,
    },
    children: [
      {
        type: "element",
        tagName: "img",
        properties: {
          src: photo.lg,
          srcSet: `${photo.sm} ${photo.smWidth}w, ${photo.lg} ${photo.lgWidth}w`,
          sizes: SIZES,
          width: photo.lgWidth,
          height,
          alt: caption,
          loading: "lazy",
          decoding: "async",
          style: `background-color: ${photo.color}`,
        },
        children: [],
      },
      ...(caption ? [{ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] }] : []),
    ],
  };
}

export default function rehypePhotos() {
  return (tree: HastNode) => {
    let photos: Map<string, Photo> | undefined;
    const walk = (parent: HastNode) => {
      const children = parent.children ?? [];
      children.forEach((node, index) => {
        const img = loneImage(node);
        const src = img?.properties?.src;
        if (typeof src === "string") {
          photos ??= loadPhotos();
          const photo = photos.get(src);
          if (photo) {
            children[index] = figure(photo, String(img?.properties?.alt ?? "").trim());
            return;
          }
        }
        if (node.children) walk(node);
      });
    };
    walk(tree);
  };
}
