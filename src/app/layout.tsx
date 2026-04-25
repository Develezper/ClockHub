import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const isProduction = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: "ClockHub - Gestión de Horarios",
  description: "Plataforma de gestión de horarios y calendarios para equipos. Controla turnos, usuarios y permisos de forma centralizada.",
  keywords: ["gestión de horarios", "turnos", "equipos", "calendario", "recursos humanos"],
  authors: [{ name: "ClockHub" }],
};

export const viewport: Viewport = {
  themeColor: "#010B2B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
        {isProduction && <Analytics />}
      </body>
    </html>
  );
}
