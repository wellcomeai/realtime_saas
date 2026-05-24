"use client";

import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Copy, Check } from 'lucide-react';

const steps = [
  {
    num: '1',
    title: 'Поделись ссылкой',
    desc: 'Получи уникальную реферальную ссылку в личном кабинете и отправь другу.',
  },
  {
    num: '2',
    title: 'Друг регистрируется',
    desc: 'Новый пользователь регистрируется по твоей ссылке или с твоим промокодом.',
  },
  {
    num: '3',
    title: 'Получаешь 20%',
    desc: 'С каждого платежа приглашённого — 20% приходит тебе. Автоматически.',
  },
];

function StepCard({ step }: { step: (typeof steps)[number] }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div
        className="gradient-text"
        style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1, marginBottom: '12px', display: 'block' }}
      >
        {step.num}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#171717', marginBottom: '8px', letterSpacing: '-0.01em' }}>
        {step.title}
      </div>
      <p style={{ fontSize: '13px', color: '#616161', lineHeight: '1.6', margin: 0 }}>
        {step.desc}
      </p>
    </div>
  );
}

export function ReferralSection() {
  const sectionRef = useScrollReveal();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('opensaas.app/ref/YOUR_CODE');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)',
        padding: '120px 0',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
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
          04 / ПАРТНЁРСКАЯ ПРОГРАММА
        </div>

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
          Встроенная партнёрская программа
        </h2>

        <p style={{ fontSize: '18px', color: '#616161', lineHeight: '1.6', marginBottom: '64px' }}>
          20% с каждого платежа приглашённого пользователя. Коды, ссылки, история выплат — всё готово.
        </p>

        {/* Steps grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-12"
        >
          {steps.map((step) => (
            <StepCard key={step.num} step={step} />
          ))}
        </div>

        {/* Referral link */}
        <div
          style={{
            border: '1.5px solid rgba(0,102,255,0.2)',
            borderRadius: '12px',
            background: '#EBF3FF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: '14px',
              color: '#0066FF',
              letterSpacing: '0.02em',
            }}
          >
            opensaas.app/ref/YOUR_CODE
          </span>
          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: copied ? '#0066FF' : 'white',
              color: copied ? 'white' : '#171717',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Скопировано!' : 'Скопировать'}
          </button>
        </div>
      </div>
    </section>
  );
}
