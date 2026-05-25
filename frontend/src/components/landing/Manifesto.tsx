"use client";

import { Github } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function ManifestoSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 20%, #111113 60%, #111113 100%)',
        padding: '160px 0',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        {/* Label */}
        <div
          style={{
            fontSize: '12px',
            color: '#8e8e93',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '40px',
          }}
        >
          06 / МАНИФЕСТ
        </div>

        {/* Quote */}
        <blockquote
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: '1.05',
            color: 'white',
            margin: '0 0 32px',
          }}
        >
          «Каждый разработчик заслуживает запустить собственный продукт.»
        </blockquote>

        {/* Description */}
        <p
          style={{
            fontSize: '18px',
            color: '#c0c0c8',
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto 56px',
          }}
        >
          OpenSaaS — это не очередной boilerplate с устаревшим кодом. Это живой шаблон с продуманной архитектурой, который мы используем сами. MIT-лицензия. Никаких скрытых платежей. Форкай, дорабатывай, запускай.
        </p>

        {/* GitHub button */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-white text-[#111113] rounded-xl px-7 h-[52px] text-[15px] font-semibold tracking-tight no-underline shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        >
          <Github size={18} />
          ★ Звездануть на GitHub
        </a>
      </div>
    </section>
  );
}
