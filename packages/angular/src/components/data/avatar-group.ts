// AvatarGroup: empilha Avatars e mostra "+N" a partir de `max` (ver docs/composition-angular.md).
// Fonte da verdade: packages/react/src/components/data/avatar-group.tsx.
// Diferença documentada: o React corta o array de avatares em `max` (menos nós no DOM); aqui `contentChildren` só CONTA
// os avatares projetados para calcular o "+N" — o consumidor deve projetar no máximo `max` `Avatar`s mais o `Overflow`.
import { Component, Directive, computed, contentChildren, inject, input } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { FewAvatar } from './avatar.js';

@Directive({
  selector: '[fewAvatarGroup]',
  exportAs: 'fewAvatarGroup',
  host: {
    class: 'few-avatar-group',
    role: 'group',
    '[attr.data-size]': 'size()',
    '[style.--few-avatar-group-spacing]': 'spacingValue()',
  },
})
export class FewAvatarGroup {
  readonly max = input<number | undefined>(undefined);
  readonly size = input<Size | 'xl'>('md');
  readonly spacing = input<string | number | undefined>(undefined);
  private readonly avatars = contentChildren(FewAvatar, { descendants: true });
  /** Total de `Avatar`s projetados — usado pelo `Overflow` para calcular `total - max`. */
  readonly total = computed(() => this.avatars().length);
  protected readonly spacingValue = computed(() => {
    const s = this.spacing();
    if (s === undefined) return null;
    return typeof s === 'number' ? `${s}px` : s;
  });
}

/** `<span fewAvatarGroupOverflow></span>`: fica no DOM com `[hidden]` quando não há excedente (equivale a retornar null no React). */
@Component({
  selector: '[fewAvatarGroupOverflow]',
  host: {
    class: 'few-avatar few-avatar-group-overflow',
    '[attr.data-size]': 'group.size()',
    '[hidden]': 'extra() <= 0',
  },
  template: `<ng-content>+{{ extra() }}</ng-content>`,
})
export class FewAvatarGroupOverflow {
  protected readonly group = inject(FewAvatarGroup);
  protected readonly extra = computed(() => {
    const max = this.group.max();
    return typeof max === 'number' ? this.group.total() - max : 0;
  });
}

/** Importe tudo de uma vez: `imports: [FEW_AVATAR_GROUP]`. */
export const FEW_AVATAR_GROUP = [FewAvatarGroup, FewAvatarGroupOverflow] as const;
