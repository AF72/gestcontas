'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    type: formData.get('type') as 'expense' | 'income',
  })

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.get('name') as string,
      type: formData.get('type') as 'expense' | 'income',
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function createLabel(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('labels').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    symbol: formData.get('symbol') as string,
  })

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function updateLabel(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('labels')
    .update({
      name: formData.get('name') as string,
      symbol: formData.get('symbol') as string,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function deleteLabel(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('labels').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
}
