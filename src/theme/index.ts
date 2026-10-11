export const colors = {
  // Backgrounds
  background: '#0d0e12',
  backgroundSubtle: '#12141a',
  surface: '#171922',
  surfaceHover: '#1f222e',
  surfaceActive: '#262938',
  surfaceSelected: '#2c3042',

  // Borders
  border: '#232634',
  borderSubtle: '#1c1e29',
  borderHighlight: '#383c52',

  // Brand / Accents
  primary: '#ec4899', // T3 Signature Magenta / Pink
  primaryLight: '#f472b6',
  primaryDark: '#db2777',
  primaryMuted: 'rgba(236, 72, 153, 0.15)',

  // Secondary Accents
  accentPurple: '#a855f7',
  accentBlue: '#3b82f6',
  accentCyan: '#06b6d4',
  accentEmerald: '#10b981',
  accentAmber: '#f59e0b',
  accentRose: '#f43f5e',

  // Provider Colors
  claude: '#d97706', // Claude amber/orange
  codex: '#10a37f', // OpenAI emerald green
  cursor: '#6366f1', // Cursor indigo
  grok: '#ec4899', // Grok pink
  opencode: '#3b82f6', // OpenCode blue
  antigravity: '#8b5cf6', // Antigravity violet

  // Text
  text: '#f3f4f6',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  textFaint: '#4b5563',
  textInverse: '#111827',

  // Status & Diff
  diffAddBg: 'rgba(16, 185, 129, 0.15)',
  diffAddText: '#34d399',
  diffAddGutter: '#059669',
  diffDeleteBg: 'rgba(244, 63, 94, 0.15)',
  diffDeleteText: '#fb7185',
  diffDeleteGutter: '#e11d48',
  statusClean: '#10b981',
  statusDirty: '#f59e0b',
  statusError: '#ef4444',
  statusRunning: '#3b82f6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.75)',
  cardGlass: 'rgba(23, 25, 34, 0.85)',
};

export const typography = {
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  monoFontFamily: "'JetBrains Mono', monospace",
  sizes: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    heading: 26,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
