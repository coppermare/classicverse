import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Classicverse — Interactive Classic Car Timeline',
  description:
    'An interactive timeline archive of iconic automobiles from 1885 to 2000. One landmark car per year, in context.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
