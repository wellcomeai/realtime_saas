import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/landing/Pricing";

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main className="py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold">Тарифы</h1>
            <p className="mt-3 text-muted-foreground">
              Выберите подходящий план. Отмена в любой момент.
            </p>
          </div>
        </div>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
