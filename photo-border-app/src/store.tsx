import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppConfig, ImageItem } from './types';

export const defaultConfig: AppConfig = {
  layout: {
    aspectRatio: "1:1",
    backgroundColor: "#ffffff",
    backgroundType: 'blurred-image',
    backgroundBlurScale: 0.02,
    backgroundDimScale: 0.3,
    borderWidthScale: 0.05,
    imagePaddingScale: 0.02,
    innerBorderColor: "#ffffff",
    innerBorderMode: "polaroid",
    innerBorderTopScale: 0.02,
    innerBorderBottomScale: 0.12, // Standard Polaroid lip for preset consistency
    innerBorderSideScale: 0.02,
    imageRadiusScale: 0,
    innerImageRadiusScale: 0,
    imageShadowBlurScale: 0,
    innerImageShadowBlurScale: 0,
  },
  labels: [
    {
      id: "1",
      show: true,
      text: "**{make}** *{model}*",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSizeScale: 0.022, 
      color: "#1e293b",
      strokeColor: "#000000",
      strokeWidthScale: 0,
      position: "Bottom Center",
      positionXScale: 0,
      positionYScale: -0.02,

      fontWeight: "normal",
      fontStyle: "normal",
    }
  ],
  logo: {
    dataUrl: null,
    sizeScale: 0.08,
    position: "Bottom Right",

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
    positionYScale: 0.02,
    boxColor: "#ffffff",
    textColor: "#1e293b",
    textStrokeColor: "#000000",
    textStrokeWidthScale: 0,
    borderColor: "#e2e8f0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSizeScale: 0.012,
    borderWidthScale: 0.001,
    internalPaddingScale: 0.8,
    pillTextSpacingScale: 0.35,
  },
  export: {
    quality: 100,
    maxResolution: "Original",
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
  updateImageCaption: (id: string, text: string) => void;
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
  const updateImageCaption = (id: string, text: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map(img => img.id === id ? { ...img, captionText: text } : img)
    }));
  };

  return (
    <StoreContext.Provider value={{ state, setState, updateConfig, addImage, removeImage, setActiveImage, clearAllImages, updateImageCaption }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
