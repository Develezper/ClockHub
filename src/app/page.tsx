"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
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

      <main className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">Gestión de horarios</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Plataforma básica para administrar horarios, usuarios y auditoría.
          </p>

          <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
            <Link href="/registro">
              <Button className="h-10 px-5">Crear cuenta</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-10 px-5">
                Entrar al sistema
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          <article className="surface p-5">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Gestión de horarios</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Crea, edita y consulta turnos de forma clara.
            </p>
          </article>
          <article className="surface p-5">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Usuarios por roles</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Control de accesos para administrador, gerente y empleado.
            </p>
          </article>
          <article className="surface p-5">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Auditoría</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Registro de cambios y trazabilidad de acciones clave.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
