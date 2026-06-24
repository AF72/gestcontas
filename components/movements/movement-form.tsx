'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createMovement, updateMovement, deleteMovement } from '@/lib/actions/movements'
import { formatDateInput } from '@/lib/utils'
import { getIconComponent } from '@/lib/icons'
import type { Account, Category, Label as LabelType, Movement } from '@/lib/types'

type MovementFormProps = {
  accounts: Account[]
  categories: Category[]
  labels: LabelType[]
  preselectedAccountId?: string
  movement?: Movement
  onSuccess?: () => void
}

export function MovementForm({
  accounts,
  categories,
  labels,
  preselectedAccountId,
  movement,
  onSuccess,
}: MovementFormProps) {
  const [type, setType] = useState<'debit' | 'credit'>(movement?.type ?? 'debit')
  const [categoryId, setCategoryId] = useState(movement?.category_id ?? '')
  const [labelId, setLabelId] = useState(movement?.label_id ?? '')
  const [accountId, setAccountId] = useState(
    movement?.account_id ?? preselectedAccountId ?? accounts[0]?.id ?? ''
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isPreselected = !!preselectedAccountId && !movement

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('type', type)
    formData.set('account_id', accountId)
    formData.set('category_id', categoryId)
    formData.set('label_id', labelId)

    const result = movement
      ? await updateMovement(movement.id, formData)
      : await createMovement(formData)

    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success(movement ? 'Movimento actualizado.' : 'Movimento registado.')
    router.refresh()
    onSuccess?.()
  }

  async function handleDelete() {
    if (!movement) return
    if (!confirm('Tens a certeza? Esta acção não pode ser desfeita.')) return

    setLoading(true)
    const result = await deleteMovement(movement.id)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Movimento eliminado.')
    router.refresh()
    onSuccess?.()
  }

  const filteredCategories = categories.filter((c) =>
    type === 'debit' ? c.type === 'expense' : c.type === 'income'
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {/* Debit/Credit toggle */}
      <div className="bg-gray-100 rounded-lg p-1 flex">
        <button
          type="button"
          onClick={() => { setType('debit'); setCategoryId('') }}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            type === 'debit' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          Débito
        </button>
        <button
          type="button"
          onClick={() => { setType('credit'); setCategoryId('') }}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            type === 'credit' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          Crédito
        </button>
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="amount">Valor (€)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          defaultValue={movement ? Number(movement.amount) : ''}
          required
          className="mt-1 text-lg font-semibold"
        />
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={movement ? formatDateInput(movement.date) : new Date().toISOString().slice(0, 10)}
          required
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          placeholder="Ex: Supermercado Continente"
          defaultValue={movement?.description ?? ''}
          required
          className="mt-1"
        />
      </div>

      {/* Account */}
      <div>
        <Label>Conta</Label>
        <Select
          value={accountId}
          onValueChange={(v) => setAccountId(v ?? '')}
          disabled={isPreselected}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Seleccionar conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div>
        <Label>Categoria</Label>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sem categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem categoria</SelectItem>
            {filteredCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Label */}
      <div>
        <Label>Label</Label>
        <Select value={labelId} onValueChange={(v) => setLabelId(v ?? '')}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sem label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem label</SelectItem>
            {labels.map((lbl) => {
              const Icon = getIconComponent(lbl.symbol)
              return (
                <SelectItem key={lbl.id} value={lbl.id}>
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {lbl.name}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
        disabled={loading}
      >
        {loading ? 'A guardar...' : movement ? 'Actualizar' : 'Guardar Movimento'}
      </Button>

      {movement && (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          disabled={loading}
          onClick={handleDelete}
        >
          Eliminar Movimento
        </Button>
      )}
    </form>
  )
}
