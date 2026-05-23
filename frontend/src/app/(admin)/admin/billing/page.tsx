"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/api/admin";
import { formatDateTime, formatMoney } from "@/lib/utils";

const statusVariant: Record<
  string,
  "default" | "success" | "destructive" | "secondary" | "warning"
> = {
  success: "success",
  pending: "warning",
  failed: "destructive",
  refunded: "secondary",
};

export default function AdminBillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => adminApi.listPayments(200),
  });

  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      if (status && p.status !== status) return false;
      if (provider && p.provider !== provider) return false;
      return true;
    });
  }, [data, status, provider]);

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Платежи</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Все статусы</option>
              <option value="pending">pending</option>
              <option value="success">success</option>
              <option value="failed">failed</option>
              <option value="refunded">refunded</option>
            </select>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Все провайдеры</option>
              <option value="robokassa">robokassa</option>
              <option value="stripe">stripe</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Загрузка...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3">Дата</th>
                  <th className="px-6 py-3">Сумма</th>
                  <th className="px-6 py-3">Провайдер</th>
                  <th className="px-6 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-6 py-3">{formatDateTime(p.created_at)}</td>
                    <td className="px-6 py-3">
                      {formatMoney(p.amount, p.currency)}
                    </td>
                    <td className="px-6 py-3">{p.provider}</td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[p.status] ?? "default"}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
