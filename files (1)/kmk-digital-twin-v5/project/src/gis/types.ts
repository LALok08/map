// Shared GIS types. These mirror the JSON emitted by the DXF→GIS pipeline.
export type Vec2 = [number, number]; // [x, z] in local ENU metres

export type BuildingCategory =
  | "academic"
  | "library"
  | "residence_m"
  | "residence_f"
  | "residence" // gender not yet confirmed — neutral colour until specified
  | "sports"
  | "dining"
  | "cafe"
  | "admin"
  | "lab"
  | "hub"
  | "dewan"
  | "masjid"
  | "koop"
  | "guard"
  | "staff_house"
  | "parking";

export interface BuildingFeatures {
  dome?: boolean;
  minaret?: boolean;
  domeRadius?: number;
  minaretHeight?: number;
  bigRoof?: boolean;
  corridor?: boolean;
  parking?: boolean;
}

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory;
  color: string;
  polygon: Vec2[];
  holes: Vec2[][]; // courtyard / atrium voids (open-air middle)
  center: Vec2;
  height: number;
  rotation: number;
  floors: number;
  area: number;
  bbox: [number, number, number, number]; // minX, minZ, maxX, maxZ
  features: BuildingFeatures;
}

export interface Corridor {
  id: string;
  rect: Vec2[];
}

export interface Road {
  id: string;
  name: string;
  type: "primary" | "secondary" | "path" | "external";
  width: number;
  polyline: Vec2[];
}

export interface Crossing {
  id: string;
  name: string;
  center: Vec2;
  width: number;
  length: number;
  rotation: number;
  stripes: number;
}

export interface Greenspace {
  id: string;
  type: "lawn" | "field" | "garden" | "plaza";
  name: string;
  polygon: Vec2[];
}

export interface Tree {
  x: number;
  z: number;
  s: number;
  r: number;
}

export interface BuildingMeta {
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  floors: number;
  hours: string;
}

export interface Manifest {
  name: string;
  origin: { lat: number; lon: number };
  crs: string;
  generatedAt: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  counts: {
    buildings: number;
    roads: number;
    greenspace: number;
    trees: number;
    corridors?: number;
    crossings?: number;
  };
}

export type MetadataMap = Record<string, BuildingMeta>;
