import { createClient } from '@/lib/supabase/server'
import type { Label } from '@/lib/types'

export async function getLabels(): Promise<Label[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}
