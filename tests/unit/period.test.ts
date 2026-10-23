import { describe, expect, it } from 'vitest';
import { formatPeriod } from '../../src/lib/period';

describe('formatPeriod', () => {
  it('Jahre: gleiches Jahr nur einmal', () => {
    expect(formatPeriod('2023-01', '2023-09', 'de')).toBe('2023');
    expect(formatPeriod('2018-01', '2019-11', 'en')).toBe('2018 – 2019');
  });
  it('offenes Ende in beiden Sprachen', () => {
    expect(formatPeriod('2023-10', null, 'de')).toBe('2023 – heute');
    expect(formatPeriod('2023-10', null, 'en')).toBe('2023 – now');
  });
  it('mit Monaten', () => {
    expect(formatPeriod('2023-01', '2023-09', 'de', { months: true })).toBe('01/2023 – 09/2023');
    expect(formatPeriod('2023-10', null, 'en', { months: true })).toBe('10/2023 – now');
  });
});
