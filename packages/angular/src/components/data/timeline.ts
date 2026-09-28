// Timeline: sequência de eventos (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/timeline.tsx.
import { Directive, input } from '@angular/core';
import type { Orientation } from '@fewcompany/core';

@Directive({
  selector: 'ol[fewTimeline]',
  host: { class: 'few-timeline', '[attr.data-orientation]': 'orientation()', '[attr.data-align]': 'align()' },
})
export class FewTimeline {
  readonly orientation = input<Orientation>('vertical');
  readonly align = input<'left' | 'right' | 'alternate'>('left');
}

@Directive({ selector: 'li[fewTimelineItem]', host: { class: 'few-timeline-item', '[attr.data-state]': 'state()' } })
export class FewTimelineItem {
  readonly state = input<'complete' | 'current' | 'upcoming'>('upcoming');
}

@Directive({ selector: '[fewTimelineIndicator]', host: { class: 'few-timeline-indicator', 'aria-hidden': 'true' } })
export class FewTimelineIndicator {}

@Directive({ selector: '[fewTimelineConnector]', host: { class: 'few-timeline-connector', 'aria-hidden': 'true' } })
export class FewTimelineConnector {}

@Directive({ selector: '[fewTimelineContent]', host: { class: 'few-timeline-content' } })
export class FewTimelineContent {}

@Directive({ selector: '[fewTimelineTitle]', host: { class: 'few-timeline-title' } })
export class FewTimelineTitle {}

@Directive({ selector: 'time[fewTimelineTime]', host: { class: 'few-timeline-time few-muted' } })
export class FewTimelineTime {}

@Directive({ selector: '[fewTimelineDescription]', host: { class: 'few-timeline-description few-muted' } })
export class FewTimelineDescription {}

/** Importe tudo de uma vez: `imports: [FEW_TIMELINE]`. */
export const FEW_TIMELINE = [FewTimeline, FewTimelineItem, FewTimelineIndicator, FewTimelineConnector, FewTimelineContent, FewTimelineTitle, FewTimelineTime, FewTimelineDescription] as const;
