import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  defaultValue?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, defaultValue }) => {
  const isModified = defaultValue !== undefined && value !== defaultValue;
  const [localVal, setLocalVal] = React.useState(value.toString());

  React.useEffect(() => {
    if (document.activeElement?.getAttribute('data-slider-id') !== label) {
      setLocalVal(value > 0 && defaultValue === 0 ? `+${value}` : value.toString());
    }
  }, [value, defaultValue, label]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalVal(e.target.value);
    const parsed = parseFloat(e.target.value);
    // Only propagate to parent if it's a valid number between min/max
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleInputBlur = () => {
    let parsed = parseFloat(localVal);
    if (isNaN(parsed)) parsed = defaultValue ?? 0;
    if (parsed > max) parsed = max;
    if (parsed < min) parsed = min;
    onChange(parsed);
    setLocalVal(parsed > 0 && defaultValue === 0 ? `+${parsed}` : parsed.toString());
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (defaultValue !== undefined) onChange(defaultValue);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{label}</span>
          {isModified && (
            <button 
              type="button" 
              onClick={handleReset}
              tabIndex={-1}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--primary)', 
                cursor: 'pointer', 
                fontSize: '0.9rem', 
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.2s'
              }}
              title="Reset value"
            >
              ⟲
            </button>
          )}
        </span>
        <input 
          data-slider-id={label}
          type="text"
          value={localVal}
          onChange={handleInputChange}
          onBlur={(e) => {
            e.target.style.borderColor = 'transparent';
            e.target.style.background = 'transparent';
            handleInputBlur();
          }}
          style={{ 
            color: isModified ? 'var(--primary)' : 'inherit', 
            transition: 'color 0.2s, border-color 0.2s, background 0.2s', 
            fontWeight: isModified ? 600 : 400,
            width: '60px',
            textAlign: 'right',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            background: 'transparent',
            border: '1px solid transparent',
            outline: 'none',
            borderRadius: '4px',
            padding: '2px 4px',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.background = 'rgba(0,0,0,0.2)';
            setLocalVal(value.toString());
            // Highlight text immediately so user can overwrite it natively
            setTimeout(() => e.target.select(), 10);
          }}
          onMouseOver={e => {
            if (document.activeElement !== e.target) {
              e.currentTarget.style.borderColor = 'var(--surface-border)';
            }
          }}
          onMouseOut={e => {
            if (document.activeElement !== e.target) {
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
        />
      </label>
      <input 
        type="range" 
        className="range-slider"
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        readOnly
        tabIndex={-1}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
