import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/context/ThemeContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { ClientOnly } from "@/components/ClientOnly";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAInstaller } from "@/components/PWAInstaller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalUI from '@/components/GlobalUI';
import Onboarding from '@/components/Onboarding';
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gym Tracker",
  },
  formatDetection: {
    telephone: false,
  },
};

export function generateViewport() {
  return {
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
    themeColor: "#3b82f6",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icons/icon-512x512.png" sizes="512x512" type="image/png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('gym-tracker-theme') || 'dark';
                  const getTimeBasedTheme = () => {
                    const hour = new Date().getHours();
                    return (hour >= 20 || hour < 7) ? 'dark' : 'light';
                  };
                  const resolvedTheme = theme === 'auto' ? getTimeBasedTheme() : theme;
                  if (resolvedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ReactQueryProvider>
            <ThemeProvider>
              <Providers>
                <OnboardingProvider>
                  <ClientOnly>
                    <ServiceWorkerRegistration />
                    <PWAInstaller />
                    <GlobalUI />
                    <Onboarding />
                  </ClientOnly>
                  <main className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                    {children}
                  </main>
                </OnboardingProvider>
              </Providers>
            </ThemeProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
