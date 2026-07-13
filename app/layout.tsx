import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/app/providers';
import AmbientBackground from '@/components/AmbientBackground';
import CursorGlow from '@/components/CursorGlow';
import ThemeToggle from '@/components/ThemeToggle';

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

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Drift — VENUGOPALAM CHUKKA',
  description:
    'A portfolio built around quiet, breathing motion, floating aesthetics, and smooth scroll transitions.',
  keywords: ['portfolio', 'developer', 'creative', 'drift', 'smooth', 'animations'],
  authors: [{ name: 'VENUGOPALAM CHUKKA' }],
};

export const viewport: Viewport = {
  themeColor: '#030303',
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`}
      suppressHydrationWarning
    >
      <ThemeProvider>
        <body
          className="antialiased relative min-h-screen"
          style={{
            background: 'var(--body-gradient, var(--bg-base))',
            color: 'var(--text-primary)',
          }}
        >
          {/* Ambient Particle Field Background */}
          <AmbientBackground />

          {/* Cursor Halo Glow */}
          <CursorGlow />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Core Portfolio Content */}
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
