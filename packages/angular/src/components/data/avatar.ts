// Avatar: imagem com fallback de iniciais (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/avatar.tsx.
// Sem `delayMs` no Fallback (o React atrasa a exibição para evitar flash): simplificação documentada — o fallback aparece de imediato,
// o que é seguro em SSR (afterNextRender/setTimeout não rodam no servidor).
import { Component, Directive, computed, effect, inject, input, output, signal } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { getInitials } from '@fewcompany/core';

export type FewAvatarImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

@Directive({
  selector: '[fewAvatar]',
  exportAs: 'fewAvatar',
  host: {
    class: 'few-avatar',
    '[attr.role]': 'name() ? "img" : null',
    '[attr.aria-label]': 'name() ?? null',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
  },
})
export class FewAvatar {
  readonly size = input<Size | 'xl'>('md');
  readonly shape = input<'circle' | 'square'>('circle');
  readonly name = input<string | undefined>(undefined);
  /** Estado de carregamento da imagem, atualizado por `Avatar.Image`. Lido pelo Fallback para se esconder quando `loaded`. */
  readonly status = signal<FewAvatarImageStatus>('idle');
}

/** `<img fewAvatarImage [src]="url">`: usa `src`/`alt` próprios (em vez do binding nativo) para acompanhar o load/error. */
@Directive({
  selector: 'img[fewAvatarImage]',
  host: {
    class: 'few-avatar-image',
    '[attr.src]': 'src()',
    '[attr.alt]': 'alt() ?? ""',
    '[attr.data-state]': 'avatar.status()',
    '(load)': 'onLoad()',
    '(error)': 'onError()',
  },
})
export class FewAvatarImage {
  protected readonly avatar = inject(FewAvatar);
  readonly src = input<string | undefined>(undefined);
  readonly alt = input<string | undefined>(undefined);
  readonly loadingStatusChange = output<FewAvatarImageStatus>();

  constructor() {
    effect(() => {
      this.src();
      this.avatar.status.set('loading');
      this.loadingStatusChange.emit('loading');
    });
  }
  protected onLoad() { this.avatar.status.set('loaded'); this.loadingStatusChange.emit('loaded'); }
  protected onError() { this.avatar.status.set('error'); this.loadingStatusChange.emit('error'); }
}

/**
 * `<span fewAvatarFallback></span>`: mostra as iniciais de `Avatar.name` via fallback nativo de `<ng-content>`
 * (Angular 19+) quando o consumidor não projeta conteúdo próprio — equivale a `children ?? getInitials(name)` no React.
 */
@Component({
  selector: '[fewAvatarFallback]',
  host: {
    class: 'few-avatar-fallback',
    '[attr.aria-hidden]': 'avatar.name() ? null : true',
    '[hidden]': 'avatar.status() === "loaded"',
  },
  template: `<ng-content>{{ initials() }}</ng-content>`,
})
export class FewAvatarFallback {
  protected readonly avatar = inject(FewAvatar);
  protected readonly initials = computed(() => (this.avatar.name() ? getInitials(this.avatar.name() as string) : ''));
}

@Directive({
  selector: '[fewAvatarStatus]',
  host: { class: 'few-avatar-status', 'aria-hidden': 'true', '[attr.data-status]': 'status()' },
})
export class FewAvatarStatus {
  readonly status = input<'online' | 'offline' | 'busy' | 'away'>('offline');
}

/** Importe tudo de uma vez: `imports: [FEW_AVATAR]`. */
export const FEW_AVATAR = [FewAvatar, FewAvatarImage, FewAvatarFallback, FewAvatarStatus] as const;
