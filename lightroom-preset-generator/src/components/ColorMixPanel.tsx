import React from 'react';
import { Slider } from './Slider';
import type { ColorMix } from '../utils/xmpGenerator';

interface ColorMixPanelProps {
  colorName: string;
  colorData: ColorMix;
  onChange: (newData: ColorMix) => void;
  accentColor: string;
  onReset?: () => void;
  isColorGrading?: boolean;
}

export const ColorMixPanel: React.FC<ColorMixPanelProps> = ({ colorName, colorData, onChange, accentColor, onReset, isColorGrading }) => {
  const handleChange = (field: keyof ColorMix, val: number) => {
    onChange({ ...colorData, [field]: val });
  };
  
  const isModified = colorData.hue !== 0 || colorData.saturation !== 0 || colorData.luminance !== 0;

  return (
    <div style={{ marginBottom: '2rem', paddingLeft: '1rem', borderLeft: `4px solid ${accentColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: accentColor, textTransform: 'capitalize' }}>{colorName}</h4>
        {isModified && onReset && (
          <button 
            type="button" 
            onClick={onReset} 
            tabIndex={-1}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--surface-border)', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              fontSize: '0.75rem', 
              padding: '2px 6px', 
              borderRadius: '4px',
              transition: 'color 0.2s, border-color 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
          >
            ⟲ Reset {colorName}
          </button>
        )}
      </div>
      <Slider label="Hue" min={isColorGrading ? 0 : -100} max={isColorGrading ? 359 : 100} step={1} value={colorData.hue} defaultValue={0} onChange={(val) => handleChange('hue', val)} />
      <Slider label="Saturation" min={isColorGrading ? 0 : -100} max={100} step={1} value={colorData.saturation} defaultValue={0} onChange={(val) => handleChange('saturation', val)} />
      <Slider label="Luminance" min={-100} max={100} step={1} value={colorData.luminance} defaultValue={0} onChange={(val) => handleChange('luminance', val)} />
    </div>
  );
};
