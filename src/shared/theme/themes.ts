import { Platform } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
  
  // Status Colors
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;
}

export const lightTheme: ThemeColors = {
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9', // Slate 100
  primary: '#0F172A', // Slate 900 (dense enterprise dark slate primary)
  primaryHover: '#1E293B', // Slate 800
  secondary: '#475569', // Slate 600
  text: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  divider: '#F1F5F9', // Slate 100

  // Status colors - enterprise pill badge colors
  success: '#15803D', // Green 700
  successBg: '#DCFCE7', // Green 100
  warning: '#B45309', // Amber 700
  warningBg: '#FEF3C7', // Amber 100
  danger: '#B91C1C', // Red 700
  dangerBg: '#FEE2E2', // Red 100
  info: '#0369A1', // Sky 700
  infoBg: '#E0F2FE', // Sky 100
};

export const darkTheme: ThemeColors = {
  background: '#0B0F19', // Custom dark slate background
  surface: '#151D30', // Deep slate surface
  surfaceHover: '#1E2942', // Hover surface
  primary: '#38BDF8', // Sky 400 (accessible on dark background)
  primaryHover: '#0EA5E9', // Sky 500
  secondary: '#94A3B8', // Slate 400
  text: '#F8FAFC', // Slate 50
  textSecondary: '#64748B', // Slate 500
  border: '#2A354F', // Dark border
  divider: '#1E293B', // Dark divider

  // Status colors - dark mode pill badge colors
  success: '#4ADE80', // Green 400
  successBg: '#052E16', // Green 950
  warning: '#FBBF24', // Amber 400
  warningBg: '#451A03', // Amber 950
  danger: '#F87171', // Red 400
  dangerBg: '#450A0A', // Red 950
  info: '#38BDF8', // Sky 400
  infoBg: '#082F49', // Sky 950
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const typography = {
  fontFamily: Platform.select({ ios: 'System', android: 'System', default: 'System-UI' }) || 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
