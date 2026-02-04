import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percent'
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export function StatCard({ 
  title, 
  value, 
  previousValue, 
  format = 'currency',
  trend,
  icon 
}: StatCardProps) {
  const formattedValue = format === 'currency' 
    ? formatCurrency(value)
    : format === 'percent'
    ? `${(value * 100).toFixed(1)}%`
    : value.toLocaleString('he-IL')

  const percentChange = previousValue && previousValue !== 0
    ? ((value - previousValue) / Math.abs(previousValue)) * 100
    : null

  const actualTrend = trend || (percentChange !== null 
    ? percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral'
    : 'neutral')

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          
          {percentChange !== null && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  trendColors[actualTrend]
                )}
              >
                {actualTrend === 'up' && (
                  <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {actualTrend === 'down' && (
                  <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {Math.abs(percentChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">מחודש קודם</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
