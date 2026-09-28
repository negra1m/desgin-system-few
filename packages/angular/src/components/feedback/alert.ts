// Alert (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/alert.tsx.
import { Component, Directive, computed, inject, input, output } from '@angular/core';
import type { Tone } from '@fewcompany/core';

export type AlertVariant = 'soft' | 'outline';

const DEFAULT_ICON: Record<Tone, string> = { neutral: '•', success: '✓', warning: '!', danger: '!', info: 'i' };

/** Raiz: `<div fewAlert tone="success" variant="soft">`. role="alert" em danger, "status" nas demais tones. */
@Directive({
  selector: '[fewAlert]',
  exportAs: 'fewAlert',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-variant]': 'variant()',
  },
})
export class FewAlert {
  readonly tone = input<Tone>('info');
  readonly variant = input<AlertVariant>('soft');
  protected readonly role = computed(() => (this.tone() === 'danger' ? 'alert' : 'status'));
  protected readonly classes = computed(() => `few-alert few-tone--${this.tone()} few-alert--${this.variant()}`);
}

/** Ícone: `<span fewAlertIcon></span>`. Sem conteúdo projetado, cai no ícone padrão da tone. */
@Component({
  selector: '[fewAlertIcon]',
  host: { class: 'few-alert-icon', 'aria-hidden': 'true' },
  template: `<ng-content>{{ defaultIcon() }}</ng-content>`,
})
export class FewAlertIcon {
  private readonly alert = inject(FewAlert);
  protected readonly defaultIcon = computed(() => DEFAULT_ICON[this.alert.tone()]);
}

@Directive({ selector: '[fewAlertTitle]', host: { class: 'few-alert-title' } })
export class FewAlertTitle {}

@Directive({ selector: '[fewAlertDescription]', host: { class: 'few-alert-description' } })
export class FewAlertDescription {}

@Directive({ selector: '[fewAlertAction]', host: { class: 'few-alert-action' } })
export class FewAlertAction {}

/** Fechar: `<button fewAlertClose (dismiss)="...">`. Sem conteúdo projetado, cai no × padrão. */
@Component({
  selector: '[fewAlertClose]',
  host: {
    class: 'few-alert-close', type: 'button',
    '[attr.aria-label]': 'ariaLabel()',
    '(click)': 'dismiss.emit()',
  },
  template: `<ng-content><span aria-hidden="true">×</span></ng-content>`,
})
export class FewAlertClose {
  readonly ariaLabel = input('Fechar', { alias: 'aria-label' });
  readonly dismiss = output<void>();
}

/** Importe tudo de uma vez: `imports: [FEW_ALERT]`. */
export const FEW_ALERT = [FewAlert, FewAlertIcon, FewAlertTitle, FewAlertDescription, FewAlertAction, FewAlertClose] as const;
