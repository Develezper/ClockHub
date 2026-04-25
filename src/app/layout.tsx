import type { Metadata, Viewport } from "next";

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

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
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>{children}</AuthProvider>
        {isProduction && <Analytics />}
      </body>
    </html>
  );
}
