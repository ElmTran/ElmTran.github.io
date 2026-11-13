export const siteMeta = {
  title: "Mengqing Chen",
  description: "A minimal blog about software, systems, and the things worth thinking twice about.",
  accent: "#607a96",
};

/**
 * 首页全屏背景：本站相对路径（如 /images/x.jpg）或任意 HTTPS绝对地址（图床 / R2 / CDN）。
 */
export const publicImages = {
  hero: "https://img.elmtran.com/DSC03295.jpg",
};

/**
 * 原图的公开地址前缀（R2 bucket 根目录）。pnpm photos add 把原图传到这里，照片 YAML 里的 src 就是这个前缀 + 文件名。
 */
export const photoOriginBase = "https://img.elmtran.com/";

/**
 * 纹理和深度图的访问前缀（R2 的 gallery/ 目录）。pnpm photos add / sync 生成后自动上传，同时在 public/gallery/ 留一份本地副本（已 gitignore）。
 * 3D 视图要把这些图载入 WebGL，所以该域名必须返回 CORS 头（站点的每个访问域名都要允许）。改回 "/gallery/" 即用本地文件。
 */
export const galleryAssetBase = "https://img.elmtran.com/gallery/";

/**
 * 照片本身在 content/photos/，一张一个 YAML 文件（星级、标题、地点、日期、EXIF）。
 * 星级不低于这个值的照片进 /photos/ 的 3D 走廊；其余只在网格视图里（/photos/?view=grid 能看到全部）。
 */
export const galleryFeaturedRating = 5;

/** 首页全屏卡：沿用原独立 Welcome 页的标题与诗句 */
export const homeHero = {
  headline: "Mengqing's Blog",
  lines: ["Your hair is winter fire,", "January embers,", "My heart burns there, too."],
  effects: {
    grayscale: true,
    grainOpacity: 0.07,
    vignette: true,
  },
  links: [
    { href: "/essays/", label: "Get Started" },
    { href: "/photos/", label: "Photos" },
  ],
};

/** /about/ 的一站：地球上的一个地点 + 左侧一张照片；点开照片会放大并翻到背面，背面是 note。 */
export type AboutStop = {
  /** 地球上的位置。首站（自我介绍）不填，地球停在全景。 */
  place?: { name: string; lat: number; lon: number };
  /** 标题上方的小字；不填则显示坐标。 */
  kicker?: string;
  title: string;
  /** 标题下的一行，如 "函館 · 2025.01"。 */
  sub?: string;
  text: string;
  /** content/photos 里某张照片的 src。没有照片的站用 cover 做文字封面。 */
  photo?: string;
  cover?: { big: string; small: string };
  /** 照片背面。essay 填 content/blog 下的文件名（不带 .md），会链到那篇文章。 */
  note: { heading: string; body: string[]; essay?: string };
  /** 「现在」所在地：地球上用余烬色标出。 */
  now?: boolean;
};

