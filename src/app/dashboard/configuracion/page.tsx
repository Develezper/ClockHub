"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks";
import { getInitials } from "@/lib/format";
import { ROLE_LABELS } from "@/types";
import { USER_ROLE_BADGE_CLASS, USER_ROLE_TEXT_CLASS } from "@/lib/semantic-colors";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    department: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    scheduleReminders: true,
    teamUpdates: true,
    weeklyReport: false,
  });

  const [preferences, setPreferences] = useState({
    language: "es",
    timezone: "America/Mexico_City",
    dateFormat: "DD/MM/YYYY",
    theme: "system",
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    
    // TODO: Conectar con endpoint de actualización de perfil
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setSuccessMessage("Vista previa de configuración — la persistencia se implementará en una futura iteración");
    setIsSaving(false);
    
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Configuración" />

      <div className="page-shell">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div>
            <h2 className="page-heading">Configuración</h2>
            <p className="page-subheading">
              Administra tu cuenta y preferencias
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-muted text-foreground rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 rounded-md border border-border bg-card/60 p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notificaciones</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Preferencias</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Seguridad</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="surface">
                <CardHeader>
                  <CardTitle>Información del Perfil</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {user ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        <Camera className="mr-2 h-4 w-4" />
                        Cambiar Foto
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG o GIF. Máximo 2MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        placeholder="+52 555 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) =>
                          setProfileData({ ...profileData, department: e.target.value })
                        }
                        placeholder="Operaciones"
                      />
                    </div>
                  </div>

                  {/* Role Info */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <Shield className={`h-5 w-5 ${user ? USER_ROLE_TEXT_CLASS[user.role] : "text-muted-foreground"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${user ? USER_ROLE_TEXT_CLASS[user.role] : ""}`}>Rol:</p>
                          {user ? (
                            <Badge className={USER_ROLE_BADGE_CLASS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                          ) : (
                            <p className="font-medium">Desconocido</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Los cambios de rol deben ser solicitados a un administrador
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="surface">
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                  <CardDescription>
                    Configura cómo y cuándo recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones en tu correo electrónico
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, email: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones en el navegador
                        </p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, push: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recordatorios de Horarios</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificaciones antes de tus turnos programados
                        </p>
                      </div>
                      <Switch
                        checked={notifications.scheduleReminders}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, scheduleReminders: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Actualizaciones del Equipo</Label>
                        <p className="text-sm text-muted-foreground">
                          Cambios de horarios de tu equipo
                        </p>
                      </div>
                      <Switch
                        checked={notifications.teamUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, teamUpdates: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reporte Semanal</Label>
                        <p className="text-sm text-muted-foreground">
                          Resumen semanal de tus horarios
                        </p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, weeklyReport: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="surface">
                <CardHeader>
                  <CardTitle>Preferencias</CardTitle>
                  <CardDescription>
                    Personaliza tu experiencia en ClockHub
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select
                        value={preferences.timezone}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, timezone: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Mexico_City">
                            Ciudad de México (GMT-6)
                          </SelectItem>
                          <SelectItem value="America/Bogota">
                            Bogotá (GMT-5)
                          </SelectItem>
                          <SelectItem value="America/Buenos_Aires">
                            Buenos Aires (GMT-3)
                          </SelectItem>
                          <SelectItem value="Europe/Madrid">
                            Madrid (GMT+1)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Formato de Fecha</Label>
                      <Select
                        value={preferences.dateFormat}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, dateFormat: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theme">Tema</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, theme: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Oscuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="surface">
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>
                    Gestiona la seguridad de tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Cambiar Contraseña</h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">
                          Confirmar Nueva Contraseña
                        </Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <Button variant="outline">Actualizar Contraseña</Button>
                  </div>

                  <Separator />

                  {/* Sessions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Sesiones Activas</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-foreground/70" />
                          </div>
                          <div>
                            <p className="font-medium">Sesión Actual</p>
                            <p className="text-sm text-muted-foreground">
                              Este dispositivo • Activo ahora
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="text-destructive">
                      Cerrar Todas las Sesiones
                    </Button>
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-destructive">Zona de Peligro</h4>
                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <p className="text-sm text-muted-foreground mb-4">
                        Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor,
                        asegúrate de estar seguro.
                      </p>
                      <Button variant="destructive">Eliminar Cuenta</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
