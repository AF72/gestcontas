'use client'

import { AVAILABLE_ICONS } from '@/lib/icons'
import { cn } from '@/lib/utils'

type IconPickerProps = {
  value: string
  onChange: (iconName: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVAILABLE_ICONS.map(({ name, label, icon: Icon }) => (
        <button
          key={name}
          type="button"
          title={label}
          onClick={() => onChange(name)}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
            value === name
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  )
}
