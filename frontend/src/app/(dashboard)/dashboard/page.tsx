"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Gift, Settings } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrialBanner } from "@/components/billing/TrialBanner";
import { EmailBanner } from "@/components/EmailBanner";
import { referralsApi } from "@/api/referrals";
import { formatMoney } from "@/lib/utils";

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["referrals-stats"],
    queryFn: () => referralsApi.stats(),
  });

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Главная</h1>
        <p className="text-sm text-muted-foreground">
          Сводка по вашему аккаунту.
        </p>
      </div>

      <EmailBanner />
      <TrialBanner />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Заработано рефералами</CardDescription>
            <CardTitle className="text-2xl">
              {formatMoney(stats?.total_earned ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Приглашено: {stats?.total_referred ?? 0} · Оплатили:{" "}
            {stats?.converted ?? 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ожидает выплаты</CardDescription>
            <CardTitle className="text-2xl">
              {formatMoney(stats?.pending_payout ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/referrals"
              className="text-xs text-primary hover:underline"
            >
              Смотреть рефералов →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            { href: "/billing", icon: CreditCard, label: "Подписка" },
            { href: "/referrals", icon: Gift, label: "Рефералы" },
            { href: "/settings", icon: Settings, label: "Настройки" },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{q.label}</span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
