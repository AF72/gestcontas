'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Home, Building2, Plus, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/accounts', icon: Building2, label: 'Contas' },
  { href: null, icon: Plus, label: 'Adicionar' },
  { href: '/stats', icon: BarChart2, label: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Config' },
]

export function TabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function openAddMovement() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('add-movement', 'true')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-2 z-40 max-w-lg mx-auto">
      {TABS.map((tab) => {
        if (!tab.href) {
          return (
            <button
              key="add"
              onClick={openAddMovement}
              className="flex flex-col items-center"
              aria-label="Adicionar movimento"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg -mt-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </button>
          )
        }

        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              isActive ? 'text-indigo-600' : 'text-gray-400'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
