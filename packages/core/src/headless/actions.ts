// Headless da categoria "actions". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.

export type ToggleGroupType = 'single' | 'multiple';
export type ToggleGroupValue = string | string[];

/** Indica se um item está selecionado no ToggleGroup, dado o tipo (single guarda string, multiple guarda string[]). */
export function isToggleGroupItemSelected(type: ToggleGroupType, current: ToggleGroupValue, itemValue: string): boolean {
  return type === 'multiple' ? (current as string[]).includes(itemValue) : current === itemValue;
}

/** Próximo valor do ToggleGroup ao alternar um item: single troca (ou limpa se já selecionado), multiple adiciona/remove. */
export function toggleGroupValue(type: ToggleGroupType, current: ToggleGroupValue, itemValue: string): ToggleGroupValue {
  if (type === 'multiple') {
    const list = current as string[];
    return list.includes(itemValue) ? list.filter(value => value !== itemValue) : [...list, itemValue];
  }
  return current === itemValue ? '' : itemValue;
}
