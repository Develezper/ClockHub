"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Panel", href: "/dashboard", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { name: "Horarios", href: "/dashboard/horarios", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { name: "Usuarios", href: "/dashboard/usuarios", roles: ["ADMIN"] },
  { name: "Auditoría", href: "/dashboard/auditoria", roles: ["ADMIN", "MANAGER"] },
  { name: "Configuración", href: "/dashboard/configuracion", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNavigation = navigation.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <aside className="w-56 border-r p-4">
      <div className="mb-4">
        <Link href="/dashboard" className="text-lg font-semibold">
          ClockHub
        </Link>
      </div>

      <nav className="space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block rounded px-2 py-1.5 text-sm",
                isActive ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t pt-4">
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
