import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Frequency — VENUGOPALAM CHUKKA',
  description:
    'A portfolio built on the broadcast metaphor. Tune into projects, skills, and transmissions.',
  keywords: ['portfolio', 'developer', 'creative', 'frequency', 'broadcast'],
  authors: [{ name: 'VENUGOPALAM CHUKKA' }],
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] antialiased">
        {/* Persistent CRT overlay */}
        <div className="crt-overlay" aria-hidden="true" />
        <div className="vignette-overlay" aria-hidden="true" />
        {/* Persistent CSS Noise Overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
