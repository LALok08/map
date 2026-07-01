/**
 * KMK Digital Twin Campus — GIS generator (v4 — OSM-aligned)
 * ─────────────────────────────────────────────────────────────────────────────
 * Source: OpenStreetMap official tile for Kolej Matrikulasi Kedah
 *         (Persiaran Kayu Manis · Jalan Pelaga · Jalan Cengkih · Jalan Bunga Lawang)
 *
 * Layout principles taken from OSM tile:
 *   - West / South: Persiaran Kayu Manis runs N→S then wraps east as perimeter
 *   - North: Jalan Pelaga
 *   - Central N–S spine: Jalan Cengkih
 *   - East: Jalan Bunga Lawang (with small north-east connector)
 *   - Athletics track + Padang in NW corner
 *   - Dewan Mahawangsa + Serambi Aktiviti Pelajar in north-central
 *   - Kompleks Dewan Kuliah + Masjid Khulafa Ar Rasyidin + Dataran Pelajar in centre-west
 *   - Bangunan Langkasuka south-west
 *   - Kediaman Seri Laka (student dorm) + Kediaman Pensyarah P1-P4 in east
 *   - Kediaman Pengarah in south-east corner
 *   - Garaj in north-east
 *   - Many small parking lots ("P" markers) spread along roads
 *   - Zebra crossings: along Persiaran Kayu Manis at every cross-road
 *
 * Coordinate system: local ENU metres. Origin [0,0] = roughly Dataran Pelajar.
 *   X = East (+right on map)
 *   Z = South (+down on map)
 *   Y = height up
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "gis");
mkdirSync(OUT, { recursive: true });

const FLOOR_H = 3.6;

// ─── Geometry helpers ────────────────────────────────────────────────────────
function rect(cx, cz, w, d, rot = 0) {
  const r = (rot * Math.PI) / 180;
  const cos = Math.cos(r), sin = Math.sin(r);
  const hw = w / 2, hd = d / 2;
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, z]) => [
    +(cx + x * cos - z * sin).toFixed(1),
    +(cz + x * sin + z * cos).toFixed(1),
  ]);
}
function rectWithCourtyard(cx, cz, w, d, courtFrac = 0.45, rot = 0) {
  const outer = rect(cx, cz, w, d, rot);
  const inner = rect(cx, cz, w * courtFrac, d * courtFrac, rot);
  return { polygon: outer, holes: [inner] };
}
function polyCenter(poly) {
  const n = poly.length;
  return [
    +(poly.reduce((s, p) => s + p[0], 0) / n).toFixed(1),
    +(poly.reduce((s, p) => s + p[1], 0) / n).toFixed(1),
  ];
}
function polyArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    a += x1 * z2 - x2 * z1;
  }
  return Math.abs(a / 2);
}
function bbox(poly) {
  return [
    Math.min(...poly.map(p => p[0])),
    Math.min(...poly.map(p => p[1])),
    Math.max(...poly.map(p => p[0])),
    Math.max(...poly.map(p => p[1])),
  ].map(n => +n.toFixed(1));
}

// ─── Building factory ────────────────────────────────────────────────────────
const buildings = [];
const metadataMap = {};

function addBuilding(opts) {
  const {
    id, name, category, color, floors, emoji,
    shape, rot = 0, features = {}, meta = {},
  } = opts;
  const polygon = shape.polygon;
  const holes = shape.holes || [];
  const center = polyCenter(polygon);
  const height = features.parking ? 0.18 : +(floors * FLOOR_H).toFixed(1);
  let area = polyArea(polygon);
  holes.forEach(h => { area -= polyArea(h); });
  buildings.push({
    id, name, category, color, polygon, holes, center,
    height, rotation: rot, floors,
    area: +area.toFixed(1),
    bbox: bbox(polygon), features,
  });
  metadataMap[id] = {
    name, emoji,
    description: meta.description || name,
    tags: meta.tags || [],
    floors,
    hours: meta.hours || "Isnin–Jumaat 08:00–17:00",
  };
}

// ─── Category colours (KMK palette) ──────────────────────────────────────────
const C = {
  admin:        "#7d8aa3",
  academic:     "#6b7fd7",
  dewan:        "#d99a3d",
  masjid:       "#3fa873",
  library:      "#e0a040",
  residence_m:  "#5b9bd5",
  residence_f:  "#e8557a",
  cafe:         "#e0795b",
  sports:       "#56b87e",
  koop:         "#56a7c4",
  guard:        "#7d8aa3",
  staff_house:  "#b08bd6",
  parking:      "#8f97a3",
};

// ═════════════════════════════════════════════════════════════════════════════
// CAMPUS LAYOUT — coordinates derived from OSM tile
// Origin: Dataran Pelajar centre (≈ middle of the OSM tile)
// Map orientation: north = -Z, east = +X
// Tile coverage ≈ 800m × 750m
// ═════════════════════════════════════════════════════════════════════════════

// ── NORTH-WEST: Athletics Track + Padang + Astaka ────────────────────────────
addBuilding({
  id: "B_ASTAKA", name: "Astaka", category: "sports", color: C.sports,
  floors: 2, emoji: "🏟️", shape: { polygon: rect(-275, -240, 36, 26) },
  meta: { description: "Astaka utama menghadap padang dan litar olahraga.", tags: ["sukan","astaka","perhimpunan"], hours: "06:00–22:00" },
});
addBuilding({
  id: "B_TENNIS_NW", name: "Gelanggang Tenis", category: "sports", color: C.sports,
  floors: 1, emoji: "🎾", shape: { polygon: rect(-225, -340, 50, 30) },
  meta: { description: "Gelanggang tenis di sebelah utara, berdekatan Jalan Pelaga.", tags: ["sukan","tenis"], hours: "06:00–22:00" },
});

// ── NORTH-CENTRAL: Dewan Mahawangsa cluster + Serambi ────────────────────────
addBuilding({
  id: "B_SERAMBI", name: "Serambi Aktiviti Pelajar", category: "admin", color: C.admin,
  floors: 2, emoji: "✨",
  shape: rectWithCourtyard(-185, -140, 56, 50, 0.35),
  features: { corridor: true },
  meta: {
    description: "Pusat aktiviti pelajar dengan ruang dalaman terbuka. Termasuk Pejabat HEP, kaunseling dan ruang aktiviti.",
    tags: ["HEP","kaunseling","pelajar","aktiviti"], hours: "Isnin–Jumaat 08:00–17:00",
  },
});
addBuilding({
  id: "B_DEWAN_MAHAWANGSA", name: "Dewan Mahawangsa", category: "dewan", color: C.dewan,
  floors: 2, emoji: "🎓",
  shape: { polygon: rect(-100, -150, 80, 50) },
  features: { bigRoof: true },
  meta: {
    description: "Dewan utama dan terbesar di KMK. Bumbung tinggi tanpa tiang tengah. Digunakan untuk konvokesyen, perhimpunan besar, ceramah dan majlis rasmi.",
    tags: ["dewan","majlis","konvokesyen","perhimpunan"], hours: "Mengikut acara · 08:00–22:00",
  },
});
addBuilding({
  id: "B_GARAJ", name: "Garaj Bas", category: "admin", color: "#9aa3b0",
  floors: 1, emoji: "🚌", shape: { polygon: rect(190, -110, 50, 24) },
  meta: { description: "Garaj dan tempat letak bas kolej.", tags: ["bas","pengangkutan","garaj"], hours: "06:00–22:00" },
});

// ── CENTRAL-WEST: Kompleks Dewan Kuliah ──────────────────────────────────────
addBuilding({
  id: "B_DEWAN_KULIAH", name: "Kompleks Dewan Kuliah", category: "academic", color: C.academic,
  floors: 3, emoji: "📐",
  shape: rectWithCourtyard(-235, -22, 60, 60, 0.32),
  features: { corridor: true },
  meta: {
    description: "Kompleks dewan kuliah utama — beberapa dewan kuliah besar dan bilik tutorial mengelilingi laman dalaman.",
    tags: ["dewan kuliah","kuliah","lecture"], hours: "Isnin–Sabtu 07:30–18:00",
  },
});

// ── CENTRAL: Masjid Khulafa Ar Rasyidin (LANDMARK with dome + minaret) ───────
addBuilding({
  id: "B_MASJID", name: "Masjid Khulafa Ar Rasyidin", category: "masjid", color: C.masjid,
  floors: 2, emoji: "🕌",
  shape: { polygon: rect(-90, -10, 56, 52) },
  features: { dome: true, minaret: true, domeRadius: 13, minaretHeight: 34 },
  meta: {
    description: "Masjid Khulafa Ar Rasyidin — mercu tanda kampus KMK dengan kubah hijau besar dan menara (minaret). Ruang solat luas untuk seluruh warga kolej.",
    tags: ["masjid","solat","agama","kubah","minaret","jumaat","khulafa","ar rasyidin"], hours: "24 jam · Solat Jumaat 12:45",
  },
});

// ── CENTRAL-WEST: Dataran Pelajar (open plaza) — see greenspace below ────────
// (Dataran Pelajar is rendered as a paved plaza in greenspace data)

// ── SOUTH-WEST: Bangunan Langkasuka + Pustaka + Koop ─────────────────────────
addBuilding({
  id: "B_LANGKASUKA", name: "Bangunan Langkasuka", category: "academic", color: C.academic,
  floors: 3, emoji: "🏫",
  shape: rectWithCourtyard(-260, 165, 70, 50, 0.36),
  features: { corridor: true },
  meta: {
    description: "Bangunan Langkasuka — bilik kuliah tambahan, makmal, pejabat jabatan dan pejabat pensyarah.",
    tags: ["kuliah","pensyarah","jabatan","langkasuka"], hours: "Isnin–Sabtu 07:30–18:00",
  },
});
addBuilding({
  id: "B_PUSTAKA", name: "Pustaka (Perpustakaan)", category: "library", color: C.library,
  floors: 3, emoji: "📚",
  shape: { polygon: rect(-170, 95, 36, 32) },
  meta: {
    description: "Perpustakaan utama KMK. Koleksi buku akademik, zon belajar berkumpulan, zon senyap dan ruang baca.",
    tags: ["perpustakaan","pustaka","buku","belajar","wifi"], hours: "Isnin–Khamis 08:30–21:30 · Sabtu 08:30–17:00",
  },
});
addBuilding({
  id: "B_KOOP", name: "Koperasi & Pejabat Pos", category: "koop", color: C.koop,
  floors: 1, emoji: "🛒", shape: { polygon: rect(-185, 145, 28, 22) },
  meta: { description: "Koperasi pelajar KMK, kedai buku, alat tulis dan pejabat pos kampus.", tags: ["koperasi","pos","kedai","buku"], hours: "Isnin–Jumaat 08:30–17:30" },
});

// ── CENTRAL: Inner academic blocks (between Jalan Cengkih and east road) ─────
// These appear in the OSM map as a 2×3 grid of mid-sized blocks
const innerGrid = [
  { id: "B_BLOK_TUTORIAL_1", name: "Blok Tutorial 1", x:   0,  z: -10, w: 44, d: 36, floors: 3 },
  { id: "B_BLOK_TUTORIAL_2", name: "Blok Tutorial 2", x:  70,  z: -10, w: 44, d: 36, floors: 3 },
  { id: "B_BLOK_MAKMAL_1",   name: "Blok Makmal 1",   x:   0,  z:  50, w: 44, d: 36, floors: 3 },
  { id: "B_BLOK_MAKMAL_2",   name: "Blok Makmal 2",   x:  70,  z:  50, w: 44, d: 36, floors: 3 },
  { id: "B_BLOK_AKADEMIK_S", name: "Blok Akademik Selatan", x: 35, z: 115, w: 112, d: 36, floors: 3 },
];
innerGrid.forEach(({ id, name, x, z, w, d, floors }) => {
  addBuilding({
    id, name, category: "academic", color: C.academic, floors, emoji: "🏫",
    shape: rectWithCourtyard(x, z, w, d, 0.32),
    features: { corridor: true },
    meta: {
      description: `${name} — bilik tutorial, makmal sains atau bilik pensyarah mengelilingi laman dalaman.`,
      tags: ["tutorial","makmal","akademik"], hours: "Isnin–Sabtu 07:30–18:00",
    },
  });
});

// ── EAST: Kediaman Seri Laka (large student dormitory complex) ───────────────
addBuilding({
  id: "B_SERI_LAKA", name: "Kediaman Seri Laka", category: "residence_m", color: C.residence_m,
  floors: 5, emoji: "🛏️",
  shape: rectWithCourtyard(195, -8, 70, 64, 0.36),
  features: { corridor: true },
  meta: {
    description: "Kediaman Seri Laka — kompleks asrama pelajar utama dengan laman dalaman terbuka dan selasar di setiap aras.",
    tags: ["asrama","seri laka","kediaman","pelajar"], hours: "24 jam (residen sahaja)",
  },
});

// Second Seri Laka wing (south block visible in OSM)
addBuilding({
  id: "B_SERI_LAKA_S", name: "Kediaman Seri Laka (Blok Selatan)", category: "residence_m", color: C.residence_m,
  floors: 5, emoji: "🛏️",
  shape: rectWithCourtyard(195, 90, 70, 50, 0.38),
  features: { corridor: true },
  meta: {
    description: "Blok selatan Kediaman Seri Laka — wing tambahan untuk pelajar dengan laman dalaman.",
    tags: ["asrama","seri laka","kediaman","pelajar"], hours: "24 jam (residen sahaja)",
  },
});

// ── EAST: Kediaman Pensyarah P1, P2, P3, P4 (lecturer housing) ───────────────
const pHouses = [
  { id: "B_KP_P1", name: "Kediaman Pensyarah P1", x: 320, z:  80,  w: 38, d: 32 },
  { id: "B_KP_P2", name: "Kediaman Pensyarah P2", x: 320, z:  20,  w: 38, d: 32 },
  { id: "B_KP_P3", name: "Kediaman Pensyarah P3", x: 320, z: -40,  w: 38, d: 32 },
  { id: "B_KP_P4", name: "Kediaman Pensyarah P4", x: 295, z: -100, w: 38, d: 30 },
];
pHouses.forEach(({ id, name, x, z, w, d }) => {
  addBuilding({
    id, name, category: "staff_house", color: C.staff_house,
    floors: 2, emoji: "🏡",
    shape: { polygon: rect(x, z, w, d) },
    meta: {
      description: `${name} — kediaman pensyarah dan staf akademik di zon timur kampus, sepanjang Jalan Bunga Lawang.`,
      tags: ["kediaman","pensyarah","staf"], hours: "Kawasan kediaman",
    },
  });
});

// ── SOUTH-EAST: Kediaman Pengarah (Director's house) ────────────────────────
addBuilding({
  id: "B_KEDIAMAN_PENGARAH", name: "Kediaman Pengarah", category: "staff_house", color: C.staff_house,
  floors: 2, emoji: "🏡", shape: { polygon: rect(260, 160, 44, 32) },
  meta: { description: "Kediaman rasmi Pengarah KMK di sudut tenggara kampus.", tags: ["kediaman","pengarah","direktur"], hours: "Kawasan kediaman" },
});

// ── Cafe / dining (scattered) ────────────────────────────────────────────────
addBuilding({
  id: "B_CAFE_DEWAN", name: "Cafe Dewan", category: "cafe", color: C.cafe,
  floors: 1, emoji: "☕", shape: { polygon: rect(-30, -150, 26, 22) },
  meta: { description: "Kafe kecil bersebelahan Dewan Mahawangsa.", tags: ["cafe","makanan"], hours: "07:00–18:00" },
});
addBuilding({
  id: "B_CAFE_PUSAT", name: "Cafe Pusat Pelajar", category: "cafe", color: C.cafe,
  floors: 1, emoji: "🍜", shape: { polygon: rect(35, 170, 40, 18) },
  meta: { description: "Kafe utama berhampiran Blok Akademik Selatan dan Dataran Pelajar.", tags: ["cafe","makanan","kafeteria"], hours: "06:30–21:30" },
});
addBuilding({
  id: "B_CAFE_SERI_LAKA", name: "Cafe Seri Laka", category: "cafe", color: C.cafe,
  floors: 1, emoji: "🍽️", shape: { polygon: rect(195, 150, 50, 22) },
  meta: { description: "Kafe untuk penghuni Kediaman Seri Laka.", tags: ["cafe","seri laka","makanan"], hours: "06:30–21:00" },
});

// ── Guard houses (entrance) ──────────────────────────────────────────────────
addBuilding({
  id: "B_GUARD_W", name: "Pondok Pengawal Barat", category: "guard", color: C.guard,
  floors: 1, emoji: "🛡️", shape: { polygon: rect(-360, 110, 10, 8) },
  meta: { description: "Pondok pengawal pintu masuk barat (Persiaran Kayu Manis).", tags: ["keselamatan","pengawal","masuk"], hours: "24 jam" },
});
addBuilding({
  id: "B_GUARD_S", name: "Pondok Pengawal Selatan", category: "guard", color: C.guard,
  floors: 1, emoji: "🛡️", shape: { polygon: rect(0, 260, 10, 8) },
  meta: { description: "Pondok pengawal pintu masuk selatan.", tags: ["keselamatan","pengawal","keluar"], hours: "24 jam" },
});

// ═════════════════════════════════════════════════════════════════════════════
// PARKING LOTS — many small "P" markers visible in OSM, placed along roads
// ═════════════════════════════════════════════════════════════════════════════
const parkingLots = [
  ["P_ASTAKA",       "Parkir Astaka",          -310, -230, 18, 22],
  ["P_DEWAN_W",      "Parkir Dewan (Barat)",   -150, -100, 22, 26],
  ["P_DEWAN_E",      "Parkir Dewan (Timur)",    -45, -100, 20, 26],
  ["P_DK_W",         "Parkir Dewan Kuliah",    -310,  -20, 18, 26],
  ["P_DK_E",         "Parkir Dewan Kuliah E",  -185,  -45, 18, 18],
  ["P_MASJID",       "Parkir Masjid",           -50,  -55, 18, 18],
  ["P_PUSTAKA",      "Parkir Pustaka",         -225,   95, 18, 22],
  ["P_CENTRAL_W",    "Parkir Tengah Barat",     -45,   50, 18, 18],
  ["P_CENTRAL_E",    "Parkir Tengah Timur",     120,   45, 18, 22],
  ["P_SOUTH_CENTRAL","Parkir Selatan Tengah",    35,  170, 16, 18],
  ["P_LANGKASUKA",   "Parkir Langkasuka",      -190,  175, 18, 22],
  ["P_SERI_LAKA_W",  "Parkir Seri Laka Barat",  130,    0, 18, 22],
  ["P_SERI_LAKA_S",  "Parkir Seri Laka Selatan",195,  185, 22, 18],
  ["P_PENGARAH",     "Parkir Kediaman Pengarah",185,  155, 16, 18],
];
parkingLots.forEach(([id, name, x, z, w, d]) => {
  addBuilding({
    id, name, category: "parking", color: C.parking,
    floors: 1, emoji: "🅿️",
    shape: { polygon: rect(x, z, w, d) },
    features: { parking: true },
    meta: { description: `${name} — kawasan parkir kampus.`, tags: ["parkir","parking"], hours: "24 jam mengikut peraturan kolej" },
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CORRIDORS (selasar) — covered walkways linking blocks (visible as thin lines)
// ═════════════════════════════════════════════════════════════════════════════
const corridors = [
  // Inner academic grid: T1 ↔ T2, T1 ↔ M1, T2 ↔ M2, M1 ↔ M2
  { id: "COR_T1_T2",       rect: rect( 35,  -10, 32, 5) },
  { id: "COR_T1_M1",       rect: rect(  0,   20,  5, 26) },
  { id: "COR_T2_M2",       rect: rect( 70,   20,  5, 26) },
  { id: "COR_M1_M2",       rect: rect( 35,   50, 32, 5) },
  { id: "COR_M_AKAD_S",    rect: rect( 35,   85,  5, 26) },
  // Dewan Mahawangsa ↔ Garaj area
  { id: "COR_DEWAN_GARAJ", rect: rect( 45, -140, 80, 5) },
  // Masjid ↔ inner grid
  { id: "COR_MASJID_INNER",rect: rect(-30,  -10, 30, 5) },
  // Pustaka ↔ Koop
  { id: "COR_PUS_KOOP",    rect: rect(-178, 120, 6, 20) },
  // Seri Laka N ↔ S
  { id: "COR_SL_NS",       rect: rect(195,   42,  5, 36) },
];

// ═════════════════════════════════════════════════════════════════════════════
// ROADS — based on OSM road network
// ═════════════════════════════════════════════════════════════════════════════
const roads = [
  // ───── Perimeter / main public roads ─────
  { id: "R_PERSIARAN_KM_W", name: "Persiaran Kayu Manis (Barat)", type: "primary", width: 10,
    polyline: [[-360, -320],[-360, -160],[-360, 0],[-360, 110],[-360, 230]] },
  { id: "R_PERSIARAN_KM_S", name: "Persiaran Kayu Manis (Selatan)", type: "primary", width: 10,
    polyline: [[-360, 230],[-260, 240],[-100, 245],[0, 250],[120, 248],[220, 245],[290, 232]] },
  { id: "R_PERSIARAN_KM_E", name: "Persiaran Kayu Manis (Sambungan Timur)", type: "primary", width: 10,
    polyline: [[-360, -45],[-220, -45],[-100, -45],[20, -45],[120, -45],[220, -45],[290, -40]] },
  { id: "R_JALAN_PELAGA",   name: "Jalan Pelaga (Utara)", type: "primary", width: 10,
    polyline: [[-360, -320],[-260, -325],[-150, -330],[-50, -325],[60, -315]] },
  { id: "R_JALAN_CENGKIH",  name: "Jalan Cengkih (Spine Tengah)", type: "primary", width: 8,
    polyline: [[-40, -310],[-40, -210],[-40, -110],[-40, -45],[-40, 50],[-40, 150],[-40, 250]] },
  { id: "R_JALAN_BUNGA_W",  name: "Jalan Bunga Lawang", type: "primary", width: 9,
    polyline: [[290, -270],[295, -180],[298, -120],[300, -40],[300, 40],[300, 130],[295, 220]] },

  // ───── External extensions (roads leaving the campus) ─────
  { id: "R_EXT_PELAGA_E", name: "Jalan Pelaga — sambungan timur", type: "external", width: 11,
    polyline: [[60, -315],[180, -310],[300, -290],[420, -260]] },
  { id: "R_EXT_BUNGA_NE", name: "Jalan Beringin 9 — sambungan timur laut", type: "external", width: 11,
    polyline: [[290, -270],[360, -250],[440, -210],[500, -150]] },
  { id: "R_EXT_KM_NW",    name: "Persiaran Kayu Manis — sambungan barat laut", type: "external", width: 11,
    polyline: [[-360, -320],[-420, -380],[-500, -420]] },
  { id: "R_EXT_KM_SW",    name: "Persiaran Kayu Manis — sambungan barat daya", type: "external", width: 11,
    polyline: [[-360, 230],[-410, 320],[-480, 400]] },
  { id: "R_EXT_BUNGA_S",  name: "Jalan Bunga Lawang — sambungan selatan", type: "external", width: 11,
    polyline: [[295, 220],[330, 290],[370, 360]] },

  // ───── Internal service roads ─────
  { id: "R_NORTH_LINK",   name: "Lorong Utara (Astaka ↔ Dewan)", type: "secondary", width: 6,
    polyline: [[-330, -180],[-260, -175],[-180, -170],[-100, -170],[-40, -165]] },
  { id: "R_DEWAN_LOOP",   name: "Lorong Dewan Mahawangsa", type: "secondary", width: 6,
    polyline: [[-150, -125],[-100, -125],[-40, -125]] },
  { id: "R_GARAJ_LINK",   name: "Lorong Garaj", type: "secondary", width: 6,
    polyline: [[140, -110],[190, -110],[245, -110]] },
  { id: "R_INNER_NS_W",   name: "Lorong Tengah Barat", type: "secondary", width: 5,
    polyline: [[-100, -45],[-100, 50],[-100, 150]] },
  { id: "R_INNER_NS_E",   name: "Lorong Tengah Timur", type: "secondary", width: 5,
    polyline: [[120, -45],[120, 50],[120, 150]] },
  { id: "R_SERI_LAKA_LOOP", name: "Lorong Seri Laka", type: "secondary", width: 6,
    polyline: [[150, -40],[150, 50],[150, 130],[195, 175],[245, 130]] },
  { id: "R_DATARAN_W",    name: "Laluan Dataran Pelajar (Barat)", type: "path", width: 4,
    polyline: [[-220, 75],[-160, 75],[-100, 75]] },
  { id: "R_DATARAN_E",    name: "Laluan Dataran Pelajar (Timur)", type: "path", width: 4,
    polyline: [[-40, 75],[20, 75],[100, 75]] },
  { id: "R_MASJID_PATH",  name: "Laluan ke Masjid", type: "path", width: 3,
    polyline: [[-90, -45],[-90, -10]] },
];

// ═════════════════════════════════════════════════════════════════════════════
// ZEBRA CROSSINGS — at every intersection visible on OSM (red striped)
// ═════════════════════════════════════════════════════════════════════════════
const crossings = [
  { id: "X_KM_DK",      name: "Lintasan Zebra (Dewan Kuliah)",    center: [-310,  -30], width: 9, length: 8, rotation: 0,  stripes: 5 },
  { id: "X_KM_PUSTAKA", name: "Lintasan Zebra (Pustaka)",         center: [-310,   90], width: 9, length: 8, rotation: 0,  stripes: 5 },
  { id: "X_KM_LANG",    name: "Lintasan Zebra (Langkasuka)",      center: [-310,  165], width: 9, length: 8, rotation: 0,  stripes: 5 },
  { id: "X_KM_SOUTH_1", name: "Lintasan Zebra (Selatan 1)",       center: [-150,  240], width: 9, length: 9, rotation: 90, stripes: 5 },
  { id: "X_KM_SOUTH_2", name: "Lintasan Zebra (Selatan 2)",       center: [   0,  248], width: 9, length: 9, rotation: 90, stripes: 5 },
  { id: "X_KM_SOUTH_3", name: "Lintasan Zebra (Selatan 3)",       center: [ 150,  246], width: 9, length: 9, rotation: 90, stripes: 5 },
  { id: "X_CENGKIH_N",  name: "Lintasan Zebra (Jalan Cengkih U)", center: [ -40, -160], width: 8, length: 9, rotation: 0,  stripes: 5 },
  { id: "X_CENGKIH_M",  name: "Lintasan Zebra (Jalan Cengkih T)", center: [ -40,  -10], width: 8, length: 9, rotation: 0,  stripes: 5 },
  { id: "X_CENGKIH_S",  name: "Lintasan Zebra (Jalan Cengkih S)", center: [ -40,  150], width: 8, length: 9, rotation: 0,  stripes: 5 },
  { id: "X_DEWAN_PED",  name: "Lintasan Zebra (Dewan Mahawangsa)",center: [-100, -100], width: 8, length: 8, rotation: 0,  stripes: 5 },
  { id: "X_MASJID_PED", name: "Lintasan Zebra (Masjid)",          center: [ -90,  -30], width: 8, length: 8, rotation: 0,  stripes: 5 },
  { id: "X_SERI_LAKA",  name: "Lintasan Zebra (Seri Laka)",       center: [ 150,   25], width: 8, length: 9, rotation: 90, stripes: 5 },
  { id: "X_BUNGA_NE",   name: "Lintasan Zebra (Jalan Bunga Lawang)",center: [298, -120], width: 8, length: 9, rotation: 90, stripes: 5 },
  { id: "X_PELAGA_W",   name: "Lintasan Zebra (Jalan Pelaga)",    center: [-260, -325], width: 9, length: 10,rotation: 0,  stripes: 6 },
];

// ═════════════════════════════════════════════════════════════════════════════
// GREENSPACE — Padang, Dataran Pelajar, lawns, small gardens
// ═════════════════════════════════════════════════════════════════════════════
const greenspace = [
  // Athletics field inside the track
  { id: "G_PADANG", type: "field", name: "Padang", polygon: rect(-240, -240, 130, 75) },
  // The reservoir / square pond visible in OSM top-centre (greenspace stand-in)
  { id: "G_POND_N", type: "garden", name: "Kolam Utara", polygon: rect(-110, -360, 80, 50) },
  // Northern small lawn
  { id: "G_LAWN_N", type: "lawn", name: "Taman Utara", polygon: rect(-220, -290, 60, 35) },
  // Dataran Pelajar — large central plaza
  { id: "G_DATARAN_PELAJAR", type: "plaza", name: "Dataran Pelajar", polygon: rect(-100, 75, 130, 50) },
  // Small "inner garden" between Dewan Kuliah and Masjid (visible as green dotted area)
  { id: "G_TAMAN_TENGAH", type: "garden", name: "Taman Tengah", polygon: rect(-165, -25, 38, 38) },
  // Small grassed area near Seri Laka
  { id: "G_LAWN_SL", type: "lawn", name: "Taman Seri Laka", polygon: rect(195, 130, 32, 30) },
  // Green strip along Jalan Bunga Lawang
  { id: "G_GREEN_STRIP_E", type: "lawn", name: "Jalur Hijau Timur", polygon: rect(335, 0, 25, 200) },
  // South-west garden near Langkasuka
  { id: "G_TAMAN_SW", type: "garden", name: "Taman Barat Daya", polygon: rect(-310, 200, 30, 40) },
];

// ═════════════════════════════════════════════════════════════════════════════
// ATHLETICS TRACK — oval shape in NW (around Padang)
// ═════════════════════════════════════════════════════════════════════════════
function ovalRing(cx, cz, rx, rz, segments = 32) {
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([+(cx + Math.cos(a) * rx).toFixed(1), +(cz + Math.sin(a) * rz).toFixed(1)]);
  }
  return pts;
}
const track = {
  outer: ovalRing(-240, -240, 80, 50),
  inner: ovalRing(-240, -240, 66, 38),
};

// ═════════════════════════════════════════════════════════════════════════════
// TREES — line plantings along roads and around buildings
// ═════════════════════════════════════════════════════════════════════════════
function treeLine(arr, x1, z1, x2, z2, n, spread = 4, sc = 3.4) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    arr.push({
      x: +(x1 + (x2 - x1) * t + (Math.random() - 0.5) * spread).toFixed(1),
      z: +(z1 + (z2 - z1) * t + (Math.random() - 0.5) * spread).toFixed(1),
      s: +(sc * (0.85 + Math.random() * 0.3)).toFixed(2),
      r: +(Math.random() * 6.28).toFixed(2),
    });
  }
}
const trees = [];
// Along Persiaran Kayu Manis (W edge)
treeLine(trees, -345, -300, -345, 220, 22, 4, 3.6);
// Along Jalan Pelaga (N edge)
treeLine(trees, -340, -310, 50, -310, 14, 5, 3.8);
// Along Jalan Bunga Lawang (E edge)
treeLine(trees,  340, -240, 340, 220, 18, 4, 3.5);
// Along Persiaran Kayu Manis (S edge)
treeLine(trees, -340, 270, 280, 270, 18, 5, 3.6);
// Around Padang
treeLine(trees, -180, -200, -100, -200, 5, 3, 3.4);
// Along Jalan Cengkih
treeLine(trees,  -55, -200, -55, 240, 14, 3, 3.2);
// Between Seri Laka and pensyarah houses
treeLine(trees,  255, -100, 255, 130, 10, 3, 3.4);
// Around Dewan Mahawangsa
treeLine(trees, -100, -180, -100, -120, 3, 2, 3.6);
// Around Masjid
treeLine(trees,  -90,   25,  -90,   45, 2, 1, 3.2);
treeLine(trees, -125,   -8, -110,   -8, 2, 2, 3.2);
// Inner gardens
treeLine(trees, -160,  -28, -160,    5, 3, 2, 3);
// East green strip
treeLine(trees,  340,  -20,  340,  180, 8, 3, 3.6);

// ═════════════════════════════════════════════════════════════════════════════
// BOUNDS & MANIFEST
// ═════════════════════════════════════════════════════════════════════════════
const roadPts = roads.flatMap(r => r.polyline);
const greenPts = greenspace.flatMap(g => g.polygon);
const crossingPts = crossings.flatMap(c => {
  const hw = c.width / 2;
  const hl = c.length / 2;
  return [[c.center[0] - hw, c.center[1] - hl], [c.center[0] + hw, c.center[1] + hl]];
});
const allX = [
  ...buildings.flatMap(b => [b.bbox[0], b.bbox[2]]),
  ...roadPts.map(p => p[0]),
  ...greenPts.map(p => p[0]),
  ...crossingPts.map(p => p[0]),
];
const allZ = [
  ...buildings.flatMap(b => [b.bbox[1], b.bbox[3]]),
  ...roadPts.map(p => p[1]),
  ...greenPts.map(p => p[1]),
  ...crossingPts.map(p => p[1]),
];
const bounds = {
  minX: Math.min(...allX) - 50,
  maxX: Math.max(...allX) + 50,
  minZ: Math.min(...allZ) - 50,
  maxZ: Math.max(...allZ) + 50,
};

const manifest = {
  name: "Kolej Matrikulasi Kedah (KMK) — Digital Twin Campus",
  origin: { lat: 6.4280, lon: 100.4290 },
  crs: "local-ENU-metres",
  generatedAt: new Date().toISOString(),
  source: "OpenStreetMap official tile (Persiaran Kayu Manis · Jalan Pelaga · Jalan Cengkih · Jalan Bunga Lawang)",
  note: "v4 layout — coordinates derived from OSM road network and building footprints, including external road extensions, parking lots and zebra crossings.",
  bounds,
  counts: {
    buildings: buildings.length,
    roads: roads.length,
    greenspace: greenspace.length,
    trees: trees.length,
    corridors: corridors.length,
    crossings: crossings.length,
  },
};

function save(file, data) {
  writeFileSync(join(OUT, file), JSON.stringify(data, null, 2));
  const len = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`✓ ${file.padEnd(20)} ${String(len).padStart(4)}`);
}
save("buildings.json", buildings);
save("roads.json", roads);
save("greenspace.json", greenspace);
save("corridors.json", corridors);
save("crossings.json", crossings);
save("track.json", track);
save("trees.json", trees);
save("metadata.json", metadataMap);
save("manifest.json", manifest);

console.log("\n── KMK campus (OSM-aligned v4) ────────────────");
console.log(`  X: ${bounds.minX} → ${bounds.maxX}  (W ${Math.round(bounds.maxX - bounds.minX)}m)`);
console.log(`  Z: ${bounds.minZ} → ${bounds.maxZ}  (D ${Math.round(bounds.maxZ - bounds.minZ)}m)`);
console.log(`  Buildings (with courtyards): ${buildings.length} (${buildings.filter(b=>b.holes.length>0).length})`);
console.log(`  Masjid Khulafa Ar Rasyidin: ${buildings.find(b=>b.id==='B_MASJID').area} m²`);
console.log(`  Dewan Mahawangsa: ${buildings.find(b=>b.id==='B_DEWAN_MAHAWANGSA').area} m²`);
