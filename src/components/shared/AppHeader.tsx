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
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-muted-foreground text-xs">{user.name}</span>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1">
              <div className={cn(
                "h-2 w-2 rounded-full",
                user.role === 'ADMIN' && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                user.role === 'MANAGER' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                user.role === 'EMPLOYEE' && "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
              )} />
              <span className="text-[10px] font-medium text-foreground/90 uppercase tracking-wider">{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs opacity-70 hover:opacity-100" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
