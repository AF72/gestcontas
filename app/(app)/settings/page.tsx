import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/queries/categories'
import { getLabels } from '@/lib/queries/labels'
import { logout } from '@/app/(auth)/login/actions'
import { CategoryForm } from '@/components/settings/category-form'
import { LabelForm } from '@/components/settings/label-form'
import { DeleteButton } from '@/components/settings/delete-button'
import { getIconComponent } from '@/lib/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [categories, labels] = await Promise.all([getCategories(), getLabels()])

  return (
    <div className="px-4 pt-12 pb-5 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {user?.email?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{user?.email}</p>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit" title="Sair">
            <LogOut className="w-4 h-4 text-gray-400" />
          </Button>
        </form>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Categorias
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 p-4 text-center">Sem categorias.</p>
          )}
          {categories.map((cat, i) => (
            <div key={cat.id} className={`flex items-center justify-between p-3 ${i < categories.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{cat.name}</span>
                <Badge variant={cat.type === 'expense' ? 'destructive' : 'default'} className="text-[10px]">
                  {cat.type === 'expense' ? 'despesa' : 'proveito'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <CategoryForm category={cat} />
                <DeleteButton id={cat.id} type="category" />
              </div>
            </div>
          ))}
          <div className="p-3">
            <CategoryForm />
          </div>
        </div>
      </section>

      {/* Labels */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Labels
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {labels.length === 0 && (
            <p className="text-sm text-gray-400 p-4 text-center">Sem labels.</p>
          )}
          {labels.map((lbl, i) => {
            const Icon = getIconComponent(lbl.symbol)
            return (
              <div key={lbl.id} className={`flex items-center justify-between p-3 ${i < labels.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">{lbl.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LabelForm label={lbl} />
                  <DeleteButton id={lbl.id} type="label" />
                </div>
              </div>
            )
          })}
          <div className="p-3">
            <LabelForm />
          </div>
        </div>
      </section>
    </div>
  )
}
