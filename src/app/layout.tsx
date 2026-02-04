import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "InputHaven - The Most Affordable Form Backend as a Service",
    template: "%s | InputHaven",
  },
  description:
    "Collect HTML form submissions without a backend. 500 free submissions/month, AI spam filtering, email routing, visual form builder. Works with React, Vue, Svelte, Next.js.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: [
    "form backend", "form API", "form endpoint", "form backend as a service",
    "HTML form backend", "Formspree alternative", "contact form API",
    "serverless forms", "form submission handler",
  ],
  authors: [{ name: "InputHaven" }],
  creator: "InputHaven",
  publisher: "InputHaven",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "InputHaven - The Most Affordable Form Backend",
    description: "Collect form submissions without a backend. 500 free/month. AI spam filtering. Works with any frontend.",
    siteName: "InputHaven",
    type: "website",
    locale: "en_US",
    url: "https://inputhaven.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "InputHaven - Form Backend as a Service",
    description: "500 free submissions/month. AI spam filtering. Works with HTML, React, Vue, Next.js.",
  },
  alternates: {
    canonical: "https://inputhaven.com",
  },
  other: {
    "llms.txt": "https://inputhaven.com/llms.txt",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
