import React, { useRef, useEffect } from 'react';
import { useStore } from './store';
import { renderPhotoBorder } from './render';

const CanvasPreview: React.FC = () => {
  const { state } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = state.images.find(img => img.id === state.activeImageId);
  const config = state.config;

  useEffect(() => {
    if (!activeImage || !canvasRef.current || !config) return;

    const img = new Image();
    img.src = activeImage.objectUrl;

    img.onload = () => {
      // Load Logo if available
      if (config.logo.dataUrl) {
        const logo = new Image();
        logo.src = config.logo.dataUrl;
        logo.onload = () => {
          renderPhotoBorder(canvasRef.current!, activeImage, img, config, logo);
        }
      } else {
        renderPhotoBorder(canvasRef.current!, activeImage, img, config, null);
      }
    };
  }, [activeImage, config]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} style={{ 
        maxWidth: '100%', 
        maxHeight: '100%', 
        objectFit: 'contain', 
        backgroundColor: '#000',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)' 
      }} />
    </div>
  );
};

export default CanvasPreview;
