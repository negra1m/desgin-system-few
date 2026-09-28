// Cálculo puro de posição de um elemento flutuante em relação a uma âncora (sem DOM). Usado pelos adaptadores.
export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';
export type FloatingAlign = 'start' | 'center' | 'end';
export interface Rect { top: number; left: number; width: number; height: number }
export interface Viewport { width: number; height: number }
export interface FloatingOptions { side?: FloatingSide; align?: FloatingAlign; offset?: number; margin?: number }
export interface FloatingPosition { top: number; left: number; side: FloatingSide }

const opposite: Record<FloatingSide, FloatingSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

function place(anchor: Rect, floating: Rect, side: FloatingSide, align: FloatingAlign, offset: number) {
  const anchorRight = anchor.left + anchor.width, anchorBottom = anchor.top + anchor.height;
  let top = 0, left = 0;
  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? anchor.top - floating.height - offset : anchorBottom + offset;
    left = align === 'start' ? anchor.left : align === 'end' ? anchorRight - floating.width : anchor.left + anchor.width / 2 - floating.width / 2;
  } else {
    left = side === 'left' ? anchor.left - floating.width - offset : anchorRight + offset;
    top = align === 'start' ? anchor.top : align === 'end' ? anchorBottom - floating.height : anchor.top + anchor.height / 2 - floating.height / 2;
  }
  return { top, left };
}

/** Posição com flip para o lado oposto quando não cabe e clamp dentro do viewport. */
export function computeFloatingPosition(anchor: Rect, floating: Rect, viewport: Viewport, { side = 'bottom', align = 'start', offset = 6, margin = 8 }: FloatingOptions = {}): FloatingPosition {
  const fits = (p: { top: number; left: number }) => p.top >= margin && p.top + floating.height <= viewport.height - margin && p.left >= margin && p.left + floating.width <= viewport.width - margin;
  let finalSide = side;
  let pos = place(anchor, floating, side, align, offset);
  if (!fits(pos)) { const flipped = place(anchor, floating, opposite[side], align, offset); if (fits(flipped)) { pos = flipped; finalSide = opposite[side]; } }
  return {
    top: Math.max(margin, Math.min(pos.top, viewport.height - floating.height - margin)),
    left: Math.max(margin, Math.min(pos.left, viewport.width - floating.width - margin)),
    side: finalSide,
  };
}
