import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppConfig, ImageItem } from './types';

export const defaultConfig: AppConfig = {
  layout: {
    aspectRatio: "1:1",
    backgroundColor: "#ffffff",
    backgroundType: 'blurred-image',
    backgroundBlurScale: 0.1,
    backgroundDimScale: 0.3,
    borderWidthScale: 0.05,
    imagePaddingScale: 0,
    innerBorderColor: "#ffffff",
    innerBorderMode: "custom",
    innerBorderTopScale: 0.02,
    innerBorderBottomScale: 0.18, // Deep Polaroid lip for better spacing
    innerBorderSideScale: 0.02,
    imageRadiusScale: 0,
    innerImageRadiusScale: 0,
    imageShadowBlurScale: 0,
    innerImageShadowBlurScale: 0,
  },
  labels: [
    {
      id: "1",
      text: "BRAND | {model}",
      fontFamily: "Inter, sans-serif",
      fontSizeScale: 0.012, // Elegant, smaller size
      color: "#000000",
      strokeColor: "#000000",
      strokeWidthScale: 0,
      position: "Bottom Center",
      positionXScale: 0,
      positionYScale: 0,
      paddingYScale: 0.08, // Nested higher in the bottom border
      paddingXScale: 0.5,
    }
  ],
  logo: {
    dataUrl: null,
    sizeScale: 0.08,
    placement: "Right of Text",
    gapScale: 0.01,
    offsetXScale: 0,
    offsetYScale: 0,
  },
  exifPills: {
    show: true,
    showFocal: true,
    showAperture: true,
    showIso: true,
    showShutter: true,
    showLens: false,
    showCamera: false,
    showDate: false,
    position: "Bottom Center",
    positionXScale: 0,
    positionYScale: 0,
    boxColor: "#ffffff",
    textColor: "#000000",
    textStrokeColor: "#000000",
    textStrokeWidthScale: 0,
    borderColor: "#eeeeee",
    fontFamily: "Inter, sans-serif",
    fontSizeScale: 0.008, // Clean, technical detail size
    paddingYScale: 0.025, // Anchored near the bottom edge
    paddingXScale: 0.03,
    borderWidthScale: 0.001,
  }
};

interface StoreContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateConfig: (updater: (config: AppConfig) => AppConfig) => void;
  addImage: (img: ImageItem) => void;
  removeImage: (id: string) => void;
  setActiveImage: (id: string | null) => void;
  clearAllImages: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    images: [],
    activeImageId: null,
    config: defaultConfig,
  });

  const updateConfig = useCallback((updater: (prev: AppConfig) => AppConfig) => {
    setState(prev => ({
      ...prev,
      config: updater(prev.config)
    }));
  }, []);

  const addImage = (image: ImageItem) => {
    setState(prev => ({
      ...prev,
      images: [...prev.images, image],
      activeImageId: prev.activeImageId || image.id,
    }));
  };

  const removeImage = (id: string) => {
    setState(prev => {
      const newImages = prev.images.filter(img => img.id !== id);
      return {
        ...prev,
        images: newImages,
        activeImageId: prev.activeImageId === id ? (newImages[0]?.id || null) : prev.activeImageId,
      };
    });
  };

  const setActiveImage = (id: string | null) => {
    setState(prev => ({ ...prev, activeImageId: id }));
  };

  const clearAllImages = () => {
    setState(prev => ({ ...prev, images: [], activeImageId: null }));
  };

  return (
    <StoreContext.Provider value={{ state, setState, updateConfig, addImage, removeImage, setActiveImage, clearAllImages }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
