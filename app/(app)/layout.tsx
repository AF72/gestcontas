import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TabBar } from '@/components/layout/tab-bar'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { getAccounts } from '@/lib/queries/accounts'
import { getCategories } from '@/lib/queries/categories'
import { getLabels } from '@/lib/queries/labels'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [accounts, categories, labels] = await Promise.all([
    getAccounts(),
    getCategories(),
    getLabels(),
  ])

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto relative">
      <main className="pb-20">{children}</main>
      <TabBar />
      <BottomSheet
        accounts={accounts}
        categories={categories}
        labels={labels}
      />
    </div>
  )
}
