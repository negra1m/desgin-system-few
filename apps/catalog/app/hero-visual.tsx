"use client";
import { useState, type PointerEvent } from 'react';

/** Brand artwork stays CSS/SVG: no canvas runtime, video or external requests. */
export function HeroVisual() {
  const [paused, setPaused] = useState(false);
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--tilt-x', `${((event.clientY - bounds.top) / bounds.height - .5) * -8}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 10}deg`);
  }
  return <div className="hero-visual" data-paused={paused} onPointerMove={tilt} onPointerLeave={event => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }}>
    <div className="visual-coordinate" aria-hidden="true"><span>FEW / CREATIVE ENGINE</span><span>01 — ∞</span></div>
    <div className="visual-depth" aria-hidden="true">
      <div className="visual-glow" />
      <svg className="visual-orbits" viewBox="0 0 500 500" fill="none">
        <defs><linearGradient id="orbit-gradient"><stop stopColor="#FF2ECC" /><stop offset=".5" stopColor="#C9AFFF" /><stop offset="1" stopColor="#38B6FF" /></linearGradient></defs>
        <circle cx="250" cy="250" r="184" stroke="#C9AFFF" strokeOpacity=".12" strokeDasharray="2 10" />
        <ellipse cx="250" cy="250" rx="232" ry="89" transform="rotate(-32 250 250)" stroke="url(#orbit-gradient)" strokeOpacity=".45" />
        <ellipse cx="250" cy="250" rx="212" ry="104" transform="rotate(45 250 250)" stroke="url(#orbit-gradient)" strokeOpacity=".2" />
        <path d="M18 310H110L155 355H390M356 45V118L430 192V265" stroke="#C9AFFF" strokeOpacity=".1" />
        <g className="orbit-satellite"><circle cx="78" cy="325" r="5" fill="#FF2ECC" /><circle cx="422" cy="175" r="4" fill="#38B6FF" /></g>
      </svg>
      <div className="visual-core"><div className="core-back" /><div className="core-front"><span className="core-reflection" /><img src="/brand/few-symbol.svg" alt="" width="146" height="156" /><span className="core-caption">PURPOSE SHAPES DIRECTION</span></div></div>
      <div className="floating-panel panel-component"><span className="panel-index">01 / COMPONENT</span><div className="mock-button">Criar o próximo <span>↗</span></div><div className="panel-code"><span>&lt;Button</span> variant="primary" <span>/&gt;</span></div></div>
      <div className="floating-panel panel-palette"><span className="panel-index">02 / IDENTITY</span><div className="palette-dots"><i /><i /><i /><i /></div><span className="palette-caption">Uma base. Infinitas expressões.</span></div>
      <span className="visual-spark spark-one">+</span><span className="visual-spark spark-two">+</span>
    </div>
    <div className="visual-bottom"><span><i /> PROJETADO PARA EVOLUIR</span><button type="button" aria-pressed={paused} aria-label={paused ? 'Retomar animação' : 'Pausar animação'} onClick={() => setPaused(!paused)}>{paused ? '▷' : 'Ⅱ'} <span>{paused ? 'Retomar' : 'Pausar'}</span></button></div>
  </div>;
}
