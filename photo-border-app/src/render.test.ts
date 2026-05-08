import { describe, it, expect, vi } from 'vitest';
import { renderPhotoBorder } from './render';
import type { AppConfig, ImageItem } from './types';

describe('renderPhotoBorder calculations', () => {
  const createMockCanvas = () => {
    const mockCtx = {
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      arc: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      clip: vi.fn(),
      rect: vi.fn(),
    };

    return {
      canvas: {
        getContext: vi.fn().mockReturnValue(mockCtx),
        width: 0,
        height: 0,
      } as unknown as HTMLCanvasElement,
      ctx: mockCtx,
    };
  };

  const mockImageItem: ImageItem = {
    id: 'test-1',
    file: new File([], 'test.jpg'),
    objectUrl: 'blob:test',
    width: 1000,
    height: 1000,
    exif: {},
  };

  const baseConfig: AppConfig = {
    layout: {
      aspectRatio: 'Original',
      backgroundColor: '#ffffff',
      backgroundType: 'color',
      backgroundBlurScale: 0.1,
      backgroundDimScale: 0.2,
      borderWidthScale: 0.05,
      imagePaddingScale: 0.02,
      innerBorderColor: '#ffffff',
      innerBorderMode: 'uniform',
      innerBorderTopScale: 0.02,
      innerBorderBottomScale: 0.02,
      innerBorderSideScale: 0.02,
      imageRadiusScale: 0,
      innerImageRadiusScale: 0,
      imageShadowBlurScale: 0,
      innerImageShadowBlurScale: 0,
    },
    labels: [],
    logo: {
      dataUrl: null,
      sizeScale: 0.08,
      position: 'Bottom Right',
      offsetXScale: 0,
      offsetYScale: 0,
    },
    exifPills: {
      show: false,
      showFocal: true,
      showAperture: true,
      showIso: true,
      showShutter: true,
      showLens: false,
      showCamera: false,
      showDate: false,
      position: 'Bottom Center',
      positionXScale: 0,
      positionYScale: 0.02,
      boxColor: '#ffffff',
      textColor: '#1e293b',
      textStrokeColor: '#000000',
      textStrokeWidthScale: 0,
      borderColor: '#e2e8f0',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSizeScale: 0.012,
      borderWidthScale: 0.001,
      internalPaddingScale: 0.8,
      pillTextSpacingScale: 0.35,
    },
    export: {
      quality: 100,
      maxResolution: 'Original',
    },
  };

  it('keeps original dimensions if under standard maxRes', () => {
    const { canvas } = createMockCanvas();
    const imgObj = { width: 3000, height: 2000 } as HTMLImageElement;

    renderPhotoBorder(canvas, mockImageItem, imgObj, baseConfig, null);

    // Default max resolution ceiling is 8000. 3000 < 8000 so no scaling happens.
    expect(canvas.width).toBe(3000);
    expect(canvas.height).toBe(2000);
  });

  it('correctly applies resolution limit capping (downscaling)', () => {
    const { canvas } = createMockCanvas();
    const imgObj = { width: 5000, height: 2500 } as HTMLImageElement; // 2:1 aspect ratio

    // Cap longest edge to 2000
    renderPhotoBorder(canvas, mockImageItem, imgObj, baseConfig, null, 2000);

    // Width should be scaled down from 5000 to 2000. 
    // Height scales proportionally: 2500 * (2000 / 5000) = 1000.
    expect(canvas.width).toBe(2000);
    expect(canvas.height).toBe(1000);
  });

  it('fully protects against upscaling (no expansion of small photos)', () => {
    const { canvas } = createMockCanvas();
    const imgObj = { width: 600, height: 400 } as HTMLImageElement;

    // Set max resolution ceiling to 2000 (which is larger than 600)
    renderPhotoBorder(canvas, mockImageItem, imgObj, baseConfig, null, 2000);

    // Width should stay at 600px, not blow up to 2000px.
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(400);
  });

  it('scales correctly based on target aspect ratio overrides', () => {
    const { canvas } = createMockCanvas();
    const imgObj = { width: 3000, height: 2000 } as HTMLImageElement; // 3:2 original ratio
    
    // Override aspect ratio to 1:1
    const configWithSquareRatio = {
      ...baseConfig,
      layout: {
        ...baseConfig.layout,
        aspectRatio: '1:1',
      },
    };

    renderPhotoBorder(canvas, mockImageItem, imgObj, configWithSquareRatio, null);

    // Canvas should become square using the longest edge (3000)
    expect(canvas.width).toBe(3000);
    expect(canvas.height).toBe(3000);
  });
});
