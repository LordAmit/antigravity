import { useState } from 'react';
import { Slider } from './components/Slider';
import { CurveInput } from './components/CurveInput';
import { ParametricGraph } from './components/ParametricGraph';
import { Collapsible } from './components/Collapsible';
import { ColorMixPanel } from './components/ColorMixPanel';
import { generateXMP, downloadPreset, defaultSettings } from './utils/xmpGenerator';
import { parseXMP, parsePresetName } from './utils/xmpParser';
import type { PresetData } from './utils/xmpGenerator';
import './index.css';

function App() {
  const [settings, setSettings] = useState<PresetData>(defaultSettings);
  const [presetName, setPresetName] = useState('My Custom Preset');

  const updateField = <K extends keyof PresetData>(field: K, value: PresetData[K]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const isCategoryModified = (keys: (keyof PresetData)[]) => {
    return keys.some(key => JSON.stringify(settings[key]) !== JSON.stringify(defaultSettings[key]));
  };

  const resetCategory = (keys: (keyof PresetData)[]) => {
    setSettings(prev => {
      const next = { ...prev };
      keys.forEach(key => {
        // @ts-ignore
        next[key] = defaultSettings[key];
      });
      return next;
    });
  };

  const resetAll = () => {
    if (window.confirm("Are you sure you want to reset all settings back to default?")) {
      setSettings(defaultSettings);
    }
  };

  const handleDownload = () => {
    const safeName = presetName.trim() || 'My Custom Preset';
    const sanitizedFile = safeName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.xmp';
    const xmp = generateXMP(settings, safeName);
    downloadPreset(xmp, sanitizedFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedSettings = parseXMP(content);
        const parsedName = parsePresetName(content);
        
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        if (parsedName) setPresetName(parsedName);
      } catch (err) {
        alert("Failed to load preset: " + err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const isCurveModified = (key: keyof PresetData['advanced']) => {
    return JSON.stringify(settings.advanced[key]) !== JSON.stringify(defaultSettings.advanced[key]);
  };

  const lightKeys: (keyof PresetData)[] = ['exposure', 'contrast', 'highlights', 'shadows', 'whites', 'blacks'];
  const colorKeys: (keyof PresetData)[] = ['temp', 'tint', 'vibrance', 'saturation'];
  const effectKeys: (keyof PresetData)[] = ['texture', 'clarity', 'dehaze', 'grain'];
  const detailKeys: (keyof PresetData)[] = ['sharpening', 'noiseReduction', 'noiseDetail', 'noiseContrast', 'colorNoiseReduction'];
  const vignetteKeys: (keyof PresetData)[] = ['vignetteAmount', 'vignetteMidpoint', 'vignetteRoundness', 'vignetteFeather', 'vignetteHighlights'];
  const colorGradingKeys: (keyof PresetData)[] = ['colorGrading'];
  const colorMixKeys: (keyof PresetData)[] = ['reds', 'oranges', 'yellows', 'greens', 'aquas', 'blues', 'purples', 'magentas'];
  const parametricKeys: (keyof PresetData)[] = ['parametricHighlights', 'parametricLights', 'parametricDarks', 'parametricShadows'];
  const advancedCurveKeys: (keyof PresetData)[] = ['advanced'];

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          Lightroom Preset Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ultimate XMP Profile Editor</p>
      </header>

      <div className="grid-2">
        {/* Left Column */}
        <div>
          <Collapsible title="Light Settings" defaultOpen={true} isModified={isCategoryModified(lightKeys)} onReset={() => resetCategory(lightKeys)}>
            <Slider label="Exposure" min={-5} max={5} step={0.05} value={settings.exposure} defaultValue={defaultSettings.exposure} onChange={(v) => updateField('exposure', v)} />
            <Slider label="Contrast" min={-100} max={100} step={1} value={settings.contrast} defaultValue={defaultSettings.contrast} onChange={(v) => updateField('contrast', v)} />
            <Slider label="Highlights" min={-100} max={100} step={1} value={settings.highlights} defaultValue={defaultSettings.highlights} onChange={(v) => updateField('highlights', v)} />
            <Slider label="Shadows" min={-100} max={100} step={1} value={settings.shadows} defaultValue={defaultSettings.shadows} onChange={(v) => updateField('shadows', v)} />
            <Slider label="Whites" min={-100} max={100} step={1} value={settings.whites} defaultValue={defaultSettings.whites} onChange={(v) => updateField('whites', v)} />
            <Slider label="Blacks" min={-100} max={100} step={1} value={settings.blacks} defaultValue={defaultSettings.blacks} onChange={(v) => updateField('blacks', v)} />
          </Collapsible>

          <Collapsible title="Color Settings" isModified={isCategoryModified(colorKeys)} onReset={() => resetCategory(colorKeys)}>
            <Slider label="Temp" min={-100} max={100} step={1} value={settings.temp} defaultValue={defaultSettings.temp} onChange={(v) => updateField('temp', v)} />
            <Slider label="Tint" min={-100} max={100} step={1} value={settings.tint} defaultValue={defaultSettings.tint} onChange={(v) => updateField('tint', v)} />
            <Slider label="Vibrance" min={-100} max={100} step={1} value={settings.vibrance} defaultValue={defaultSettings.vibrance} onChange={(v) => updateField('vibrance', v)} />
            <Slider label="Saturation" min={-100} max={100} step={1} value={settings.saturation} defaultValue={defaultSettings.saturation} onChange={(v) => updateField('saturation', v)} />
          </Collapsible>

          <Collapsible title="Effects & Grain" isModified={isCategoryModified(effectKeys)} onReset={() => resetCategory(effectKeys)}>
            <Slider label="Texture" min={-100} max={100} step={1} value={settings.texture} defaultValue={defaultSettings.texture} onChange={(v) => updateField('texture', v)} />
            <Slider label="Clarity" min={-100} max={100} step={1} value={settings.clarity} defaultValue={defaultSettings.clarity} onChange={(v) => updateField('clarity', v)} />
            <Slider label="Dehaze" min={-100} max={100} step={1} value={settings.dehaze} defaultValue={defaultSettings.dehaze} onChange={(v) => updateField('dehaze', v)} />
            
            <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: 'var(--primary)' }}>Film Grain</h4>
            <Slider label="Amount" min={0} max={100} step={1} value={settings.grain.amount} defaultValue={defaultSettings.grain.amount} onChange={(v) => updateField('grain', {...settings.grain, amount: v})} />
            <Slider label="Size" min={0} max={100} step={1} value={settings.grain.size} defaultValue={defaultSettings.grain.size} onChange={(v) => updateField('grain', {...settings.grain, size: v})} />
            <Slider label="Roughness" min={0} max={100} step={1} value={settings.grain.roughness} defaultValue={defaultSettings.grain.roughness} onChange={(v) => updateField('grain', {...settings.grain, roughness: v})} />
          </Collapsible>

          <Collapsible title="Detail & Sharpening" isModified={isCategoryModified(detailKeys)} onReset={() => resetCategory(detailKeys)}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Sharpening</h4>
            <Slider label="Amount" min={0} max={150} step={1} value={settings.sharpening.amount} defaultValue={defaultSettings.sharpening.amount} onChange={(v) => updateField('sharpening', {...settings.sharpening, amount: v})} />
            <Slider label="Radius" min={0.5} max={3.0} step={0.1} value={settings.sharpening.radius} defaultValue={defaultSettings.sharpening.radius} onChange={(v) => updateField('sharpening', {...settings.sharpening, radius: v})} />
            <Slider label="Detail" min={0} max={100} step={1} value={settings.sharpening.detail} defaultValue={defaultSettings.sharpening.detail} onChange={(v) => updateField('sharpening', {...settings.sharpening, detail: v})} />
            <Slider label="Masking" min={0} max={100} step={1} value={settings.sharpening.masking} defaultValue={defaultSettings.sharpening.masking} onChange={(v) => updateField('sharpening', {...settings.sharpening, masking: v})} />
            
            <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: 'var(--primary)' }}>Noise Reduction</h4>
            <Slider label="Luminance" min={0} max={100} step={1} value={settings.noiseReduction} defaultValue={defaultSettings.noiseReduction} onChange={(v) => updateField('noiseReduction', v)} />
            <Slider label="Detail" min={0} max={100} step={1} value={settings.noiseDetail} defaultValue={defaultSettings.noiseDetail} onChange={(v) => updateField('noiseDetail', v)} />
            <Slider label="Contrast" min={0} max={100} step={1} value={settings.noiseContrast} defaultValue={defaultSettings.noiseContrast} onChange={(v) => updateField('noiseContrast', v)} />
            <Slider label="Color Noise" min={0} max={100} step={1} value={settings.colorNoiseReduction} defaultValue={defaultSettings.colorNoiseReduction} onChange={(v) => updateField('colorNoiseReduction', v)} />
          </Collapsible>

          <Collapsible title="Vignette" isModified={isCategoryModified(vignetteKeys)} onReset={() => resetCategory(vignetteKeys)}>
            <Slider label="Amount" min={-100} max={100} step={1} value={settings.vignetteAmount} defaultValue={defaultSettings.vignetteAmount} onChange={(v) => updateField('vignetteAmount', v)} />
            <Slider label="Midpoint" min={0} max={100} step={1} value={settings.vignetteMidpoint} defaultValue={defaultSettings.vignetteMidpoint} onChange={(v) => updateField('vignetteMidpoint', v)} />
            <Slider label="Roundness" min={-100} max={100} step={1} value={settings.vignetteRoundness} defaultValue={defaultSettings.vignetteRoundness} onChange={(v) => updateField('vignetteRoundness', v)} />
            <Slider label="Feather" min={0} max={100} step={1} value={settings.vignetteFeather} defaultValue={defaultSettings.vignetteFeather} onChange={(v) => updateField('vignetteFeather', v)} />
            <Slider label="Highlights" min={0} max={100} step={1} value={settings.vignetteHighlights} defaultValue={defaultSettings.vignetteHighlights} onChange={(v) => updateField('vignetteHighlights', v)} />
          </Collapsible>

        </div>

        {/* Right Column */}
        <div>
          <Collapsible title="Color Grading (Wheels)" isModified={isCategoryModified(colorGradingKeys)} onReset={() => resetCategory(colorGradingKeys)}>
            <ColorMixPanel isColorGrading colorName="Shadows" accentColor="#1677ff" colorData={settings.colorGrading.shadows} onChange={(v) => updateField('colorGrading', {...settings.colorGrading, shadows: v})} onReset={() => updateField('colorGrading', {...settings.colorGrading, shadows: defaultSettings.colorGrading.shadows})} />
            <ColorMixPanel isColorGrading colorName="Midtones" accentColor="#fa8c16" colorData={settings.colorGrading.midtones} onChange={(v) => updateField('colorGrading', {...settings.colorGrading, midtones: v})} onReset={() => updateField('colorGrading', {...settings.colorGrading, midtones: defaultSettings.colorGrading.midtones})} />
            <ColorMixPanel isColorGrading colorName="Highlights" accentColor="#fadb14" colorData={settings.colorGrading.highlights} onChange={(v) => updateField('colorGrading', {...settings.colorGrading, highlights: v})} onReset={() => updateField('colorGrading', {...settings.colorGrading, highlights: defaultSettings.colorGrading.highlights})} />
            <ColorMixPanel isColorGrading colorName="Global" accentColor="#ff4d4f" colorData={settings.colorGrading.global} onChange={(v) => updateField('colorGrading', {...settings.colorGrading, global: v})} onReset={() => updateField('colorGrading', {...settings.colorGrading, global: defaultSettings.colorGrading.global})} />
            
            <div style={{ paddingLeft: '1rem', borderLeft: '4px solid var(--surface-border)', marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Blending & Balance</h4>
              <Slider label="Blending" min={0} max={100} step={1} value={settings.colorGrading.blending} defaultValue={defaultSettings.colorGrading.blending} onChange={(v) => updateField('colorGrading', {...settings.colorGrading, blending: v})} />
              <Slider label="Balance" min={-100} max={100} step={1} value={settings.colorGrading.balance} defaultValue={defaultSettings.colorGrading.balance} onChange={(v) => updateField('colorGrading', {...settings.colorGrading, balance: v})} />
            </div>
          </Collapsible>

          <Collapsible title="Color Mix (HSL)" isModified={isCategoryModified(colorMixKeys)} onReset={() => resetCategory(colorMixKeys)}>
            <ColorMixPanel colorName="Red" accentColor="#ff4d4f" colorData={settings.reds} onChange={(v) => updateField('reds', v)} onReset={() => updateField('reds', defaultSettings.reds)} />
            <ColorMixPanel colorName="Orange" accentColor="#fa8c16" colorData={settings.oranges} onChange={(v) => updateField('oranges', v)} onReset={() => updateField('oranges', defaultSettings.oranges)} />
            <ColorMixPanel colorName="Yellow" accentColor="#fadb14" colorData={settings.yellows} onChange={(v) => updateField('yellows', v)} onReset={() => updateField('yellows', defaultSettings.yellows)} />
            <ColorMixPanel colorName="Green" accentColor="#52c41a" colorData={settings.greens} onChange={(v) => updateField('greens', v)} onReset={() => updateField('greens', defaultSettings.greens)} />
            <ColorMixPanel colorName="Aqua" accentColor="#13c2c2" colorData={settings.aquas} onChange={(v) => updateField('aquas', v)} onReset={() => updateField('aquas', defaultSettings.aquas)} />
            <ColorMixPanel colorName="Blue" accentColor="#1677ff" colorData={settings.blues} onChange={(v) => updateField('blues', v)} onReset={() => updateField('blues', defaultSettings.blues)} />
            <ColorMixPanel colorName="Purple" accentColor="#722ed1" colorData={settings.purples} onChange={(v) => updateField('purples', v)} onReset={() => updateField('purples', defaultSettings.purples)} />
            <ColorMixPanel colorName="Magenta" accentColor="#eb2f96" colorData={settings.magentas} onChange={(v) => updateField('magentas', v)} onReset={() => updateField('magentas', defaultSettings.magentas)} />
          </Collapsible>

          <Collapsible title="Parametric Curve" isModified={isCategoryModified(parametricKeys)} onReset={() => resetCategory(parametricKeys)}>
            <ParametricGraph 
              highlights={settings.parametricHighlights}
              lights={settings.parametricLights}
              darks={settings.parametricDarks}
              shadows={settings.parametricShadows}
              onChange={updateField}
            />
            <Slider label="Highlights (Param)" min={-100} max={100} step={1} value={settings.parametricHighlights} defaultValue={defaultSettings.parametricHighlights} onChange={(v) => updateField('parametricHighlights', v)} />
            <Slider label="Lights (Param)" min={-100} max={100} step={1} value={settings.parametricLights} defaultValue={defaultSettings.parametricLights} onChange={(v) => updateField('parametricLights', v)} />
            <Slider label="Darks (Param)" min={-100} max={100} step={1} value={settings.parametricDarks} defaultValue={defaultSettings.parametricDarks} onChange={(v) => updateField('parametricDarks', v)} />
            <Slider label="Shadows (Param)" min={-100} max={100} step={1} value={settings.parametricShadows} defaultValue={defaultSettings.parametricShadows} onChange={(v) => updateField('parametricShadows', v)} />
          </Collapsible>

          <Collapsible title="Advanced Tone Curves" isModified={isCategoryModified(advancedCurveKeys)} onReset={() => resetCategory(advancedCurveKeys)}>
            <CurveInput label="RGB Curve" points={settings.advanced.rgbCurve} onChange={(v) => updateField('advanced', { ...settings.advanced, rgbCurve: v })} isModified={isCurveModified('rgbCurve')} onReset={() => updateField('advanced', { ...settings.advanced, rgbCurve: defaultSettings.advanced.rgbCurve })} />
            <CurveInput label="Red Curve" points={settings.advanced.redCurve} onChange={(v) => updateField('advanced', { ...settings.advanced, redCurve: v })} isModified={isCurveModified('redCurve')} onReset={() => updateField('advanced', { ...settings.advanced, redCurve: defaultSettings.advanced.redCurve })} />
            <CurveInput label="Green Curve" points={settings.advanced.greenCurve} onChange={(v) => updateField('advanced', { ...settings.advanced, greenCurve: v })} isModified={isCurveModified('greenCurve')} onReset={() => updateField('advanced', { ...settings.advanced, greenCurve: defaultSettings.advanced.greenCurve })} />
            <CurveInput label="Blue Curve" points={settings.advanced.blueCurve} onChange={(v) => updateField('advanced', { ...settings.advanced, blueCurve: v })} isModified={isCurveModified('blueCurve')} onReset={() => updateField('advanced', { ...settings.advanced, blueCurve: defaultSettings.advanced.blueCurve })} />
          </Collapsible>
          
          <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Ready to Download?</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Your custom .xmp file combines all metadata into a precise Lightroom Preset.</p>
            
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label className="input-label" style={{ marginBottom: '0.5rem' }}>Preset Name</label>
              <input 
                type="text" 
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g. Cinematic Film Base"
                className="number-input" 
                style={{ fontSize: '1rem', padding: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-primary" onClick={handleDownload} style={{ width: '100%', fontSize: '1.2rem', padding: '16px' }}>
                Download Preset
              </button>
              
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="file" 
                  accept=".xmp" 
                  onChange={handleFileUpload}
                  style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10, left: 0, top: 0 }}
                  title="Upload existing .xmp preset"
                />
                <button 
                  type="button"
                  style={{ 
                    width: '100%', 
                    fontSize: '1rem', 
                    padding: '12px', 
                    background: 'transparent', 
                    border: '1px solid var(--primary)', 
                    color: 'var(--primary)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  Upload Existing .xmp Preset
                </button>
              </div>
              
              <button 
                type="button"
                onClick={resetAll} 
                style={{ 
                  width: '100%', 
                  fontSize: '1rem', 
                  padding: '12px', 
                  background: 'transparent', 
                  border: '1px solid var(--surface-border)', 
                  color: 'var(--text-primary)', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#ff4d4f'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--surface-border)'}
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
