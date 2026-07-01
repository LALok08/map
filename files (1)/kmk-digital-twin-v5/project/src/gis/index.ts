// Single typed access point for KMK GIS data layer (PRD §5).
import buildingsJson from "./buildings.json";
import roadsJson from "./roads.json";
import greenspaceJson from "./greenspace.json";
import corridorsJson from "./corridors.json";
import crossingsJson from "./crossings.json";
import trackJson from "./track.json";
import treesJson from "./trees.json";
import metadataJson from "./metadata.json";
import manifestJson from "./manifest.json";
import type {
  Building,
  Corridor,
  Crossing,
  Road,
  Greenspace,
  Tree,
  MetadataMap,
  Manifest,
  Vec2,
} from "./types";

export const buildings = buildingsJson as unknown as Building[];
export const roads = roadsJson as Road[];
export const greenspace = greenspaceJson as Greenspace[];
export const corridors = corridorsJson as Corridor[];
export const crossings = crossingsJson as Crossing[];
export const track = trackJson as { outer: Vec2[]; inner: Vec2[] };
export const trees = treesJson as Tree[];
export const metadata = metadataJson as MetadataMap;
export const manifest = manifestJson as Manifest;

export const buildingById = new Map(buildings.map((b) => [b.id, b]));

// KMK-specific category colours (from traffic plan map palette)
export const CATEGORY_COLORS: Record<string, string> = {
  academic:    "#6b7fd7",
  library:     "#e0a040",
  residence_m: "#5b9bd5",  // blue — lelaki
  residence_f: "#e8557a",  // pink — perempuan
  sports:      "#56b87e",
  cafe:        "#e0795b",
  admin:       "#7d8aa3",
  lab:         "#56a7c4",
  hub:         "#b08bd6",
  dewan:       "#d99a3d",
  masjid:      "#4caf77",
  koop:        "#56a7c4",
  guard:       "#7d8aa3",
  staff_house: "#b08bd6",
  parking:     "#9aa3b0",
  dining:      "#e0795b",
};

export const CATEGORY_LABELS: Record<string, string> = {
  academic:    "Academic",
  library:     "Library / Pustaka",
  residence_m: "Blok Lelaki",
  residence_f: "Blok Perempuan",
  sports:      "Sports",
  cafe:        "Cafe / Dining",
  admin:       "Administration",
  lab:         "Laboratory",
  hub:         "Student Hub",
  dewan:       "Dewan",
  masjid:      "Masjid / Surau",
  koop:        "Koperasi",
  guard:       "Guard / Security",
  staff_house: "Staff House",
  parking:     "Parking",
  dining:      "Dining",
};
