import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          OpenSaaS
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          <Link href="/#features">Возможности</Link>
          <Link href="/pricing">Тарифы</Link>
          <Link href="/#faq">FAQ</Link>
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
