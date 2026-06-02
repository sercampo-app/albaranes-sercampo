import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Albaranes · Sercampo',
  description: 'Gestión digital de albaranes de recogida de aceites',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-6 pb-16">
          {children}
        </main>
      </body>
    </html>
  )
}
