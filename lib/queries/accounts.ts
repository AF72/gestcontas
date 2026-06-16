import { createClient } from '@/lib/supabase/server'
import type { Account, AccountWithStats } from '@/lib/types'

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAccountById(id: string): Promise<Account | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getAccountsWithStats(): Promise<AccountWithStats[]> {
  const supabase = await createClient()

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at')

  if (error) throw new Error(error.message)
  if (!accounts || accounts.length === 0) return []

  const accountsWithStats = await Promise.all(
    accounts.map(async (account) => {
      const { data: movements } = await supabase
        .from('movements')
        .select('amount, type')
        .eq('account_id', account.id)

      const total_credit = (movements ?? [])
        .filter((m) => m.type === 'credit')
        .reduce((sum, m) => sum + Number(m.amount), 0)

      const total_debit = (movements ?? [])
        .filter((m) => m.type === 'debit')
        .reduce((sum, m) => sum + Number(m.amount), 0)

      return {
        ...account,
        balance: total_credit - total_debit,
        total_credit,
        total_debit,
        movement_count: (movements ?? []).length,
      }
    })
  )

  return accountsWithStats
}
