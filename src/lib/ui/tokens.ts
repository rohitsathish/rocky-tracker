// Design tokens and motion presets
export const tokens = {
  radius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    xxl: 16,
  },
  // 4px grid; choose smaller steps by default for density
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const,
  motion: {
    fast: '120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    medium: '180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    slow: '300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  colors: {
    // Primary brand colors
    accent: '#6366F1', // Indigo
    accentHover: '#4F46E5',
    accentLight: 'rgba(99, 102, 241, 0.1)',

    // Status colors - more sophisticated palette
    red: '#EF4444',
    redHover: '#DC2626',
    redLight: 'rgba(239, 68, 68, 0.1)',
    redBg: '#FEF2F2',

    yellow: '#F59E0B',
    yellowHover: '#D97706',
    yellowLight: 'rgba(245, 158, 11, 0.1)',
    yellowBg: '#FFFBEB',

    green: '#10B981',
    greenHover: '#059669',
    greenLight: 'rgba(16, 185, 129, 0.1)',
    greenBg: '#ECFDF5',

    // Neutral grays - sophisticated scale
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Background colors - layered approach
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F9FAFB',
    bgTertiary: '#F3F4F6',
    bgOverlay: 'rgba(0, 0, 0, 0.02)',
    bgHover: 'rgba(0, 0, 0, 0.025)',
    bgPressed: 'rgba(0, 0, 0, 0.04)',

    // Border colors
    borderSubtle: 'rgba(0, 0, 0, 0.04)',
    borderDefault: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.12)',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
    textInverse: '#FFFFFF',
  },
} as const;
