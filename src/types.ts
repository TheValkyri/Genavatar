export type FrameCategory = 'official' | 'student' | 'ceremony';

export interface FrameTemplate {
  id: string;
  name: string;
  category: FrameCategory;
  src: string;
  badgeText: string;
  description: string;
  hasEmbeddedLogo?: boolean;
  isOfficial?: boolean;
}

export type ActiveLayer = 'photo' | 'logo';

export interface LogoSettings {
  enabled: boolean;
  x: number; // 0 to 1 relative to canvas width
  y: number; // 0 to 1 relative to canvas height
  size: number; // 60 to 220 px relative to 600px canvas
  rotation: number; // 0 to 360 deg
  opacity: number; // 0.2 to 1.0
}

export interface StudentBadgeSettings {
  enabled: boolean;
  fullName: string;
  className: string;
  schoolYear: string;
}

export interface ImageAdjustments {
  zoom: number; // 0.5 to 3.0
  rotation: number; // 0 to 360
  flipH: boolean;
  panX: number;
  panY: number;
  brightness: number; // 70 to 140
  contrast: number; // 70 to 140
}
