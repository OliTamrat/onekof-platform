/**
 * Ethiopian Calendar Utilities
 * Comprehensive Ethiopian (Ge'ez) calendar system with conversion utilities
 *
 * Ethiopian Calendar:
 * - 13 months (12 months of 30 days + 1 month of 5-6 days)
 * - New Year on September 11 (or 12 in leap years)
 * - 7-8 years behind Gregorian calendar
 */

export interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number;
  monthName: string;
  dayName: string;
}

export const ETHIOPIAN_MONTHS = [
  'Meskerem',   // መስከረም (Sept 11 - Oct 10)
  'Tikimt',     // ጥቅምት (Oct 11 - Nov 9)
  'Hidar',      // ህዳር (Nov 10 - Dec 9)
  'Tahsas',     // ታህሳስ (Dec 10 - Jan 8)
  'Tir',        // ጥር (Jan 9 - Feb 7)
  'Yekatit',    // የካቲት (Feb 8 - Mar 9)
  'Megabit',    // መጋቢት (Mar 10 - Apr 8)
  'Miazia',     // ሚያዝያ (Apr 9 - May 8)
  'Genbot',     // ግንቦት (May 9 - June 7)
  'Sene',       // ሰኔ (June 8 - July 7)
  'Hamle',      // ሐምሌ (July 8 - Aug 6)
  'Nehasse',    // ነሐሴ (Aug 7 - Sept 5)
  'Pagumen'     // ጳጉሜን (Sept 6 - Sept 10/11)
];

export const ETHIOPIAN_DAYS = [
  'Segno',      // ሰኞ (Monday)
  'Maksegno',   // ማክሰኞ (Tuesday)
  'Erob',       // ረቡዕ (Wednesday)
  'Hamus',      // ሐሙስ (Thursday)
  'Arb',        // ዓርብ (Friday)
  'Kidame',     // ቅዳሜ (Saturday)
  'Ehud'        // እሑድ (Sunday)
];

/**
 * Check if an Ethiopian year is a leap year
 */
export function isEthiopianLeapYear(year: number): boolean {
  return (year % 4) === 3;
}

/**
 * Get the number of days in an Ethiopian month
 */
export function getEthiopianMonthDays(month: number, year: number): number {
  if (month < 13) return 30;
  return isEthiopianLeapYear(year) ? 6 : 5;
}

/**
 * Convert Gregorian date to Ethiopian date
 */
