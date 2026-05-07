import exifr from 'exifr';
import * as piexif from 'piexifjs';
import type { ExifData, ImageItem, AppConfig } from './types';
import { resolveTemplate } from './utils';

export const extractExif = async (file: File): Promise<ExifData> => {
  try {
    const data = await exifr.parse(file, [
      'Make', 'Model', 'FocalLength', 'FNumber', 'ISO', 'ExposureTime', 'LensModel', 'DateTimeOriginal'
    ]);

    if (!data) return {};

    // Format exposure time
    let exposureTimeValue: string | number | undefined = data.ExposureTime;
    if (typeof data.ExposureTime === 'number') {
      if (data.ExposureTime < 1) {
        exposureTimeValue = `1/${Math.round(1 / data.ExposureTime)}`;
      }
    }

    let dateValue = undefined;
    if (data.DateTimeOriginal) {
      const d = new Date(data.DateTimeOriginal);
      if (!isNaN(d.getTime())) {
        dateValue = d.toLocaleDateString();
      }
    }

    return {
      make: data.Make,
      model: data.Model,
      focalLength: data.FocalLength ? Math.round(data.FocalLength) : undefined,
      fNumber: data.FNumber ? Number(data.FNumber.toFixed(1)) : undefined,
      iso: data.ISO ? Math.round(data.ISO) : undefined,
      exposureTime: exposureTimeValue,
      lensModel: data.LensModel,
      date: dateValue as any,
    };
  } catch (error) {
    console.warn("Failed to extract EXIF data", error);
    return {};
  }
};

export const exportImageWithExif = async (canvas: HTMLCanvasElement, image: ImageItem, config: AppConfig): Promise<Blob | null> => {
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

  if (image.rawExifStr) {
    try {
      const newImageWithExif = piexif.insert(image.rawExifStr, dataUrl);
      const res = await fetch(newImageWithExif);
      return await res.blob();
    } catch (e) {
      console.error("Failed to insert EXIF", e);
    }
  }
  
  const res = await fetch(dataUrl);
  return await res.blob();
};
