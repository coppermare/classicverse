import type { Metadata, Viewport } from 'next';
import { Inter, VT323 } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

// Retro CRT on-screen-display face, used for text drawn on the TV screen.
const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-crt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Classicverse — Interactive Classic Car Timeline',
  description:
    'An interactive timeline archive of iconic automobiles from 1885 to 2000. One landmark car per year, in context.',
  openGraph: {
    title: 'Classicverse — Interactive Classic Car Timeline',
    description:
      'An interactive timeline archive of iconic automobiles from 1885 to 2000. One landmark car per year, in context.',
    siteName: 'Classicverse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classicverse — Interactive Classic Car Timeline',
    description:
      'An interactive timeline archive of iconic automobiles from 1885 to 2000. One landmark car per year, in context.',
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
    <html lang="en" data-theme="light" className={`${inter.variable} ${vt323.variable} h-full`}>
      <body className="h-full min-h-screen antialiased" style={{ fontFamily: 'var(--font-sans)' }}>
        {children}
      </body>
    </html>
  );
}
