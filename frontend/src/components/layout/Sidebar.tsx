"use client";

import Link from "next/link";
import Image from "next/image";
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
import { useUiStore } from "@/store/uiStore";
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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
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
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md py-2 text-sm transition-all duration-200 border-l-2 pl-[10px]",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5",
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
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md py-2 text-sm transition-all duration-200 border-l-2 pl-[10px]",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5",
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
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b px-6">
        <Image src="/logo.png" alt="logo" width={28} height={28} style={{ borderRadius: '6px' }} />
        <span className="font-display font-semibold">OpenSaaS</span>
      </div>
      <NavLinks onNavigate={onNavigate} />
    </>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-muted/40 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onNavigate={() => setSidebarOpen(false)} />
      </aside>
    </>
  );
}
