import { computed, ref, type ComputedRef, type Ref } from 'vue';

/**
 * Estado controlado ou não (padrão `value` + `defaultValue` + `update:value`, compatível com `v-model:value`).
 * Controlado quando a prop não é `undefined`; `onChange` só dispara quando o valor muda de fato.
 */
export function useControllable<T>(getProp: () => T | undefined, defaultValue: T, onChange?: (value: T) => void): [ComputedRef<T>, (next: T | ((previous: T) => T)) => void] {
  const internal = ref(defaultValue) as Ref<T>;
  const value = computed<T>(() => { const prop = getProp(); return prop === undefined ? internal.value : prop; });
  const setValue = (next: T | ((previous: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(value.value) : next;
    if (Object.is(resolved, value.value)) return;
    if (getProp() === undefined) internal.value = resolved;
    onChange?.(resolved);
  };
  return [value, setValue];
}
