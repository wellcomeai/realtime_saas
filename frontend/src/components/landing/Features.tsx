import {
  Bell,
  CreditCard,
  Gift,
  Key,
  Lock,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Аутентификация",
    desc: "JWT, refresh-токены, email-подтверждение, сброс пароля.",
  },
  {
    icon: CreditCard,
    title: "Биллинг",
    desc: "Подписки, триал, история платежей, Робокасса + заготовка Stripe.",
  },
  {
    icon: Gift,
    title: "Реферальная программа",
    desc: "Уникальные коды, выплаты 20% от платежей, админ-модерация.",
  },
  {
    icon: Key,
    title: "API ключи",
    desc: "Скоупы, rate limit, безопасное хранение (bcrypt).",
  },
  {
    icon: Bell,
    title: "Уведомления",
    desc: "In-app уведомления + email для важных событий.",
  },
  {
    icon: ShieldCheck,
    title: "Админка",
    desc: "Управление пользователями, выплатами, статистика.",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold">Всё, что нужно для запуска SaaS</h2>
        <p className="mt-3 text-muted-foreground">
          Не пишите рутинную инфраструктуру — сосредоточьтесь на продукте.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <Icon className="h-6 w-6" />
              <div className="mt-4 font-semibold">{f.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
