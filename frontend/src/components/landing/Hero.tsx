import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container py-24 text-center">
      <div className="mx-auto inline-flex items-center rounded-full border bg-muted/40 px-3 py-1 text-xs">
        Open source · MIT · v1.0
      </div>
      <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-6xl">
        SaaS-шаблон, готовый к запуску
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
        FastAPI + Next.js. Аутентификация, биллинг, реферальная программа,
        API-ключи и админка из коробки. Дальше — только ваша бизнес-логика.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/register">
          <Button size="lg">
            Начать бесплатно <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/pricing">
          <Button size="lg" variant="outline">
            Тарифы
          </Button>
        </Link>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        3 дня бесплатного триала · Без привязки карты
      </p>
    </section>
  );
}
