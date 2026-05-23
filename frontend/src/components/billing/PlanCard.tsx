"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { Plan } from "@/types";

interface Props {
  plan: Plan;
  active?: boolean;
  loading?: boolean;
  onSubscribe?: (plan: Plan) => void;
}

export function PlanCard({ plan, active, loading, onSubscribe }: Props) {
  return (
    <Card className={active ? "border-2 border-primary" : undefined}>
      <CardContent className="p-6">
        <div className="text-sm font-medium uppercase text-muted-foreground">
          {plan.name}
        </div>
        <div className="mt-2 text-3xl font-bold">
          {formatMoney(plan.price, plan.currency)}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            / {plan.interval === "month" ? "мес" : "год"}
          </span>
        </div>
        <ul className="mt-6 space-y-2 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 w-full"
          variant={active ? "outline" : "default"}
          disabled={loading || active}
          onClick={() => onSubscribe?.(plan)}
        >
          {active ? "Текущий план" : loading ? "Подождите..." : "Выбрать"}
        </Button>
      </CardContent>
    </Card>
  );
}
