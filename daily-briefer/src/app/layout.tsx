import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Rubik, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/* Self-hosted at build time by next/font, so the app still renders correctly
   with no network — which matters once it lives on the home screen. */
const display = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "יומן BOLD",
  description: "הכדורים, המים, המשימות, הפרויקטים והדואר — הכול במקום אחד.",
  manifest: "/manifest.webmanifest",
  applicationName: "יומן BOLD",
  appleWebApp: { capable: true, title: "יומן BOLD", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F1EC" },
    { media: "(prefers-color-scheme: dark)", color: "#17181A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
