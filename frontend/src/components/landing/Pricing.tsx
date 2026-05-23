"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { usePlans } from "@/hooks/useBilling";

export function Pricing() {
  const { data: plans, isLoading } = usePlans();

  const fallback = [
    {
      name: "Trial",
      price: "0",
      currency: "RUB",
      features: ["3 дня бесплатно", "Все возможности", "Без карты"],
      ctaLabel: "Начать триал",
    },
    {
      name: "Basic",
      price: "990",
      currency: "RUB",
      features: ["До 100 запросов в день", "Email поддержка", "Базовая аналитика"],
      ctaLabel: "Подписаться",
    },
    {
      name: "Pro",
      price: "2990",
      currency: "RUB",
      features: [
        "Безлимит запросов",
        "Приоритетная поддержка",
        "API доступ",
        "Расширенная аналитика",
      ],
      ctaLabel: "Подписаться",
      highlight: true,
    },
  ];

  const items =
    plans && plans.length > 0
      ? [
          {
            name: "Trial",
            price: "0",
            currency: "RUB",
            features: ["3 дня бесплатно", "Все возможности"],
            ctaLabel: "Начать",
          },
          ...plans.map((p, i) => ({
            name: p.name,
            price: p.price,
            currency: p.currency,
            features: p.features,
            ctaLabel: "Подписаться",
            highlight: i === plans.length - 1,
          })),
        ]
      : fallback;

  return (
    <section id="pricing" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold">Простые тарифы</h2>
        <p className="mt-3 text-muted-foreground">
          Платите только за то, что используете. Отмена в любой момент.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {items.map((p) => (
          <div
            key={p.name}
            className={
              p.highlight
                ? "rounded-lg border-2 border-primary bg-card p-6 shadow-md"
                : "rounded-lg border bg-card p-6"
            }
          >
            <div className="text-sm font-medium uppercase text-muted-foreground">
              {p.name}
            </div>
            <div className="mt-2 text-3xl font-bold">
              {p.price === "0" ? "Бесплатно" : formatMoney(p.price, p.currency)}
              {p.price !== "0" && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / мес
                </span>
              )}
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-6 block">
              <Button
                className="w-full"
                variant={p.highlight ? "default" : "outline"}
              >
                {p.ctaLabel}
              </Button>
            </Link>
          </div>
        ))}
        {isLoading && (
          <div className="col-span-full text-center text-sm text-muted-foreground">
            Загрузка тарифов…
          </div>
        )}
      </div>
    </section>
  );
}
