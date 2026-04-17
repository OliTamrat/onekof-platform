/**
 * Ethiopian Calendar (Ge'ez Calendar) conversion utilities.
 *
 * The Ethiopian calendar has 13 months:
 * - 12 months of 30 days each
 * - 1 short month (Pagumen) of 5 days (6 in leap years)
 *
 * Ethiopian year = Gregorian year - 7 (after Sept 11) or - 8 (before Sept 11)
 * Ethiopian New Year (Enkutatash) = September 11 (or 12 in Gregorian leap years)
 */

const ETH_MONTHS = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen',
];

const ETH_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን',
];

export interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number;   // 1-30 (1-5/6 for Pagumen)
  monthName: string;
  monthNameAm: string;
}

/**
 * Check if an Ethiopian year is a leap year.
 * Ethiopian leap year: (year % 4) === 3
 */
function isEthiopianLeapYear(ethYear: number): boolean {
  return (ethYear % 4) === 3;
}

/**
 * Convert Gregorian date to Ethiopian date.
 *
 * Algorithm: Calculate the Julian Day Number (JDN) for the Gregorian date,
 * then convert JDN to Ethiopian date.
 */
export function toEthiopian(gYear: number, gMonth: number, gDay: number): EthiopianDate {
  // Calculate Julian Day Number from Gregorian
  const jdn = gregorianToJDN(gYear, gMonth, gDay);

  // Ethiopian epoch in JDN: August 29, 8 CE (Julian) = JDN 1724221
  // Adjusted for Gregorian: Ethiopian epoch = JDN 1723856 for the
  // "practical" algorithm below.

  // Use a simpler offset-based approach that's been validated:
  // Ethiopian New Year falls on September 11 (or 12 in Gregorian leap years)

  // Days from Ethiopian epoch
  const ethEpochJDN = 1724221;
  const r = (jdn - ethEpochJDN) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  const ethYear = 4 * Math.floor((jdn - ethEpochJDN) / 1461)
    + Math.floor(r / 365)
    - Math.floor(r / 1460);

  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthName: ETH_MONTHS[ethMonth - 1] || 'Pagumen',
    monthNameAm: ETH_MONTHS_AM[ethMonth - 1] || 'ጳጉሜን',
  };
}

/**
 * Convert Ethiopian date to Gregorian date.
 */
export function toGregorian(ethYear: number, ethMonth: number, ethDay: number): { year: number; month: number; day: number } {
  const jdn = ethiopianToJDN(ethYear, ethMonth, ethDay);
  return jdnToGregorian(jdn);
}

/**
 * Get the number of days in an Ethiopian month.
 */
export function daysInEthiopianMonth(ethYear: number, ethMonth: number): number {
  if (ethMonth <= 12) return 30;
  // Pagumen (month 13)
  return isEthiopianLeapYear(ethYear) ? 6 : 5;
}

/**
 * Format Ethiopian date as string.
 */
export function formatEthiopian(eth: EthiopianDate, useAmharic = false): string {
  const monthName = useAmharic ? eth.monthNameAm : eth.monthName;
  return `${monthName} ${eth.day}, ${eth.year}`;
}

/**
 * Get all Ethiopian month names.
 */
export function getEthiopianMonths(useAmharic = false): string[] {
  return useAmharic ? [...ETH_MONTHS_AM] : [...ETH_MONTHS];
}

// ─── Internal JDN helpers ───

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function ethiopianToJDN(ethYear: number, ethMonth: number, ethDay: number): number {
  const ethEpochJDN = 1724221;
  return ethEpochJDN + 365 * ethYear + Math.floor(ethYear / 4)
    + 30 * (ethMonth - 1) + ethDay - 1;
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}
