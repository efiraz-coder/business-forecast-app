'use client'

import { ForecastResult } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'

interface ForecastTableProps {
  data: ForecastResult[]
}

export function ForecastTable({ data }: ForecastTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>חודש</TableHead>
          <TableHead>הכנסות</TableHead>
          <TableHead>הוצאות</TableHead>
          <TableHead>רווח נקי</TableHead>
          <TableHead>יתרה לחיסכון</TableHead>
          <TableHead>יתרת בנק</TableHead>
          <TableHead>מצב</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={`${row.year}-${row.month}`}>
            <TableCell className="font-medium">
              {row.monthName} {row.year}
            </TableCell>
            <TableCell>{formatCurrency(row.totalRevenueForecast)}</TableCell>
            <TableCell>{formatCurrency(row.totalExpensesForecast)}</TableCell>
            <TableCell
              className={cn(
                'font-medium',
                row.profitLossForecast >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrency(row.profitLossForecast)}
            </TableCell>
            <TableCell
              className={cn(
                'font-medium',
                (row.netSavings || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {formatCurrency(row.netSavings || 0)}
            </TableCell>
            <TableCell
              className={cn(
                'font-medium',
                row.bankBalanceForecast >= 0 ? 'text-blue-600' : 'text-red-600'
              )}
            >
              {formatCurrency(row.bankBalanceForecast)}
            </TableCell>
            <TableCell>
              <TrafficLightBadge status={row.trafficLight} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function TrafficLightBadge({ status }: { status: 'green' | 'yellow' | 'red' }) {
  const styles = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  }

  const labels = {
    green: 'תקין',
    yellow: 'תשומת לב',
    red: 'אזהרה',
  }

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
      {labels[status]}
    </span>
  )
}
