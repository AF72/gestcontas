'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { StatsByCategory } from '@/lib/types'

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

type CategoryPieChartProps = {
  data: StatsByCategory[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem dados para o período seleccionado.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category_name"
          cx="50%"
          cy="45%"
          outerRadius={80}
          innerRadius={50}
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => <span style={{ fontSize: '11px', color: '#374151' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
