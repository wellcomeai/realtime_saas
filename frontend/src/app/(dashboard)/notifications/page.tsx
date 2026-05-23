"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notificationsApi } from "@/api/notifications";
import { formatDateTime, cn } from "@/lib/utils";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications-page"],
    queryFn: () => notificationsApi.list(50, 0),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications-page"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications-page"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Уведомления</h1>
          <p className="text-sm text-muted-foreground">
            Платежи, выплаты, изменения подписки.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
        >
          <Check className="mr-2 h-4 w-4" />
          Отметить все как прочитанные
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
              <Bell className="mb-3 h-8 w-8" />
              Пока нет уведомлений.
            </div>
          ) : (
            <ul className="divide-y">
              {data.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex justify-between gap-4 py-4 text-sm",
                    !n.is_read && "bg-primary/5 -mx-6 px-6",
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{n.title}</span>
                      {!n.is_read && <Badge variant="default">new</Badge>}
                    </div>
                    <p className="mt-1 text-muted-foreground">{n.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                    <span>{formatDateTime(n.created_at)}</span>
                    {!n.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markRead.mutate(n.id)}
                      >
                        Отметить
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
