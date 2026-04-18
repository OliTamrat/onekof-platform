/**
 * Onekof Mobile Design System — Nocturne Dark Theme
 * Matches the web platform's Nocturne design tokens
 */

export const Colors = {
  // Backgrounds
  bg: '#0B0E11',
  bgCard: '#12161B',
  bgElevated: '#181D23',

  // Primary (Teal)
  primary: '#1C8C7D',
  primaryLight: '#2BB5A2',
  primary50: '#EFFEFB',
  primary100: '#C7FFF5',
  primary400: '#22C9B0',
  primary500: '#1C8C7D',
  primary600: '#167064',
  primary700: '#155A51',

  // Violet (AI features)
  violet: '#8B5CF6',
  violet400: '#A78BFA',

  // Text — brightened for readability on dark backgrounds
  textPrimary: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.65)',
  textFaint: 'rgba(255,255,255,0.40)',
  textWhite: '#FFFFFF',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.15)',

  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Status backgrounds
  successBg: 'rgba(34,197,94,0.1)',
  warningBg: 'rgba(245,158,11,0.1)',
  errorBg: 'rgba(239,68,68,0.1)',
  infoBg: 'rgba(59,130,246,0.1)',

  // Priority colors
  priorityCritical: '#EF4444',
  priorityHigh: '#F97316',
  priorityMedium: '#F59E0B',
  priorityLow: '#3B82F6',

  // Misc
  overlay: 'rgba(0,0,0,0.6)',
  inputBg: '#12161B',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 13,
  sm: 15,
  base: 16,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 38,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
