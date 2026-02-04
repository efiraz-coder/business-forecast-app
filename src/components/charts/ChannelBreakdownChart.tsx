'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ForecastResult } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ChannelBreakdownChartProps {
  data: ForecastResult[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function ChannelBreakdownChart({ data }: ChannelBreakdownChartProps) {
  // Aggregate channel data across all months
  const channelTotals: Record<string, { name: string; revenue: number; marketing: number }> = {}
  
  data.forEach(month => {
    if (month.channelBreakdown) {
      month.channelBreakdown.forEach(channel => {
        if (!channelTotals[channel.channelId]) {
          channelTotals[channel.channelId] = {
            name: channel.channelName,
            revenue: 0,
            marketing: 0,
          }
        }
        channelTotals[channel.channelId].revenue += channel.revenue
        channelTotals[channel.channelId].marketing += channel.marketingBudget
      })
    }
  })
  
  const chartData = Object.values(channelTotals).map(ch => ({
    name: ch.name,
    הכנסות: ch.revenue,
    שיווק: ch.marketing,
    roi: ch.marketing > 0 ? (ch.revenue / ch.marketing).toFixed(1) : 0,
  }))
  
  if (chartData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-500">
        אין נתוני ערוצים להצגה
      </div>
    )
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            labelStyle={{ fontWeight: 'bold' }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend />
          <Bar dataKey="הכנסות" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="שיווק" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
