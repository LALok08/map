/**
 * KMK Digital Twin Campus — GIS data generator
 * ------------------------------------------------------------------
 * Simulates the DXF -> GIS -> JSON pipeline described in the PRD.
 *
 *      DXF  ->  GIS  ->  JSON  ->  Three.js
 *
 * In production this script is REPLACED by a real DXF parser that emits
 * the exact same JSON shape. Render code never changes — only the data.
 *
 * Coordinate system: local ENU metres, origin at campus reference point.
 * X = East (m), Z = South (m). Heights in metres. All footprints are real
 * polygons (no hand-placed Box coordinates).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "gis");
mkdirSync(OUT, { recursive: true });

// Deterministic PRNG so regenerating yields identical campus.
let seed = 20260214;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const rr = (a, b) => a + (b - a) * rand();

// Geo reference (a plausible KMK reference origin, used by CoordSystem).
const ORIGIN = { lat: 3.07494, lon: 101.50705 };

// Build a rotated-rectangle footprint polygon (real building footprint).
function rectFootprint(cx, cz, w, l, rotDeg) {
  const r = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const hw = w / 2;
  const hl = l / 2;
  const corners = [
    [-hw, -hl],
    [hw, -hl],
    [hw, hl],
    [-hw, hl],
  ];
  return corners.map(([x, z]) => [
    +(cx + x * cos - z * sin).toFixed(2),
    +(cz + x * sin + z * cos).toFixed(2),
  ]);
}

function polyArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    a += x1 * z2 - x2 * z1;
  }
  return Math.abs(a) / 2;
}

// ---- Building catalogue ------------------------------------------------
// Curated, believable KMK campus. Each entry: category drives colour/use.
const CATS = {
  academic: { color: "#6b7fd7", label: "Academic" },
  library: { color: "#d99a3d", label: "Library" },
  residence: { color: "#cf7da6", label: "Residence" },
  sports: { color: "#56b87e", label: "Sports" },
  dining: { color: "#e0795b", label: "Dining" },
  admin: { color: "#7d8aa3", label: "Administration" },
  lab: { color: "#56a7c4", label: "Laboratory" },
  hub: { color: "#b08bd6", label: "Student Hub" },
};

const FLOOR_H = 3.6;

const seeds = [
  // name, category, cx, cz, w, l, rot, floors, emoji
  ["Main Library", "library", -40, -30, 70, 48, 4, 4, "📚"],
  ["Tutorial Block A", "academic", 90, -60, 64, 30, 0, 3, "📐"],
  ["Tutorial Block B", "academic", 90, -10, 64, 30, 0, 3, "📝"],
  ["Lecture Theatre Complex", "academic", 175, -40, 56, 56, 12, 2, "🎓"],
  ["Engineering Lab", "lab", -150, 40, 60, 44, 0, 3, "⚙️"],
  ["Science Building", "lab", -150, -50, 60, 44, 0, 4, "🔬"],
  ["Computing Faculty", "academic", -50, 70, 72, 36, 0, 4, "💻"],
  ["Administration Tower", "admin", 30, 90, 38, 38, 0, 8, "🏛️"],
  ["Student Hub", "hub", 10, -110, 80, 40, 0, 2, "✨"],
  ["Central Cafe", "dining", -110, -120, 34, 26, 0, 1, "☕"],
  ["Food Court", "dining", 120, 80, 50, 34, 0, 1, "🍜"],
  ["Sports Hall", "sports", -210, 130, 70, 50, 0, 2, "🏀"],
  ["Gymnasium", "sports", -120, 150, 44, 34, 0, 1, "🏋️"],
  ["Residence Hall North", "residence", 180, 110, 30, 70, 0, 6, "🛏️"],
  ["Residence Hall South", "residence", 230, 110, 30, 70, 0, 6, "🛏️"],
  ["Residence Hall East", "residence", 205, 200, 70, 30, 0, 6, "🛏️"],
  ["Health & Counselling", "admin", -30, 150, 36, 26, 0, 2, "➕"],
  ["Design Studio", "academic", -230, -30, 48, 36, 6, 3, "🎨"],
  ["Auditorium", "hub", 95, 150, 60, 48, 0, 1, "🎭"],
  ["Innovation Centre", "lab", -250, 60, 46, 40, 0, 3, "🚀"],
];

const buildings = [];
const metadata = {};

const HOURS = "Mon–Fri 08:00–22:00 · Sat 09:00–17:00";

seeds.forEach((s, i) => {
  const [name, category, cx, cz, w, l, rot, floors, emoji] = s;
  const id = `B${String(i + 1).padStart(3, "0")}`;
  const polygon = rectFootprint(cx, cz, w, l, rot);
  const height = +(floors * FLOOR_H).toFixed(2);
  const area = +polyArea(polygon).toFixed(1);
  buildings.push({
    id,
    name,
    category,
    color: CATS[category].color,
    polygon,
    center: [+cx.toFixed(2), +cz.toFixed(2)],
    height,
    rotation: rot,
    floors,
    area,
    bbox: [
      Math.min(...polygon.map((p) => p[0])),
      Math.min(...polygon.map((p) => p[1])),
      Math.max(...polygon.map((p) => p[0])),
      Math.max(...polygon.map((p) => p[1])),
    ].map((n) => +n.toFixed(2)),
  });
  metadata[id] = {
    name,
    emoji,
    description: descFor(category, name, floors),
    tags: tagsFor(category),
    floors,
    hours: category === "residence" ? "24 hours · residents only" : HOURS,
  };
});

function descFor(cat, name, floors) {
  const map = {
    library: `The ${name} is the academic heart of KMK with ${floors} floors of study space, archives, silent zones and group rooms.`,
    academic: `${name} houses lecture rooms and tutorial spaces across ${floors} floors for daily classes.`,
    lab: `${name} contains specialised laboratories and research facilities spread over ${floors} floors.`,
    residence: `${name} is on-campus accommodation with student rooms, common lounges and laundry.`,
    sports: `${name} supports indoor sports, training and campus events.`,
    dining: `${name} serves meals, snacks and coffee throughout the day — a popular meeting spot.`,
    admin: `${name} hosts campus administration and student services across ${floors} floors.`,
    hub: `${name} is a central gathering space for student life, events and activities.`,
  };
  return map[cat] || name;
}
function tagsFor(cat) {
  const map = {
    library: ["study", "quiet", "wifi", "archives"],
    academic: ["lectures", "tutorials", "classrooms"],
    lab: ["research", "labs", "equipment"],
    residence: ["accommodation", "students", "24h"],
    sports: ["sports", "fitness", "events"],
    dining: ["food", "coffee", "social"],
    admin: ["services", "office", "help"],
    hub: ["events", "social", "students"],
  };
  return map[cat] || [];
}

// ---- Roads -------------------------------------------------------------
// Polylines with real width. A perimeter loop + internal connectors.
const roads = [
  {
    id: "R001",
    name: "Campus Ring Road",
    type: "primary",
    width: 10,
    polyline: [
      [-300, -180],
      [280, -180],
      [300, 0],
      [290, 240],
      [-120, 250],
      [-300, 180],
      [-300, -180],
    ],
  },
  {
    id: "R002",
    name: "Central Avenue",
    type: "primary",
    width: 8,
    polyline: [
      [-40, -180],
      [-40, 90],
      [30, 130],
      [30, 245],
    ],
  },
  {
    id: "R003",
    name: "Library Walk",
    type: "path",
    width: 4,
    polyline: [
      [-40, -30],
      [-150, -50],
      [-230, -30],
    ],
  },
  {
    id: "R004",
    name: "Faculty Link",
    type: "secondary",
    width: 6,
    polyline: [
      [90, -180],
      [90, -10],
      [175, -40],
    ],
  },
  {
    id: "R005",
    name: "Residence Drive",
    type: "secondary",
    width: 6,
    polyline: [
      [30, 130],
      [180, 110],
      [230, 110],
      [205, 200],
    ],
  },
  {
    id: "R006",
    name: "West Service Road",
    type: "secondary",
    width: 6,
    polyline: [
      [-300, 60],
      [-250, 60],
      [-150, 40],
      [-50, 70],
    ],
  },
  {
    id: "R007",
    name: "Sports Path",
    type: "path",
    width: 4,
    polyline: [
      [-50, 70],
      [-120, 150],
      [-210, 130],
    ],
  },
];

// ---- Greenspace --------------------------------------------------------
const greenspace = [
  {
    id: "G001",
    type: "lawn",
    name: "Central Green",
    polygon: rectFootprint(20, 20, 120, 90, 0),
  },
  {
    id: "G002",
    type: "field",
    name: "Sports Field",
    polygon: rectFootprint(-180, 30, 120, 80, 0),
  },
  {
    id: "G003",
    type: "garden",
    name: "Library Garden",
    polygon: rectFootprint(-95, -90, 90, 60, 0),
  },
  {
    id: "G004",
    type: "lawn",
    name: "Residence Lawn",
    polygon: rectFootprint(170, 170, 110, 70, 0),
  },
  {
    id: "G005",
    type: "plaza",
    name: "Hub Plaza",
    polygon: rectFootprint(10, -110, 110, 60, 0),
  },
];

// ---- Tree instances (for instanced rendering / greenery) ---------------
const trees = [];
for (let i = 0; i < 220; i++) {
  const x = rr(-300, 300);
  const z = rr(-180, 250);
  // keep trees off building footprints (rough check via center distance)
  const tooClose = buildings.some((b) => {
    const dx = b.center[0] - x;
    const dz = b.center[1] - z;
    return Math.hypot(dx, dz) < Math.max(b.bbox[2] - b.bbox[0], b.bbox[3] - b.bbox[1]) * 0.6;
  });
  if (tooClose) continue;
  trees.push({
    x: +x.toFixed(1),
    z: +z.toFixed(1),
    s: +rr(2.4, 4.6).toFixed(2),
    r: +rr(0, 6.28).toFixed(2),
  });
}

// ---- Bounds ------------------------------------------------------------
const allX = [...buildings.flatMap((b) => [b.bbox[0], b.bbox[2]])];
const allZ = [...buildings.flatMap((b) => [b.bbox[1], b.bbox[3]])];
const meta = {
  name: "KMK Digital Twin Campus",
  origin: ORIGIN,
  crs: "local-ENU-metres",
  generatedAt: new Date().toISOString(),
  bounds: {
    minX: -310,
    maxX: 310,
    minZ: -200,
    maxZ: 270,
  },
  counts: {
    buildings: buildings.length,
    roads: roads.length,
    greenspace: greenspace.length,
    trees: trees.length,
  },
};

function save(file, data) {
  writeFileSync(join(OUT, file), JSON.stringify(data, null, 2));
  console.log("wrote", file, Array.isArray(data) ? data.length : "");
}

save("buildings.json", buildings);
save("roads.json", roads);
save("greenspace.json", greenspace);
save("trees.json", trees);
save("metadata.json", metadata);
save("manifest.json", meta);
console.log("Done. bounds X", Math.min(...allX), Math.max(...allX), "Z", Math.min(...allZ), Math.max(...allZ));
