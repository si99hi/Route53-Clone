import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Amazon Route 53 - DNS service',
  description: 'A reliable and cost-effective way to route end users to Internet applications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased text-slate-800 bg-white min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
