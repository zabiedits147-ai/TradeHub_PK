// TradeHub PK — Centralized Design Theme

export const colors = {
  // Brand
  primary: '#1B7A4A',
  primaryDark: '#0F2E22',
  primaryLight: '#E7F3EC',

  // Accent
  accentOrange: '#C2410C',
  accentOrangeLight: '#FEF3EE',
  accentOrangeBadge: '#FDE4D6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Backgrounds
  bgScreen: '#F7F9F8',
  bgCard: '#FFFFFF',
  bgDark: '#0F2E22',

  // Borders / dividers
  border: '#E5E7EB',
  borderLight: '#EDEFEE',
  divider: '#F3F4F6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' },
  h2: { fontSize: 22, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '700' },
  h4: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '400' },
  bodyBold: { fontSize: 14, fontWeight: '700' },
  caption: { fontSize: 12, fontWeight: '400' },
  captionBold: { fontSize: 12, fontWeight: '700' },
  small: { fontSize: 11, fontWeight: '400' },
  tag: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
};

export const shadow = {
  card: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardStrong: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
};

export default { colors, spacing, radius, typography, shadow };