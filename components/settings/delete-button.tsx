'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteCategory, deleteLabel } from '@/app/(app)/settings/actions'

type DeleteButtonProps = {
  id: string
  type: 'category' | 'label'
}

export function DeleteButton({ id, type }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Tens a certeza? Esta acção não pode ser desfeita.')) return
    setLoading(true)
    const result = type === 'category' ? await deleteCategory(id) : await deleteLabel(id)
    setLoading(false)
    if (result?.error) { toast.error(result.error); return }
    toast.success(type === 'category' ? 'Categoria eliminada.' : 'Label eliminada.')
    router.refresh()
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-gray-400 hover:text-red-500 transition-colors">
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
