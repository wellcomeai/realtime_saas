"use client";

import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: '#0a0a0a',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            color: copied ? '#34d399' : '#8e8e93',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '20px 24px',
          fontFamily: 'Geist Mono, Fira Code, monospace',
          fontSize: '13px',
          color: '#e5e5e5',
          lineHeight: '1.8',
          overflowX: 'auto',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

const step1Code = `git clone https://github.com/your/opensaas
cd opensaas && cp .env.example .env`;

const step2Code = `docker-compose up -d
cd backend && alembic upgrade head
python scripts/create_admin.py`;

const deployBadges = [
  { name: 'Render', color: '#46E3B7', bg: '#0a0a0a' },
  { name: 'Vercel', color: '#ffffff', bg: '#000000' },
  { name: 'Docker', color: '#2496ED', bg: '#f5f5f7' },
];

const extras = [
  'alembic upgrade head — при старте автоматически',
  'Создание админа — идемпотентно',
  'Redis опционален — PostgreSQL fallback работает из коробки',
];

export function HowToStartSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="how-to-start"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal"
      style={{
        background: 'linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%)',
        padding: '120px 0',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="text-center mb-16">
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
            05 / КАК НАЧАТЬ
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: '1.05',
              color: '#171717',
            }}
          >
            От нуля до рабочего SaaS за 3 шага
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '720px', margin: '0 auto 64px' }}>
          {/* Step 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                className="gradient-text"
                style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#171717', letterSpacing: '-0.01em' }}>
                  Клонировать
                </div>
                <div style={{ fontSize: '14px', color: '#616161' }}>Скачай и настрой окружение</div>
              </div>
            </div>
            <CodeBlock code={step1Code} />
          </div>

          {/* Step 2 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                className="gradient-text"
                style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#171717', letterSpacing: '-0.01em' }}>
                  Запустить
                </div>
                <div style={{ fontSize: '14px', color: '#616161' }}>Docker, миграции, первый админ</div>
              </div>
            </div>
            <CodeBlock code={step2Code} />
          </div>

          {/* Step 3 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                className="gradient-text"
                style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#171717', letterSpacing: '-0.01em' }}>
                  Деплоить
                </div>
                <div style={{ fontSize: '14px', color: '#616161' }}>Поддержка Render + Vercel из коробки</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {deployBadges.map(badge => (
                <div
                  key={badge.name}
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: badge.bg === '#f5f5f7' ? '1px solid rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {badge.name}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#8e8e93', marginTop: '12px' }}>
              Документация для каждого варианта деплоя в репозитории.
            </p>
          </div>
        </div>

        {/* Extras */}
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            background: '#f5f5f7',
            borderRadius: '16px',
            padding: '24px 28px',
          }}
        >
          {extras.map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: '14px',
                color: '#616161',
              }}
            >
              <span style={{ color: '#0066FF', fontWeight: 700, flexShrink: 0 }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
