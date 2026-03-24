import React, { useState } from 'react';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onReset?: () => void;
  isModified?: boolean;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ title, children, defaultOpen = false, onReset, isModified }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible" style={{ marginBottom: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
      <div style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isOpen ? '1px solid var(--surface-border)' : 'none' }}>
        <button 
          className="collapsible-header" 
          onClick={() => setIsOpen(!isOpen)}
          style={{ flexGrow: 1, textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(-90deg)', transition: 'transform var(--transition-normal)', fontSize: '0.8rem', display: 'inline-block' }}>▼</span>
          {title}
        </button>
        {isModified && onReset && (
          <button 
            type="button"
            className="category-reset"
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            title="Reset category"
            tabIndex={-1}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'color 0.2s, border-color 0.2s', zIndex: 10 }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
          >
            ⟲ Reset Panel
          </button>
        )}
      </div>
      {isOpen && (
        <div className="collapsible-content open" style={{ padding: '1.5rem', paddingTop: '0.75rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};
