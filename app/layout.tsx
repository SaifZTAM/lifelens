import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LifeLens — Decision Intelligence',
  description: 'Real-time AI nudges to improve your focus, decisions, and well-being.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <ThemeProvider>
          {/* SVG filter for liquid glass refraction — referenced by backdrop-filter: url(#lg-refract) */}
          <svg width="0" height="0" style={{ position: 'fixed', pointerEvents: 'none', zIndex: -1 }} aria-hidden="true">
            <defs>
              <filter id="lg-refract" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="3" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
