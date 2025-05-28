import { cn } from '@/lib/utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('should override conflicting tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle arrays of class names', () => {
    expect(cn(['p-4', 'm-2'], 'bg-green-500')).toBe('p-4 m-2 bg-green-500');
  });

  it('should handle null and undefined values', () => {
    expect(cn('p-4', null, 'm-2', undefined, 'bg-yellow-500')).toBe('p-4 m-2 bg-yellow-500');
  });

  it('should handle mixed types of inputs', () => {
    const isActive = true;
    expect(cn('base', { 'active': isActive, 'text-bold': true }, ['p-2', 'm-1'])).toBe('base active text-bold p-2 m-1');
  });
});
