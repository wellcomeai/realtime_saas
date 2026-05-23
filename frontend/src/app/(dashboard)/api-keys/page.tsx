"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiKeysApi } from "@/api/apiKeys";
import { formatDateTime } from "@/lib/utils";
import type { ApiKeyCreated } from "@/types";

export default function ApiKeysPage() {
  const qc = useQueryClient();
  const { data: keys } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeysApi.list(),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);

  const create = useMutation({
    mutationFn: () =>
      apiKeysApi.create({ name, scopes: ["read", "write"] }),
    onSuccess: (k) => {
      setCreatedKey(k);
      setCreateOpen(false);
      setName("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e) => {
      const err = e as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail ?? "Не удалось создать ключ");
    },
  });

  const revoke = useMutation({
    mutationFn: (id: string) => apiKeysApi.revoke(id),
    onSuccess: () => {
      toast.success("Ключ отозван");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiKeysApi.delete(id),
    onSuccess: () => {
      toast.success("Ключ удалён");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Скопировано");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API ключи</h1>
          <p className="text-sm text-muted-foreground">
            Для доступа к публичному API из ваших приложений.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Создать ключ</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ваши ключи</CardTitle>
        </CardHeader>
        <CardContent>
          {!keys || keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ещё нет ни одного ключа.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Имя</th>
                  <th className="py-2">Prefix</th>
                  <th className="py-2">Использован</th>
                  <th className="py-2">Создан</th>
                  <th className="py-2">Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{k.name}</td>
                    <td className="py-3 font-mono text-xs">
                      {k.key_prefix}...
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {k.last_used_at ? formatDateTime(k.last_used_at) : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(k.created_at)}
                    </td>
                    <td className="py-3">
                      <Badge variant={k.is_active ? "success" : "secondary"}>
                        {k.is_active ? "active" : "revoked"}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      {k.is_active ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revoke.mutate(k.id)}
                        >
                          Отозвать
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Удалить ключ безвозвратно?")) {
                              remove.mutate(k.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый API ключ</DialogTitle>
            <DialogDescription>
              Дайте ключу понятное имя — например «Mobile app».
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mobile app"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => create.mutate()}
              disabled={!name || create.isPending}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show full key once */}
      <Dialog
        open={!!createdKey}
        onOpenChange={(o) => !o && setCreatedKey(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ваш новый ключ</DialogTitle>
            <DialogDescription className="text-destructive">
              Скопируйте ключ — он показывается ОДИН раз. После закрытия диалога
              вы больше не сможете его увидеть.
            </DialogDescription>
          </DialogHeader>
          <div className="break-all rounded-md border bg-muted p-3 font-mono text-xs">
            {createdKey?.full_key}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => createdKey && copy(createdKey.full_key)}
            >
              <Copy className="mr-2 h-4 w-4" /> Скопировать
            </Button>
            <Button onClick={() => setCreatedKey(null)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
