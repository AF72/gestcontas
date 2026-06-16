'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createLabel, updateLabel } from '@/app/(app)/settings/actions'
import { IconPicker } from './icon-picker'
import { getIconComponent } from '@/lib/icons'
import { Plus, Pencil } from 'lucide-react'
import type { Label as LabelType } from '@/lib/types'

type LabelFormProps = {
  label?: LabelType
}

export function LabelForm({ label }: LabelFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState(label?.symbol ?? 'wallet')
  const router = useRouter()

  const SelectedIcon = getIconComponent(symbol)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('symbol', symbol)

    const result = label
      ? await updateLabel(label.id, formData)
      : await createLabel(formData)

    setLoading(false)
    if (result?.error) { toast.error(result.error); return }
    toast.success(label ? 'Label actualizada.' : 'Label criada.')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {label ? (
        <DialogTrigger render={<button className="text-gray-400 hover:text-indigo-600" />}>
          <Pencil className="w-4 h-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<button className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors" />}>
          <Plus className="w-4 h-4" />
          Nova label
        </DialogTrigger>
      )}
      <DialogContent className="overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{label ? 'Editar Label' : 'Nova Label'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label>Nome</Label>
            <Input name="name" defaultValue={label?.name} placeholder="Ex: Férias" required className="mt-1" />
          </div>
          <div>
            <Label>Ícone seleccionado</Label>
            <div className="mt-1 flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
              <SelectedIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-indigo-700 font-medium">{symbol}</span>
            </div>
          </div>
          <div>
            <Label>Escolher ícone</Label>
            <div className="mt-2">
              <IconPicker value={symbol} onChange={setSymbol} />
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
