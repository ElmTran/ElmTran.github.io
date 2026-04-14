export const siteMeta = {
  title: "Mengqing Chen",
  description: "A minimal blog about software, systems, and the things worth thinking twice about.",
  tagline: "Leave room for the image. Leave room for the sentence.",
  footer: "Train hard, turn up, run your best.",
  accent: "#7a1f32",
};

/**
 * 首页全屏背景：public/ 下的路径。
 */
export const publicImages = {
  hero: "/images/DSC02474.jpg",
};

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
