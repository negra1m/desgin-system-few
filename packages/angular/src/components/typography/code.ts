// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/typography/code.tsx.
import { Component, Directive, ElementRef, booleanAttribute, input, signal, viewChild } from '@angular/core';

export type CodeVariant = 'soft' | 'outline';

/** Código inline: aplique em `<code fewCode>` do consumidor. Sem efeito de bloco — use `FewCodeBlock` para isso. */
@Directive({
  selector: 'code[fewCode]',
  host: {
    class: 'few-code',
    '[attr.data-variant]': 'variant()',
    '[attr.data-lang]': 'lang()',
  },
})
export class FewCode {
  readonly variant = input<CodeVariant>('soft');
  /** Linguagem do trecho, exposta só como data-lang (sem syntax highlight). */
  readonly lang = input<string>();
}

/**
 * Código em bloco: `<pre fewCodeBlock>...</pre>`, rolagem horizontal e por teclado (tabindex 0), cópia opcional.
 * Sem `document`, o botão de copiar não é renderizado (guard) e `copy()` não é chamado fora de handler de usuário.
 */
@Component({
  selector: 'pre[fewCodeBlock]',
  host: {
    class: 'few-code',
    'data-block': '',
    tabindex: '0',
    '[attr.data-lang]': 'lang()',
  },
  template: `
    <code class="few-code-code" #codeEl><ng-content /></code>
    @if (copyable()) {
      <button type="button" class="few-code-copy" (click)="copy()" aria-label="Copiar código">{{ copied() ? 'Copiado' : 'Copiar' }}</button>
      <span role="status" aria-live="polite" class="few-sr-only">{{ copied() ? 'Copiado' : '' }}</span>
    }
  `,
})
export class FewCodeBlock {
  readonly lang = input<string>();
  /** Mostra um botão de copiar. */
  readonly copyable = input(false, { transform: booleanAttribute });
  protected readonly copied = signal(false);
  private readonly codeEl = viewChild<ElementRef<HTMLElement>>('codeEl');
  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  protected async copy() {
    const text = this.codeEl()?.nativeElement.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => this.copied.set(false), 2000);
    } catch {
      /* clipboard indisponível (permissão/contexto não seguro); botão fica sem feedback de sucesso */
    }
  }
}

export const FEW_CODE = [FewCode, FewCodeBlock] as const;
