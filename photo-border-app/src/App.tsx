import React, { useRef, useEffect } from 'react';
import { Upload, Layers, Save, FileJson, Archive, Trash2, Download, X } from 'lucide-react';
import { useStore } from './store';
import { extractExif } from './exif';
import { renderPhotoBorder } from './render';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import CanvasPreview from './CanvasPreview';
import SidebarControls from './SidebarControls';

function App() {
  const { state, addImage, updateConfig, clearAllImages, setActiveImage, removeImage } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const exif = await extractExif(file);
      const tempImg = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve) => {
        tempImg.onload = resolve;
        tempImg.src = objectUrl;
      });

      addImage({
        id: uuidv4(),
        file,
        objectUrl,
        width: tempImg.width,
        height: tempImg.height,
        exif,
      });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

      // Render to offscreen canvas
      renderPhotoBorder(canvas, image, img, state.config, logoImg);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 1.0));
      if (blob) {
        zip.file(`Bordered-${image.file.name}`, blob);
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

    renderPhotoBorder(canvas, targetImage, img, state.config, logoImg);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 1.0));
    if (blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Bordered-${targetImage.file.name}`;
      link.click();
    }
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
    <div className="app-container">
      <div className="workspace">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers className="text-blue-500" size={24} />
            <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Borderify Images v1.0</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
            <button className="btn btn-outline" onClick={() => importPresetRef.current?.click()}>
              <FileJson size={16} /> Load Preset
            </button>
            <button className="btn btn-outline" onClick={savePresetJSON}>
              <Save size={16} /> Save Preset
            </button>
            <div style={{ width: '1px', background: 'var(--surface-border)', margin: '0 4px' }}></div>
            <button className="btn btn-outline" onClick={() => clearAllImages()} disabled={state.images.length === 0} title="Clear All Images">
              <Trash2 size={16} />
            </button>
            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Import Photos
            </button>
            <button className="btn btn-outline" onClick={handleExportSingle} disabled={state.images.length === 0}>
              <Download size={16} /> Save Image
            </button>
            <button className="btn btn-primary" onClick={handleExportBatch} disabled={state.images.length === 0}>
              <Archive size={16} /> Batch Export Zip
            </button>
          </div>
        </header>

        <div className="canvas-container">
          {state.images.length === 0 ? (
            <div className="empty-state glass-panel" style={{ padding: '40px', borderRadius: '16px' }}>
              <Layers size={48} />
              <h2 style={{ marginBottom: '8px' }}>No Images Loaded</h2>
              <p style={{ maxWidth: '300px', fontSize: '14px' }}>Import photos to begin editing borders and extracting EXIF data.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Files
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

      <SidebarControls />
    </div>
  );
}

export default App;
