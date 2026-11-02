export const siteMeta = {
  title: "Mengqing Chen",
  description: "A minimal blog about software, systems, and the things worth thinking twice about.",
  tagline: "Leave room for the image. Leave room for the sentence.",
  footer: "Train hard, turn up, run your best.",
  accent: "#607a96",
};

/**
 * 首页全屏背景：本站相对路径（如 /images/x.jpg）或任意 HTTPS绝对地址（图床 / R2 / CDN）。
 */
export const publicImages = {
  hero: "https://img.elmtran.com/DSC03295.jpg",
};

/** 可选拍摄参数（相册大图 / lightbox 展示）。字段均可选，只填有的项。 */
export type GalleryExif = {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  exposureComp?: string;
  flash?: string;
};

/** 单张相册条目：src 为完整 URL 或本站路径。 */
export type GalleryPhoto = { src: string; alt?: string; exif?: GalleryExif };

/**
 * tools/gallery/prepare.mjs 生成的纹理和深度图的访问前缀。脚本把文件写到 public/gallery/（已 gitignore），新生成的文件需手动传到这里。
 * 3D 视图要把这些图载入 WebGL，所以该域名必须返回 CORS 头（站点的每个访问域名都要允许）。改回 "/gallery/" 即用本地文件。
 */
export const galleryAssetBase = "https://img.elmtran.com/gallery/";

/**
 * Photos 页面图源。非空时只使用此列表，不再扫描 public/images（适合大图放对象存储或图床，减轻 git 体积）。
 * 留空则沿用构建时扫描 public/images/。
 */
export const galleryPhotos: GalleryPhoto[] = [
  // { src: "https://your-cdn.example/photo.webp", alt: "Optional caption" },
  {
    src: "https://img.elmtran.com/DSC01536-Enhanced-NR.jpg",
    alt: "2025-01-09 Mt. Hakodate, Hakodate",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "70 mm",
      aperture: "f/2.8",
      shutter: "1/320 sec",
      iso: "2500",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC03234.jpg",
    alt: "2025-10-03 藏民转场, 四川",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/4.5",
      shutter: "1/640 sec",
      iso: "100",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC01460-Enhanced-NR.jpg",
    alt: "2025-01-09 函馆山2, 函馆",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "70 mm",
      aperture: "f/2.8",
      shutter: "1/500 sec",
      iso: "800",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC02732.jpg",
    alt: "2025-08-09 维多利亚港, 香港",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/16",
      shutter: "1/2000 sec",
      iso: "3200",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC03273.jpg",
    alt: "2025-10-03 饮马, 四川",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/5",
      shutter: "1/250 sec",
      iso: "100",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC03295.jpg",
    alt: "2025-10-03 若尔盖草原, 四川",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/7.1",
      shutter: "1/250 sec",
      iso: "100",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC03403.jpg",
    alt: "2025-11-29 栖霞山红叶, 南京",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/1.6",
      shutter: "1/2500 sec",
      iso: "160",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC03503.jpg",
    alt: "2025-11-29 栖霞山, 南京",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/2.5",
      shutter: "1/4000 sec",
      iso: "800",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC04586.jpg",
    alt: "2026-03-22 橘猫, 上海",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/2",
      shutter: "1/800 sec",
      iso: "100",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC04680.jpg",
    alt: "2026-03-22 奔赴, 上海",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/5",
      shutter: "1/320 sec",
      iso: "1250",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC09884.png",
    alt: "2024-10-19 静安寺, 上海",
  },
  {
    src: "https://img.elmtran.com/DSC02481.jpg",
    alt: "2025-05-24 狮子, 上海",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/8",
      shutter: "1/400 sec",
      iso: "12800",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC02174.jpg",
    alt: "2025-05-24 火烈鸟, 上海",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/4",
      shutter: "1/400 sec",
      iso: "100",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
  {
    src: "https://img.elmtran.com/DSC02474.jpg",
    alt: "2025-05-24 耳廓狐, 上海",
    exif: {
      camera: "SONY ILCE-7CM2",
      focalLength: "85 mm",
      aperture: "f/8",
      shutter: "1/400 sec",
      iso: "800",
      exposureComp: "0",
      flash: "No flash, compulsory",
    },
  },
];

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
  /** galleryPhotos 里某一张的 src。没有照片的站用 cover 做文字封面。 */
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

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/essays/", label: "Essays" },
  { href: "/photos/", label: "Photos" },
  { href: "/about/", label: "About" },
];
