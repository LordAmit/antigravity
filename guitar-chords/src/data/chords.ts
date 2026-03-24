
export interface ChordDefinition {
    frets: number[]; // -1 for mute/x, 0 for open
    fingers: number[]; // 0 for no finger, 1-4 for fingers
    barres?: number[]; // Fret numbers to barre
    capo?: boolean; // If true, base fret is higher
}

// Basic chords library
export const CHORD_DATA: Record<string, ChordDefinition> = {
    // A major
    'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
    'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    'A7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
    // B
    'B': { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1], barres: [2] },
    'Bm': { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [2] },
    // C
    'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    'C#': { frets: [-1, 4, 3, 1, 2, 1], fingers: [0, 3, 2, 1, 4, 1], barres: [1] }, // This is hard to draw generically without base fret shift
    // D
    'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    // E
    'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    // F
    'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
    'F#m': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [2] },
    // G
    'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    'Gm': { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [3] },
    'G#': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [4] },
    'G#m': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barres: [4] },
    // Additional / Sharps
    'C#m': { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barres: [4] },
    'D#': { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 3, 3, 3, 1], barres: [6] },
    'D#m': { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barres: [6] },
    'F#': { frets: [2, 4, 3, 2, 2, 2], fingers: [1, 3, 2, 1, 1, 1], barres: [2] },
    'Fm': { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
    'A#': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 3, 3, 3, 1], barres: [1] },
    'A#m': { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [1] },
    // Power Chords (5)
    'E5': { frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 2, 0, 0, 0] },
    'F5': { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] },
    'F#5': { frets: [2, 4, 4, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] },
    'G5': { frets: [3, 5, 5, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] },
    'G#5': { frets: [4, 6, 6, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] },
    'A5': { frets: [5, 7, 7, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] }, // Root 6
    'A#5': { frets: [6, 8, 8, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] }, // Root 6
    'B5': { frets: [7, 9, 9, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] }, // Root 6
    'C5': { frets: [8, 10, 10, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] }, // Root 6
    'C#5': { frets: [4, 6, 6, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] }, // Root 5
    'D5': { frets: [5, 7, 7, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] }, // Root 5
    'D#5': { frets: [6, 8, 8, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0] }, // Root 5
    // Suspended Chords
    'Dsus2': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
    'Dsus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 3, 4] },
    'Asus2': { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
    'Asus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 2, 3, 4, 0] },
    'Esus4': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0] },
    'Gsus4': { frets: [3, 2, 0, 0, 1, 3], fingers: [3, 2, 0, 0, 1, 4] }, // Common open shape
    'Csus4': { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
};

// Helper to normalize chord name for lookup (e.g. A# -> Bb if we only have Bb)
// But currently we use Sharps.
