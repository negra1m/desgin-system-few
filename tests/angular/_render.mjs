// Helper dos testes Angular: carrega o compilador JIT (as libs do Angular são parcialmente compiladas) e o dist-full.
import '@angular/compiler';
export { renderComponent } from '../../packages/angular/dist-full/testing/render.js';
export * from '../../packages/angular/dist-full/demos/index.js';
