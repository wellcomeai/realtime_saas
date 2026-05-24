"use client";

import Link from "next/link";
import { ArrowRight, Key, Lock, CreditCard, Gift, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const metrics = [
  { icon: Lock,       label: "Auth" },
  { icon: CreditCard, label: "Billing" },
  { icon: Gift,       label: "Referrals" },
  { icon: Key,        label: "API Keys" },
];

const trustItems = [
  { icon: Lock,       label: "Аутентификация" },
  { icon: CreditCard, label: "Биллинг" },
  { icon: Gift,       label: "Рефералы" },
  { icon: Key,        label: "API Ключи" },
  { icon: ShieldCheck,label: "Админка" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      {/* Background orbs */}
      <div
        className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-indigo-500 opacity-20 blur-3xl"
        style={{ animation: "gradient-drift 8s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-6rem] right-[-6rem] h-80 w-80 rounded-full bg-violet-500 opacity-20 blur-3xl"
        style={{ animation: "gradient-drift 8s ease-in-out infinite", animationDelay: "3s" }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container relative py-28 lg:py-36">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Left content */}
          <motion.div
            className="flex-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-400">
                <Zap className="h-3 w-3 text-indigo-400" />
                Open source · MIT · v1.0
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.92] tracking-tight"
            >
              Запусти SaaS
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                за дни,
              </span>
              <br />
              не за месяцы
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-lg text-base text-zinc-400 lg:text-lg"
            >
              FastAPI + Next.js. Аутентификация, биллинг, реферальная программа,
              API‑ключи и админка из коробки. Дальше — только ваша бизнес‑логика.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-zinc-950 hover:bg-zinc-100"
                >
                  Начать бесплатно <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-transparent hover:text-white"
                >
                  Тарифы
                </Button>
              </Link>
            </motion.div>

            {/* Trust strip */}
            <motion.div variants={itemVariants}>
              <div className="mt-12 border-t border-zinc-800 pt-6">
                <div className="flex flex-wrap items-center gap-5 opacity-50">
                  {trustItems.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating metrics card — desktop only */}
          <div className="hidden lg:block lg:w-72 xl:w-80">
            <div
              className="animate-float rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
                Из коробки
              </p>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                      <Icon className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-xs font-medium text-zinc-300">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-zinc-600">
                3 дня бесплатно · Без карты
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
