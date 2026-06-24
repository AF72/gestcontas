'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MovementForm } from '@/components/movements/movement-form'
import type { Account, Category, Label, Movement } from '@/lib/types'

type EditMovementSheetProps = {
  movements: Movement[]
  accounts: Account[]
  categories: Category[]
  labels: Label[]
}

export function EditMovementSheet({ movements, accounts, categories, labels }: EditMovementSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const movement = movements.find((m) => m.id === searchParams.get('edit-movement'))

  function handleClose() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('edit-movement')
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Sheet open={!!movement} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Movimento</SheetTitle>
        </SheetHeader>
        {movement && (
          <MovementForm
            accounts={accounts}
            categories={categories}
            labels={labels}
            movement={movement}
            onSuccess={handleClose}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
