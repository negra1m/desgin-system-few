export const tokens = {
  color: { canvas: '#f1f0ea', surface: '#ffffff', ink: '#242925', muted: '#62685f', line: '#d8dbd2', brand: '#244c38', accent: '#d7ed87', danger: '#a83232', success: '#256541' },
  space: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px', 12: '48px', 16: '64px' },
  radius: { sm: '4px', md: '8px', lg: '16px', pill: '999px' },
  motion: { fast: '140ms', normal: '220ms' },
  typography: { body: 'Arial, Helvetica, sans-serif', mono: 'ui-monospace, Consolas, monospace' },
} as const;
export type FewTheme = 'few' | 'dark' | 'caraminholas' | 'ifight';
