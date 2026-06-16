import { formatCurrency, formatDate } from '@/lib/utils'
import { getIconComponent } from '@/lib/icons'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Movement } from '@/lib/types'

type MovementItemProps = {
  movement: Movement
  onClick?: () => void
}

export function MovementItem({ movement, onClick }: MovementItemProps) {
  const isCredit = movement.type === 'credit'
  const IconComponent = movement.labels?.symbol
    ? getIconComponent(movement.labels.symbol)
    : null

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors text-left"
    >
      {/* Icon: label icon or colored circle */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        isCredit ? 'bg-green-50' : 'bg-red-50'
      )}>
        {IconComponent ? (
          <IconComponent className={cn('w-5 h-5', isCredit ? 'text-green-600' : 'text-red-500')} />
        ) : (
          <div className={cn('w-3 h-3 rounded-full', isCredit ? 'bg-green-500' : 'bg-red-500')} />
        )}
      </div>

      {/* Description and category */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {movement.description}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(movement.date)}</span>
          {movement.categories && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {movement.categories.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Amount */}
      <span className={cn(
        'font-semibold text-sm flex-shrink-0',
        isCredit ? 'text-green-600' : 'text-red-500'
      )}>
        {isCredit ? '+' : '-'}{formatCurrency(Number(movement.amount))}
      </span>
    </button>
  )
}
