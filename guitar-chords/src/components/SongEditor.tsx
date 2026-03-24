
import React from 'react';

interface SongEditorProps {
    value: string;
    onChange: (val: string) => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ value, onChange }) => {
    return (
        <div className="w-full h-full flex flex-col">
            <textarea
                className="w-full h-96 p-4 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all shadow-inner"
                placeholder="Paste your song here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SongEditor;
