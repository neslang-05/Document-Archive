import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAProvider } from "@/components/providers/pwa-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://document-archive.vercel.app"),
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
    url: "https://document-archive.vercel.app",
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
      { url: "/logo.ico", type: "image/x-icon" },
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/logo.ico",
    apple: [
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
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
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        
        <link rel="icon" href="/logo.ico" type="image/x-icon" />
        <link rel="alternate icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-144x144.png" />
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
