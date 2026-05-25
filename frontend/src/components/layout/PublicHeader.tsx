"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

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
          <Image src="/logo.png" alt="logo" width={32} height={32} style={{ borderRadius: '8px' }} priority />
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
              className="text-sm text-[#616161] no-underline font-normal tracking-tight transition-colors duration-150 hover:text-[#171717]"
            >
              {label}
            </Link>
          ))}
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#616161] no-underline font-normal tracking-tight transition-colors duration-150 hover:text-[#171717]"
          >
            <Github size={15} />
            GitHub
          </Link>
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-2">
          <Link href="/login" className="no-underline">
            <button
              type="button"
              className="bg-transparent border-none text-[#616161] text-sm font-medium px-3 h-9 rounded-lg cursor-pointer transition-colors duration-150 hover:text-[#171717] hover:bg-black/[0.04]"
            >
              Войти
            </button>
          </Link>
          <Link href="/register" className="no-underline">
            <button
              type="button"
              className="bg-[#0066FF] border-none text-white text-sm font-semibold px-4 h-9 rounded-lg cursor-pointer tracking-tight shadow-[0_2px_8px_rgba(0,102,255,0.25)] transition-all duration-200 hover:bg-[#0052CC] hover:scale-[1.02]"
            >
              Начать бесплатно
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
