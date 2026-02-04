import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { MainNav } from '@/components/MainNav'

const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  title: 'מערכת חיזוי כלכלי לעסקים',
  description: 'מערכת לניהול וחיזוי כלכלי לעסקים קטנים',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} font-sans antialiased`}>
        <Providers>
          <MainNav />
          <main className="min-h-[calc(100vh-56px)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
