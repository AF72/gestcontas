import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getAccountById } from '@/lib/queries/accounts'
import { getMovementsByAccount } from '@/lib/queries/movements'
import { getCategories } from '@/lib/queries/categories'
import { getLabels } from '@/lib/queries/labels'
import { MovementList } from '@/components/movements/movement-list'
import { formatCurrency } from '@/lib/utils'
import type { MovementFilters } from '@/lib/types'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}

export default async function AccountDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams

  const [account, categories, labels] = await Promise.all([
    getAccountById(id),
    getCategories(),
    getLabels(),
  ])

  if (!account) notFound()

  const filters: MovementFilters = {
    type: sp.type as MovementFilters['type'],
    category_id: sp.category_id,
    label_id: sp.label_id,
  }

  const movements = await getMovementsByAccount(id, filters)

  const balance = movements.reduce(
    (sum, m) => sum + (m.type === 'credit' ? Number(m.amount) : -Number(m.amount)),
    0
  )

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-4 pt-10 pb-6 text-white">
        <Link href="/accounts" className="flex items-center gap-1 text-white/80 text-sm mb-4">
          <ChevronLeft className="w-4 h-4" />
          Contas
        </Link>
        <p className="text-sm opacity-80">{account.name}</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(balance)}</p>
        <p className="text-xs opacity-60 mt-1">{account.account_number}</p>
      </div>

      <div className="px-4 pt-4">
        <MovementList
          movements={movements}
          categories={categories}
          labels={labels}
          accountId={id}
        />
      </div>
    </div>
  )
}
