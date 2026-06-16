import { createClient } from '@/lib/supabase/server'
import type { Movement, MovementFilters } from '@/lib/types'

export async function getMovements(filters?: MovementFilters): Promise<Movement[]> {
  const supabase = await createClient()

  let query = supabase
    .from('movements')
    .select(`
      *,
      categories(id, name, type),
      labels(id, name, symbol)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.category_id) query = query.eq('category_id', filters.category_id)
  if (filters?.label_id) query = query.eq('label_id', filters.label_id)

  if (filters?.month && filters?.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 0).toISOString().slice(0, 10)
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Movement[]) ?? []
}

export async function getMovementsByAccount(
  accountId: string,
  filters?: MovementFilters
): Promise<Movement[]> {
  const supabase = await createClient()

  let query = supabase
    .from('movements')
    .select(`
      *,
      categories(id, name, type),
      labels(id, name, symbol)
    `)
    .eq('account_id', accountId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.category_id) query = query.eq('category_id', filters.category_id)
  if (filters?.label_id) query = query.eq('label_id', filters.label_id)

  if (filters?.month && filters?.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 0).toISOString().slice(0, 10)
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Movement[]) ?? []
}

export async function getRecentMovements(limit = 10): Promise<Movement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movements')
    .select(`
      *,
      categories(id, name, type),
      labels(id, name, symbol)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data as Movement[]) ?? []
}
