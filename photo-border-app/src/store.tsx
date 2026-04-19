import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppConfig, ImageItem } from './types';

export const defaultConfig: AppConfig = {
  layout: {
    aspectRatio: "Original",
    backgroundColor: "#2e2e2e",
    backgroundType: 'blurred-image',
    backgroundBlurScale: 0.1,
    backgroundDimScale: 0.3,
    borderWidthScale: 0.05,
    imagePaddingScale: 0,
    innerBorderColor: "#ffffff",
    innerBorderMode: "custom",
    innerBorderTopScale: 0.02,
    innerBorderBottomScale: 0.1, // Polaroid style bottom lip
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
      fontSizeScale: 0.025,
      color: "#000000",
      strokeColor: "#000000",
      strokeWidthScale: 0,
      position: "Bottom Center",
      paddingYScale: 0.15,
      paddingXScale: 0.5,
    }
  ],
  logo: {
    dataUrl: null,
    sizeScale: 0.05,
    placement: "Left of Text",
    gapScale: 0.02,
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
    borderColor: "#cccccc",
    fontFamily: "Inter, sans-serif",
    fontSizeScale: 0.015,
    paddingYScale: 0.03,
    paddingXScale: 0.03,
    borderWidthScale: 0.001,
  }
};

interface StoreContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateConfig: (updater: (prev: AppConfig) => AppConfig) => void;
  addImage: (image: ImageItem) => void;
  removeImage: (id: string) => void;
  setActiveImage: (id: string | null) => void;
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

  return (
    <StoreContext.Provider value={{ state, setState, updateConfig, addImage, removeImage, setActiveImage }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
