"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Возможности" },
  { href: "/#ai-agents", label: "AI-агенты" },
  { href: "/#how-to-start", label: "Как начать" },
];

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '60px',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      }}
    >
      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}
        className="flex h-full items-center justify-between"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5"
          style={{ textDecoration: 'none' }}
        >
          <span style={{ color: '#0066FF', fontSize: '18px', lineHeight: 1 }}>▪</span>
          <span
            style={{
              fontFamily: 'Geist, sans-serif',
              fontWeight: 600,
              fontSize: '17px',
              color: '#171717',
              letterSpacing: '-0.01em',
            }}
          >
            OpenSaaS
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: '14px',
                color: '#616161',
                textDecoration: 'none',
                fontWeight: 450,
                letterSpacing: '-0.01em',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#171717')}
              onMouseLeave={e => (e.currentTarget.style.color = '#616161')}
            >
              {label}
            </Link>
          ))}
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5"
            style={{
              fontSize: '14px',
              color: '#616161',
              textDecoration: 'none',
              fontWeight: 450,
              letterSpacing: '-0.01em',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#171717')}
            onMouseLeave={e => (e.currentTarget.style.color = '#616161')}
          >
            <Github size={15} />
            GitHub
          </Link>
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-2">
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#616161',
                fontSize: '14px',
                fontWeight: 500,
                padding: '0 12px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'color 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#171717';
                e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#616161';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Войти
            </button>
          </Link>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: '#0066FF',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                padding: '0 16px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'background 0.2s ease, transform 0.15s ease',
                boxShadow: '0 2px 8px rgba(0,102,255,0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0052CC';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0066FF';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Начать бесплатно
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
