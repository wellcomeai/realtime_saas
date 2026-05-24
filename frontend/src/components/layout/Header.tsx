"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="text-sm text-muted-foreground">{user?.email}</div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
