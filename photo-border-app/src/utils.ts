import type { ExifData } from './types';

export const resolveTemplate = (raw: string, exif: ExifData | undefined): string => {
  if (!raw) return '';
  const safeExif = exif || {};
  
  return raw
    .replace(/{make}/gi, String(safeExif.make || ''))
    .replace(/{model}/gi, String(safeExif.model || ''))
    .replace(/{lens}/gi, String(safeExif.lensModel || ''))
    .replace(/{iso}/gi, String(safeExif.iso || ''))
    .replace(/{focal}/gi, String(safeExif.focalLength || ''))
    .replace(/{f}/gi, String(safeExif.fNumber || ''))
    .replace(/{shutter}/gi, String(safeExif.exposureTime || ''))
    .replace(/{date}/gi, String(safeExif.date || ''))
    // Replace multiple spaces that might result from empty replacements with a single space
    .replace(/\s+/g, ' ')
    .trim();
};
