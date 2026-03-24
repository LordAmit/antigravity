import React, { useRef, useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

interface ParametricGraphProps {
  highlights: number;
  lights: number;
  darks: number;
  shadows: number;
  onChange: (field: 'parametricHighlights' | 'parametricLights' | 'parametricDarks' | 'parametricShadows', val: number) => void;
}

export const ParametricGraph: React.FC<ParametricGraphProps> = ({ highlights, lights, darks, shadows, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeZone, setActiveZone] = useState<number | null>(null);

  const zones: Array<'parametricShadows' | 'parametricDarks' | 'parametricLights' | 'parametricHighlights'> = [
    'parametricShadows',
    'parametricDarks',
    'parametricLights',
    'parametricHighlights'
  ];

  // SVG coordinate system is 0 to 100.
  // Y is flipped (0 is top, 100 is bottom).
  const calculatePoints = () => {
    // scale determines how extreme the curve bows. (Max 25 SVG units deflection)
    const scale = 25;
    
    // X positions of our max deflection points
    const pts = [
      { x: 0, y: 100 }, // start (bottom-left)
      { x: 12.5, y: 100 - (12.5 + (shadows / 100) * scale) },
      { x: 37.5, y: 100 - (37.5 + (darks / 100) * scale) },
      { x: 62.5, y: 100 - (62.5 + (lights / 100) * scale) },
      { x: 87.5, y: 100 - (87.5 + (highlights / 100) * scale) },
      { x: 100, y: 0 } // end (top-right)
    ];

    // Build a simple SVG path command using cubic beziers for smoothness
    // Using Catmull-Rom or simple smooth curves:
    // A trick for smooth curves in SVG is to use 'S' or calculate control points.
    // D3 line curve basis equivalent:
    
    const catmullRom2bezier = (pts: {x: number, y: number}[]) => {
      let d = `M ${pts[0].x},${pts[0].y} `;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i === 0 ? pts[0] : pts[i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
        
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        
        d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
      }
      return d;
    };
    return catmullRom2bezier(pts);
  };

  const handlePointerDown = (e: ReactMouseEvent, zoneIndex: number) => {
    setIsDragging(true);
    setActiveZone(zoneIndex);
    handleMovement(e.clientY, zoneIndex);
  };

  const handlePointerMove = (e: MouseEvent | ReactMouseEvent) => {
    if (!isDragging || activeZone === null) return;
    handleMovement((e as any).clientY, activeZone);
  };

  const handleMovement = (clientY: number, zoneIndex: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // How far up is the mouse structurally inside the SVG bounds (0=bottom, 1=top)
    const relativeY = 1 - (clientY - rect.top) / rect.height;
    
    // We want the relative Y position to map strictly to a -100 to 100 adjustment.
    // The neutral line is Y = X natively. Let's make an intuitive drag logic
    // Just looking at raw Y drag delta is usually better, but for simplicity, 
    // let's do: neutral is middle (0.5). Top is +100, Bottom is -100.
    // Actually, mapping it to exact math is tough because the baseline leans.
    
    // Center of this zone on the diagonal is zoneIndex * 0.25 + 0.125
    const baseLineRelativeY = (zoneIndex * 0.25) + 0.125;
    
    // The difference between where the mouse is and the baseline
    const diff = relativeY - baseLineRelativeY;
    
    // The max height bow is 0.25 (25%). So diff / 0.25 maps back to -1.0 to 1.0.
    let mappedVal = Math.round((diff / 0.25) * 100);
    
    if (mappedVal > 100) mappedVal = 100;
    if (mappedVal < -100) mappedVal = -100;

    onChange(zones[zoneIndex], mappedVal);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setActiveZone(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
    } else {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [isDragging, activeZone, highlights, lights, darks, shadows]);

  return (
    <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Drag up or down across the 4 zones to dynamically bend the parametric curve.
      </p>
      
      <svg 
        ref={svgRef}
        viewBox="0 0 100 100" 
        style={{ 
          width: '100%', 
          height: '250px', 
          overflow: 'visible', 
          borderLeft: '1px solid var(--surface-border)', 
          borderBottom: '1px solid var(--surface-border)',
          cursor: isDragging ? 'ns-resize' : 'crosshair'
        }}
      >
        {/* Baseline Diagonal */}
        <line x1="0" y1="100" x2="100" y2="0" stroke="var(--surface-border)" strokeWidth="1" strokeDasharray="2" />
        
        {/* Grid Splits (25, 50, 75) */}
        <line x1="25" y1="0" x2="25" y2="100" stroke="var(--surface-border)" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="var(--surface-border)" strokeWidth="0.5" />
        <line x1="75" y1="0" x2="75" y2="100" stroke="var(--surface-border)" strokeWidth="0.5" />

        {/* Dynamic Curved Path */}
        <path 
          d={calculatePoints()} 
          fill="none" 
          stroke="var(--primary)" 
          strokeWidth="1" 
          style={{ transition: isDragging ? 'none' : 'd 0.1s ease-out' }}
        />
        
        {/* Invisible Hitboxes for the 4 zones to capture easy dragging */}
        <rect x="0" y="0" width="25" height="100" fill="transparent" 
          onMouseDown={(e) => handlePointerDown(e, 0)} 
          style={{ cursor: 'ns-resize' }} 
        />
        <rect x="25" y="0" width="25" height="100" fill="transparent" 
          onMouseDown={(e) => handlePointerDown(e, 1)} 
          style={{ cursor: 'ns-resize' }} 
        />
        <rect x="50" y="0" width="25" height="100" fill="transparent" 
          onMouseDown={(e) => handlePointerDown(e, 2)} 
          style={{ cursor: 'ns-resize' }} 
        />
        <rect x="75" y="0" width="25" height="100" fill="transparent" 
          onMouseDown={(e) => handlePointerDown(e, 3)} 
          style={{ cursor: 'ns-resize' }} 
        />
        
        {/* Active Zone Highlight (visual indicator when dragging) */}
        {activeZone !== null && (
          <rect x={activeZone * 25} y="0" width="25" height="100" fill="var(--primary)" fillOpacity="0.1" pointerEvents="none" />
        )}
      </svg>
      
      {/* Zone Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span style={{ width: '25%', textAlign: 'center' }}>Shadows</span>
        <span style={{ width: '25%', textAlign: 'center' }}>Darks</span>
        <span style={{ width: '25%', textAlign: 'center' }}>Lights</span>
        <span style={{ width: '25%', textAlign: 'center' }}>Highlights</span>
      </div>
    </div>
  );
};
