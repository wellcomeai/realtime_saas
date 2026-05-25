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
          padding: '6px 10px',
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
          padding: '16px 18px',
          fontFamily: 'Geist Mono, Fira Code, monospace',
          fontSize: '12.5px',
          color: '#e5e5e5',
          lineHeight: '1.7',
          overflowX: 'auto',
          minHeight: '120px',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

const steps = [
  {
    num: '1',
    title: 'Клонировать',
    code: `git clone https://github.com/your/opensaas
cp .env.example .env`,
  },
  {
    num: '2',
    title: 'Запустить',
    code: `docker-compose up -d
alembic upgrade head
python create_admin.py`,
  },
  {
    num: '3',
    title: 'Деплоить',
    code: `# Render / Vercel / Docker
# — на выбор`,
  },
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
        <div className="text-center" style={{ marginBottom: '72px' }}>
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

        {/* Timeline */}
        <div className="hts-timeline">
          {/* Horizontal line (desktop only) */}
          <div className="hts-line-track" aria-hidden="true">
            <div className="hts-line-fill" />
          </div>

          <div className="hts-grid">
            {steps.map((step, i) => (
              <div key={step.num} className="hts-step" style={{ animationDelay: `${i * 0.15}s` }}>
                {/* Connector dot */}
                <div className="hts-dot" />

                <div className="hts-card">
                  <div className="hts-num gradient-text">{step.num}</div>
                  <div className="hts-title">{step.title}</div>
                  <CodeBlock code={step.code} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hts-timeline {
          position: relative;
        }
        .hts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          position: relative;
          z-index: 1;
        }

        .hts-step {
          position: relative;
          opacity: 0;
          transform: translateY(16px);
        }
        :global(.reveal.visible) .hts-step {
          animation: hts-step-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes hts-step-in {
          to { opacity: 1; transform: translateY(0); }
        }

        .hts-dot {
          display: none;
        }

        .hts-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.07);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
        }
        .hts-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 102, 255, 0.25);
          box-shadow: 0 8px 32px rgba(0, 102, 255, 0.1);
        }

        .hts-num {
          font-size: 48px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 12px;
        }
        .hts-title {
          font-size: 18px;
          font-weight: 700;
          color: #171717;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
        }

        .hts-line-track {
          display: none;
        }

        @media (min-width: 768px) {
          .hts-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .hts-line-track {
            display: block;
            position: absolute;
            top: 28px;
            left: 12%;
            right: 12%;
            height: 2px;
            background: rgba(0, 102, 255, 0.12);
            border-radius: 2px;
            overflow: hidden;
            z-index: 0;
          }
          .hts-line-fill {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, #0066FF, #6366f1);
            transform: scaleX(0);
            transform-origin: left center;
          }
          :global(.reveal.visible) .hts-line-fill {
            animation: hts-line-grow 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
          }
          @keyframes hts-line-grow {
            to { transform: scaleX(1); }
          }
          .hts-dot {
            display: block;
            position: absolute;
            top: 22px;
            left: 50%;
            transform: translateX(-50%);
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            border: 3px solid #0066FF;
            box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
            z-index: 2;
          }
          .hts-card {
            margin-top: 56px;
          }
        }
      `}</style>
    </section>
  );
}