export const aboutStops: AboutStop[] = [
  {
    kicker: "About",
    title: "Hi, I’m Mengqing.",
    text: "Born in ’97 in a small town in Sichuan; these days I write software in Shanghai. The lit points are places I’ve carried a camera. Scroll to travel, and click a print to turn it over.",
    photo: "https://img.elmtran.com/DSC04680.jpg",
    note: {
      heading: "Hi, I’m Mengqing.",
      body: [
        "I grew up in southwest China and work as a software engineer. I used to want to be a writer; code won out day-to-day, but I still like clear sentences.",
        "Think of this site as a small digital coffee shop: notes on software and markets, photographs, and short pieces of memoir.",
        "Most of a trip fades. A frame or two stays. These are some of them.",
      ],
    },
  },
  {
    place: { name: "Zoigê, Sichuan", lat: 33.58, lon: 102.96 },
    title: "Sichuan",
    sub: "四川 · 1997 —",
    text: "Where I was born. In October 2025 I went back up to the grassland at Zoigê with a camera.",
    photo: "https://img.elmtran.com/DSC03234.jpg",
    note: {
      heading: "Home",
      body: [
        "A small town in Sichuan. A pomelo tree in the backyard, an internet café that smelled of cigarettes and instant noodles, QQ messages typed on a nine-key phone at midnight.",
        "At home they called me 弯弯: when I smiled as a kid, my eyes curved into crescents.",
        "Later there were other roads — to the high-speed rail station, the airport, an office building. None of them felt like the road to the internet café.",
      ],
      essay: "2026-06-01-children-s-day",
    },
  },
  {
    place: { name: "Galway", lat: 53.27, lon: -9.05 },
    title: "Galway",
    sub: "Ireland · Christmas",
    text: "Christmas on the west coast of Ireland. No photograph from this one — just a coin.",
    cover: { big: "53°N", small: "Galway · Christmas" },
    note: {
      heading: "The coin",
      body: [
        "I meant to leave it at the Cliffs of Moher with the others. On the way back an old man was playing the accordion in the wind, and I emptied my pocket into his case.",
        "Almost. I kept one.",
        "On the coach that night, it was still cold in my palm.",
      ],
      essay: "2026-06-04-galway",
    },
  },
  {
    place: { name: "Hakodate", lat: 41.77, lon: 140.73 },
    title: "Hakodate",
    sub: "函館 · 2025.01",
    text: "A winter trip through Hokkaido — Sapporo, Otaru, Noboribetsu — ending at blue hour on Mt. Hakodate.",
    photo: "https://img.elmtran.com/DSC01536-Enhanced-NR.jpg",
    note: {
      heading: "Blue hour",
      body: [
        "Clouds sat over the city most of the afternoon. By dusk the viewing deck was full, everyone waiting in the drizzle for the last bit of hope.",
        "Then the wind thinned them out, and the lights came on street by street — the whole city held between two dark coastlines.",
        "I left a little early to miss the crowds, and walked down into the Hakodate night.",
      ],
      essay: "2026-06-29-blue-hour",
    },
  },
  {
    place: { name: "Hong Kong", lat: 22.29, lon: 114.17 },
    title: "Hong Kong",
    sub: "香港 · 2025.08",
    text: "Victoria Harbour, August 2025.",
    photo: "https://img.elmtran.com/DSC02732.jpg",
    note: {
      heading: "Victoria Harbour",
      body: ["August 2025, stopped down to f/16.", "No essay for this one yet. The photograph will have to do."],
    },
  },
  {
    place: { name: "Qixia Mountain, Nanjing", lat: 32.15, lon: 118.95 },
    title: "Nanjing",
    sub: "南京 · 2025.11",
    text: "Red maples on Qixia Mountain at the end of November.",
    photo: "https://img.elmtran.com/DSC03403.jpg",
    note: {
      heading: "Qixia Mountain",
      body: [
        "The end of November, when the maples on Qixia Mountain turn.",
        "Shot wide open at f/1.6: a few branches sharp, everything behind them dissolving.",
      ],
    },
  },
  {
    place: { name: "Shanghai", lat: 31.23, lon: 121.47 },
    title: "Shanghai",
    sub: "上海 · now",
    text: "Where I live and work, and where most of this site gets written.",
    photo: "https://img.elmtran.com/DSC04586.jpg",
    now: true,
    note: {
      heading: "Now",
      body: [
        "I write software in Shanghai, and in between, the essays, market notes and photographs you’ll find here.",
        "If something on this site stayed with you, say hello on GitHub.",
      ],
    },
  },
];

/**
 * /essays/ 写作部分的章节，按故事发生的地方编排。每篇用 frontmatter 的 `chapter` 填这里的 id；
 * 不填或填错的归到最后一章。章内按发布日期从旧到新。
 */
export const essayChapters = [
  { id: "sichuan", no: "I", title: "四川", en: "Sichuan" },
  { id: "shanghai", no: "II", title: "上海", en: "Shanghai" },
  { id: "road", no: "III", title: "路上", en: "On the road" },
  { id: "fiction", no: "IV", title: "虚构", en: "Fiction" },
  { id: "thoughts", no: "V", title: "随想", en: "Thoughts" },
];

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/essays/", label: "Essays" },
  { href: "/photos/", label: "Photos" },
  { href: "/about/", label: "About" },
];
