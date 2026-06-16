import { getStatsByCategory, getStatsByLabel } from '@/lib/queries/stats'
import { CategoryPieChart } from '@/components/charts/category-pie-chart'
import { LabelBarChart } from '@/components/charts/label-bar-chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type PageProps = {
  searchParams: Promise<Record<string, string>>
}

export default async function StatsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const now = new Date()
  const month = Number(sp.month ?? now.getMonth() + 1)
  const year = Number(sp.year ?? now.getFullYear())

  const monthName = new Date(year, month - 1).toLocaleString('pt-PT', {
    month: 'long',
    year: 'numeric',
  })

  const [expensesByCategory, incomeByCategory, statsByLabel] = await Promise.all([
    getStatsByCategory(month, year, 'debit'),
    getStatsByCategory(month, year, 'credit'),
    getStatsByLabel(month, year),
  ])

  return (
    <div className="px-4 pt-12 pb-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estatísticas</h1>
        <span className="text-sm text-gray-500 capitalize">{monthName}</span>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="expenses" className="flex-1">Despesas</TabsTrigger>
          <TabsTrigger value="income" className="flex-1">Proveitos</TabsTrigger>
          <TabsTrigger value="labels" className="flex-1">Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Despesas por categoria
            </h2>
            <CategoryPieChart data={expensesByCategory} />
          </div>
        </TabsContent>

        <TabsContent value="income">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Proveitos por categoria
            </h2>
            <CategoryPieChart data={incomeByCategory} />
          </div>
        </TabsContent>

        <TabsContent value="labels">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Movimentos por label
            </h2>
            <LabelBarChart data={statsByLabel} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
