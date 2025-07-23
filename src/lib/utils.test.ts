import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2 py-1', 'text-red-500')).toBe('px-2 py-1 text-red-500');
    });

    it('handles conflicting classes with proper precedence', () => {
      expect(cn('px-2 px-4')).toContain('px-4'); // Later class should take precedence
    });

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class');
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
    });

    it('handles undefined and null values', () => {
      expect(cn('base-class', undefined, null, 'other-class')).toBe('base-class other-class');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
    });

    it('handles object syntax', () => {
      expect(cn({
        'base-class': true,
        'conditional-class': false,
        'active-class': true,
      })).toBe('base-class active-class');
    });

    it('deduplicates classes', () => {
      expect(cn('px-2', 'px-2', 'py-1')).toBe('px-2 py-1');
    });
  });
});