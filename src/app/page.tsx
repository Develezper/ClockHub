"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <span className="text-xl font-semibold tracking-tight">ClockHub</span>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-9 px-4">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="sm" className="h-9 px-4">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">Gestión de horarios</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Plataforma básica para administrar horarios, usuarios y auditoría.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          <Link href="/registro">
            <Button className="h-10 px-5">Crear cuenta</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="h-10 px-5">
              Entrar al sistema
            </Button>
          </Link>
        </div>

        <section className="max-w-2xl rounded-md border border-border bg-card p-6">
          <h2 className="mb-3 text-xl font-semibold">Incluye</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Gestión de horarios</li>
            <li>Gestión de usuarios por roles</li>
            <li>Registro de auditoría</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
