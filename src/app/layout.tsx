import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAProvider } from "@/components/providers/pwa-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MTU Archive - Academic Resource Platform",
    template: "%s | MTU Archive",
  },
  description:
    "A community-driven academic archiving platform for B.Tech CSE students at Manipur Technical University. Access question papers, notes, lab manuals, and more.",
  keywords: [
    "MTU",
    "Manipur Technical University",
    "B.Tech",
    "CSE",
    "Computer Science",
    "Question Papers",
    "Notes",
    "Academic Resources",
  ],
  authors: [{ name: "Nilambar Elangbam", url: "https://github.com/neslang-05" }],
  creator: "Nilambar Elangbam",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MTU Archive",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mtu-archive.vercel.app",
    siteName: "MTU Archive",
    title: "MTU Archive - Academic Resource Platform",
    description:
      "A community-driven academic archiving platform for B.Tech CSE students at Manipur Technical University.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MTU Archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MTU Archive - Academic Resource Platform",
    description:
      "A community-driven academic archiving platform for B.Tech CSE students at Manipur Technical University.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
        color: "#238636",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#238636" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWAProvider>
            {children}
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
