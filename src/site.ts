export const siteMeta = {
  title: "Mengqing Chen",
  description: "A minimal blog about software, systems, and the things worth thinking twice about.",
  tagline: "Leave room for the image. Leave room for the sentence.",
  footer: "Train hard, turn up, run your best.",
  accent: "#7a1f32",
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
 * Photos 页面图源。非空时只使用此列表，不再扫描 public/images（适合大图放对象存储或图床，减轻 git 体积）。
 * 留空则沿用构建时扫描 public/images/。
 */
export const galleryPhotos: GalleryPhoto[] = [
  // { src: "https://your-cdn.example/photo.webp", alt: "Optional caption" },
  {
    src: "https://img.elmtran.com/DSC01536-Enhanced-NR.jpg",
    alt: "2025-01-09 Mt. Hakan, Hakan",
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

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/essays/", label: "Essays" },
  { href: "/photos/", label: "Photos" },
  { href: "/about/", label: "About" },
];
