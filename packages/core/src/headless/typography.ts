// Headless da categoria "typography". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.

/** Plataforma para normalizar teclas do Kbd. Sem detecção automática: quem chama informa a plataforma. */
export type KbdPlatform = 'mac' | 'other';

const MAC_KEY_SYMBOLS: Record<string, string> = {
  Cmd: '⌘', Command: '⌘', Meta: '⌘',
  Ctrl: '⌃', Control: '⌃',
  Alt: '⌥', Option: '⌥',
  Shift: '⇧',
  Enter: '⏎', Return: '⏎',
  Backspace: '⌫', Delete: '⌦',
  Tab: '⇥', Escape: '⎋', Esc: '⎋',
};

/**
 * Normaliza uma sequência de teclas para exibição no Kbd.
 * `'Mod'` vira `Cmd` (mac) ou `Ctrl` (other); no mac, teclas conhecidas viram símbolo (⌘, ⇧, ⏎...).
 * Sem `window`/`navigator`: a plataforma é sempre um parâmetro explícito.
 */
export function normalizeKbdKeys(keys: string[], platform: KbdPlatform = 'other'): string[] {
  return keys.map(key => {
    const resolved = key === 'Mod' ? (platform === 'mac' ? 'Cmd' : 'Ctrl') : key;
    return platform === 'mac' ? (MAC_KEY_SYMBOLS[resolved] ?? resolved) : resolved;
  });
}
