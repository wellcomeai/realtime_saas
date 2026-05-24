"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur transition-all duration-300",
        scrolled ? "bg-background/98 shadow-sm" : "bg-background/95",
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-display font-semibold">
          OpenSaaS
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {[
            { href: "/#features", label: "Возможности" },
            { href: "/pricing",   label: "Тарифы" },
            { href: "/#faq",      label: "FAQ" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative text-muted-foreground transition-colors duration-150 hover:text-foreground",
                "after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-full after:origin-left",
                "after:scale-x-0 after:bg-foreground after:transition-transform after:duration-200 hover:after:scale-x-100",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Войти
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Начать бесплатно</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
