"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Gift,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  DollarSign,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const userNav = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/billing", label: "Подписка", icon: CreditCard },
  { href: "/referrals", label: "Рефералы", icon: Gift },
  { href: "/settings", label: "Настройки", icon: Settings },
];

const adminNav = [
  { href: "/admin", label: "Админ", icon: ShieldCheck },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/billing", label: "Платежи", icon: DollarSign },
  { href: "/admin/referrals", label: "Выплаты", icon: Gift },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-muted/40 md:block">
      <div className="flex h-14 items-center border-b px-6 font-semibold">
        OpenSaaS
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {userNav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <>
            <div className="my-3 border-t" />
            <div className="px-3 text-xs font-medium uppercase text-muted-foreground">
              Администрирование
            </div>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
