"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Что входит в шаблон?",
    a: "Аутентификация, биллинг (Робокасса), реферальная программа, API-ключи, in-app уведомления, админка, демо-модуль. Backend на FastAPI, frontend на Next.js 14.",
  },
  {
    q: "Сколько длится триал?",
    a: "По умолчанию 3 дня. Можно изменить переменной TRIAL_DAYS в .env.",
  },
  {
    q: "Можно ли подключить Stripe?",
    a: "В шаблоне есть заготовка stripe.py с TODO и точками подключения в webhook. Документация Stripe + аналогичный код Робокассы — и Stripe заработает.",
  },
  {
    q: "Redis обязателен?",
    a: "Нет. Если REDIS_URL не задан, rate limit использует PostgreSQL fallback. Никаких других зависимостей от Redis нет.",
  },
  {
    q: "Какая лицензия?",
    a: "MIT. Используйте в коммерческих и личных проектах без ограничений.",
  },
  {
    q: "Как добавить свой модуль?",
    a: "См. docs/adding-modules.md. Кратко: создаёте папку backend/modules/<name>/ с моделью, схемой и сервисом, добавляете миграцию Alembic и роутер.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="container py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold">Частые вопросы</h2>
        <div className="mt-8 divide-y rounded-lg border bg-card">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={f.q}
                className="block w-full p-5 text-left"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </div>
                {isOpen && (
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
