// Demos/hosts de teste da categoria "Feedback" (pasta components/feedback). Um componente por id do registry.
import { defineComponent, h, type Component } from 'vue';
import { FewAlert, FewAlertIcon, FewAlertTitle, FewAlertDescription, FewAlertClose } from '../components/feedback/alert.js';
import { FewBadge } from '../components/feedback/badge.js';
import { FewTag, FewTagLabel, FewTagIcon, FewTagClose } from '../components/feedback/tag.js';
import { FewProgress, FewProgressLabel, FewProgressTrack, FewProgressIndicator, FewProgressValue } from '../components/feedback/progress.js';
import { FewProgressCircle, FewProgressCircleCircle, FewProgressCircleLabel } from '../components/feedback/progress-circle.js';
import { FewSpinner } from '../components/feedback/spinner.js';
import { FewSkeleton } from '../components/feedback/skeleton.js';
import { FewEmptyState, FewEmptyStateIcon, FewEmptyStateTitle, FewEmptyStateDescription, FewEmptyStateActions } from '../components/feedback/empty-state.js';

export const DemoAlert = defineComponent({
  name: 'DemoAlert',
  setup() {
    return () => h('div', null, [
      h(FewAlert, { tone: 'info' }, () => [
        h(FewAlertIcon),
        h(FewAlertTitle, null, () => 'Atualização disponível'),
        h(FewAlertDescription, null, () => 'Uma nova versão do painel está pronta para instalar.'),
      ]),
      h(FewAlert, { tone: 'danger' }, () => [
        h(FewAlertIcon),
        h(FewAlertTitle, null, () => 'Falha ao publicar'),
        h(FewAlertDescription, null, () => 'Não foi possível publicar as alterações. Tente novamente.'),
        h(FewAlertClose, { onDismiss: () => {} }),
      ]),
    ]);
  },
});

export const DemoBadge = defineComponent({
  name: 'DemoBadge',
  setup() {
    return () => h('div', null, [
      h(FewBadge, { tone: 'success', dot: true }, () => 'Ativo'),
      h(FewBadge, { tone: 'warning', variant: 'outline' }, () => 'Pendente'),
    ]);
  },
});

export const DemoTag = defineComponent({
  name: 'DemoTag',
  setup() {
    return () => h(FewTag, { tone: 'info' }, () => [
      h(FewTagIcon, null, () => '#'),
      h(FewTagLabel, null, () => 'React'),
      h(FewTagClose, { label: 'React', onRemove: () => {} }),
    ]);
  },
});

export const DemoProgress = defineComponent({
  name: 'DemoProgress',
  setup() {
    return () => h(FewProgress, { value: 120, max: 100, tone: 'success' }, () => [
      h(FewProgressLabel, null, () => 'Importação de dados'),
      h(FewProgressTrack, null, () => h(FewProgressIndicator)),
      h(FewProgressValue),
    ]);
  },
});

export const DemoProgressCircle = defineComponent({
  name: 'DemoProgressCircle',
  setup() {
    return () => h(FewProgressCircle, { value: 40, tone: 'info' }, () => [
      h(FewProgressCircleCircle),
      h(FewProgressCircleLabel),
    ]);
  },
});

export const DemoSpinner = defineComponent({
  name: 'DemoSpinner',
  setup() {
    return () => h(FewSpinner, { label: 'Carregando pedidos', tone: 'info' });
  },
});

export const DemoSkeleton = defineComponent({
  name: 'DemoSkeleton',
  setup() {
    return () => h('div', null, [
      h(FewSkeleton, { variant: 'text', lines: 3 }),
      h(FewSkeleton, { variant: 'circle', width: 40, height: 40 }),
    ]);
  },
});

export const DemoEmptyState = defineComponent({
  name: 'DemoEmptyState',
  setup() {
    return () => h(FewEmptyState, null, () => [
      h(FewEmptyStateIcon),
      h(FewEmptyStateTitle, null, () => 'Nenhum resultado'),
      h(FewEmptyStateDescription, null, () => 'Ajuste os filtros ou tente outra busca.'),
      h(FewEmptyStateActions, null, () => h('button', { type: 'button' }, 'Limpar filtros')),
    ]);
  },
});

export const FEEDBACK_DEMOS: Record<string, Component> = {
  alert: DemoAlert,
  badge: DemoBadge,
  tag: DemoTag,
  progress: DemoProgress,
  'progress-circle': DemoProgressCircle,
  spinner: DemoSpinner,
  skeleton: DemoSkeleton,
  'empty-state': DemoEmptyState,
};
