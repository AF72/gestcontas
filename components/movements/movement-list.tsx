'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MovementItem } from './movement-item'
import { EditMovementSheet } from './edit-movement-sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Movement, Account, Category, Label } from '@/lib/types'

type MovementListProps = {
  movements: Movement[]
  accounts: Account[]
  categories: Category[]
  labels: Label[]
  accountId: string
}

export function MovementList({ movements, accounts, categories, labels, accountId }: MovementListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`)
  }

  function openEdit(movementId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit-movement', movementId)
    router.push(`${pathname}?${params.toString()}`)
  }

  const typeFilter = searchParams.get('type') ?? ''
  const categoryFilter = searchParams.get('category_id') ?? ''
  const labelFilter = searchParams.get('label_id') ?? ''

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Select value={typeFilter} onValueChange={(v) => updateFilter('type', v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="min-w-[110px] h-8 text-xs">
            <SelectValue placeholder="Tipo">
              {(value: string) => ({ '': 'Todos', all: 'Todos', debit: 'Débito', credit: 'Crédito' })[value] ?? 'Tipo'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="debit">Débito</SelectItem>
            <SelectItem value="credit">Crédito</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => updateFilter('category_id', v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="min-w-[130px] h-8 text-xs">
            <SelectValue placeholder="Categoria">
              {(value: string) => (!value || value === 'all') ? 'Todas' : categories.find((c) => c.id === value)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={labelFilter} onValueChange={(v) => updateFilter('label_id', v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="min-w-[110px] h-8 text-xs">
            <SelectValue placeholder="Label">
              {(value: string) => (!value || value === 'all') ? 'Todas' : labels.find((l) => l.id === value)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {labels.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {movements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Sem movimentos para os filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((movement) => (
            <MovementItem
              key={movement.id}
              movement={movement}
              onClick={() => openEdit(movement.id)}
            />
          ))}
        </div>
      )}

      <EditMovementSheet
        movements={movements}
        accounts={accounts}
        categories={categories}
        labels={labels}
      />
    </div>
  )
}
