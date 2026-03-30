// ============================================
// LAIKITA - Color Palette
// Veterinary warm & modern theme
// ============================================

const tintColorLight = '#1B9E8C';
const tintColorDark = '#4ECDC4';

export const Colors = {
  // Brand
  primary: '#1B9E8C',
  primaryLight: '#4ECDC4',
  primaryDark: '#147A6E',
  primarySoft: '#E8F8F5',

  secondary: '#FF8C5A',
  secondaryLight: '#FFB088',
  secondaryDark: '#E06B3A',
  secondarySoft: '#FFF0E8',

  accent: '#6C5CE7',
  accentLight: '#A29BFE',
  accentSoft: '#F0EEFF',

  // Status
  success: '#27AE60',
  successSoft: '#E8F5E9',
  warning: '#F39C12',
  warningSoft: '#FFF8E1',
  error: '#E74C3C',
  errorSoft: '#FDEAEA',
  info: '#3498DB',
  infoSoft: '#EBF5FB',

  // Treatment types
  treatmentColors: {
    consultation: '#3498DB',
    vaccination: '#27AE60',
    surgery: '#E74C3C',
    grooming: '#F39C12',
    dental: '#9B59B6',
    laboratory: '#1ABC9C',
    emergency: '#E74C3C',
    deworming: '#2ECC71',
    other: '#95A5A6',
  },

  // Pet species
  speciesColors: {
    dog: '#FF8C5A',
    cat: '#6C5CE7',
    bird: '#F39C12',
    rabbit: '#FD79A8',
    hamster: '#FDCB6E',
    other: '#95A5A6',
  },

  // Light theme
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    background: '#F7F8FC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F3F8',
    border: '#E5E7EB',
    borderLight: '#F0F1F5',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    shadow: 'rgba(0, 0, 0, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    cardShadow: 'rgba(27, 158, 140, 0.08)',
  },

  // Dark theme
  dark: {
    text: '#F7F8FC',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    background: '#0F1123',
    surface: '#1A1D35',
    surfaceSecondary: '#242847',
    border: '#2D3154',
    borderLight: '#242847',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    cardShadow: 'rgba(78, 205, 196, 0.05)',
  },
};

export type ThemeColors = typeof Colors.light;
