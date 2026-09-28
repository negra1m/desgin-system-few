// Renderiza um componente para HTML em Node (SSR), para testes de contrato sem navegador.
import { createSSRApp, type Component } from 'vue';
import { renderToString } from '@vue/server-renderer';

export async function renderComponent(component: Component, props: Record<string, unknown> = {}): Promise<string> {
  const app = createSSRApp(component, props);
  return renderToString(app);
}
