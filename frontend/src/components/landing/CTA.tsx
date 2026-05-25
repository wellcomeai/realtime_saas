"use client";

import Link from "next/link";
import { Github, Send } from "lucide-react";

export function CTA() {
  return (
    <section
      style={{
        background: 'white',
        padding: '120px 0',
      }}
    >
      <div
        style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}
      >
        <h2
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: '1.05',
            color: '#171717',
            marginBottom: '16px',
          }}
        >
          Начни прямо сейчас
        </h2>

        <p
          style={{
            fontSize: '18px',
            color: '#616161',
            marginBottom: '40px',
            lineHeight: '1.6',
          }}
        >
          Открытый исходный код. MIT лицензия. Без ограничений.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#171717',
              color: 'white',
              borderRadius: '12px',
              padding: '0 28px',
              height: '52px',
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              transition: 'transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.background = '#000000';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = '#171717';
            }}
          >
            <Github size={18} />
            Клонировать на GitHub
          </Link>

          <a
            href="https://t.me/wellcome_ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0066FF',
              color: 'white',
              borderRadius: '12px',
              padding: '0 28px',
              height: '52px',
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              transition: 'transform 0.15s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 16px rgba(0, 102, 255, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(0, 102, 255, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 102, 255, 0.3)';
            }}
          >
            <Send size={16} />
            Подписаться в Telegram
          </a>
        </div>

        <p style={{ fontSize: '13px', color: '#8e8e93' }}>
          Бесплатно навсегда · MIT лицензия · Без кредитной карты
        </p>
      </div>
    </section>
  );
}
