import { cx } from './cx.js';

type AnyProps = Record<string, unknown>;

/** Mescla props do Slot com as do filho (padrão Radix): handlers compõem (filho primeiro), className concatena, style mescla, o resto do filho vence. */
export function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps };
  for (const key of Object.keys(childProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key)) {
      if (typeof slotValue === 'function' && typeof childValue === 'function') merged[key] = (...args: unknown[]) => { (childValue as (...a: unknown[]) => void)(...args); (slotValue as (...a: unknown[]) => void)(...args); };
      else if (typeof childValue === 'function') merged[key] = childValue;
    } else if (key === 'style') merged.style = { ...(slotValue as object), ...(childValue as object) };
    else if (key === 'className') merged.className = cx(slotValue as string, childValue as string);
    else if (childValue !== undefined) merged[key] = childValue;
  }
  return merged;
}
