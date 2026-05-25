"use client";

import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay },
  }),
};

export function Hero() {
  return (
    <section
      className="relative overflow-hidden noise"
      style={{ paddingTop: '160px', paddingBottom: '120px' }}
    >
      {/* Mesh background */}
      <div
        className="absolute inset-0 mesh-bg"
        style={{ zIndex: 0 }}
      />

      <div
        className="relative mx-auto text-center px-6"
        style={{ maxWidth: '900px', zIndex: 1 }}
      >
        {/* Pill badge */}
        <motion.div
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-8"
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 group border border-black/10 rounded-full px-4 py-1.5 text-[13px] text-[#616161] no-underline bg-white/70 backdrop-blur-md transition-colors duration-200 hover:border-[#0066FF] hover:text-[#0066FF]"
          >
            <span>⚡</span>
            <span>Open Source · MIT · GitHub</span>
            <span style={{ fontSize: '12px' }}>→</span>
          </a>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            lineHeight: '1',
            letterSpacing: '-0.04em',
            fontWeight: 800,
            color: '#171717',
            marginBottom: '24px',
          }}
        >
          Готовый шаблон
          <br />
          <span className="gradient-text">под ваш SaaS проект</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={0.15}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto"
          style={{
            fontSize: '18px',
            color: '#616161',
            maxWidth: '620px',
            lineHeight: '1.6',
            marginBottom: '40px',
          }}
        >
          Форкни репозиторий, заполни .env, запускай. Всё остальное уже написано за тебя.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          custom={0.3}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-3"
          style={{ marginBottom: '64px' }}
        >
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-primary-new">
            <Github size={18} />
            Клонировать на GitHub
          </Link>
          <Link href="/register" className="btn-secondary-new">
            <ExternalLink size={16} />
            Смотреть демо
          </Link>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          custom={0.5}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className="animate-float-gentle mx-auto"
            style={{
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              background: '#fafafa',
              maxWidth: '860px',
              willChange: 'transform',
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                background: '#f0f0f0',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div
                style={{
                  flex: 1,
                  background: 'white',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#8e8e93',
                  fontFamily: 'monospace',
                }}
              >
                app.opensaas.dev/dashboard
              </div>
            </div>

            {/* Dashboard content */}
            <div style={{ padding: '24px', background: '#fafafa' }}>
              {/* Top stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'Пользователи', value: '2,847', change: '+12%', color: '#0066FF' },
                  { label: 'Выручка', value: '₽48,320', change: '+8%', color: '#34d399' },
                  { label: 'Активных', value: '1,203', change: '+5%', color: '#f59e0b' },
                  { label: 'API запросов', value: '89.2K', change: '+23%', color: '#8b5cf6' },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#8e8e93', marginBottom: '6px' }}>{item.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#171717', letterSpacing: '-0.02em' }}>{item.value}</div>
                    <div style={{ fontSize: '11px', color: item.color, marginTop: '4px' }}>{item.change} vs прошлый мес</div>
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '4px',
                }}
              >
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background: i === 11 ? '#0066FF' : `rgba(0,102,255,${0.15 + (h / 100) * 0.2})`,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
