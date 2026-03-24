import React, { useRef, useState, useEffect } from 'react';
import type { Point } from '../utils/xmpGenerator';
import type { MouseEvent as ReactMouseEvent } from 'react';

interface CurveInputProps {
  label: string;
  points: Point[];
  onChange: (points: Point[]) => void;
  onReset?: () => void;
  isModified?: boolean;
}

export const CurveInput: React.FC<CurveInputProps> = ({ label, points, onChange, onReset, isModified }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointChange = (index: number, field: 'x' | 'y', value: number) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], [field]: value };
    // Prevent auto-sorting during live typing to avoid index shifting under cursor!
    onChange(newPoints);
  };

  const removePoint = (index: number, e?: ReactMouseEvent) => {
    if (e) e.stopPropagation();
    if (points.length <= 2) return;
    onChange(points.filter((_, i) => i !== index));
  };

  const sortPoints = () => {
    const sorted = [...points].sort((a, b) => a.x - b.x);
    onChange(sorted);
  };

  const handleAddPoint = () => {
    let maxGap = 0;
    let insertIndex = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const gap = points[i + 1].x - points[i].x;
      if (gap > maxGap) {
        maxGap = gap;
        insertIndex = i;
      }
    }
    
    if (maxGap <= 1) return;
    
    const p1 = points[insertIndex];
    const p2 = points[insertIndex + 1];
    const newX = Math.round((p1.x + p2.x) / 2);
    const newY = Math.round((p1.y + p2.y) / 2);
    
    const newPoints = [...points, { x: newX, y: newY }].sort((a, b) => a.x - b.x);
    onChange(newPoints);
  };

  const getRenderedCoordinates = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const mapped = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return {
      x: Math.max(0, Math.min(255, Math.round(mapped.x))),
      y: Math.max(0, Math.min(255, Math.round(255 - mapped.y))) // invert Y back to 0-255 domain
    };
  };

  // --- SVG Drag Logic ---
  const handlePointerDown = (e: ReactMouseEvent, index: number) => {
    e.stopPropagation();
    setDragIndex(index);
    isDraggingRef.current = true;
  };

  const handlePointerMove = (e: MouseEvent) => {
    if (dragIndex === null || !svgRef.current) return;
    
    let { x, y } = getRenderedCoordinates(e.clientX, e.clientY);

    const newPoints = [...points];
    
    // Enforce monotonic X to prevent curve loopback
    if (dragIndex > 0) {
      x = Math.max(x, newPoints[dragIndex - 1].x + 1);
    }
    if (dragIndex < newPoints.length - 1) {
      x = Math.min(x, newPoints[dragIndex + 1].x - 1);
    }

    newPoints[dragIndex] = { x, y };
    onChange(newPoints);
  };

  const handlePointerUp = () => {
    setDragIndex(null);
    setTimeout(() => { isDraggingRef.current = false; }, 50);
  };

  useEffect(() => {
    if (dragIndex !== null) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [dragIndex, points]);

  const handleSvgClick = (e: ReactMouseEvent) => {
    if (isDraggingRef.current || !svgRef.current) return;
    
    const { x, y } = getRenderedCoordinates(e.clientX, e.clientY);
    const newPoints = [...points, { x, y }].sort((a, b) => a.x - b.x);
    onChange(newPoints);
  };

  // --- Draw Spline Path ---
  const generatePath = () => {
    const mapped = points.map(p => ({ x: p.x, y: 255 - p.y }));
    if (mapped.length === 0) return "";
    
    let d = `M ${mapped[0].x},${mapped[0].y} `;
    
    if (mapped.length === 2) {
      return d + `L ${mapped[1].x},${mapped[1].y}`;
    }

    for (let i = 0; i < mapped.length - 1; i++) {
      const p0 = i === 0 ? mapped[0] : mapped[i - 1];
      const p1 = mapped[i];
      const p2 = mapped[i + 1];
      const p3 = i + 2 < mapped.length ? mapped[i + 2] : p2;
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
    }
    return d;
  };

  const gridLinePositions = [0, 255/4, (255/4)*2, (255/4)*3, 255];
  
  // Determine curve color based on label context
  let curveColor = 'var(--text-primary)';
  if (label.includes('Red')) curveColor = '#ff4d4f';
  if (label.includes('Green')) curveColor = '#52c41a';
  if (label.includes('Blue')) curveColor = '#1677ff';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary)' }}>{label}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isModified && onReset && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'color 0.2s, border-color 0.2s', zIndex: 10 }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
            >
              ⟲ Reset
            </button>
          )}
          <button 
            type="button" 
            onClick={sortPoints}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Sort
          </button>
        </div>
      </div>
      
      {/* SVG Graph View */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
        <svg 
          ref={svgRef}
          viewBox="0 0 255 255" 
          onClick={handleSvgClick}
          style={{ 
            width: '100%', 
            maxHeight: '220px', 
            overflow: 'visible', 
            cursor: 'crosshair',
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '4px'
          }}
        >
          {/* Base Grid */}
          {gridLinePositions.map(pos => (
            <React.Fragment key={pos}>
              <line x1={pos} y1="0" x2={pos} y2="255" stroke="var(--surface-border)" strokeWidth="1" />
              <line x1="0" y1={pos} x2="255" y2={pos} stroke="var(--surface-border)" strokeWidth="1" />
            </React.Fragment>
          ))}
          {/* Diagonal */}
          <line x1="0" y1="255" x2="255" y2="0" stroke="var(--surface-border)" strokeWidth="1" />
          
          {/* Curving Path */}
          <path d={generatePath()} fill="none" stroke={curveColor} strokeWidth="2.5" />
          
          {/* Draggable Points */}
          {points.map((p, i) => (
            <g key={i} style={{ cursor: dragIndex === i ? 'grabbing' : 'grab' }}>
              <circle 
                cx={p.x} 
                cy={255 - p.y} 
                r={12} 
                fill="transparent" 
                onMouseDown={(e) => handlePointerDown(e, i)}
              />
              <circle 
                cx={p.x} 
                cy={255 - p.y} 
                r={4} 
                fill={curveColor} 
                stroke="var(--bg-color)"
                strokeWidth="2"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          ))}
        </svg>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.75rem', marginBottom: '0' }}>Click grid to add points • Drag points to curve</p>
      </div>
      
      {/* Fallback Number Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>Input (0-255)</div>
        <div>Output (0-255)</div>
        <div></div>
      </div>
      
      {points.map((pt, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
          <input 
            type="number" 
            className="number-input"
            value={pt.x} 
            onChange={(e) => handlePointChange(i, 'x', Number(e.target.value))} 
            onFocus={(e) => e.target.select()}
            onBlur={sortPoints}
            min="0" max="255" 
          />
          <input 
            type="number" 
            className="number-input"
            value={pt.y} 
            onChange={(e) => handlePointChange(i, 'y', Number(e.target.value))} 
            onFocus={(e) => e.target.select()}
            onBlur={sortPoints}
            min="0" max="255" 
          />
          <button 
            type="button"
            onClick={(e) => removePoint(i, e)}
            tabIndex={-1}
            disabled={points.length <= 2}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: points.length <= 2 ? 'var(--surface-border)' : '#ff4d4f', 
              cursor: points.length <= 2 ? 'not-allowed' : 'pointer', 
              fontSize: '1.2rem', 
              padding: '0 0.5rem' 
            }}
          >
            ×
          </button>
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={handleAddPoint}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '0.5rem',
          background: 'transparent',
          border: '1px dashed var(--surface-border)',
          color: 'var(--text-secondary)',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'color 0.2s, border-color 0.2s'
        }}
        onMouseOver={e => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = curveColor;
        }}
        onMouseOut={e => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--surface-border)';
        }}
      >
        + Add Point
      </button>
    </div>
  );
};
