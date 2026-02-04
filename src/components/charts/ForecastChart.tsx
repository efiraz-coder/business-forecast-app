'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { ForecastResult } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ForecastChartProps {
  data: ForecastResult[]
  dataKey: keyof ForecastResult
  color?: string
  showComparison?: boolean
  comparisonData?: ForecastResult[]
  comparisonColor?: string
}

export function ForecastChart({
  data,
  dataKey,
  color = '#3b82f6',
  showComparison = false,
  comparisonData,
  comparisonColor = '#f59e0b',
}: ForecastChartProps) {
  const chartData = data.map((item, index) => ({
    name: `${item.monthName} ${item.year}`,
    value: item[dataKey] as number,
    comparison: showComparison && comparisonData ? comparisonData[index]?.[dataKey] as number : undefined,
  }))

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value).replace('₪', '')}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ fontWeight: 'bold' }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="תחזית"
          />
          {showComparison && (
            <Line
              type="monotone"
              dataKey="comparison"
              stroke={comparisonColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: comparisonColor, strokeWidth: 2, r: 4 }}
              name="תרחיש"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
