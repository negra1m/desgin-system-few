"use client";
// Timeline: sequência de eventos (ver docs/composition.md).
import type { ComponentProps } from 'react';
import type { Orientation } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface TimelineProps extends ComponentProps<'ol'> { asChild?: boolean; orientation?: Orientation; align?: 'left' | 'right' | 'alternate' }
function TimelineRoot({ asChild, orientation = 'vertical', align = 'left', className, ...props }: TimelineProps) {
  const Comp = asChild ? Slot : 'ol';
  return <Comp {...props} className={cx('few-timeline', className)} data-orientation={orientation} data-align={align} />;
}

export interface TimelineItemProps extends ComponentProps<'li'> { asChild?: boolean; state?: 'complete' | 'current' | 'upcoming' }
function TimelineItem({ asChild, state = 'upcoming', className, ...props }: TimelineItemProps) {
  const Comp = asChild ? Slot : 'li';
  return <Comp {...props} className={cx('few-timeline-item', className)} data-state={state} />;
}

export interface TimelineIndicatorProps extends ComponentProps<'span'> { asChild?: boolean }
function TimelineIndicator({ asChild, className, ...props }: TimelineIndicatorProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-timeline-indicator', className)} />;
}

export interface TimelineConnectorProps extends ComponentProps<'span'> { asChild?: boolean }
function TimelineConnector({ asChild, className, ...props }: TimelineConnectorProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-timeline-connector', className)} />;
}

export interface TimelineContentProps extends ComponentProps<'div'> { asChild?: boolean }
function TimelineContent({ asChild, className, ...props }: TimelineContentProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-timeline-content', className)} />;
}

export interface TimelineTitleProps extends ComponentProps<'p'> { asChild?: boolean }
function TimelineTitle({ asChild, className, ...props }: TimelineTitleProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-timeline-title', className)} />;
}

export interface TimelineTimeProps extends ComponentProps<'time'> { asChild?: boolean }
function TimelineTime({ asChild, className, ...props }: TimelineTimeProps) {
  const Comp = asChild ? Slot : 'time';
  return <Comp {...props} className={cx('few-timeline-time', 'few-muted', className)} />;
}

export interface TimelineDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function TimelineDescription({ asChild, className, ...props }: TimelineDescriptionProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-timeline-description', 'few-muted', className)} />;
}

/** Timeline composto: <Timeline><Timeline.Item state="complete"><Timeline.Indicator/><Timeline.Content><Timeline.Title/><Timeline.Time dateTime="…"/></Timeline.Content></Timeline.Item></Timeline> */
export const Timeline = Object.assign(TimelineRoot, { Root: TimelineRoot, Item: TimelineItem, Indicator: TimelineIndicator, Connector: TimelineConnector, Content: TimelineContent, Title: TimelineTitle, Time: TimelineTime, Description: TimelineDescription });
export { TimelineRoot, TimelineItem, TimelineIndicator, TimelineConnector, TimelineContent, TimelineTitle, TimelineTime, TimelineDescription };
