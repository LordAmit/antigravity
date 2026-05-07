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
});
