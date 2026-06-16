import { getAccountsWithStats } from '@/lib/queries/accounts'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'

export default async function AccountsPage() {
  const accounts = await getAccountsWithStats()

  return (
    <div className="px-4 pt-12 pb-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
        <AccountForm />
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Ainda não tens contas.</p>
          <p className="text-xs mt-1">Toca em + para criar a primeira.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account, i) => (
            <AccountCard key={account.id} account={account} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
