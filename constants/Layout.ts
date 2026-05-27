import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  window: { width, height },
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 768,
  isLargeDevice: width >= 768,
  isWeb: Platform.OS === 'web',
  isMobile: width < 768,

  // Grid columns responsive
  get gridColumns() {
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  },

  // Spacing responsivo
  spacing: {
    xs: width < 768 ? 4 : 6,
    sm: width < 768 ? 8 : 10,
    md: width < 768 ? 12 : 16,
    lg: width < 768 ? 16 : 24,
    xl: width < 768 ? 20 : 32,
    xxl: width < 768 ? 24 : 40,
  },

  // Border radius
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: width < 768 ? 16 : 20,
    xxl: 24,
    full: 9999,
  },

  // Font sizes responsivas
  fontSize: {
    xs: width < 768 ? 11 : 12,
    sm: width < 768 ? 13 : 14,
    md: width < 768 ? 15 : 16,
    lg: width < 768 ? 17 : 18,
    xl: width < 768 ? 20 : 22,
    xxl: width < 768 ? 24 : 28,
    xxxl: width < 768 ? 28 : 34,
    title: width < 768 ? 22 : 26,
  },

  // Max content width
  maxContentWidth: width < 768 ? width - 32 : 560,
  maxWebWidth: 1400,

  // Tab bar
  tabBarHeight: width < 768 ? (Platform.OS === 'ios' ? 80 : 65) : 70,

  // Header
  headerHeight: width < 768 ? 56 : 64,
};