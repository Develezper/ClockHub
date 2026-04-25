"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks";
import { ROLE_LABELS } from "@/types";
import { USER_ROLE_BADGE_CLASS } from "@/lib/semantic-colors";

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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-black/60 px-5 backdrop-blur-md">
      <h1 className="text-base font-semibold tracking-tight">{title ?? "Dashboard"}</h1>
      <div className="flex items-center gap-3 text-sm">
        {user && (
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-muted-foreground text-xs">{user.name}</span>
            <Badge className={cn("text-[10px] h-5 px-1.5", USER_ROLE_BADGE_CLASS[user.role])}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        )}
        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs opacity-70 hover:opacity-100" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
