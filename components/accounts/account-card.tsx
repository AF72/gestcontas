import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { AccountWithStats } from '@/lib/types'

const GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
]

type AccountCardProps = {
  account: AccountWithStats
  index?: number
  compact?: boolean
}

export function AccountCard({ account, index = 0, compact = false }: AccountCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length]

  if (compact) {
    return (
      <Link
        href={`/accounts/${account.id}`}
        className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white min-w-[140px] flex-shrink-0 block`}
      >
        <p className="text-xs opacity-80 truncate">{account.name}</p>
        <p className="text-xl font-bold mt-1">{formatCurrency(account.balance)}</p>
      </Link>
    )
  }

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
        <p className="text-sm opacity-80">{account.name}</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(account.balance)}</p>
        <p className="text-xs opacity-60 mt-1 truncate">{account.account_number}</p>
      </div>
      <div className="flex divide-x divide-gray-100">
        <div className="flex-1 p-3 text-center">
          <p className="text-xs text-gray-400">Entradas</p>
          <p className="text-sm font-semibold text-green-600">
            +{formatCurrency(account.total_credit)}
          </p>
        </div>
        <div className="flex-1 p-3 text-center">
          <p className="text-xs text-gray-400">Saídas</p>
          <p className="text-sm font-semibold text-red-500">
            -{formatCurrency(account.total_debit)}
          </p>
        </div>
        <div className="flex-1 p-3 text-center">
          <p className="text-xs text-gray-400">Movimentos</p>
          <p className="text-sm font-semibold text-gray-700">{account.movement_count}</p>
        </div>
      </div>
    </Link>
  )
}
