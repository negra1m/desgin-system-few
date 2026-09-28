// Renderiza um componente standalone para HTML em Node (SSR), para testes de contrato sem navegador.
import { provideZonelessChangeDetection, reflectComponentType, type Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';

export async function renderComponent(component: Type<unknown>): Promise<string> {
  const selector = reflectComponentType(component)?.selector ?? 'app-root';
  const html = await renderApplication((context) => bootstrapApplication(component, { providers: [provideZonelessChangeDetection(), provideServerRendering()] }, context), { document: `<!doctype html><html><body><${selector}></${selector}></body></html>` });
  const start = html.indexOf(`<${selector}`);
  const end = html.lastIndexOf(`</${selector}>`);
  return start >= 0 && end >= 0 ? html.slice(start, end + selector.length + 3) : html;
}
