'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/lector', label: 'Lector' },
  { href: '/historico', label: 'Histórico' },
  { href: '/conductores', label: 'Conductores' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <header className="bg-white border-b sticky top-0 z-20" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 font-semibold text-sm shrink-0">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="26" height="26" rx="6" fill="#1a1a18"/>
            <path d="M7 14c2-4 4-6 6-6s4 2 6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="13" cy="17" r="3" fill="#fff"/>
          </svg>
          <span>Sercampo</span>
        </div>
        <nav className="flex gap-1">
          {tabs.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
