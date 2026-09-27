export const tokens = {
  color: { canvas: '#0A0A1F', surface: '#12122B', ink: '#FAFAFF', muted: '#A6A6C0', line: '#30304E', brand: '#C9AFFF', accent: '#FF2ECC', blue: '#38B6FF', danger: '#FF9BAE', success: '#83E5C0' },
  gradient: { brand: 'linear-gradient(115deg, #FF2ECC 0%, #C9AFFF 52%, #38B6FF 100%)' },
  space: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px', 12: '48px', 16: '64px' },
  radius: { sm: '4px', md: '8px', lg: '16px', pill: '999px' },
  motion: { fast: '140ms', normal: '220ms' },
  typography: { body: 'Poppins, Arial, Helvetica, sans-serif', mono: 'ui-monospace, Consolas, monospace' },
} as const;
export type FewTheme = 'few' | 'dark' | 'caraminholas' | 'ifight';
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type Size = 'sm' | 'md' | 'lg';
export type Orientation = 'horizontal' | 'vertical';
