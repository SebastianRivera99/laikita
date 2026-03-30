// ============================================
// LAIKITA - Layout Constants
// Responsive breakpoints & spacing
// ============================================

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  window: { width, height },
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 768,
  isLargeDevice: width >= 768,
  isWeb: Platform.OS === 'web',

  // Spacing scale (4px base)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    title: 28,
  },

  // Max content width for web
  maxContentWidth: 480,
  maxWebWidth: 1200,

  // Tab bar
  tabBarHeight: Platform.OS === 'ios' ? 85 : 65,

  // Header
  headerHeight: 56,
};
