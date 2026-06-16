'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    account_number: formData.get('account_number') as string,
  })

  if (error) return { error: error.message }
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
}
