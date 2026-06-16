'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMovement(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('movements').insert({
    user_id: user.id,
    account_id: formData.get('account_id') as string,
    date: formData.get('date') as string,
    description: formData.get('description') as string,
    amount: Number(formData.get('amount')),
    type: formData.get('type') as 'credit' | 'debit',
    category_id: (formData.get('category_id') as string) || null,
    label_id: (formData.get('label_id') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/', 'layout')
}

export async function updateMovement(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('movements')
    .update({
      account_id: formData.get('account_id') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      type: formData.get('type') as 'credit' | 'debit',
      category_id: (formData.get('category_id') as string) || null,
      label_id: (formData.get('label_id') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/', 'layout')
}

export async function deleteMovement(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('movements').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/', 'layout')
}
