"use client";

import Link from "next/link";
import { Github, Send } from "lucide-react";

export function CTA() {
  return (
    <section style={{ padding: '0 0 120px', background: 'white' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {/* Dark gradient card */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0d0d12 0%, #161625 60%, #0f172a 100%)',
            borderRadius: '28px',
            padding: 'clamp(60px, 8vw, 100px) clamp(24px, 6vw, 80px)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Glow orbs */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              left: '15%',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,102,255,0.18) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-80px',
              right: '10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '40%',
              right: '5%',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Label */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '4px 14px',
              }}
            >
              Open Source · MIT
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: '1.05',
                color: 'white',
                marginBottom: '16px',
              }}
            >
              Начни прямо сейчас
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.55)',
                marginBottom: '40px',
                lineHeight: '1.6',
                maxWidth: '480px',
                margin: '0 auto 40px',
              }}
            >
              Открытый исходный код. Без ограничений. Форкай и запускай.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '28px',
              }}
            >
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#171717] rounded-xl px-7 no-underline tracking-tight transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                style={{
                  background: 'white',
                  height: '52px',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <Github size={18} />
                Клонировать на GitHub
              </Link>

              <a
                href="https://t.me/wellcome_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white rounded-xl px-7 no-underline tracking-tight transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  height: '52px',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                <Send size={16} />
                Подписаться в Telegram
              </a>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
              Бесплатно навсегда · MIT лицензия · Без кредитной карты
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
