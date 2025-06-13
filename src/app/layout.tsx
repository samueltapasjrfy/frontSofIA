import type { Metadata } from 'next'
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { preloadLottieAnimations } from '@/utils/lottieCache'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Pré-carrega animações comuns
preloadLottieAnimations(['loading', 'business']).catch(console.error);

export const metadata: Metadata = {
  title: 'Sofia - Dashboard Jurídico',
  description: 'Dashboard para análise de publicações jurídicas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR" style={{ overflow: 'hidden' }}>
      <body className={inter.variable}>
        <ReactQueryProvider>
          <AppProviders>{children}</AppProviders>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
