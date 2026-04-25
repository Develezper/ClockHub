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
    <header className="flex h-14 items-center justify-between border-b px-4">
      <h1 className="text-base font-semibold">{title ?? "Dashboard"}</h1>
      <div className="flex items-center gap-3 text-sm">
        {user && (
          <span className="text-muted-foreground">
            {user.name} ({ROLE_LABELS[user.role]})
          </span>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
