/**
 * cn utility function tests
 *
 * Tests the class name merging utility that combines
 * clsx (conditional classes) with tailwind-merge (deduplication).
 */

import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility', () => {
  describe('basic functionality', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle single class name', () => {
      const result = cn('foo');
      expect(result).toBe('foo');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle undefined and null values', () => {
      const result = cn('foo', undefined, null, 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle false and 0 values', () => {
      const result = cn('foo', false, 0, 'bar');
      expect(result).toBe('foo bar');
    });
  });

  describe('conditional classes', () => {
    it('should handle conditional objects', () => {
      const result = cn('foo', { bar: true, baz: false });
      expect(result).toBe('foo bar');
    });

    it('should handle multiple conditional objects', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn('base', {
        active: isActive,
        disabled: isDisabled,
      });
      expect(result).toBe('base active');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['foo', 'bar']);
      expect(result).toBe('foo bar');
    });

    it('should handle nested arrays', () => {
      const result = cn(['foo', ['bar', 'baz']]);
      expect(result).toBe('foo bar baz');
    });
  });

  describe('tailwind-merge deduplication', () => {
    it('should merge conflicting tailwind classes', () => {
      const result = cn('px-2 px-4');
      expect(result).toBe('px-4');
    });

    it('should merge conflicting background colors', () => {
      const result = cn('bg-red-500', 'bg-blue-500');
      expect(result).toBe('bg-blue-500');
    });

    it('should merge conflicting text colors', () => {
      const result = cn('text-white', 'text-black');
      expect(result).toBe('text-black');
    });

    it('should merge padding classes correctly', () => {
      const result = cn('p-4', 'px-2');
      expect(result).toBe('p-4 px-2');
    });

    it('should keep non-conflicting classes', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4');
      expect(result).toBe('bg-red-500 text-white p-4');
    });

    it('should handle responsive variants', () => {
      const result = cn('p-2', 'md:p-4', 'lg:p-6');
      expect(result).toBe('p-2 md:p-4 lg:p-6');
    });

    it('should handle hover states', () => {
      const result = cn('hover:bg-blue-500', 'hover:bg-red-500');
      expect(result).toBe('hover:bg-red-500');
    });
  });

  describe('real-world usage patterns', () => {
    it('should handle button variant pattern', () => {
      const baseClasses = 'inline-flex items-center justify-center rounded-2xl';
      const variantClasses = 'bg-blue-500 text-white';
      const customClasses = 'mt-4';

      const result = cn(baseClasses, variantClasses, customClasses);
      expect(result).toBe(
        'inline-flex items-center justify-center rounded-2xl bg-blue-500 text-white mt-4'
      );
    });

    it('should allow custom classes to override defaults', () => {
      const defaultClasses = 'bg-blue-500 text-white p-4';
      const customClasses = 'bg-red-500 p-2';

      const result = cn(defaultClasses, customClasses);
      expect(result).toBe('text-white bg-red-500 p-2');
    });

    it('should handle input error state pattern', () => {
      const hasError = true;
      const result = cn(
        'border rounded-2xl',
        hasError ? 'border-red-500' : 'border-gray-300'
      );
      expect(result).toBe('border rounded-2xl border-red-500');
    });

    it('should handle card variant pattern', () => {
      const variant = 'elevated';
      const result = cn(
        'rounded-3xl border',
        {
          'bg-gray-800': variant === 'default',
          'bg-gray-900 shadow-lg': variant === 'elevated',
        }
      );
      expect(result).toBe('rounded-3xl border bg-gray-900 shadow-lg');
    });
  });
});
