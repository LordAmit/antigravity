import React, { useState } from 'react';
import { useStore, defaultConfig } from './store';
import { Type, Square, Database, RotateCcw, Frame, Maximize, Image, Bold, Italic } from 'lucide-react';

const SliderRow = ({ label, value, min, max, step, onChange, onReset }: any) => {
  return (
    <div className="compact-slider">
      <label className="label" title={label}>{label}</label>
      <div className="slider-container">
        <input type="range" style={{ width: '100%' }} min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      </div>
      <button
        onClick={onReset}
        title="Reset"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex', justifyContent: 'center' }}
      >
        <RotateCcw size={12} />
      </button>
    </div>
  );
};

const ChipGroup = ({ options, value, onChange }: any) => (
  <div className="chip-group">
    {options.map((opt: any) => (
      <button 
        key={opt.value} 
        className={`chip ${value === opt.value ? 'active' : ''}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const GridPositionSelector = ({ value, onChange }: any) => {
  const grid = [
    ['Top Left', 'Top Center', 'Top Right'],
    ['Middle Left', 'Center', 'Middle Right'],
    ['Bottom Left', 'Bottom Center', 'Bottom Right']
  ];

  return (
    <div className="grid-position-selector">
      {grid.flat().map((pos) => (
        <div 
          key={pos}
          className={`grid-dot ${value === pos ? 'active' : ''}`}
          onClick={() => onChange(pos)}
          title={pos}
        />
      ))}
    </div>
  );
};

const StyleGallery = ({ config, updateConfig }: any) => {
  const styles = [
    {
      id: 'polaroid',
      name: 'Polaroid',
      icon: <Square size={18} />,
      apply: (c: any) => ({
        ...c,
        layout: {
          ...c.layout,
          aspectRatio: '1:1',
          backgroundType: 'blurred-image',
          backgroundBlurScale: 0.02,
          innerBorderMode: 'polaroid',
          innerBorderSideScale: 0.02,
          innerBorderBottomScale: 0.12,
          borderWidthScale: 0.05,
        },
        labels: c.labels.map((l: any, i: number) => i === 0 ? { ...l, position: 'Bottom Center', positionYScale: -0.02, show: true } : l),
        exifPills: { ...c.exifPills, position: 'Bottom Center', positionYScale: 0.02, show: true }
      })
    },
    {
      id: 'museum',
      name: 'Museum',
      icon: <Frame size={18} />,
      apply: (c: any) => ({
        ...c,
        layout: {
          ...c.layout,
          aspectRatio: 'Original',
          backgroundType: 'color',
          backgroundColor: '#ffffff',
          innerBorderMode: 'uniform',
          innerBorderSideScale: 0.05,
          innerBorderTopScale: 0.05,
          innerBorderBottomScale: 0.05,
          borderWidthScale: 0.08,
        },
        labels: c.labels.map((l: any, i: number) => i === 0 ? { ...l, position: 'Bottom Center', positionYScale: 0, show: true } : l),
        exifPills: { ...c.exifPills, position: 'Bottom Center', positionYScale: 0.05, show: true }
      })
    },
    {
      id: 'minimal',
      name: 'Minimal',
      icon: <Maximize size={18} />,
      apply: (c: any) => ({
        ...c,
        layout: {
          ...c.layout,
          aspectRatio: 'Original',
          backgroundType: 'color',
          backgroundColor: '#ffffff',
          innerBorderMode: 'uniform',
          innerBorderSideScale: 0,
          innerBorderTopScale: 0,
          innerBorderBottomScale: 0,
          borderWidthScale: 0.03,
        },
        labels: c.labels.map((l: any) => ({ ...l, show: false })),
        exifPills: { ...c.exifPills, show: false }
      })
    }
  ];

  return (
    <div className="style-gallery">
      {styles.map(s => (
        <div 
          key={s.id}
          className={`style-card ${config.layout.innerBorderMode === s.id || (s.id === 'polaroid' && config.layout.innerBorderMode === 'polaroid') ? 'active' : ''}`}
          onClick={() => updateConfig(s.apply)}
        >
          {s.icon}
          <span className="style-card-title">{s.name}</span>
        </div>
      ))}
    </div>
  );
};
const LogoPlacementSelector = ({ value, onChange }: { value: string, onChange: (val: any) => void }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '6px' }}>
      <div 
        className={`pos-cell ${value === 'Left of Text' ? 'active' : ''}`}
        style={{ 
          height: '30px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '10px', 
          cursor: 'pointer', 
          borderRadius: '4px', 
          background: value === 'Left of Text' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', 
          color: value === 'Left of Text' ? '#38bdf8' : '#94a3b8', 
          border: value === 'Left of Text' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          transition: 'all 0.2s ease'
        }}
        onClick={() => onChange('Left of Text')}
      >
        Left
      </div>
      <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#64748b', fontWeight: 'bold' }}>
        Text
      </div>
      <div 
        className={`pos-cell ${value === 'Right of Text' ? 'active' : ''}`}
        style={{ 
          height: '30px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '10px', 
          cursor: 'pointer', 
          borderRadius: '4px', 
          background: value === 'Right of Text' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', 
          color: value === 'Right of Text' ? '#38bdf8' : '#94a3b8', 
          border: value === 'Right of Text' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          transition: 'all 0.2s ease'
        }}
        onClick={() => onChange('Right of Text')}
      >
        Right
      </div>
    </div>
  );
};


const TagBar = ({ value, onChange, tags }: { value: string, onChange: (val: string) => void, tags: string[] }) => {
  return (
    <div className="chip-group" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {tags.map(tagStr => {
        const isActive = value.includes(tagStr);
        return (
          <span 
            key={tagStr} 
            className="chip"
            style={{ 
              fontSize: '10px', 
              padding: '2px 6px', 
              background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)', 
              borderRadius: '4px',
              cursor: 'pointer',
              border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: isActive ? '#38bdf8' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              if (isActive) {
                const newText = value.replace(tagStr, '').replace(/\s+/g, ' ').trim();
                onChange(newText);
              } else {
                const newText = value + ` ${tagStr}`;
                onChange(newText.trim());
              }
            }}
          >
            {isActive ? '−' : '+'}{tagStr.replace('{', '').replace('}', '')}
          </span>
        );
      })}
    </div>
  );
};

const SidebarControls: React.FC = () => {
  const { state, updateConfig } = useStore();
  const config = state.config;

  const [openSection, setOpenSection] = useState<string>('layout');
  const [showAdvancedLayout, setShowAdvancedLayout] = useState(false);
  const [showAdvancedTypography, setShowAdvancedTypography] = useState(false);
  const [showAdvancedExif, setShowAdvancedExif] = useState(false);
  const [showLogoAdvanced, setShowLogoAdvanced] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        
        <label className="label" style={{ marginBottom: '8px' }}>Styles</label>
        <StyleGallery config={config} updateConfig={updateConfig} />

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
                <label className="label">Ratio</label>
                <ChipGroup 
                  value={config.layout.aspectRatio}
                  onChange={(val: string) => updateConfig(c => ({ ...c, layout: { ...c.layout, aspectRatio: val } }))}
                  options={[
                    { label: 'ORIG', value: 'Original' },
                    { label: '1:1', value: '1:1' },
                    { label: '4:3', value: '4:3' },
                    { label: '3:4', value: '3:4' },
                    { label: '3:2', value: '3:2' },
                    { label: '2:3', value: '2:3' },
                    { label: '16:9', value: '16:9' },
                    { label: '9:16', value: '9:16' },
                  ]}
                />
              </div>

              <div className="control-group">
                <label className="label">Background</label>
                <select
                  className="input-field"
                  value={config.layout.backgroundType}
                  onChange={(e) => updateConfig(c => ({ ...c, layout: { ...c.layout, backgroundType: e.target.value as any } }))}
                >
                  <option value="color">Solid Color</option>
                  <option value="blurred-image">Blurred Photo (Desktop only)</option>
                </select>
              </div>

              {config.layout.backgroundType === 'color' && (
                <div className="control-group">
                  <label className="label">Background</label>
                  <input
                    type="color"
                    className="input-field"
                    style={{ height: '40px', padding: '2px' }}
                    value={config.layout.backgroundColor}
                    onChange={(e) => updateConfig(c => ({ ...c, layout: { ...c.layout, backgroundColor: e.target.value } }))}
                  />
                </div>
              )}

              {config.layout.backgroundType === 'blurred-image' && (
                <>
                  <SliderRow
                    label="Blur Amount"
                    value={config.layout.backgroundBlurScale}
                    min="0" max="0.2" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, backgroundBlurScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, backgroundBlurScale: defaultConfig.layout.backgroundBlurScale } }))}
                  />
                  <SliderRow
                    label="Dim Overlay"
                    value={config.layout.backgroundDimScale}
                    min="0" max="0.8" step="0.01"
                    onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, backgroundDimScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, backgroundDimScale: defaultConfig.layout.backgroundDimScale } }))}
                  />
                </>
              )}

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <SliderRow
                  label={`Frame Size: ${(config.layout.borderWidthScale * 100).toFixed(0)}%`}
                  value={config.layout.borderWidthScale}
                  min="0" max="0.5" step="0.01"
                  onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, borderWidthScale: val } }))}
                  onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, borderWidthScale: defaultConfig.layout.borderWidthScale } }))}
                />
              </div>

              <div className="control-group">
                <label className="label">Frame</label>
                <input
                  type="color"
                  className="input-field"
                  style={{ height: '36px', padding: '2px' }}
                  value={config.layout.innerBorderColor}
                  onChange={(e) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderColor: e.target.value } }))}
                />
              </div>

              <div 
                className="advanced-toggle" 
                onClick={() => setShowAdvancedLayout(!showAdvancedLayout)}
              >
                <span>Advanced Border & Effects</span>
                <span>{showAdvancedLayout ? '−' : '+'}</span>
              </div>

              {showAdvancedLayout && (
                <div className="advanced-section">
                  <div className="control-group">
                    <label className="label">Border Style</label>
                    <select
                      className="input-field"
                      value={config.layout.innerBorderMode}
                      onChange={(e) => {
                        const mode = e.target.value as any;
                        updateConfig(c => {
                          const newConfig = { ...c, layout: { ...c.layout, innerBorderMode: mode } };
                          // Auto-apply logic for Polaroid mode
                          if (mode === 'polaroid') {
                            newConfig.layout.innerBorderTopScale = 0.05;
                            newConfig.layout.innerBorderBottomScale = 0.12;
                            newConfig.layout.backgroundBlurScale = 0.02;
                            newConfig.labels = newConfig.labels.map((l: any, i: number) => i === 0 ? { ...l, positionYScale: -0.03, show: true } : l);
                            newConfig.exifPills = { ...newConfig.exifPills, positionYScale: 0.03, show: true };
                          } else if (mode === 'uniform') {
                            newConfig.labels = newConfig.labels.map((l: any, i: number) => i === 0 ? { ...l, positionYScale: 0, show: true } : l);
                            newConfig.exifPills = { ...newConfig.exifPills, positionYScale: 0, show: true };
                          }
                          return newConfig;
                        });
                      }}
                    >
                      <option value="uniform">Even Border</option>
                      <option value="polaroid">Polaroid</option>
                      <option value="custom">Advanced / Manual</option>
                    </select>
                  </div>

                  {config.layout.innerBorderMode === 'uniform' && (
                    <SliderRow
                      label="Edge Thickness"
                      value={config.layout.innerBorderSideScale}
                      min="0" max="0.3" step="0.005"
                      onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderSideScale: val, innerBorderTopScale: val, innerBorderBottomScale: val } }))}
                      onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderSideScale: defaultConfig.layout.innerBorderSideScale, innerBorderTopScale: defaultConfig.layout.innerBorderTopScale, innerBorderBottomScale: defaultConfig.layout.innerBorderBottomScale } }))}
                    />
                  )}

                  {config.layout.innerBorderMode === 'polaroid' && (
                    <>
                      <SliderRow
                        label="Edge Thickness"
                        value={config.layout.innerBorderSideScale}
                        min="0" max="0.3" step="0.005"
                        onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderSideScale: val, innerBorderTopScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderSideScale: defaultConfig.layout.innerBorderSideScale, innerBorderTopScale: defaultConfig.layout.innerBorderTopScale } }))}
                      />
                      <SliderRow
                        label="Signature Space"
                        value={config.layout.innerBorderBottomScale}
                        min="0" max="0.3" step="0.005"
                        onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderBottomScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderBottomScale: defaultConfig.layout.innerBorderBottomScale } }))}
                      />
                    </>
                  )}

                  {config.layout.innerBorderMode === 'custom' && (
                    <>
                      <SliderRow
                        label="Top Edge"
                        value={config.layout.innerBorderTopScale}
                        min="0" max="0.3" step="0.005"
                        onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderTopScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderTopScale: defaultConfig.layout.innerBorderTopScale } }))}
                      />
                      <SliderRow
                        label="Bottom Edge"
                        value={config.layout.innerBorderBottomScale}
                        min="0" max="0.3" step="0.005"
                        onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderBottomScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderBottomScale: defaultConfig.layout.innerBorderBottomScale } }))}
                      />

                      <SliderRow
                        label="Side Edges"
                        value={config.layout.innerBorderSideScale}
                        min="0" max="0.3" step="0.005"
                        onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderSideScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerBorderSideScale: defaultConfig.layout.innerBorderSideScale } }))}
                      />
                    </>
                  )}

                  <SliderRow
                    label="Frame Rounding"
                    value={config.layout.imageRadiusScale}
                    min="0" max="0.1" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, imageRadiusScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, imageRadiusScale: defaultConfig.layout.imageRadiusScale } }))}
                  />

                  <SliderRow
                    label="Photo Rounding"
                    value={config.layout.innerImageRadiusScale}
                    min="0" max="0.1" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerImageRadiusScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerImageRadiusScale: defaultConfig.layout.innerImageRadiusScale || 0 } }))}
                  />

                  <SliderRow
                    label="Frame Shadow"
                    value={config.layout.imageShadowBlurScale}
                    min="0" max="0.1" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, imageShadowBlurScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, imageShadowBlurScale: defaultConfig.layout.imageShadowBlurScale } }))}
                  />

                  <SliderRow
                    label="Photo Shadow"
                    value={config.layout.innerImageShadowBlurScale}
                    min="0" max="0.1" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, innerImageShadowBlurScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, innerImageShadowBlurScale: defaultConfig.layout.innerImageShadowBlurScale || 0 } }))}
                  />

                  <SliderRow
                    label="Photo Spacing"
                    value={config.layout.imagePaddingScale}
                    min="0" max="0.2" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, layout: { ...c.layout, imagePaddingScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, layout: { ...c.layout, imagePaddingScale: defaultConfig.layout.imagePaddingScale } }))}
                  />
                </div>
              )}
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
                <label className="label">Signature</label>
                <textarea
                  className="input-field"
                  rows={2}
                  style={{ resize: 'vertical' }}
                  value={config.labels[0].text}
                  onChange={(e) => updateConfig(c => ({
                    ...c,
                    labels: [{ ...c.labels[0], text: e.target.value }]
                  }))}
                />
                  <TagBar 
                    value={config.labels[0].text} 
                    onChange={(val) => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], text: val }] }))}
                    tags={['{make}', '{model}', '{iso}', '{shutter}', '{f}', '{focal}', '{lens}', '{date}']}
                  />
              </div>

              <div className="control-group">
                <label className="label">Font</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={config.labels[0].fontFamily}
                    onChange={(e) => updateConfig(c => ({
                      ...c, labels: [{ ...c.labels[0], fontFamily: e.target.value }]
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
                            ...c, labels: [{ ...c.labels[0], fontFamily: fontName, customFontDataUrl: base64Url }]
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
                    title="Upload Font"
                    style={{ padding: '8px', minWidth: '40px' }}
                  >
                    +
                  </button>
                  <button 
                    className={`btn btn-outline ${config.labels[0].fontWeight === 'bold' ? 'active' : ''}`}
                    style={{ padding: '0 12px', minWidth: '40px', borderColor: config.labels[0].fontWeight === 'bold' ? 'var(--accent-color)' : '' }}
                    onClick={() => updateConfig(c => ({
                      ...c, labels: [{ ...c.labels[0], fontWeight: c.labels[0].fontWeight === 'bold' ? 'normal' : 'bold' }]
                    }))}
                  >
                    <Bold size={16} />
                  </button>
                  <button 
                    className={`btn btn-outline ${config.labels[0].fontStyle === 'italic' ? 'active' : ''}`}
                    style={{ padding: '0 12px', minWidth: '40px', borderColor: config.labels[0].fontStyle === 'italic' ? 'var(--accent-color)' : '' }}
                    onClick={() => updateConfig(c => ({
                      ...c, labels: [{ ...c.labels[0], fontStyle: c.labels[0].fontStyle === 'italic' ? 'normal' : 'italic' }]
                    }))}
                  >
                    <Italic size={16} />
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '4px', color: '#94a3b8', fontSize: '11px' }}>Alternatively, upload a .ttf/.otf file</small>
              </div>

              <SliderRow
                label="Size"
                value={config.labels[0].fontSizeScale}
                min="0.005" max="0.30" step="0.005"
                onChange={(val: number) => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], fontSizeScale: val }] }))}
                onReset={() => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], fontSizeScale: defaultConfig.labels[0].fontSizeScale }] }))}
              />

              <div className="control-group">
                <label className="label">Text Position</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <GridPositionSelector 
                    value={config.labels[0].position}
                    onChange={(pos: any) => updateConfig(c => ({
                      ...c, labels: [{ ...c.labels[0], position: pos }]
                    }))}
                  />
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{config.labels[0].position}</div>
                </div>
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
                      ...c, labels: [{ ...c.labels[0], color: e.target.value }]
                    }))}
                  />
                </div>
                <div className="control-group">
                  <label className="label">Border</label>
                  <input
                    type="color"
                    className="input-field"
                    style={{ height: '36px', padding: '2px' }}
                    value={config.labels[0].strokeColor || '#000000'}
                    onChange={(e) => updateConfig(c => ({
                      ...c, labels: [{ ...c.labels[0], strokeColor: e.target.value }]
                    }))}
                  />
                </div>
              </div>

              <div 
                className="advanced-toggle" 
                onClick={() => setShowAdvancedTypography(!showAdvancedTypography)}
              >
                <span>Typography Offsets & Stroke</span>
                <span>{showAdvancedTypography ? '−' : '+'}</span>
              </div>

              {showAdvancedTypography && (
                <div className="advanced-section">
                  <SliderRow
                    label="Horizontal"
                    value={config.labels[0].positionXScale}
                    min="-0.5" max="0.5" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], positionXScale: val }] }))}
                    onReset={() => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], positionXScale: 0 }] }))}
                  />
                  <SliderRow
                    label="Vertical"
                    value={config.labels[0].positionYScale}
                    min="-0.5" max="0.5" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], positionYScale: val }] }))}
                    onReset={() => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], positionYScale: 0 }] }))}
                  />
                  <SliderRow
                    label="Outline"
                    value={config.labels[0].strokeWidthScale}
                    min="0" max="0.02" step="0.001"
                    onChange={(val: number) => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], strokeWidthScale: val }] }))}
                    onReset={() => updateConfig(c => ({ ...c, labels: [{ ...c.labels[0], strokeWidthScale: defaultConfig.labels[0].strokeWidthScale }] }))}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logo Settings */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('logo')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Image size={16} /> Logo
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
                        updateConfig(c => ({ ...c, logo: { ...c.logo, dataUrl: event.target?.result as string } }));
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
                      style={{ width: '100%' }}
                      onClick={() => updateConfig(c => ({ ...c, logo: { ...c.logo, dataUrl: null } }))}
                    >
                      Clear Logo
                    </button>
                  </div>

                  <SliderRow
                    label="Size"
                    value={config.logo.sizeScale}
                    min="0.01" max="0.30" step="0.01"
                    onChange={(val: number) => updateConfig(c => ({ ...c, logo: { ...c.logo, sizeScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, logo: { ...c.logo, sizeScale: defaultConfig.logo.sizeScale } }))}
                  />

                  <div className="control-group">
                    <label className="label">Placement</label>
                    <LogoPlacementSelector 
                      value={config.logo.placement}
                      onChange={(val) => updateConfig(c => ({ ...c, logo: { ...c.logo, placement: val } }))}
                    />
                  </div>

                  <SliderRow
                    label="Gap"
                    value={config.logo.gapScale}
                    min="0" max="0.10" step="0.005"
                    onChange={(val: number) => updateConfig(c => ({ ...c, logo: { ...c.logo, gapScale: val } }))}
                    onReset={() => updateConfig(c => ({ ...c, logo: { ...c.logo, gapScale: defaultConfig.logo.gapScale } }))}
                  />

                  <div className="advanced-toggle" onClick={() => setShowLogoAdvanced(!showLogoAdvanced)}>
                    <span>Logo Adjustment</span>
                    <span>{showLogoAdvanced ? '−' : '+'}</span>
                  </div>

                  {showLogoAdvanced && (
                    <div className="advanced-section">
                      <SliderRow
                    label="Horizontal"
                        value={config.logo.offsetXScale}
                        min="-0.2" max="0.2" step="0.005"
                        onChange={(val: number) => updateConfig(c => ({ ...c, logo: { ...c.logo, offsetXScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, logo: { ...c.logo, offsetXScale: 0 } }))}
                      />
                      <SliderRow
                    label="Vertical"
                        value={config.logo.offsetYScale}
                        min="-0.2" max="0.2" step="0.005"
                        onChange={(val: number) => updateConfig(c => ({ ...c, logo: { ...c.logo, offsetYScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, logo: { ...c.logo, offsetYScale: 0 } }))}
                      />
                    </div>
                  )}
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
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.exifPills.show}
                    onChange={(e) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, show: e.target.checked } }))}
                  />
                  Show EXIF Pills
                </label>

                {config.exifPills.show && (
                  <>
                    <div className="control-group">
                      <label className="label">EXIF Position</label>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <GridPositionSelector 
                          value={config.exifPills.position}
                          onChange={(pos: any) => updateConfig(c => ({
                            ...c, exifPills: { ...c.exifPills, position: pos }
                          }))}
                        />
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{config.exifPills.position}</div>
                      </div>
                    </div>

                    <SliderRow
                      label="Size"
                      value={config.exifPills.fontSizeScale}
                      min="0.002" max="0.05" step="0.001"
                      onChange={(val: number) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, fontSizeScale: val } }))}
                      onReset={() => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, fontSizeScale: defaultConfig.exifPills.fontSizeScale } }))}
                    />

                    <SliderRow
                      label="Padding"
                      value={config.exifPills.internalPaddingScale}
                      min="0.1" max="2.0" step="0.05"
                      onChange={(val: number) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, internalPaddingScale: val } }))}
                      onReset={() => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, internalPaddingScale: 0.5 } }))}
                    />
                  <div className="control-group">
                    <label className="label">Displayed Data</label>
                    <div className="chip-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {[
                        { key: 'showCamera', label: 'Camera' },
                        { key: 'showLens', label: 'Lens' },
                        { key: 'showAperture', label: 'Aperture' },
                        { key: 'showIso', label: 'ISO' },
                        { key: 'showShutter', label: 'Shutter' },
                        { key: 'showFocal', label: 'Focal' },
                        { key: 'showDate', label: 'Date' },
                      ].map(item => {
                        const isActive = (config.exifPills as any)[item.key];
                        return (
                          <span 
                            key={item.key}
                            className={`chip ${isActive ? 'active' : ''}`}
                            style={{
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                              border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                              color: isActive ? '#38bdf8' : '#94a3b8',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              userSelect: 'none'
                            }}
                            onClick={() => updateConfig(c => ({
                              ...c, exifPills: { ...c.exifPills, [item.key]: !isActive }
                            }))}
                          >
                            {isActive ? '✓ ' : '+ '}{item.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>


                  <div 
                    className="advanced-toggle" 
                    onClick={() => setShowAdvancedExif(!showAdvancedExif)}
                  >
                    <span>Advanced EXIF Positioning & Styles</span>
                    <span>{showAdvancedExif ? '−' : '+'}</span>
                  </div>

                  {showAdvancedExif && (
                    <div className="advanced-section">
                      <div className="flex-row">
                        <div className="control-group">
                          <label className="label">Custom Camera</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. {make} {model}"
                            value={config.exifPills.customCameraText || ''}
                            onChange={(e) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, customCameraText: e.target.value } }))}
                          />
                        </div>
                        <div className="control-group">
                          <label className="label">Custom Lens</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. {lens}"
                            value={config.exifPills.customLensText || ''}
                            onChange={(e) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, customLensText: e.target.value } }))}
                          />
                        </div>
                      </div>

                      <SliderRow
                        label="Horizontal"
                        value={config.exifPills.positionXScale}
                        min="-0.5" max="0.5" step="0.01"
                        onChange={(val: number) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, positionXScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, positionXScale: defaultConfig.exifPills.positionXScale } }))}
                      />
                      <SliderRow
                        label="Vertical"
                        value={config.exifPills.positionYScale}
                        min="-0.5" max="0.5" step="0.01"
                        onChange={(val: number) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, positionYScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, positionYScale: defaultConfig.exifPills.positionYScale } }))}
                      />

                      <div className="flex-row">
                        <div className="control-group">
                          <label className="label">Background</label>
                          <input
                            type="color"
                            className="input-field"
                            style={{ height: '36px', padding: '2px' }}
                            value={config.exifPills.boxColor}
                            onChange={(e) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, boxColor: e.target.value } }))}
                          />
                        </div>
                        <div className="control-group">
                          <label className="label">Text</label>
                          <input
                            type="color"
                            className="input-field"
                            style={{ height: '36px', padding: '2px' }}
                            value={config.exifPills.textColor}
                            onChange={(e) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, textColor: e.target.value } }))}
                          />
                        </div>
                        <div className="control-group">
                          <label className="label">Border</label>
                          <input
                            type="color"
                            className="input-field"
                            style={{ height: '36px', padding: '2px' }}
                            value={config.exifPills.textStrokeColor || '#000000'}
                            onChange={(e) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, textStrokeColor: e.target.value } }))}
                          />
                        </div>
                      </div>

                      <div className="control-group">
                        <label className="label">EXIF Font</label>
                        <input
                          type="text"
                          className="input-field"
                          value={config.exifPills.fontFamily}
                          onChange={(e) => updateConfig(c => ({
                            ...c, exifPills: { ...c.exifPills, fontFamily: e.target.value }
                          }))}
                        />
                      </div>

                      <SliderRow
                        label="Stroke"
                        value={config.exifPills.textStrokeWidthScale || 0}
                        min="0" max="0.02" step="0.001"
                        onChange={(val: number) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, textStrokeWidthScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, textStrokeWidthScale: defaultConfig.exifPills.textStrokeWidthScale || 0 } }))}
                      />

                      <SliderRow
                        label="Outline"
                        value={config.exifPills.borderWidthScale}
                        min="0" max="0.02" step="0.001"
                        onChange={(val: number) => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, borderWidthScale: val } }))}
                        onReset={() => updateConfig(c => ({ ...c, exifPills: { ...c.exifPills, borderWidthScale: defaultConfig.exifPills.borderWidthScale } }))}
                      />
                    </div>
                  )}
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
