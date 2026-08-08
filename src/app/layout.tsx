import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { getActiveAircraftId, listAircraft } from "@/lib/aircraft";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Wallet PAPI",
  title: {
    default: "Wallet PAPI",
    template: "%s · PAPI",
  },
  description: "Aircraft logbook, expenses, and total cost of ownership.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PAPI",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Feed the client nav switcher from the server (cookie-backed active plane).
  const [fleet, activeId] = await Promise.all([
    listAircraft(),
    getActiveAircraftId(),
  ]);
  const aircraftOptions = fleet.map((p) => ({
    id: p.id,
    tailNumber: p.tailNumber,
  }));

  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ServiceWorkerRegister />
        <AppChrome aircraft={aircraftOptions} activeId={activeId}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
