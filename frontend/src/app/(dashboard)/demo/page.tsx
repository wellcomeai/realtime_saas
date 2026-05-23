"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoNotesApi } from "@/api/demoNotes";
import { formatDateTime } from "@/lib/utils";

export default function DemoPage() {
  const qc = useQueryClient();
  const { data: notes } = useQuery({
    queryKey: ["demo-notes"],
    queryFn: () => demoNotesApi.list(),
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const create = useMutation({
    mutationFn: () => demoNotesApi.create({ title, content }),
    onSuccess: () => {
      setTitle("");
      setContent("");
      qc.invalidateQueries({ queryKey: ["demo-notes"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => demoNotesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["demo-notes"] }),
  });

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Демо: Заметки</h1>
        <p className="text-sm text-muted-foreground">
          Пример пользовательского модуля. Удалите когда не нужен.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новая заметка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="content">Текст</Label>
            <Textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <Button
            onClick={() => create.mutate()}
            disabled={!title || create.isPending}
          >
            Создать
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ваши заметки</CardTitle>
        </CardHeader>
        <CardContent>
          {!notes || notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока ничего нет.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{n.title}</div>
                    {n.content && (
                      <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {n.content}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(n.updated_at)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove.mutate(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
