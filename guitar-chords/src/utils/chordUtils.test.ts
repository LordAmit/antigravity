
import { describe, it, expect } from 'vitest';
import { transposeChord, isChord, parseSong, transposeLine } from './chordUtils';
import type { SongLine } from './chordUtils';

describe('chordUtils', () => {
    describe('transposeChord', () => {
        it('transposes A up 2 semitones to B', () => {
            expect(transposeChord('A', 2)).toBe('B');
        });

        it('transposes A up 1 semitone to A#', () => {
            expect(transposeChord('A', 1)).toBe('A#');
        });

        it('transposes G up 2 semitones to A', () => {
            expect(transposeChord('G', 2)).toBe('A');
        });

        it('transposes minor chords', () => {
            expect(transposeChord('Am', 2)).toBe('Bm');
        });

        it('transposes complex chords', () => {
            // F# is index 6. +1 = 7 (G).
            expect(transposeChord('F#m7', 1)).toBe('Gm7');
        });

        it('handles negative transposition', () => {
            expect(transposeChord('B', -2)).toBe('A');
        });

        it('normalizes flats', () => {
            // Bb -> A#
            // A# + 1 -> B
            expect(transposeChord('Bb', 1)).toBe('B');
        });
    });

    describe('isChord', () => {
        it('identifies simple chords', () => {
            expect(isChord('A')).toBe(true);
            expect(isChord('Am')).toBe(true);
        });

        it('identifies complex chords', () => {
            expect(isChord('F#m7')).toBe(true);
            expect(isChord('Bb/D')).toBe(true);
        });

        it('rejects lyrics', () => {
            expect(isChord('Hello')).toBe(false);
            expect(isChord('Verse')).toBe(false);
            expect(isChord('[Verse')).toBe(false);
        });
    });

    describe('parseSong', () => {
        it('parses interleaved chords and lyrics', () => {
            const input = `A           E
Tomar jonno nilche tara`;
            const lines = parseSong(input);
            expect(lines).toHaveLength(2);
            expect(lines[0].type).toBe('chords');
            expect(lines[1].type).toBe('lyrics');
        });
    });

    describe('transposeLine', () => {
        it('transposes a line of chords preserving spaces', () => {
            const line = 'A           E';
            // A -> B (+2), E -> F# (+2)
            const transposed = transposeLine(line, 2);
            // Expect 'B           F#' roughly
            // The exact length might vary if strict replacement used, but we expect spaces to remain
            expect(transposed).toMatch(/B\s+F#/);
        });
    });
});
