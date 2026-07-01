// KMK Digital Twin Campus — i18n Translations (PRD §15 Multi-language)
// Languages: 华文 (zh), 马来文 (ms), English (en)
// All UI text lives here — scene code never contains hardcoded strings.

export type Locale = "zh" | "ms" | "en";

export const translations = {
  zh: {
    // App & Meta
    appTitle: "KMK 数字孪生校园",
    appDescription: "基于真实 GIS 数据的 KMK 校园数字孪生 — 探索建筑、导航、留下回忆。",

    // Loading
    loadingTitle: "数字孪生校园",
    loadingSubtitle: "正在加载真实 GIS 数据",
    loadingPipeline: "DXF → GIS → JSON → Three.js",

    // HUD
    digitalTwin: "数字孪生校园",
    kmkFull: "Kolej Matrikulasi Kedah",
    search: "搜索",
    searchPlaceholder: "搜索建筑，例如：图书馆、清真寺、宿舍…",
    memories: "留言墙",
    birdView: "鸟瞰",
    orbitView: "环绕",
    flyView: "飞行",
    walkView: "漫步",
    labels: "标签",
    reset: "重置",
    miniMap: "小地图",

    // Categories (KMK-specific)
    categoryAcademic: "教学楼",
    categoryLibrary: "图书馆",
    categoryResidence_m: "男生宿舍",
    categoryResidence_f: "女生宿舍",
    categorySports: "体育设施",
    categoryCafe: "餐厅/咖啡厅",
    categoryAdmin: "行政楼",
    categoryLab: "实验室",
    categoryHub: "学生中心",
    categoryDewan: "礼堂",
    categoryMasjid: "清真寺",
    categoryKoop: "合作社",
    categoryGuard: "门卫",
    categoryStaff_house: "教职员住宅",
    categoryParking: "停车场",
    categoryDining: "餐饮",

    // Building Info
    floors: "楼层",
    height: "高度",
    footprint: "占地面积",
    hours: "开放时间",
    noMemories: "还没有留言，成为第一个分享的人吧 💬",
    leaveMemory: "在此留下回忆",
    memoriesTitle: "回忆",
    viewAllMemories: "查看所有留言",

    // Memory Form
    yourName: "您的姓名",
    faculty: "学院/科目（可选）",
    year: "毕业年份",
    shareMemory: "分享关于 {building} 的回忆…",
    photoUrl: "照片链接（可选，https://…）",
    postMemory: "发布回忆",
    posting: "发布中…",
    cancel: "取消",
    nameRequired: "姓名和留言为必填项",
    postError: "无法发布，请重试",

    // Memory Board
    boardTitle: "KMK 校园留言墙",
    boardSubtitle: "来自社区的 {count} 条故事",
    allRoles: "全部身份",
    allYears: "全部年份",
    student: "在校生",
    alumni: "毕业生",
    staff: "教职员",
    visitor: "访客",
    classOf: "{year} 届",
    backToCampus: "返回校园地图",

    // Roles
    roleStudent: "在校生",
    roleAlumni: "毕业生",
    roleStaff: "教职员",
    roleVisitor: "访客",

    // Search / misc
    noResults: "未找到匹配结果",
    enterBuilding: "进入建筑",
    buildingCount: "{n} 座建筑",
    treeCount: "{n} 棵树木",
    loadingDots: "加载中…",

    // Language Switcher
    language: "语言",
    localeZh: "华文",
    localeMs: "Bahasa Melayu",
    localeEn: "English",
  },

  ms: {
    // App & Meta
    appTitle: "KMK Kampus Digital Twin",
    appDescription: "Kampus digital KMK berdasarkan data GIS sebenar — teroka bangunan, navigasi, tinggalkan kenangan.",

    // Loading
    loadingTitle: "Kampus Digital Twin",
    loadingSubtitle: "Memuatkan data GIS sebenar",
    loadingPipeline: "DXF → GIS → JSON → Three.js",

    // HUD
    digitalTwin: "Kampus Digital Twin",
    kmkFull: "Kolej Matrikulasi Kedah",
    search: "Cari",
    searchPlaceholder: "Cari bangunan, cth: pustaka, masjid, asrama…",
    memories: "Papan Kenangan",
    birdView: "Pandangan Burung",
    orbitView: "Orbit",
    flyView: "Terbang",
    walkView: "Berjalan",
    labels: "Label",
    reset: "Reset",
    miniMap: "Peta Mini",

    // Categories
    categoryAcademic: "Akademik",
    categoryLibrary: "Pustaka",
    categoryResidence_m: "Blok Lelaki",
    categoryResidence_f: "Blok Perempuan",
    categorySports: "Sukan",
    categoryCafe: "Kafe / Makan",
    categoryAdmin: "Pentadbiran",
    categoryLab: "Makmal",
    categoryHub: "Pusat Pelajar",
    categoryDewan: "Dewan",
    categoryMasjid: "Masjid / Surau",
    categoryKoop: "Koperasi",
    categoryGuard: "Pengawal Keselamatan",
    categoryStaff_house: "Kediaman Staf",
    categoryParking: "Tempat Letak Kereta",
    categoryDining: "Kafeteria",

    // Building Info
    floors: "Tingkat",
    height: "Ketinggian",
    footprint: "Keluasan",
    hours: "Waktu Operasi",
    noMemories: "Tiada kenangan lagi. Jadilah yang pertama berkongsi 💬",
    leaveMemory: "Tinggalkan kenangan di sini",
    memoriesTitle: "Kenangan",
    viewAllMemories: "Lihat semua kenangan",

    // Memory Form
    yourName: "Nama Anda",
    faculty: "Fakulti / Modul (pilihan)",
    year: "Tahun Graduasi",
    shareMemory: "Kongsi kenangan tentang {building}…",
    photoUrl: "URL Foto (pilihan, https://…)",
    postMemory: "Siarkan Kenangan",
    posting: "Memuatkan…",
    cancel: "Batal",
    nameRequired: "Nama dan mesej diperlukan",
    postError: "Gagal menyiarkan. Sila cuba lagi.",

    // Memory Board
    boardTitle: "Papan Kenangan Kampus KMK",
    boardSubtitle: "{count} cerita dari komuniti",
    allRoles: "Semua peranan",
    allYears: "Semua tahun",
    student: "Pelajar",
    alumni: "Alumni",
    staff: "Staf",
    visitor: "Pelawat",
    classOf: "Kelas {year}",
    backToCampus: "Kembali ke Peta Kampus",

    // Roles
    roleStudent: "Pelajar",
    roleAlumni: "Alumni",
    roleStaff: "Staf",
    roleVisitor: "Pelawat",

    // Search / misc
    noResults: "Tiada padanan dijumpai",
    enterBuilding: "Masuk ke bangunan",
    buildingCount: "{n} bangunan",
    treeCount: "{n} pokok",
    loadingDots: "Memuatkan…",

    // Language Switcher
    language: "Bahasa",
    localeZh: "华文",
    localeMs: "Bahasa Melayu",
    localeEn: "English",
  },

  en: {
    // App & Meta
    appTitle: "KMK Digital Twin Campus",
    appDescription: "A real-GIS digital twin of KMK campus — explore buildings, navigate, and leave memories.",

    // Loading
    loadingTitle: "Digital Twin Campus",
    loadingSubtitle: "Loading real GIS data",
    loadingPipeline: "DXF → GIS → JSON → Three.js",

    // HUD
    digitalTwin: "Digital Twin Campus",
    kmkFull: "Kolej Matrikulasi Kedah",
    search: "Search",
    searchPlaceholder: "Search buildings, e.g. library, masjid, hostel…",
    memories: "Memories",
    birdView: "Bird",
    orbitView: "Orbit",
    flyView: "Fly",
    walkView: "Walk",
    labels: "Labels",
    reset: "Reset",
    miniMap: "Mini Map",

    // Categories
    categoryAcademic: "Academic",
    categoryLibrary: "Library / Pustaka",
    categoryResidence_m: "Male Block",
    categoryResidence_f: "Female Block",
    categorySports: "Sports",
    categoryCafe: "Cafe / Dining",
    categoryAdmin: "Administration",
    categoryLab: "Laboratory",
    categoryHub: "Student Hub",
    categoryDewan: "Dewan / Hall",
    categoryMasjid: "Masjid / Surau",
    categoryKoop: "Cooperative / Shop",
    categoryGuard: "Guard House",
    categoryStaff_house: "Staff House",
    categoryParking: "Parking",
    categoryDining: "Dining",

    // Building Info
    floors: "Floors",
    height: "Height",
    footprint: "Footprint",
    hours: "Opening Hours",
    noMemories: "No memories yet. Be the first to share one 💬",
    leaveMemory: "Leave a memory here",
    memoriesTitle: "Memories",
    viewAllMemories: "View all memories",

    // Memory Form
    yourName: "Your Name",
    faculty: "Faculty / Module (optional)",
    year: "Graduation Year",
    shareMemory: "Share a memory about {building}…",
    photoUrl: "Photo URL (optional, https://…)",
    postMemory: "Post Memory",
    posting: "Posting…",
    cancel: "Cancel",
    nameRequired: "Name and message are required",
    postError: "Could not post. Please try again.",

    // Memory Board
    boardTitle: "KMK Campus Memory Board",
    boardSubtitle: "{count} stories from the community",
    allRoles: "All roles",
    allYears: "All years",
    student: "Student",
    alumni: "Alumni",
    staff: "Staff",
    visitor: "Visitor",
    classOf: "Class of {year}",
    backToCampus: "Back to Campus Map",

    // Roles
    roleStudent: "Student",
    roleAlumni: "Alumni",
    roleStaff: "Staff",
    roleVisitor: "Visitor",

    // Search / misc
    noResults: "No matches found",
    enterBuilding: "Enter building",
    buildingCount: "{n} buildings",
    treeCount: "{n} trees",
    loadingDots: "Loading…",

    // Language Switcher
    language: "Language",
    localeZh: "华文",
    localeMs: "Bahasa Melayu",
    localeEn: "English",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey, params?: Record<string, string | number>) {
  let text = translations[locale][key] as string;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return text;
}

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "zh", label: "华文" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "en", label: "English" },
];

export const DEFAULT_LOCALE: Locale = "en";
