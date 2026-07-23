import { describe, it, expect } from 'vitest';

describe('Ethiopian Calendar Conversion', () => {
  function toEthiopian(year: number, month: number, day: number): [number, number, number] {
    const jdn = gregorianToJDN(year, month, day);
    return jdnToEthiopian(jdn);
  }

  function gregorianToJDN(year: number, month: number, day: number): number {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function jdnToEthiopian(jdn: number): [number, number, number] {
    const r = (jdn - 1723856) % 1461;
    const n = (r % 365) + 365 * Math.floor(r / 1460);
    const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
    const month = Math.floor(n / 30) + 1;
    const day = (n % 30) + 1;
    return [year, month, day];
  }

  it('converts September 11, 2026 to Ethiopian New Year 2019', () => {
    const [year, month, day] = toEthiopian(2026, 9, 11);
    expect(year).toBe(2019);
    expect(month).toBe(1);
    expect(day).toBe(1);
  });

  it('converts January 1, 2026 to Tahsas 2018', () => {
    const [year, month, day] = toEthiopian(2026, 1, 1);
    expect(year).toBe(2018);
    expect(month).toBe(4);
  });

  it('handles Pagume (13th month)', () => {
    const [year, month, day] = toEthiopian(2026, 9, 6);
    expect(month).toBe(13);
  });

  it('Ethiopian month is between 1 and 13', () => {
    for (let m = 1; m <= 12; m++) {
      const [, month] = toEthiopian(2026, m, 15);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(13);
    }
  });

  it('Ethiopian day is between 1 and 30', () => {
    const [, , day] = toEthiopian(2026, 6, 15);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(30);
  });
});
