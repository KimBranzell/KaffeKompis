import { describe, it, expect } from 'vitest';
import { calculateGrindSize, calculateFirstAndSecondPours } from '../src/components/generators/4-6-generator/utils/calculations.js';

describe('calculations', () => {
  it('calculates known grind sizes correctly', () => {
    expect(calculateGrindSize(6)).toBe(700);
    expect(calculateGrindSize(40)).toBe(1000);
    expect(calculateGrindSize(76)).toBe(1200);
  });

  it('calculates first and second pours for Acidic taste', () => {
    const [first, second] = calculateFirstAndSecondPours('Acidic', 90);
    expect(first).toBeCloseTo(60);
    expect(second).toBeCloseTo(30);
  });
});
