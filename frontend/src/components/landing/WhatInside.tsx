"use client";

import { Shield, CreditCard, Gift, Bot } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const cards = [
  {
    Icon: Shield,
    color: '#0066FF',
    bg: 'rgba(0,102,255,0.08)',
    title: 'Регистрация пользователей',
    text: 'Вход, выход, подтверждение email, сброс пароля — работает из коробки',
    tip: 'JWT + email-верификация',
  },
  {
    Icon: CreditCard,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    title: 'Приём платежей',
    text: 'Робокасса уже интегрирована. Просто вставьте ключи в .env',
    tip: 'Webhook + история транзакций',
  },
  {
    Icon: Gift,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    title: 'Реферальная программа',
    text: 'Пользователи приглашают друзей — вы получаете больше клиентов автоматически',
    tip: '20% с каждого платежа',
  },
  {
    Icon: Bot,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    title: 'AI-агенты понимают код',
    text: 'Каждый модуль содержит CLAUDE.md — AI дорабатывает проект без лишних вопросов',
    tip: 'Claude Code · Cursor · Copilot',
  },
];

export function WhatInside() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal"
      style={{
        background: '#ffffff',
        padding: '120px 0',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: '1.05',
              color: '#171717',
              marginBottom: '16px',
            }}
          >
            Всё уже написано за вас
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#616161',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Не тратьте месяцы на инфраструктуру — сосредоточьтесь на своей идее
          </p>
        </div>

        {/* Cards 2×2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="wi-card"
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '20px',
                padding: '32px',
                transition: 'all 0.25s ease',
                animation: 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
                animationDelay: `${i * 0.1}s`,
                cursor: 'default',
              }}
            >
              {/* Icon badge */}
              <div
                className="tooltip"
                data-tip={card.tip}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: card.bg,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <card.Icon size={24} color={card.color} strokeWidth={1.75} />
              </div>

              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#171717',
                  letterSpacing: '-0.015em',
                  marginBottom: '8px',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  color: '#616161',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .wi-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 102, 255, 0.2) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </section>
  );
}
