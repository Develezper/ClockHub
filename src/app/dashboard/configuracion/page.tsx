"use client";

import { useState } from "react";
import { User, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks";
import { toast } from "sonner";

export default function ConfigPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Simulación de guardado
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Cambios guardados localmente");
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Configuración" />

      <div className="page-shell page-stack max-w-4xl">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight">Ajustes del Sistema</h2>
          <p className="text-muted-foreground">Gestiona tu identidad y seguridad en la plataforma.</p>
        </header>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass p-1 transition-all">
            <TabsTrigger value="perfil" className="gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="gap-2">
              <Shield className="h-4 w-4" /> Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="mt-6 space-y-4">
            <Card className="surface">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información pública y de contacto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" defaultValue={user?.name || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" defaultValue={user?.email || ""} disabled />
                    <p className="text-[10px] text-muted-foreground italic">El correo no puede ser modificado por el usuario.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol asignado</Label>
                  <Input id="role" defaultValue={user?.role || ""} disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguridad" className="mt-6 space-y-4">
            <Card className="surface">
              <CardHeader>
                <CardTitle>Contraseña</CardTitle>
                <CardDescription>
                  Cambia tu contraseña para mantener tu cuenta segura.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Contraseña actual</Label>
                  <Input id="current" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new">Nueva contraseña</Label>
                    <Input id="new" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
                    <Input id="confirm" type="password" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
