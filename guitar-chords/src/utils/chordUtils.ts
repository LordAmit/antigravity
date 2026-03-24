
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const FLATS_TO_SHARPS: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'Cb': 'B', 'Fb': 'E'
};

// Custom chord syntax: 5w7 or 6w5-5w7 (String 'w' Fret)
// We match chord OR custom syntax.
// Custom syntax regex: Start with [1-6]w[0-9]+, optionally followed by -[1-6]w[0-9]+ repeated.
const CUSTOM_SYNTAX_PART = `[1-6]w[0-9]+(?:-[1-6]w[0-9]+)*`;
const STANDARD_CHORD_PART = `[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|5)?(?:[0-9])?(?:\/[A-G](?:#|b)?)?`;

// Combined regex
const CHORD_REGEX = new RegExp(`^(?:${STANDARD_CHORD_PART}|${CUSTOM_SYNTAX_PART})$`);

export const transposeChord = (chord: string, semitones: number): string => {
    // 0. Check for custom syntax
    if (/[1-6]w[0-9]+/.test(chord)) {
        // It's a custom chord.
        // Split by '-'
        const parts = chord.split('-');
        const newParts = parts.map(part => {
            const match = part.match(/^([1-6])w([0-9]+)$/);
            if (!match) return part;
            const stringNum = match[1];
            const fret = parseInt(match[2], 10);
            let newFret = fret + semitones;
            if (newFret < 0) newFret = 0; // clamp to 0? or perhaps allow negative if we want to show it's invalid? 
            // Logic: physically you can't go below 0. 
            // If original was 0 (open), -1 -> 0? No, open string transposed down is invalid on standard tuning.
            // But let's just clamp to 0 for simplicity or keep as is?
            // Let's return newFret. If it's negative, it will just show as such (and likely not render on diagram).
            return `${stringNum}w${newFret}`;
        });
        return newParts.join('-');
    }

    // 1. Identify root and suffix
    const rootMatch = chord.match(/^([A-G](?:#|b)?)(.*)$/);
    if (!rootMatch) return chord;

    let root = rootMatch[1];
    const suffix = rootMatch[2];

    // Normalize root to sharp if flat
    if (FLATS_TO_SHARPS[root]) {
        root = FLATS_TO_SHARPS[root];
    }

    let index = NOTES.indexOf(root);
    if (index === -1) return chord; // Unknown chord root

    // 2. Shift index
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    // 3. Return new chord
    return NOTES[newIndex] + suffix;
};

// Check if a specific token is a chord
export const isChord = (token: string): boolean => {
    return CHORD_REGEX.test(token.trim());
};

export type SongLine = {
    type: 'chords' | 'lyrics' | 'empty';
    content: string;
    originalContent?: string; // To keep track for editing maybe?
};

// Check if a line is composed of chords
export const isChordLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;

    const tokens = trimmed.split(/\s+/);
    // If more than 80% of tokens look like chords, it's a chord line
    const validChords = tokens.filter(token => {
        // Simple regex check
        return CHORD_REGEX.test(token);
    });

    return validChords.length / tokens.length > 0.5;
};

export const parseSong = (text: string): SongLine[] => {
    return text.split('\n').map(line => {
        if (!line.trim()) {
            return { type: 'empty', content: '' };
        }
        if (isChordLine(line)) {
            return { type: 'chords', content: line };
        }
        return { type: 'lyrics', content: line };
    });
};

// Helper to transpose a whole line of chords
export const transposeLine = (line: string, semitones: number): string => {
    // Strategy: Replace anything that matches our CHORD_REGEX
    // We need to construct a global regex from our source
    // Since CHORD_REGEX is ^...$, we need to remove anchors for global search

    // Constructing global regex for search:
    const customPart = `[1-6]w[0-9]+(?:-[1-6]w[0-9]+)*`;
    const standardPart = `[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|5)?(?:[0-9])?(?:\/[A-G](?:#|b)?)?`;

    // We put custom part first to match it greedily if possible (though they are quite distinct)
    const globalRegex = new RegExp(`(${customPart}|${standardPart})`, 'g');

    return line.replace(globalRegex, (match) => {
        // Double check if it's a valid chord before transposing?
        // The regex is loose enough to match. 
        if (!isChord(match)) return match;
        return transposeChord(match, semitones);
    });
};

export const getUniqueChords = (lines: SongLine[], semitones: number): string[] => {
    const chords = new Set<string>();

    lines.forEach(line => {
        if (line.type === 'chords') {
            const transposedLine = transposeLine(line.content, semitones);
            const tokens = transposedLine.split(/\s+/);
            tokens.forEach(token => {
                if (isChord(token)) {
                    chords.add(token);
                }
            });
        }
    });

    return Array.from(chords);
};

export const transposeSongText = (text: string, semitones: number): string => {
    return text.split('\n').map(line => {
        if (isChordLine(line)) {
            return transposeLine(line, semitones);
        }
        return line;
    }).join('\n');
};

import type { ChordDefinition } from '../data/chords';

export const parseCustomChord = (chord: string): ChordDefinition | null => {
    if (!/[1-6]w[0-9]+/.test(chord)) return null;

    // Default: all strings muted (-1), all fingers 0
    const frets = [-1, -1, -1, -1, -1, -1];
    const fingers = [0, 0, 0, 0, 0, 0];

    // Split by '-'
    const parts = chord.split('-');

    parts.forEach(part => {
        const match = part.match(/^([1-6])w([0-9]+)$/);
        if (match) {
            const stringNum = parseInt(match[1], 10);
            const fret = parseInt(match[2], 10);

            // String 1 is high E (index 5 in our array usually? or index 0?)
            // Standard tuning: E A D G B e
            // 6=E (Low), 5=A, 4=D, 3=G, 2=B, 1=e (High)
            // Array indices: typically [Low E, A, D, G, B, High E] -> [0, 1, 2, 3, 4, 5]
            // So if stringNum is 6 (Low E), index is 0. 
            // If stringNum is 1 (High E), index is 5.
            // Map: index = 6 - stringNum
            const index = 6 - stringNum;

            if (index >= 0 && index < 6) {
                frets[index] = fret;
                // We can't determine fingers easily, keep as 0
            }
        }
    });

    return { frets, fingers };
};
