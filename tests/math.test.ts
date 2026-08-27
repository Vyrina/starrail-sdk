import { describe, it, expect } from 'vitest';
import { clamp } from '../src/utils/math.js';

describe('clamp', () => {
  it('returns the value unchanged when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('is inclusive at the exact boundaries', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('works with an unbounded upper side (Infinity)', () => {
    expect(clamp(1e9, 0, Infinity)).toBe(1e9);
    expect(clamp(-5, 0, Infinity)).toBe(0);
  });

  it('works with an unbounded lower side (-Infinity)', () => {
    expect(clamp(-1e9, -Infinity, 1)).toBe(-1e9);
    expect(clamp(5, -Infinity, 1)).toBe(1);
  });
});
