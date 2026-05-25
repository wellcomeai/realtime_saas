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
            className="inline-flex items-center gap-2 bg-[#171717] text-white rounded-xl px-7 h-[52px] text-[15px] font-semibold tracking-tight no-underline shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200 hover:scale-[1.02] hover:bg-black"
          >
            <Github size={18} />
            Клонировать на GitHub
          </Link>

          <a
            href="https://t.me/wellcome_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0066FF] text-white rounded-xl px-7 h-[52px] text-[15px] font-semibold tracking-tight no-underline shadow-[0_4px_16px_rgba(0,102,255,0.3)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_28px_rgba(0,102,255,0.5)]"
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
