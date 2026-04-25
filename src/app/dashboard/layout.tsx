"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { useAuth } from "@/hooks";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { UserProvider } from "@/context/UserContext";
import { AuditProvider } from "@/context/AuditContext";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScheduleProvider>
      <UserProvider>
        <AuditProvider>
          <div className="flex h-screen bg-background">
            <AppSidebar />
            <main className="flex-1 overflow-auto md:pl-60">
              {children}
            </main>
          </div>
        </AuditProvider>
      </UserProvider>
    </ScheduleProvider>
  );
}
