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
  title: 'Classicverse - A Universe of Classic Things',
  description:
    'The cars, the races and the radio, on a vintage television set you operate. Turn the dial and find a century of things people still love.',
  openGraph: {
    title: 'Classicverse - A Universe of Classic Things',
    description:
      'The cars, the races and the radio, on a vintage television set you operate. Turn the dial and find a century of things people still love.',
    siteName: 'Classicverse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classicverse - A Universe of Classic Things',
    description:
      'The cars, the races and the radio, on a vintage television set you operate. Turn the dial and find a century of things people still love.',
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
