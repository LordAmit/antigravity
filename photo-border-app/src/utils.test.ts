import { describe, it, expect } from 'vitest';
import { resolveTemplate } from './utils';

describe('resolveTemplate', () => {
  it('correctly injects make and model', () => {
    const exif = { make: 'Sony', model: 'A7IV' } as any;
    expect(resolveTemplate('{make} {model}', exif)).toBe('Sony A7IV');
  });

  it('handles missing EXIF data cleanly by collapsing empty spaces', () => {
    const exif = { make: 'Sony' } as any; // missing model
    expect(resolveTemplate('Shot on {make} {model} Camera', exif)).toBe('Shot on Sony Camera');
  });

  it('gracefully returns empty string when image has zero EXIF data', () => {
    expect(resolveTemplate('{make} {model}', undefined)).toBe('');
    expect(resolveTemplate('{lens}', {})).toBe('');
  });

  it('passes through custom strings without templates correctly', () => {
    const exif = { make: 'Sony', model: 'A7IV' } as any;
    expect(resolveTemplate('My Custom Camera', exif)).toBe('My Custom Camera');
    expect(resolveTemplate('My Custom Camera', undefined)).toBe('My Custom Camera');
  });

  it('preserves newlines in the string while collapsing horizontal whitespace', () => {
    const exif = { make: 'Sony' } as any; // missing model
    const input = 'Shot on {make} {model}\nNext line here';
    // {make} -> 'Sony', {model} -> '', resulting string: 'Shot on Sony \nNext line here' -> collapsed to 'Shot on Sony\nNext line here'
    expect(resolveTemplate(input, exif)).toBe('Shot on Sony\nNext line here');
  });
});
