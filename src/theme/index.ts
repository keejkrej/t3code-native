/**
 * T3 Code Design Tokens & Theme Palettes
 * Sourced directly from @t3tools/shared/themePalettes (T3_CODE_DARK_THEME_COLORS)
 */

export const colors = {
  // Official T3 Code Canvas & Chrome
  background: '#0a0a0a',
  backgroundSubtle: '#0f0f0f',
  
  // Surfaces
  surface: '#111111',
  surfaceHover: '#141414',
  surfaceActive: '#1a1a1a',
  surfaceSelected: '#1e1e1e',

  // Sidebar (pure dark black in official T3 Code desktop)
  sidebar: '#000000',
  sidebarForeground: '#f1f3f7',
  sidebarMutedForeground: '#a3a3a3',
  sidebarControlSurface: '#0a0a0a',
  sidebarRowHover: '#131313',
  sidebarRowActive: '#1a1b1b',
  sidebarRowSelected: '#111111',
  sidebarBorder: '#141414',

  // Borders
  border: '#191919',
  borderSubtle: '#141414',
  borderHighlight: '#262626',
  inputBorder: '#1e1e1e',

  // Brand & Accents
  primary: '#ec4899', // T3 Signature Magenta / Pink
  primaryLight: '#f472b6',
  primaryDark: '#db2777',
  primaryMuted: 'rgba(236, 72, 153, 0.15)',

  // T3 Action Accent (Cobalt Blue in official T3 Code dark)
  accentCobalt: '#346bf1',
  accentCobaltHover: '#3061d9',

  // Secondary Accents
  accentPurple: '#a855f7',
  accentBlue: '#346bf1',
  accentCyan: '#06b6d4',
  accentEmerald: '#10b981',
  accentAmber: '#fe9a00',
  accentRose: '#fb414a',

  // Provider Colors
  claude: '#d97706',
  codex: '#10a37f',
  cursor: '#6366f1',
  grok: '#ec4899',
  opencode: '#346bf1',
  antigravity: '#8b5cf6',

  // Typography Colors
  text: '#f5f5f5',
  textSecondary: '#a3a3a3',
  textMuted: '#818181',
  textFaint: '#525252',
  textInverse: '#0a0a0a',

  // Status & Diff (Matches T3 Code Diffs)
  diffAddBg: 'rgba(16, 185, 129, 0.12)',
  diffAddText: '#4ade80',
  diffAddGutter: '#16a34a',
  diffDeleteBg: 'rgba(251, 65, 74, 0.12)',
  diffDeleteText: '#f87171',
  diffDeleteGutter: '#dc2626',
  statusClean: '#10b981',
  statusDirty: '#fe9a00',
  statusError: '#fb414a',
  statusRunning: '#346bf1',

  // Terminal (Official T3 Code Terminal tokens)
  terminalBackground: '#0a0a0a',
  terminalForeground: '#f5f5f5',
  terminalCursor: '#b4cbff',
  terminalSelection: '#343a47',
  terminalScrollbar: '#222222',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.75)',
  cardGlass: 'rgba(17, 17, 17, 0.9)',
};

export const typography = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'DM Sans', Roboto, sans-serif",
  monoFontFamily:
    "'SF Mono', 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', 'JetBrains Mono', monospace",
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
