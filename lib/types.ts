export type Account = {
  id: string
  user_id: string
  name: string
  account_number: string
  created_at: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  type: 'expense' | 'income'
  created_at: string
}

export type Label = {
  id: string
  user_id: string
  name: string
  symbol: string
  created_at: string
}

export type MovementType = 'credit' | 'debit'

export type Movement = {
  id: string
  account_id: string
  user_id: string
  date: string
  description: string
  amount: number
  type: MovementType
  category_id: string | null
  label_id: string | null
  created_at: string
  categories?: Pick<Category, 'id' | 'name' | 'type'> | null
  labels?: Pick<Label, 'id' | 'name' | 'symbol'> | null
}

export type AccountWithStats = Account & {
  balance: number
  total_credit: number
  total_debit: number
  movement_count: number
}

export type MovementFilters = {
  type?: MovementType
  category_id?: string
  label_id?: string
  month?: number
  year?: number
}

export type StatsByCategory = {
  category_id: string | null
  category_name: string
  category_type: 'expense' | 'income'
  total: number
}

export type StatsByLabel = {
  label_id: string | null
  label_name: string
  label_symbol: string
  total: number
}
