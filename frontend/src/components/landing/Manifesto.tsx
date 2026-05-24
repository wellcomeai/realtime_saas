"use client";

import { Github } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { CountUp } from '@/components/ui/count-up';

const stats = [
  { value: 8,  suffix: '',  label: 'модулей' },
  { value: 10, suffix: '',  label: 'миграций' },
  { value: 40, suffix: '+', label: 'страниц' },
];

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
            color: '#8e8e93',
            lineHeight: '1.7',
            marginBottom: '72px',
            maxWidth: '600px',
            margin: '0 auto 72px',
          }}
        >
          OpenSaaS — это не очередной boilerplate с устаревшим кодом. Это живой шаблон с продуманной архитектурой, который мы используем сами. MIT-лицензия. Никаких скрытых платежей. Форкай, дорабатывай, запускай.
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '48px',
            marginBottom: '64px',
            flexWrap: 'wrap',
          }}
        >
          {stats.map((stat, i) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '56px',
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  <CountUp end={stat.value} suffix={stat.suffix} duration={1500} />
                </div>
                <div style={{ fontSize: '14px', color: '#8e8e93', marginTop: '8px' }}>
                  {stat.label}
                </div>
              </div>
              {i < stats.length - 1 && (
                <span style={{ color: '#3a3a3e', fontSize: '24px' }}>·</span>
              )}
            </div>
          ))}
        </div>

        {/* GitHub button */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'white',
            color: '#111113',
            borderRadius: '12px',
            padding: '0 28px',
            height: '52px',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            textDecoration: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
          }}
        >
          <Github size={18} />
          ★ Звездануть на GitHub
        </a>
      </div>
    </section>
  );
}
