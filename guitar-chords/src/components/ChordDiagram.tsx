
import React from 'react';
import { CHORD_DATA } from '../data/chords';
import { parseCustomChord } from '../utils/chordUtils';

interface ChordDiagramProps {
    chord: string;
    scale?: number;
}

const ChordDiagram: React.FC<ChordDiagramProps> = ({ chord, scale = 1 }) => {
    // Try to get data from library, or parse as custom chord
    const data = CHORD_DATA[chord] || parseCustomChord(chord);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center w-32 h-40 bg-gray-800 rounded-lg border border-gray-700 p-2">
                <span className="text-xl font-bold text-gray-400">{chord}</span>
                <span className="text-xs text-gray-500 mt-2">No diagram</span>
            </div>
        );
    }

    // Determine base fret
    const validFrets = data.frets.filter(f => f > 0);
    const minFret = validFrets.length > 0 ? Math.min(...validFrets) : 1;
    const maxFret = validFrets.length > 0 ? Math.max(...validFrets) : 1;

    // If the chord fits in the first 5 frets, start at 1. Otherwise start at minFret.
    const baseFret = maxFret <= 5 ? 1 : minFret;

    // Draw setup
    const numStrings = 6;
    const numFrets = 5;
    const width = 100;
    const height = 120;

    const stringSpacing = width / (numStrings - 1);
    const fretSpacing = height / numFrets;
    const topPadding = 20;
    const leftPadding = 40; // Increased for wider container
    const rightPadding = 40; // Increased for wider container

    const boxWidth = width;
    const boxHeight = height;

    return (
        <div
            className="flex flex-col items-center bg-gray-800/50 p-6 rounded-xl border-2 border-gray-700/50 backdrop-blur-sm shadow-xl origin-top-left"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
        >
            <h3 className="text-xl font-bold text-cyan-400 mb-2">{chord}</h3>
            <svg width={width + leftPadding + rightPadding} height={height + 40} viewBox={`0 0 ${width + leftPadding + rightPadding} ${height + 40}`}>
                {/* Base Fret Indicator */}
                {baseFret > 1 && (
                    <text x={leftPadding - 6} y={topPadding + fretSpacing / 2 + 4} textAnchor="end" fill="white" fontSize="12" fontWeight="bold">
                        {baseFret}fr
                    </text>
                )}

                {/* Frets */}
                {Array.from({ length: numFrets + 1 }).map((_, i) => (
                    <line
                        key={`fret-${i}`}
                        x1={leftPadding}
                        y1={topPadding + i * fretSpacing}
                        x2={leftPadding + boxWidth}
                        y2={topPadding + i * fretSpacing}
                        stroke={i === 0 && baseFret === 1 ? "white" : "#6b7280"}
                        strokeWidth={i === 0 && baseFret === 1 ? 3 : 1}
                    />
                ))}

                {/* Strings */}
                {Array.from({ length: numStrings }).map((_, i) => (
                    <line
                        key={`string-${i}`}
                        x1={leftPadding + i * stringSpacing}
                        y1={topPadding}
                        x2={leftPadding + i * stringSpacing}
                        y2={topPadding + boxHeight}
                        stroke="#9ca3af" // gray-400
                        strokeWidth={1}
                    />
                ))}

                {/* Dots/X/O */}
                {data.frets.map((fret, stringIndex) => {
                    // X or O at the top
                    if (fret === -1) {
                        return (
                            <text
                                key={`mute-${stringIndex}`}
                                x={leftPadding + stringIndex * stringSpacing}
                                y={topPadding - 8}
                                textAnchor="middle"
                                fill="#ef4444" // red-500
                                fontSize="12"
                                fontWeight="bold"
                            >
                                X
                            </text>
                        );
                    }
                    if (fret === 0) {
                        // Open strings are always fret 0, regardless of baseFret.
                        return (
                            <text
                                key={`open-${stringIndex}`}
                                x={leftPadding + stringIndex * stringSpacing}
                                y={topPadding - 8}
                                textAnchor="middle"
                                fill="#10b981" // emerald-500
                                fontSize="12"
                                fontWeight="bold"
                            >
                                O
                            </text>
                        );
                    }

                    // Finger position relative to baseFret
                    // If baseFret is 1, fret 1 is at 0.5 spacing.
                    // If baseFret is 4, fret 4 is at 0.5 spacing.
                    // Logic: relative = fret - baseFret + 1
                    const relativeFret = fret - baseFret + 1;

                    if (relativeFret < 1 || relativeFret > numFrets) {
                        return null; // Should not happen with our baseFret logic, but safety check
                    }

                    return (
                        <circle
                            key={`finger-${stringIndex}`}
                            cx={leftPadding + stringIndex * stringSpacing}
                            cy={topPadding + (relativeFret - 0.5) * fretSpacing}
                            r={6}
                            fill="#22d3ee" // cyan-400
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default ChordDiagram;
