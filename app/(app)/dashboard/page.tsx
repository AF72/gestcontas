import { formatCurrency } from '@/lib/utils'
import { getAccountsWithStats } from '@/lib/queries/accounts'
import { getRecentMovements } from '@/lib/queries/movements'
import { getCategories } from '@/lib/queries/categories'
import { getLabels } from '@/lib/queries/labels'
import { AccountCard } from '@/components/accounts/account-card'
import { RecentMovements } from '@/components/movements/recent-movements'

export default async function DashboardPage() {
  const [accounts, recentMovements, categories, labels] = await Promise.all([
    getAccountsWithStats(),
    getRecentMovements(10),
    getCategories(),
    getLabels(),
  ])

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  const totalCredit = accounts.reduce((sum, a) => sum + a.total_credit, 0)
  const totalDebit = accounts.reduce((sum, a) => sum + a.total_debit, 0)

  const now = new Date()
  const monthName = now.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 pt-12 pb-8 text-white">
        <p className="text-sm opacity-70 capitalize">{monthName}</p>
        <p className="text-sm opacity-80 mt-2">Saldo Total</p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-80">Proveitos</p>
            <p className="font-semibold">+{formatCurrency(totalCredit)}</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-80">Despesas</p>
            <p className="font-semibold">-{formatCurrency(totalDebit)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Accounts horizontal scroll */}
        {accounts.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contas
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {accounts.map((account, i) => (
                <AccountCard key={account.id} account={account} index={i} compact />
              ))}
            </div>
          </section>
        )}

        {/* Recent movements */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recentes
          </h2>
          {recentMovements.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">Ainda não tens movimentos.</p>
              <p className="text-xs mt-1">Toca em + para adicionar o primeiro.</p>
            </div>
          ) : (
            <RecentMovements
              movements={recentMovements}
              accounts={accounts}
              categories={categories}
              labels={labels}
            />
          )}
        </section>
      </div>
    </div>
  )
}
