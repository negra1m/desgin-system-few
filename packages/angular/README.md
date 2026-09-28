# @fewcompany/angular

Adaptador Angular 22 (standalone, signals, zoneless) do design system da Few Company, sobre `@fewcompany/core`. Mesmo CSS, mesmas classes `few-*`, mesmos `data-state` e comportamento de teclado do adaptador React.

```ts
import { FEW_TABS, FewButton, FEW_DIALOG } from '@fewcompany/angular';

@Component({
  imports: [FEW_TABS, FewButton, FEW_DIALOG],
  template: `
    <div fewTabs [(value)]="tab">
      <div fewTabsList>
        <button fewTabsTrigger value="resumo">Resumo</button>
        <button fewTabsTrigger value="atividade">Atividade</button>
      </div>
      <div fewTabsContent value="resumo">…</div>
    </div>

    <div fewDialog>
      <button fewDialogTrigger fewButton>Compartilhar</button>
      <dialog fewDialogContent>
        <h2 fewDialogTitle>Pronto?</h2>
        <button fewDialogClose fewButton variant="secondary">Voltar</button>
      </dialog>
    </div>
  `,
})
export class Example { tab = signal('resumo'); }
```

Importe `@fewcompany/angular/styles.css` uma vez (em `styles.css` do app ou `angular.json`). Temas por `data-few-theme` em qualquer contêiner.

Padrão (ver `docs/composition-angular.md`): cada parte é uma diretiva de atributo aplicada no elemento do consumidor (`<button fewTabsTrigger>`), o que dispensa `asChild`; estado por `model()` (`[(value)]`, `[(open)]`, `[(checked)]`); opções por `input()`; contexto por injeção; overlays em `<dialog>` e `popover` nativos. Arrays `FEW_X` agrupam as partes de cada componente para `imports`.

Sem `@angular/forms` (ControlValueAccessor fica para uma versão futura) e sem `@angular/cdk`. Testes de contrato rodam por SSR (`@angular/platform-server`) em `tests/angular/`; os hosts de demonstração ficam em `src/demos`.
