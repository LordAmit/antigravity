export interface ExifData {
  make?: string;
  model?: string;
  focalLength?: number;
  fNumber?: number;
  iso?: number;
  exposureTime?: number | string;
  lensModel?: string; 
  date?: Date;
}

export interface ImageItem {
  id: string;
  file: File;
  objectUrl: string;
  width: number;
  height: number;
  exif: ExifData;
}

export interface LayoutSettings {
  aspectRatio: string; // "Original", "1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3"
  backgroundColor: string;
  backgroundType: 'color' | 'blurred-image';
  backgroundBlurScale: number;
  backgroundDimScale: number;
  borderWidthScale: number; // e.g. 0.05 for 5% of longest side
  imagePaddingScale: number; // additional padding around the image specifically
  innerBorderColor: string;
  innerBorderMode: 'uniform' | 'polaroid' | 'custom';
  innerBorderTopScale: number;
  innerBorderBottomScale: number;
  innerBorderSideScale: number;
  imageRadiusScale: number; // corner rounding for the inner border frame
  innerImageRadiusScale: number; // corner rounding for the actual inner photo
  imageShadowBlurScale: number;
  innerImageShadowBlurScale: number;
}

export interface TextLabel {
  id: string;
  text: string; // Supports templates like "{Make} | {Model}"
  fontFamily: string;
  fontSizeScale: number; // relative to short side
  color: string;
  strokeColor: string;
  strokeWidthScale: number;
  position: "Top Left" | "Top Center" | "Top Right" | "Bottom Left" | "Bottom Center" | "Bottom Right" | "Center";
  positionXScale: number;
  positionYScale: number;
  paddingYScale: number;
  paddingXScale: number;
  customFontDataUrl?: string; // stores base64 of uploaded font for preset persistence
}

export interface LogoSettings {
  dataUrl: string | null; 
  sizeScale: number;
  placement: "Left of Text" | "Right of Text";
  gapScale: number; // space between logo and text
  offsetXScale: number;
  offsetYScale: number;
}

export interface ExifPillSettings {
  show: boolean;
  showFocal: boolean;
  showAperture: boolean;
  showIso: boolean;
  showShutter: boolean;
  showLens: boolean;
  showCamera: boolean;
  showDate: boolean;
  position: "Top Left" | "Top Center" | "Top Right" | "Bottom Left" | "Bottom Center" | "Bottom Right" | "Center";
  positionXScale: number; 
  positionYScale: number; 
  boxColor: string;
  textColor: string;
  textStrokeColor: string;
  textStrokeWidthScale: number;
  borderColor: string;
  fontFamily: string;
  fontSizeScale: number;
  paddingYScale: number;
  paddingXScale: number;
  borderWidthScale: number;
  customCameraText?: string;
  customLensText?: string;
}

export interface AppConfig {
  layout: LayoutSettings;
  labels: TextLabel[];
  logo: LogoSettings;
  exifPills: ExifPillSettings;
}

export interface AppState {
  images: ImageItem[];
  activeImageId: string | null;
  config: AppConfig;
}
