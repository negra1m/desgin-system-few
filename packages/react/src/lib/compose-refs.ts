import type { Ref, RefCallback } from 'react';

export function setRef<T>(ref: Ref<T> | undefined | null, value: T | null): void | (() => void) {
  if (typeof ref === 'function') return ref(value) as void | (() => void);
  if (ref) (ref as { current: T | null }).current = value;
}

/** Combina refs (callback ou objeto). Necessário quando Slot precisa expor o ref do filho e o do pai. */
export function composeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map(ref => setRef(ref, node));
    return () => { cleanups.forEach((cleanup, index) => { if (typeof cleanup === 'function') cleanup(); else setRef(refs[index], null); }); };
  };
}
