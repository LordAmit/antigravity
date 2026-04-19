import React, { useState } from 'react';
import { useStore, defaultConfig } from './store';
import { Type, Square, Database, RotateCcw } from 'lucide-react';

const SliderRow = ({ label, value, min, max, step, onChange, onReset }: any) => {
  return (
    <div className="control-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <label className="label">{label}</label>
        <button 
          onClick={onReset} 
          title="Reset" 
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <div className="slider-container">
        <input type="range" style={{width: '100%'}} min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      </div>
    </div>
  );
};

const SidebarControls: React.FC = () => {
  const { state, updateConfig } = useStore();
  const config = state.config;

  const [openSection, setOpenSection] = useState<string>('layout');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">Controls</div>
      <div className="sidebar-content">
        
        {/* Layout Settings */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('layout')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Square size={16} /> Layout & Border
            </div>
            <span>{openSection === 'layout' ? '▲' : '▼'}</span>
          </button>
          
          {openSection === 'layout' && (
            <div className="accordion-body">
              <div className="control-group">
                <label className="label">Target Aspect Ratio</label>
                <select 
                  className="input-field" 
                  value={config.layout.aspectRatio}
                  onChange={(e) => updateConfig(c => ({...c, layout: {...c.layout, aspectRatio: e.target.value}}))}
                >
                  <option value="Original">Match Original</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="4:3">4:3 Standard</option>
                  <option value="3:4">3:4 Portrait</option>
                  <option value="16:9">16:9 Widescreen</option>
                  <option value="9:16">9:16 Vertical</option>
                  <option value="3:2">3:2 Classic</option>
                  <option value="2:3">2:3 Classic Portrait</option>
                </select>
              </div>

              <div className="control-group">
                <label className="label">Background Type</label>
                <select 
                  className="input-field" 
                  value={config.layout.backgroundType}
                  onChange={(e) => updateConfig(c => ({...c, layout: {...c.layout, backgroundType: e.target.value as any}}))}
                >
                  <option value="color">Solid Color</option>
                  <option value="blurred-image">Blurred Image</option>
                </select>
              </div>

              {config.layout.backgroundType === 'color' && (
                <div className="control-group">
                  <label className="label">Background Color</label>
                  <input 
                    type="color" 
                    className="input-field" 
                    style={{ height: '40px', padding: '2px' }}
                    value={config.layout.backgroundColor}
                    onChange={(e) => updateConfig(c => ({...c, layout: {...c.layout, backgroundColor: e.target.value}}))}
                  />
                </div>
              )}

              {config.layout.backgroundType === 'blurred-image' && (
                <div className="flex-row">
                  <SliderRow 
                    label="Blur Amount"
                    value={config.layout.backgroundBlurScale}
                    min="0" max="0.2" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, backgroundBlurScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, layout: {...c.layout, backgroundBlurScale: defaultConfig.layout.backgroundBlurScale}}))}
                  />
                  <SliderRow 
                    label="Dim Overlay"
                    value={config.layout.backgroundDimScale}
                    min="0" max="0.8" step="0.01"
                    onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, backgroundDimScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, layout: {...c.layout, backgroundDimScale: defaultConfig.layout.backgroundDimScale}}))}
                  />
                </div>
              )}

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                  <SliderRow 
                    label={`Global Border Scale: ${(config.layout.borderWidthScale * 100).toFixed(0)}%`}
                    value={config.layout.borderWidthScale}
                    min="0" max="0.5" step="0.01"
                    onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, borderWidthScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, layout: {...c.layout, borderWidthScale: defaultConfig.layout.borderWidthScale}}))}
                  />
              </div>

              <div className="control-group">
                <label className="label">Inner Border Color</label>
                <input 
                  type="color" 
                  className="input-field" 
                  style={{ height: '36px', padding: '2px' }}
                  value={config.layout.innerBorderColor}
                  onChange={(e) => updateConfig(c => ({...c, layout: {...c.layout, innerBorderColor: e.target.value}}))}
                />
              </div>

              <div className="control-group">
                <label className="label">Inner Border Mode</label>
                <select 
                  className="input-field" 
                  value={config.layout.innerBorderMode}
                  onChange={(e) => {
                    const mode = e.target.value as any;
                    updateConfig(c => {
                      let newTop = c.layout.innerBorderTopScale;
                      let newBottom = c.layout.innerBorderBottomScale;
                      const side = c.layout.innerBorderSideScale;
                      if (mode === 'uniform') {
                        newTop = side;
                        newBottom = side;
                      } else if (mode === 'polaroid') {
                        newTop = side;
                      }
                      return { ...c, layout: { ...c.layout, innerBorderMode: mode, innerBorderTopScale: newTop, innerBorderBottomScale: newBottom }};
                    });
                  }}
                >
                  <option value="uniform">Uniform Regular</option>
                  <option value="polaroid">Polaroid Style</option>
                  <option value="custom">Custom Independent</option>
                </select>
              </div>

              {config.layout.innerBorderMode === 'uniform' && (
                <SliderRow 
                  label="Border Thickness"
                  value={config.layout.innerBorderSideScale}
                  min="0" max="0.3" step="0.005"
                  onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerBorderSideScale: val, innerBorderTopScale: val, innerBorderBottomScale: val}}))}
                  onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerBorderSideScale: defaultConfig.layout.innerBorderSideScale, innerBorderTopScale: defaultConfig.layout.innerBorderTopScale, innerBorderBottomScale: defaultConfig.layout.innerBorderBottomScale}}))}
                />
              )}

              {config.layout.innerBorderMode === 'polaroid' && (
                <>
                  <SliderRow 
                    label="Standard Frame Thickness"
                    value={config.layout.innerBorderSideScale}
                    min="0" max="0.3" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerBorderSideScale: val, innerBorderTopScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerBorderSideScale: defaultConfig.layout.innerBorderSideScale, innerBorderTopScale: defaultConfig.layout.innerBorderTopScale}}))}
                  />
                  <SliderRow 
                    label="Bottom Lip Extension"
                    value={config.layout.innerBorderBottomScale}
                    min="0" max="0.3" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerBorderBottomScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerBorderBottomScale: defaultConfig.layout.innerBorderBottomScale}}))}
                  />
                </>
              )}

              {config.layout.innerBorderMode === 'custom' && (
                <>
                  <div className="flex-row">
                    <SliderRow 
                      label="Inner Top"
                      value={config.layout.innerBorderTopScale}
                      min="0" max="0.3" step="0.005"
                      onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerBorderTopScale: val}}))}
                      onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerBorderTopScale: defaultConfig.layout.innerBorderTopScale}}))}
                    />
                    <SliderRow 
                      label="Inner Bottom"
                      value={config.layout.innerBorderBottomScale}
                      min="0" max="0.3" step="0.005"
                      onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerBorderBottomScale: val}}))}
                      onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerBorderBottomScale: defaultConfig.layout.innerBorderBottomScale}}))}
                    />
                  </div>

                  <SliderRow 
                    label="Inner Sides"
                    value={config.layout.innerBorderSideScale}
                    min="0" max="0.3" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerBorderSideScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerBorderSideScale: defaultConfig.layout.innerBorderSideScale}}))}
                  />
                </>
              )}

              <SliderRow 
                label="Frame Corner Radius"
                value={config.layout.imageRadiusScale}
                min="0" max="0.1" step="0.005"
                onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, imageRadiusScale: val}}))}
                onReset={() => updateConfig(c => ({...c, layout: {...c.layout, imageRadiusScale: defaultConfig.layout.imageRadiusScale}}))}
              />

              <SliderRow 
                label="Inner Image Radius"
                value={config.layout.innerImageRadiusScale}
                min="0" max="0.1" step="0.005"
                onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerImageRadiusScale: val}}))}
                onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerImageRadiusScale: defaultConfig.layout.innerImageRadiusScale || 0}}))}
              />

              <SliderRow 
                label="Frame Shadow Layer"
                value={config.layout.imageShadowBlurScale}
                min="0" max="0.1" step="0.005"
                onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, imageShadowBlurScale: val}}))}
                onReset={() => updateConfig(c => ({...c, layout: {...c.layout, imageShadowBlurScale: defaultConfig.layout.imageShadowBlurScale}}))}
              />

              <SliderRow 
                label="Inner Image Shadow"
                value={config.layout.innerImageShadowBlurScale}
                min="0" max="0.1" step="0.005"
                onChange={(val: number) => updateConfig(c => ({...c, layout: {...c.layout, innerImageShadowBlurScale: val}}))}
                onReset={() => updateConfig(c => ({...c, layout: {...c.layout, innerImageShadowBlurScale: defaultConfig.layout.innerImageShadowBlurScale || 0}}))}
              />
            </div>
          )}
        </div>

        {/* Typography Settings */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('typography')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={16} /> Typography / Brand
            </div>
            <span>{openSection === 'typography' ? '▲' : '▼'}</span>
          </button>
          
          {openSection === 'typography' && config.labels.length > 0 && (
            <div className="accordion-body">
              <div className="control-group">
                <label className="label">Brand Text Template</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={config.labels[0].text}
                  onChange={(e) => updateConfig(c => ({
                    ...c, 
                    labels: [{...c.labels[0], text: e.target.value }]
                  }))}
                />
                <small style={{display: 'block', marginTop: '4px', color: '#94a3b8', fontSize: '11px'}}>Use {`{make}`} or {`{model}`} for dynamic EXIF</small>
              </div>

              <div className="control-group">
                <label className="label">Font Family (e.g., Arial, Shantell Sans)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={config.labels[0].fontFamily}
                    onChange={(e) => updateConfig(c => ({
                      ...c, labels: [{...c.labels[0], fontFamily: e.target.value}]
                    }))}
                  />
                  <input 
                    type="file" 
                    accept=".ttf,.otf,.woff,.woff2"
                    id="font-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Url = event.target?.result as string;
                        
                        // Inject font into document
                        const style = document.createElement('style');
                        style.innerHTML = `
                          @font-face {
                            font-family: '${fontName}';
                            src: url('${base64Url}');
                          }
                        `;
                        document.head.appendChild(style);
                        
                        // Force DOM to load font before rendering
                        document.fonts.load(`16px "${fontName}"`).then(() => {
                          updateConfig(c => ({
                            ...c, labels: [{...c.labels[0], fontFamily: fontName, customFontDataUrl: base64Url}]
                          }));
                        });
                      };
                      reader.readAsDataURL(file);

                      e.target.value = ''; // reset
                    }}
                  />
                  <button 
                    className="btn btn-outline" 
                    onClick={() => document.getElementById('font-upload')?.click()}
                    title="Upload Local Font File"
                    style={{ padding: '8px', minWidth: '40px' }}
                  >
                    +
                  </button>
                </div>
                <small style={{display: 'block', marginTop: '4px', color: '#94a3b8', fontSize: '11px'}}>Alternatively, upload a .ttf/.otf file</small>
              </div>

              <SliderRow 
                label="Font Size Scale"
                value={config.labels[0].fontSizeScale}
                min="0.005" max="0.30" step="0.005"
                onChange={(val: number) => updateConfig(c => ({...c, labels: [{...c.labels[0], fontSizeScale: val}]}))}
                onReset={() => updateConfig(c => ({...c, labels: [{...c.labels[0], fontSizeScale: defaultConfig.labels[0].fontSizeScale}]}))}
              />

              <div className="control-group">
                <label className="label">Text Position</label>
                <select 
                  className="input-field" 
                  value={config.labels[0].position}
                  onChange={(e) => updateConfig(c => ({...c, labels: [{...c.labels[0], position: e.target.value as any}]}))}
                >
                  <option value="Top Left">Top Left</option>
                  <option value="Top Center">Top Center</option>
                  <option value="Top Right">Top Right</option>
                  <option value="Bottom Left">Bottom Left</option>
                  <option value="Bottom Center">Bottom Center</option>
                  <option value="Bottom Right">Bottom Right</option>
                  <option value="Center">Center</option>
                </select>
              </div>

              <div className="flex-row">
                <div className="control-group">
                  <label className="label">Color</label>
                  <input 
                    type="color" 
                    className="input-field" 
                    style={{ height: '36px', padding: '2px' }}
                    value={config.labels[0].color}
                    onChange={(e) => updateConfig(c => ({
                      ...c, labels: [{...c.labels[0], color: e.target.value}]
                    }))}
                  />
                </div>
                <div className="control-group">
                  <label className="label">Stroke/Border Color</label>
                  <input 
                    type="color" 
                    className="input-field" 
                    style={{ height: '36px', padding: '2px' }}
                    value={config.labels[0].strokeColor || '#000000'}
                    onChange={(e) => updateConfig(c => ({
                      ...c, labels: [{...c.labels[0], strokeColor: e.target.value}]
                    }))}
                  />
                </div>
              </div>

              <SliderRow 
                label="Stroke Width Scale"
                value={config.labels[0].strokeWidthScale}
                min="0" max="0.02" step="0.001"
                onChange={(val: number) => updateConfig(c => ({...c, labels: [{...c.labels[0], strokeWidthScale: val}]}))}
                onReset={() => updateConfig(c => ({...c, labels: [{...c.labels[0], strokeWidthScale: defaultConfig.labels[0].strokeWidthScale}]}))}
              />

            </div>
          )}
        </div>

        {/* Logo Settings */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('logo')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Square size={16} /> Logo
            </div>
            <span>{openSection === 'logo' ? '▲' : '▼'}</span>
          </button>

          {openSection === 'logo' && (
            <div className="accordion-body">
              <div className="control-group">
                <label className="label">Upload Logo</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        updateConfig(c => ({...c, logo: {...c.logo, dataUrl: event.target?.result as string}}));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="input-field" 
                />
              </div>
              
              {config.logo.dataUrl && (
                <>
                  <div className="control-group">
                    <button 
                      className="btn btn-outline" 
                      style={{width: '100%'}}
                      onClick={() => updateConfig(c => ({...c, logo: {...c.logo, dataUrl: null}}))}
                    >
                      Clear Logo
                    </button>
                  </div>

                  <SliderRow 
                    label="Scale Size"
                    value={config.logo.sizeScale}
                    min="0.01" max="0.30" step="0.01"
                    onChange={(val: number) => updateConfig(c => ({...c, logo: {...c.logo, sizeScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, logo: {...c.logo, sizeScale: defaultConfig.logo.sizeScale}}))}
                  />

                  <div className="control-group">
                    <label className="label">Placement</label>
                    <select 
                      className="input-field" 
                      value={config.logo.placement}
                      onChange={(e) => updateConfig(c => ({...c, logo: {...c.logo, placement: e.target.value as any}}))}
                    >
                      <option value="Left of Text">Left of Text</option>
                      <option value="Right of Text">Right of Text</option>
                    </select>
                  </div>

                  <SliderRow 
                    label="Gap Distance"
                    value={config.logo.gapScale}
                    min="0" max="0.10" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({...c, logo: {...c.logo, gapScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, logo: {...c.logo, gapScale: defaultConfig.logo.gapScale}}))}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* EXIF Setting */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('exif')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} /> EXIF Data
            </div>
            <span>{openSection === 'exif' ? '▲' : '▼'}</span>
          </button>
          
          {openSection === 'exif' && (
            <div className="accordion-body">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={config.exifPills.show}
                  onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, show: e.target.checked}}))}
                />
                Show EXIF Pills
              </label>

              {config.exifPills.show && (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={config.exifPills.showFocal}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, showFocal: e.target.checked}}))}
                      />
                      Focal Length
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={config.exifPills.showAperture}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, showAperture: e.target.checked}}))}
                      />
                      Aperture
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={config.exifPills.showIso}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, showIso: e.target.checked}}))}
                      />
                      ISO
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={config.exifPills.showShutter}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, showShutter: e.target.checked}}))}
                      />
                      Shutter Speed
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={config.exifPills.showLens}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, showLens: e.target.checked}}))}
                      />
                      Lens
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={config.exifPills.showCamera}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, showCamera: e.target.checked}}))}
                      />
                      Camera
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={config.exifPills.showDate}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, showDate: e.target.checked}}))}
                      />
                      Date
                    </label>
                  </div>

                  <div className="control-group">
                    <label className="label">Base Position</label>
                    <select 
                      className="input-field" 
                      value={config.exifPills.position}
                      onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, position: e.target.value as any}}))}
                    >
                      <option value="Top Left">Top Left</option>
                      <option value="Top Center">Top Center</option>
                      <option value="Top Right">Top Right</option>
                      <option value="Bottom Left">Bottom Left</option>
                      <option value="Bottom Center">Bottom Center</option>
                      <option value="Bottom Right">Bottom Right</option>
                      <option value="Center">Center</option>
                    </select>
                  </div>

                  <div className="flex-row">
                    <SliderRow 
                      label="Offset X"
                      value={config.exifPills.positionXScale}
                      min="-0.5" max="0.5" step="0.01"
                      onChange={(val: number) => updateConfig(c => ({...c, exifPills: {...c.exifPills, positionXScale: val}}))}
                      onReset={() => updateConfig(c => ({...c, exifPills: {...c.exifPills, positionXScale: defaultConfig.exifPills.positionXScale}}))}
                    />
                    <SliderRow 
                      label="Offset Y"
                      value={config.exifPills.positionYScale}
                      min="-0.5" max="0.5" step="0.01"
                      onChange={(val: number) => updateConfig(c => ({...c, exifPills: {...c.exifPills, positionYScale: val}}))}
                      onReset={() => updateConfig(c => ({...c, exifPills: {...c.exifPills, positionYScale: defaultConfig.exifPills.positionYScale}}))}
                    />
                  </div>

                  <div className="flex-row">
                    <div className="control-group">
                      <label className="label">Text Color</label>
                      <input 
                        type="color" 
                        className="input-field" 
                        style={{ height: '36px', padding: '2px' }}
                        value={config.exifPills.textColor}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, textColor: e.target.value}}))}
                      />
                    </div>
                    <div className="control-group">
                      <label className="label">Border Color</label>
                      <input 
                        type="color" 
                        className="input-field" 
                        style={{ height: '36px', padding: '2px' }}
                        value={config.exifPills.textStrokeColor || '#000000'}
                        onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, textStrokeColor: e.target.value}}))}
                      />
                    </div>
                  </div>

                  <SliderRow 
                    label="Text Stroke Width Scale"
                    value={config.exifPills.textStrokeWidthScale || 0}
                    min="0" max="0.02" step="0.001"
                    onChange={(val: number) => updateConfig(c => ({...c, exifPills: {...c.exifPills, textStrokeWidthScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, exifPills: {...c.exifPills, textStrokeWidthScale: defaultConfig.exifPills.textStrokeWidthScale || 0}}))}
                  />
                  <div className="control-group">
                    <label className="label">Font Family</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={config.exifPills.fontFamily}
                      placeholder="e.g. system-ui, Arial, Inter"
                      onChange={(e) => updateConfig(c => ({...c, exifPills: {...c.exifPills, fontFamily: e.target.value}}))}
                    />
                  </div>

                  <SliderRow 
                    label="EXIF Font Size Scale"
                    value={config.exifPills.fontSizeScale}
                    min="0.005" max="0.05" step="0.001"
                    onChange={(val: number) => updateConfig(c => ({...c, exifPills: {...c.exifPills, fontSizeScale: val}}))}
                    onReset={() => updateConfig(c => ({...c, exifPills: {...c.exifPills, fontSizeScale: defaultConfig.exifPills.fontSizeScale}}))}
                  />

                  <div className="flex-row">
                    <SliderRow 
                      label="Box Padding X"
                      value={config.exifPills.paddingXScale}
                      min="0" max="0.1" step="0.002"
                      onChange={(val: number) => updateConfig(c => ({...c, exifPills: {...c.exifPills, paddingXScale: val}}))}
                      onReset={() => updateConfig(c => ({...c, exifPills: {...c.exifPills, paddingXScale: defaultConfig.exifPills.paddingXScale}}))}
                    />
                    <SliderRow 
                      label="Box Padding Y"
                      value={config.exifPills.paddingYScale}
                      min="0" max="0.1" step="0.002"
                      onChange={(val: number) => updateConfig(c => ({...c, exifPills: {...c.exifPills, paddingYScale: val}}))}
                      onReset={() => updateConfig(c => ({...c, exifPills: {...c.exifPills, paddingYScale: defaultConfig.exifPills.paddingYScale}}))}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SidebarControls;
