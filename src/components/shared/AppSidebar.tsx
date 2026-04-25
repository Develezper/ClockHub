"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import type { UserRole } from "@/types";

const navigation: Array<{ name: string; href: string; roles: UserRole[] }> = [
  { name: "Panel", href: "/dashboard", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { name: "Horarios", href: "/dashboard/horarios", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { name: "Usuarios", href: "/dashboard/usuarios", roles: ["ADMIN"] },
  { name: "Auditoría", href: "/dashboard/auditoria", roles: ["ADMIN", "MANAGER"] },
  { name: "Configuración", href: "/dashboard/configuracion", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNavigation = navigation.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md md:flex p-4">
      <div className="mb-5">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          ClockHub
        </Link>
      </div>

      <nav className="space-y-1.5">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border border-border bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4 px-2">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
          <span className="opacity-70 group-hover:opacity-100 transition-opacity">Cerrar sesión</span>
        </Button>
      </div>
    </aside>
  );
}
