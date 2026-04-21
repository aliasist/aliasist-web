export interface StormCam {
  id: string;
  name: string;
  provider?: string;
  embedUrl?: string; // iframe/embed URL (YouTube, etc.)
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  type?: "cityCam" | "stormCam" | "chaser" | "other";
  attribution?: string;
}

export interface RadarFrame {
  tileUrl: string; // tile URL template for a single frame (z/x/y)
  timestamp: string;
}

export interface RadarData {
  frames: RadarFrame[];
  tileSize?: number;
  attribution?: string;
}