export function gregorianToEthiopian(date: Date): EthiopianDate {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();

  // Calculate Ethiopian year (roughly 7-8 years behind)
  let ethiopianYear = gregorianYear - 7;
  if (gregorianMonth < 9 || (gregorianMonth === 9 && gregorianDay < 11)) {
    ethiopianYear--;
  }

  // Calculate day of Ethiopian year
  const gregorianNewYear = new Date(gregorianYear, 0, 1);
  const dayOfGregorianYear = Math.floor((date.getTime() - gregorianNewYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Ethiopian new year starts on Sept 11 (or 12 in leap year before Ethiopian leap year)
  const ethiopianNewYearDay = isEthiopianLeapYear(ethiopianYear - 1) ? 256 : 255;

  let dayOfEthiopianYear: number;
  if (dayOfGregorianYear >= ethiopianNewYearDay) {
    dayOfEthiopianYear = dayOfGregorianYear - ethiopianNewYearDay + 1;
  } else {
    dayOfEthiopianYear = dayOfGregorianYear + (isEthiopianLeapYear(ethiopianYear - 1) ? 366 : 365) - ethiopianNewYearDay + 1;
  }

  // Calculate Ethiopian month and day
  let ethiopianMonth = 1;
  let ethiopianDay = dayOfEthiopianYear;

  while (ethiopianDay > getEthiopianMonthDays(ethiopianMonth, ethiopianYear)) {
    ethiopianDay -= getEthiopianMonthDays(ethiopianMonth, ethiopianYear);
    ethiopianMonth++;
  }

  // Get day of week (Ethiopian week starts on Monday)
  const dayOfWeek = date.getDay();
  const ethiopianDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return {
    year: ethiopianYear,
    month: ethiopianMonth,
    day: ethiopianDay,
    monthName: ETHIOPIAN_MONTHS[ethiopianMonth - 1],
    dayName: ETHIOPIAN_DAYS[ethiopianDayOfWeek]
  };
}

/**
 * Convert Ethiopian date to Gregorian date
 */
export function ethiopianToGregorian(ethiopianDate: EthiopianDate): Date {
  const { year, month, day } = ethiopianDate;

  // Calculate days from Ethiopian new year
  let daysFromNewYear = 0;
  for (let m = 1; m < month; m++) {
    daysFromNewYear += getEthiopianMonthDays(m, year);
  }
  daysFromNewYear += day - 1;

  // Ethiopian new year in Gregorian calendar
  const gregorianYear = year + 7;
  const isLeapYearBefore = isEthiopianLeapYear(year - 1);
  const ethiopianNewYearMonth = 8; // September (0-indexed)
  const ethiopianNewYearDay = isLeapYearBefore ? 12 : 11;

  const ethiopianNewYear = new Date(gregorianYear, ethiopianNewYearMonth, ethiopianNewYearDay);

  // Add days from Ethiopian new year
  const gregorianDate = new Date(ethiopianNewYear.getTime() + daysFromNewYear * 24 * 60 * 60 * 1000);

  return gregorianDate;
}

/**
 * Format Ethiopian date as string
 */
export function formatEthiopianDate(ethiopianDate: EthiopianDate, format: 'short' | 'long' | 'full' = 'long'): string {
  const { year, month, day, monthName, dayName } = ethiopianDate;

  switch (format) {
    case 'short':
      return `${day}/${month}/${year}`;
    case 'long':
      return `${monthName} ${day}, ${year}`;
    case 'full':
      return `${dayName}, ${monthName} ${day}, ${year}`;
    default:
      return `${monthName} ${day}, ${year}`;
  }
}

/**
 * Get all days in an Ethiopian month
 */
export function getEthiopianMonthCalendar(year: number, month: number): EthiopianDate[] {
  const days: EthiopianDate[] = [];
  const daysInMonth = getEthiopianMonthDays(month, year);

  for (let day = 1; day <= daysInMonth; day++) {
    const ethiopianDate: EthiopianDate = {
      year,
      month,
      day,
      monthName: ETHIOPIAN_MONTHS[month - 1],
      dayName: '' // Will be calculated when converted to Gregorian
    };

    // Get the corresponding Gregorian date to determine day name
    const gregorianDate = ethiopianToGregorian(ethiopianDate);
    const dayOfWeek = gregorianDate.getDay();
    ethiopianDate.dayName = ETHIOPIAN_DAYS[dayOfWeek === 0 ? 6 : dayOfWeek - 1];

    days.push(ethiopianDate);
  }

  return days;
}

/**
 * Get current Ethiopian date
 */
export function getCurrentEthiopianDate(): EthiopianDate {
  return gregorianToEthiopian(new Date());
}

/**
 * Compare two Ethiopian dates
 */
export function compareEthiopianDates(date1: EthiopianDate, date2: EthiopianDate): number {
  if (date1.year !== date2.year) return date1.year - date2.year;
  if (date1.month !== date2.month) return date1.month - date2.month;
  return date1.day - date2.day;
}

/**
 * Check if two Ethiopian dates are the same
 */
export function isSameEthiopianDate(date1: EthiopianDate, date2: EthiopianDate): boolean {
  return date1.year === date2.year && date1.month === date2.month && date1.day === date2.day;
}

/**
 * Add days to Ethiopian date
 */
export function addDaysToEthiopianDate(ethiopianDate: EthiopianDate, days: number): EthiopianDate {
  const gregorianDate = ethiopianToGregorian(ethiopianDate);
  gregorianDate.setDate(gregorianDate.getDate() + days);
  return gregorianToEthiopian(gregorianDate);
}

/**
 * Get Ethiopian date range for a Gregorian month
 */
export function getEthiopianDateRangeForGregorianMonth(year: number, month: number): {
  start: EthiopianDate;
  end: EthiopianDate;
} {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    start: gregorianToEthiopian(startDate),
    end: gregorianToEthiopian(endDate)
  };
}
