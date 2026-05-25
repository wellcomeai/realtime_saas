"use client";

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { TerminalMockup } from './TerminalMockup';

export function AIAgentsSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="ai-agents"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal"
      style={{
        background: 'linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%)',
        padding: '120px 0',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div>
            <div
              style={{
                fontSize: '12px',
                color: '#0066FF',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              04 / AI-АГЕНТЫ
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: '1.05',
                color: '#171717',
                marginBottom: '24px',
              }}
            >
              Создан для работы с AI-агентами
            </h2>
            <p style={{ fontSize: '16px', color: '#616161', lineHeight: '1.7', marginBottom: '24px' }}>
              Каждый модуль содержит <code style={{ fontFamily: 'monospace', background: '#f5f5f7', padding: '2px 6px', borderRadius: '4px', fontSize: '14px' }}>CLAUDE.md</code> — файл с контекстом архитектуры, паттернами кода и правилами безопасности.
            </p>
            <p style={{ fontSize: '16px', color: '#616161', lineHeight: '1.7', marginBottom: '32px' }}>
              Claude Code, Cursor и другие AI-инструменты сразу понимают структуру проекта и дорабатывают его без лишних вопросов.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#0066FF',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Смотреть CLAUDE.md →
            </a>
          </div>

          {/* Right column — terminal */}
          <div className="ai-terminal-wrap">
            <TerminalMockup />
          </div>
        </div>
      </div>

      <style jsx>{`
        .ai-terminal-wrap > :global(div) {
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .ai-terminal-wrap:hover > :global(div) {
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(52, 211, 153, 0.1);
        }
      `}</style>
    </section>
  );
}
