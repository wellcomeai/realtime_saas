import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12">
      <div className="container grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-semibold">OpenSaaS</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Open source SaaS boilerplate.
          </p>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Продукт</div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/#features">Возможности</Link></li>
            <li><Link href="/pricing">Тарифы</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Компания</div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/login">Войти</Link></li>
            <li><Link href="/register">Регистрация</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Документация</div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Getting started</li>
            <li>API Reference</li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t pt-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} OpenSaaS. MIT License.
      </div>
    </footer>
  );
}
