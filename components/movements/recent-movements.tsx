'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MovementItem } from './movement-item'
import { EditMovementSheet } from './edit-movement-sheet'
import type { Account, Category, Label, Movement } from '@/lib/types'

type RecentMovementsProps = {
  movements: Movement[]
  accounts: Account[]
  categories: Category[]
  labels: Label[]
}

export function RecentMovements({ movements, accounts, categories, labels }: RecentMovementsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function openEdit(movementId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit-movement', movementId)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-2">
      {movements.map((movement) => (
        <MovementItem
          key={movement.id}
          movement={movement}
          onClick={() => openEdit(movement.id)}
        />
      ))}

      <EditMovementSheet
        movements={movements}
        accounts={accounts}
        categories={categories}
        labels={labels}
      />
    </div>
  )
}
