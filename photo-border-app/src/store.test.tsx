import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StoreProvider, useStore } from './store';
import React from 'react';
import type { ImageItem } from './types';

describe('useStore', () => {
  it('addImage correctly appends to the image array and sets the active image', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <StoreProvider>{children}</StoreProvider>;
    const { result } = renderHook(() => useStore(), { wrapper });

    const mockImage: ImageItem = {
      id: '1',
      file: new File([], 'test.jpg'),
      objectUrl: 'blob:test',
      width: 100,
      height: 100,
      exif: {},
      rawExifStr: null
    };

    act(() => {
      result.current.addImage(mockImage);
    });

    expect(result.current.state.images).toHaveLength(1);
    expect(result.current.state.images[0].id).toBe('1');
    expect(result.current.state.activeImageId).toBe('1');
  });

  it('updateConfig successfully deep-merges configuration updates', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <StoreProvider>{children}</StoreProvider>;
    const { result } = renderHook(() => useStore(), { wrapper });

    const initialConfig = result.current.state.config;

    act(() => {
      result.current.updateConfig((c) => ({
        ...c,
        exifPills: {
          ...c.exifPills,
          customCameraText: 'Overridden Camera'
        }
      }));
    });

    expect(result.current.state.config.exifPills.customCameraText).toBe('Overridden Camera');
    expect(result.current.state.config.layout.innerBorderTopScale).toBe(initialConfig.layout.innerBorderTopScale);
  });

  it('updateImageCaption specifically updates the caption for the correct image', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <StoreProvider>{children}</StoreProvider>;
    const { result } = renderHook(() => useStore(), { wrapper });

    const mockImage1: ImageItem = { id: '1', file: new File([], '1.jpg'), objectUrl: 'blob:1', width: 100, height: 100, exif: {} };
    const mockImage2: ImageItem = { id: '2', file: new File([], '2.jpg'), objectUrl: 'blob:2', width: 100, height: 100, exif: {} };

    act(() => {
      result.current.addImage(mockImage1);
      result.current.addImage(mockImage2);
    });

    act(() => {
      result.current.updateImageCaption('1', 'Custom Caption 1');
    });

    const img1 = result.current.state.images.find(img => img.id === '1');
    const img2 = result.current.state.images.find(img => img.id === '2');

    expect(img1?.captionText).toBe('Custom Caption 1');
    // Ensure image 2 was not modified
    expect(img2?.captionText).toBeUndefined();
  });
});
