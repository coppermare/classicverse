import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// One typeface for the whole set — chrome, screen, and every channel. A second
// pixel "CRT" face was used for on-screen titles, which made the same product
// speak in two voices and rendered the smaller text hard to read.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Classicverse — Interactive Classic Car Timeline',
  description:
    'A century of cars — an interactive timeline archive of iconic automobiles from 1885 to 1984. One landmark car per year, in context.',
  openGraph: {
    title: 'Classicverse — Interactive Classic Car Timeline',
    description:
      'A century of cars — an interactive timeline archive of iconic automobiles from 1885 to 1984. One landmark car per year, in context.',
    siteName: 'Classicverse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classicverse — Interactive Classic Car Timeline',
    description:
      'A century of cars — an interactive timeline archive of iconic automobiles from 1885 to 1984. One landmark car per year, in context.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF7' },
    { media: '(prefers-color-scheme: dark)', color: '#151310' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={`${inter.variable} h-full`}>
      <body className="h-full min-h-screen antialiased" style={{ fontFamily: 'var(--font-sans)' }}>
        {children}
      </body>
    </html>
  );
}
