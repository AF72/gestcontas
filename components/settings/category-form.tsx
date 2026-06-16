'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createCategory, updateCategory } from '@/app/(app)/settings/actions'
import { Plus, Pencil } from 'lucide-react'
import type { Category } from '@/lib/types'

type CategoryFormProps = {
  category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>(category?.type ?? 'expense')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('type', type)

    const result = category
      ? await updateCategory(category.id, formData)
      : await createCategory(formData)

    setLoading(false)
    if (result?.error) { toast.error(result.error); return }
    toast.success(category ? 'Categoria actualizada.' : 'Categoria criada.')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {category ? (
        <DialogTrigger render={<button className="text-gray-400 hover:text-indigo-600" />}>
          <Pencil className="w-4 h-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<button className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors" />}>
          <Plus className="w-4 h-4" />
          Nova categoria
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label>Nome</Label>
            <Input name="name" defaultValue={category?.name} placeholder="Ex: Alimentação" required className="mt-1" />
          </div>
          <div>
            <Label>Tipo</Label>
            <div className="bg-gray-100 rounded-lg p-1 flex mt-1">
              <button type="button" onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                Despesa
              </button>
              <button type="button" onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                Proveito
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'A guardar...' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
