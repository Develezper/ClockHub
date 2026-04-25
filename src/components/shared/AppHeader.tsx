"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/types";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/95 px-5 backdrop-blur">
      <h1 className="text-base font-semibold tracking-tight">{title ?? "Dashboard"}</h1>
      <div className="flex items-center gap-3 text-sm">
        {user && (
          <span className="hidden text-muted-foreground md:inline">
            {user.name} ({ROLE_LABELS[user.role]})
          </span>
        )}
        <Button variant="outline" size="sm" className="h-9 px-4" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
