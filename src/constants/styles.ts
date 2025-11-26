export const SPACING = {
  zero: 0,
  micro: 2,
  xs: 4,
  xsPlus: 6,
  sm: 8,
  smPlus: 10,
  md: 12,
  mdPlus: 14,
  lg: 16,
  lgPlus: 18,
  xlBase: 20,
  xl: 24,
  xlPlus: 28,
  xxl: 32,
  xxxl: 40,
  jumbo: 48,
} as const;

export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  mdPlus: 10,
  lg: 12,
  lgPlus: 14,
  xl: 16,
  xxl: 24,
  full: 20,
  pill: 999,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  lgPlus: 18,
  xl: 20,
  xxl: 22,
  xxxl: 24,
  displaySm: 28,
  displayMd: 32,
  displayLg: 36,
} as const;

export const SHADOWS = {
  small: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const ICON_SIZES = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xlPlus: 28,
  xxl: 32,
  xxxl: 40,
} as const;

