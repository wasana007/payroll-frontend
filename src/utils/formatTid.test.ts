import { describe, it, expect } from 'vitest';
import { formatTid } from './formatTid';

describe('formatTid', () => {
  it('formats ISO string correctly', () => {
    expect(formatTid('2026-06-04T04:52:45')).toBe('4.6.26 04:52:45');
  });

  it('pads hours minutes seconds with zero', () => {
    expect(formatTid('2026-01-01T01:01:01')).toBe('1.1.26 01:01:01');
  });

  it('formats last two digits of year', () => {
    expect(formatTid('2099-12-31T23:59:59')).toBe('31.12.99 23:59:59');
  });

  it('returns current time when input is undefined', () => {
    const result = formatTid(undefined);
    expect(result).toMatch(/^\d{1,2}\.\d{1,2}\.\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('returns current time when input is null', () => {
    const result = formatTid(null);
    expect(result).toMatch(/^\d{1,2}\.\d{1,2}\.\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});
