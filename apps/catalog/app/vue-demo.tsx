"use client";
// Monta a demo Vue (@fewcompany/vue/demos) dentro da página React. Só no cliente: o export estático renderiza a demo React.
import { useEffect, useRef, useState } from 'react';
import { createApp, type App } from 'vue';
import { VUE_DEMOS } from '@fewcompany/vue/demos';

export const hasVueDemo = (id: string) => Boolean(VUE_DEMOS[id]);

export function VueDemo({ id }: { id: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const component = VUE_DEMOS[id];
    const element = host.current;
    if (!component || !element) return;
    let app: App | null = null;
    try { app = createApp(component); app.config.errorHandler = (err) => setError(String(err)); app.mount(element); setError(''); }
    catch (err) { setError(String(err)); }
    return () => { app?.unmount(); };
  }, [id]);
  if (!VUE_DEMOS[id]) return <p className="few-muted">Esta demonstração ainda não existe em Vue.</p>;
  return <>
    <div ref={host} data-framework="vue" />
    {error && <p role="alert" className="few-error">Erro ao montar a demo Vue: {error}</p>}
  </>;
}

/** Deriva a linha de import a partir das tags <FewX> usadas no snippet. */
export function vueImportLine(snippet: string) {
  const names = Array.from(new Set(Array.from(snippet.matchAll(/<(Few[A-Za-z]+)/g), match => match[1])));
  return names.length ? `import { ${names.join(', ')} } from '@fewcompany/vue';` : `import '@fewcompany/vue';`;
}
