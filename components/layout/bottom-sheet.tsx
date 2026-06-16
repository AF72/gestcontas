'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Account, Category, Label } from '@/lib/types'

type BottomSheetProps = {
  accounts: Account[]
  categories: Category[]
  labels: Label[]
}

export function BottomSheet({ accounts, categories, labels }: BottomSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isOpen = searchParams.get('add-movement') === 'true'
  const preselectedAccountId = searchParams.get('account') ?? undefined

  function handleClose() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('add-movement')
    params.delete('account')
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Movimento</SheetTitle>
        </SheetHeader>
        <div className="pt-4">
          <p className="text-sm text-gray-500 text-center">
            Formulário de movimento será adicionado na Task 9.
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Contas disponíveis: {accounts.length} | Categorias: {categories.length} | Labels: {labels.length}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
