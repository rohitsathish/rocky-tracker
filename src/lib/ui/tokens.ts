// Design tokens and motion presets
export const tokens = {
  radius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
  },
  // 4px grid; choose smaller steps by default for density
  spacing: [4, 8, 12, 16, 20, 24, 32] as const,
  motion: {
    fast: '120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    medium: '180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  colors: {
    accent: '#0A84FF',
    red: '#FF3B30',
    yellow: '#FFCC00',
    green: '#34C759',
  },
} as const;
