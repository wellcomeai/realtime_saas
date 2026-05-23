import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <Link href="/" className="font-semibold">
            OpenSaaS
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md px-4">{children}</div>
      </main>
    </div>
  );
}
