import React, { useRef, useEffect, useState } from 'react';
import { Upload, Trash2, Download, X, ImagePlus } from 'lucide-react';
import { useStore } from './store';
import { extractExif, exportImageWithExif } from './exif';
import { renderPhotoBorder } from './render';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import CanvasPreview from './CanvasPreview';
import SidebarControls from './SidebarControls';

import piexif from 'piexifjs';

function App() {
  const { state, addImage, updateConfig, clearAllImages, setActiveImage, removeImage } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Dynamically load fonts from Google Fonts for seamless usage
  useEffect(() => {
    const fontsToLoad = new Set<string>();

    // Check Label fonts
    state.config.labels.forEach(label => {
      // If it contains a raw base64 custom font, inject it natively instead of via Google Fonts
      if (label.customFontDataUrl) {
        const linkId = `custom-local-font-${label.fontFamily.replace(/\s+/g, '-')}`;
        if (!document.getElementById(linkId)) {
          const style = document.createElement('style');
          style.id = linkId;
          style.innerHTML = `
            @font-face {
              font-family: '${label.fontFamily}';
              src: url('${label.customFontDataUrl}');
            }
          `;
          document.head.appendChild(style);
          if ('fonts' in document) {
            document.fonts.load(`16px "${label.fontFamily}"`).then(() => updateConfig(c => ({ ...c })));
          }
        }
      } else if (label.fontFamily && !label.fontFamily.includes('sans-serif')) {
        fontsToLoad.add(label.fontFamily.replace(/"/g, '').trim());
      }
    });

    // Check EXIF fonts
    if (state.config.exifPills.fontFamily && !state.config.exifPills.fontFamily.includes('sans-serif')) {
      fontsToLoad.add(state.config.exifPills.fontFamily.replace(/"/g, '').trim());
    }

    fontsToLoad.forEach(font => {
      const linkId = `dynamic-font-${font.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;600&display=swap`;

        // When loaded, trigger a state update just to re-render the canvas
        link.onload = () => {
          updateConfig(c => ({ ...c }));
        };

        document.head.appendChild(link);

        // Also force Document.fonts to be ready if it's local but needs to be parsed
        if ('fonts' in document) {
          document.fonts.load(`16px "${font}"`).catch(() => { });
        }
      }
    });
  }, [state.config.labels, state.config.exifPills.fontFamily, updateConfig]);

  const processFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|heif|gif)$/i)) continue;

      let rawExifStr: string | null = null;
      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.name.match(/\.jpe?g$/i)) {
        const reader = new FileReader();
        rawExifStr = await new Promise((resolve) => {
          reader.onload = (e) => {
            try {
              const dataUrl = e.target?.result as string;
              const exifObj = piexif.load(dataUrl);
              const exifStr = piexif.dump(exifObj);
              if (exifStr && exifStr !== "Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x00\x00\x00\x00\x00") {
                resolve(exifStr);
              } else {
                resolve(null);
              }
            } catch (err) {
              resolve(null);
            }
          };
          reader.readAsDataURL(file);
        });
      }

      const exif = await extractExif(file);
      const tempImg = new Image();
      const objectUrl = URL.createObjectURL(file);

      const isLoaded = await new Promise((resolve) => {
        tempImg.onload = () => resolve(true);
        tempImg.onerror = () => resolve(false);
        tempImg.src = objectUrl;
      });

      if (!isLoaded) continue;

      addImage({
        id: uuidv4(),
        file,
        objectUrl,
        width: tempImg.width,
        height: tempImg.height,
        exif,
        rawExifStr,
        captionText: state.config.labels[0].text,
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    await processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        await processFiles(files);
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);



  const handleExportBatch = async () => {
    if (state.images.length === 0) return;

    // Create an offscreen canvas
    const canvas = document.createElement('canvas');
    const zip = new JSZip();

    // Load logo if exists
    let logoImg: HTMLImageElement | null = null;
    if (state.config.logo.dataUrl) {
      logoImg = new Image();
      await new Promise((resolve) => {
        logoImg!.onload = resolve;
        logoImg!.src = state.config.logo.dataUrl!;
      });
    }

    for (const image of state.images) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = image.objectUrl;
      });

      let overrideMaxRes = 8000;
      if (state.config.export?.maxResolution === "4K") overrideMaxRes = 3840;
      if (state.config.export?.maxResolution === "Facebook") overrideMaxRes = 2048;
      if (state.config.export?.maxResolution === "Instagram") overrideMaxRes = 1350;

      // Render to offscreen canvas
      renderPhotoBorder(canvas, image, img, state.config, logoImg, overrideMaxRes);

      const quality = (state.config.export?.quality ?? 100) / 100;
      const blob = await exportImageWithExif(canvas, image, quality);
      if (blob) {
        zip.file(`Bordered-${image.file.name.replace(/\.[^/.]+$/, "")}.jpg`, blob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `Batch-Export.zip`;
    link.click();
  };

  const handleExportSingle = async () => {
    if (state.images.length === 0) return;

    let targetImage = state.images.find(img => img.id === state.activeImageId);
    if (!targetImage) targetImage = state.images[0];

    const canvas = document.createElement('canvas');
    let logoImg: HTMLImageElement | null = null;
    if (state.config.logo.dataUrl) {
      logoImg = new Image();
      await new Promise((resolve) => {
        logoImg!.onload = resolve;
        logoImg!.src = state.config.logo.dataUrl!;
      });
    }

    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = targetImage.objectUrl;
    });

    let overrideMaxRes = 8000;
    if (state.config.export?.maxResolution === "4K") overrideMaxRes = 3840;
    if (state.config.export?.maxResolution === "Facebook") overrideMaxRes = 2048;
    if (state.config.export?.maxResolution === "Instagram") overrideMaxRes = 1350;

    renderPhotoBorder(canvas, targetImage, img, state.config, logoImg, overrideMaxRes);

    const quality = (state.config.export?.quality ?? 100) / 100;
    const blob = await exportImageWithExif(canvas, targetImage, quality);
    if (blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Bordered-${targetImage.file.name.replace(/\.[^/.]+$/, "")}.jpg`;
      link.click();
    }
  };

  const handlePreviewExport = async () => {
    if (state.images.length === 0) return;
    setIsPreviewLoading(true);

    let targetImage = state.images.find(img => img.id === state.activeImageId);
    if (!targetImage) targetImage = state.images[0];

    const canvas = document.createElement('canvas');
    let logoImg: HTMLImageElement | null = null;
    if (state.config.logo.dataUrl) {
      logoImg = new Image();
      await new Promise((resolve) => {
        logoImg!.onload = resolve;
        logoImg!.src = state.config.logo.dataUrl!;
      });
    }

    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = targetImage.objectUrl;
    });

    let overrideMaxRes = 8000;
    if (state.config.export?.maxResolution === "4K") overrideMaxRes = 3840;
    if (state.config.export?.maxResolution === "Facebook") overrideMaxRes = 2048;
    if (state.config.export?.maxResolution === "Instagram") overrideMaxRes = 1350;

    renderPhotoBorder(canvas, targetImage, img, state.config, logoImg, overrideMaxRes);

    const quality = (state.config.export?.quality ?? 100) / 100;
    const blob = await exportImageWithExif(canvas, targetImage, quality);
    if (blob) {
      setPreviewUrl(URL.createObjectURL(blob));
    }
    setIsPreviewLoading(false);
  };

  const savePresetJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.config, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "border-preset.json");
    dlAnchorElem.click();
  };

  const importPresetRef = useRef<HTMLInputElement>(null);

  const loadPresetJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        updateConfig(() => config);
      } catch (err) {
        console.error("Failed to load preset JSON", err);
      }
    };
    reader.readAsText(file);
    if (importPresetRef.current) importPresetRef.current.value = '';
  };

  return (
    <div
      className="app-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="workspace">
        <header className="top-bar">
          <div className="brand">
            <img src="./favicon.svg" alt="Borderify Logo" className="logo-icon" style={{ width: 28, height: 28 }} />
            <h1 className="brand-name">Borderify</h1>
          </div>
          <div className="actions">
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <input
              type="file"
              accept=".json"
              ref={importPresetRef}
              style={{ display: 'none' }}
              onChange={loadPresetJSON}
            />
            <div className="action-group">
              <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} /> Browse
              </button>
              <button className="btn btn-danger" onClick={() => clearAllImages()} disabled={state.images.length === 0} title="Clear All Photos">
                <Trash2 size={16} /> Reset
              </button>
            </div>
          </div>
        </header>

        <div className="canvas-container">
          {state.images.length === 0 ? (
            <div className="empty-state glass-panel" style={{ padding: '40px', borderRadius: '16px' }}>
              <img src="./favicon.svg" alt="Borderify Empty State" style={{ width: 100, height: 100 }} />
              <h2 style={{ marginBottom: '8px' }}>No Photos Loaded</h2>
              <p style={{ maxWidth: '300px', fontSize: '14px' }}>Start framing your photos by dropping them here.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={18} />
                <span>Choose Photos</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <CanvasPreview />
              </div>
              {state.images.length > 1 && (
                <div style={{
                  height: '80px',
                  flexShrink: 0,
                  display: 'flex',
                  gap: '8px',
                  padding: '8px',
                  overflowX: 'auto',
                  background: 'var(--surface-color)',
                  borderTop: '1px solid var(--surface-border)'
                }}>
                  {state.images.map(img => (
                    <div
                      key={img.id}
                      style={{
                        position: 'relative',
                        height: '100%',
                        flexShrink: 0
                      }}
                    >
                      <div
                        onClick={() => setActiveImage(img.id)}
                        style={{
                          cursor: 'pointer',
                          opacity: state.activeImageId === img.id ? 1 : 0.5,
                          border: state.activeImageId === img.id ? '2px solid #3b82f6' : '2px solid transparent',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          height: '100%',
                        }}
                      >
                        <img src={img.objectUrl} style={{ height: '100%', objectFit: 'cover', width: 'auto' }} />
                      </div>
                      <button
                        className="thumbnail-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SidebarControls 
        onPreviewExport={handlePreviewExport} 
        isPreviewLoading={isPreviewLoading}
        onSavePreset={savePresetJSON}
        onLoadPreset={() => importPresetRef.current?.click()}
        onExportSingle={handleExportSingle}
        onExportBatch={handleExportBatch}
        hasImages={state.images.length > 0}
        hasMultipleImages={state.images.length > 1}
      />

      {previewUrl && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '12px'
          }}>
            <button className="btn btn-primary" onClick={handleExportSingle}>
              <Download size={16} /> Save Image
            </button>
            <button className="btn btn-outline" onClick={() => setPreviewUrl(null)} style={{ background: 'var(--surface-color)' }}>
              <X size={16} /> Close Preview
            </button>
          </div>
          <img src={previewUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </div>
  );
}

export default App;
