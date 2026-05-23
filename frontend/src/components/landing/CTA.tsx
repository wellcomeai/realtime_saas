import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container text-center">
        <h2 className="text-balance text-3xl font-bold md:text-4xl">
          Начните свой SaaS уже сегодня
        </h2>
        <p className="mx-auto mt-3 max-w-xl opacity-90">
          3 дня бесплатного триала. Без привязки карты.
        </p>
        <div className="mt-8">
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Создать аккаунт
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
