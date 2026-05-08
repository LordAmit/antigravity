import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractExif, exportImageWithExif } from './exif';
import exifr from 'exifr';
import * as piexif from 'piexifjs';

// Mock exifr
vi.mock('exifr', () => ({
  default: {
    parse: vi.fn(),
  },
}));

// Mock piexifjs
vi.mock('piexifjs', () => ({
  load: vi.fn(),
  dump: vi.fn(),
  insert: vi.fn(),
  ImageIFD: { Make: 271, Model: 272 },
  ExifIFD: { LensModel: 42036 },
}));

describe('extractExif', () => {
  it('verifies the shutter speed fraction conversion', async () => {
    (exifr.parse as any).mockResolvedValue({ ExposureTime: 0.005 });
    const result = await extractExif(new File([], 'test.jpg'));
    expect(result.exposureTime).toBe('1/200');
  });

  it('verifies date parsing fallback logic', async () => {
    const testDate = new Date('2023-01-01T12:00:00Z');
    (exifr.parse as any).mockResolvedValue({ DateTimeOriginal: testDate });
    const result = await extractExif(new File([], 'test.jpg'));
    expect(result.date).toBe(testDate.toLocaleDateString());
  });

  it('safely returns an empty {} object without crashing when an image contains absolutely no EXIF data', async () => {
    (exifr.parse as any).mockResolvedValue(undefined);
    const result = await extractExif(new File([], 'test.png'));
    expect(result).toEqual({});
  });
});

describe('exportImageWithExif', () => {
  const mockCanvas = {
    toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mockdata'),
  } as unknown as HTMLCanvasElement;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ blob: () => Promise.resolve(new Blob()) });
  });

  it('strictly preserves the original EXIF without modifying it', async () => {
    const mockRawExifStr = 'mockRawExifStr';
    (piexif.insert as any).mockReturnValue('newImageWithExif');

    await exportImageWithExif(mockCanvas, { rawExifStr: mockRawExifStr, exif: {} } as any);

    // It should NEVER load or dump, it should strictly use the raw string
    expect(piexif.load).not.toHaveBeenCalled();
    expect(piexif.dump).not.toHaveBeenCalled();
    expect(piexif.insert).toHaveBeenCalledWith(mockRawExifStr, 'data:image/jpeg;base64,mockdata');
  });

  it('exports cleanly if there is no original EXIF data', async () => {
    await exportImageWithExif(mockCanvas, { rawExifStr: null, exif: {} } as any);

    expect(piexif.insert).not.toHaveBeenCalled();
  });

  it('properly passes custom quality settings down to the canvas toDataURL method', async () => {
    const quality = 0.85;
    await exportImageWithExif(mockCanvas, { rawExifStr: null, exif: {} } as any, quality);

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.85);
  });
});
