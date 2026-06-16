import { createClient } from '@/lib/supabase/server'
import type { StatsByCategory, StatsByLabel } from '@/lib/types'

export async function getStatsByCategory(
  month: number,
  year: number,
  movementType: 'debit' | 'credit' = 'debit'
): Promise<StatsByCategory[]> {
  const supabase = await createClient()

  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('movements')
    .select('amount, type, category_id, categories(id, name, type)')
    .eq('type', movementType)
    .gte('date', start)
    .lte('date', end)

  if (error) throw new Error(error.message)
  if (!data) return []

  const grouped = new Map<string, StatsByCategory>()

  for (const movement of data as any[]) {
    const key = movement.category_id ?? 'sem-categoria'
    const existing = grouped.get(key)

    if (existing) {
      existing.total += Number(movement.amount)
    } else {
      grouped.set(key, {
        category_id: movement.category_id,
        category_name: movement.categories?.name ?? 'Sem categoria',
        category_type: movement.categories?.type ?? (movementType === 'debit' ? 'expense' : 'income'),
        total: Number(movement.amount),
      })
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total)
}

export async function getStatsByLabel(
  month: number,
  year: number
): Promise<StatsByLabel[]> {
  const supabase = await createClient()

  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('movements')
    .select('amount, type, label_id, labels(id, name, symbol)')
    .gte('date', start)
    .lte('date', end)
    .not('label_id', 'is', null)

  if (error) throw new Error(error.message)
  if (!data) return []

  const grouped = new Map<string, StatsByLabel>()

  for (const movement of data as any[]) {
    if (!movement.label_id) continue
    const amount = movement.type === 'debit'
      ? -Number(movement.amount)
      : Number(movement.amount)

    const existing = grouped.get(movement.label_id)
    if (existing) {
      existing.total += amount
    } else {
      grouped.set(movement.label_id, {
        label_id: movement.label_id,
        label_name: movement.labels?.name ?? '',
        label_symbol: movement.labels?.symbol ?? 'wallet',
        total: amount,
      })
    }
  }

  return Array.from(grouped.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
}
