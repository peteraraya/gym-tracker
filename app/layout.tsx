import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GymProvider } from "@/context/GymContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { AuthProvider } from "@/context/AuthContext";
import { EquipmentProvider } from "@/context/EquipmentContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { Navbar } from "@/components/Navbar";
import { ClientOnly } from "@/components/ClientOnly";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gym Tracker - Registra tus rutinas de gimnasio",
  description: "Aplicación para registrar y seguir tus rutinas de gimnasio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LocaleProvider>
            <EquipmentProvider>
              <GymProvider>
                <WorkoutProvider>
                  <ClientOnly>
                    <Navbar />
                  </ClientOnly>
                  <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                    {children}
                  </main>
                </WorkoutProvider>
              </GymProvider>
            </EquipmentProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
