'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { StatsByLabel } from '@/lib/types'

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#f59e0b', '#ef4444']

type LabelBarChartProps = {
  data: StatsByLabel[]
}

export function LabelBarChart({ data }: LabelBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem labels com movimentos no período seleccionado.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.label_name,
    total: Math.abs(d.total),
    symbol: d.label_symbol,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 48)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis
          type="number"
          tickFormatter={(v) => `€${v}`}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
