"use client";

import Link from "next/link";
import { Github } from "lucide-react";

const columns = [
  {
    title: 'Продукт',
    links: [
      { label: 'Возможности', href: '/#features' },
      { label: 'AI-агенты', href: '/#ai-agents' },
      { label: 'Как начать', href: '/#how-to-start' },
      { label: 'Тарифы', href: '/pricing' },
    ],
  },
  {
    title: 'Open Source',
    links: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Документация', href: '/docs' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Аккаунт',
    links: [
      { label: 'Войти', href: '/login' },
      { label: 'Регистрация', href: '/register' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        background: '#f5f5f7',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        padding: '64px 0 32px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Top section */}
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-1.5 mb-3"
              style={{ textDecoration: 'none' }}
            >
              <img src="/logo.png" alt="logo" style={{ height: '28px', width: '28px', borderRadius: '6px' }} />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '17px',
                  color: '#171717',
                  letterSpacing: '-0.01em',
                }}
              >
                OpenSaaS
              </span>
            </Link>
            <p style={{ fontSize: '14px', color: '#8e8e93', lineHeight: '1.6' }}>
              Open-source SaaS шаблон на FastAPI + Next.js.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '16px',
                fontSize: '13px',
                color: '#616161',
                textDecoration: 'none',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                padding: '6px 12px',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0066FF')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
            >
              <Github size={14} />
              ★ GitHub
            </a>
          </div>

          {/* Columns */}
          {columns.map(col => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#171717',
                  marginBottom: '12px',
                  letterSpacing: '-0.01em',
                }}
              >
                {col.title}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: '14px',
                        color: '#8e8e93',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#171717')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#8e8e93')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#8e8e93' }}>
            © {new Date().getFullYear()} OpenSaaS. MIT License.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#8e8e93',
                textDecoration: 'none',
              }}
            >
              <Github size={14} />
              MIT License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
