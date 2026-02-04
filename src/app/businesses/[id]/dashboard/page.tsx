'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { TrafficLight } from '@/components/dashboard/TrafficLight'
import { StatCard } from '@/components/dashboard/StatCard'
import { ForecastChart } from '@/components/charts/ForecastChart'
import { ForecastTable } from '@/components/charts/ForecastTable'
import { ChannelBreakdownChart } from '@/components/charts/ChannelBreakdownChart'
import { ForecastResult } from '@/types'

export default function DashboardPage() {
  const params = useParams()
  const businessId = params.id as string
  const [forecast, setForecast] = useState<ForecastResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await fetch(`/api/forecast?businessId=${businessId}&monthsAhead=12`)
        const data = await res.json()
        if (data.success) {
          setForecast(data.data)
        }
      } catch (error) {
        console.error('Error fetching forecast:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [businessId])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-6 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-32" />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 h-96" />
      </div>
    )
  }

  // Calculate summary stats - מודל ROI של בן
  const totalRevenue = forecast.reduce((sum, f) => sum + f.totalRevenueForecast, 0)
  const totalProfit = forecast.reduce((sum, f) => sum + f.profitLossForecast, 0)
  const totalNetSavings = forecast.reduce((sum, f) => sum + (f.netSavings || 0), 0)
  const avgNetSavingsPerMonth = totalNetSavings / forecast.length
  const endingBalance = forecast[forecast.length - 1]?.bankBalanceForecast || 0
  const totalMarketingSpend = forecast.reduce((sum, f) => sum + (f.marketingExpenses || 0), 0)
  const avgROI = totalRevenue > 0 && totalMarketingSpend > 0 
    ? totalRevenue / totalMarketingSpend 
    : 0

  // Get overall traffic light
  const redMonths = forecast.filter((f) => f.trafficLight === 'red').length
  const yellowMonths = forecast.filter((f) => f.trafficLight === 'yellow').length
  const overallStatus: 'green' | 'yellow' | 'red' = 
    redMonths >= 3 ? 'red' : 
    yellowMonths >= 4 || redMonths >= 1 ? 'yellow' : 
    'green'
  
  const overallReason = 
    overallStatus === 'red' 
      ? `${redMonths} חודשים עם אזהרות חמורות מתוך 12`
      : overallStatus === 'yellow'
      ? `${yellowMonths + redMonths} חודשים דורשים תשומת לב`
      : `יתרה לחיסכון ממוצעת: ${avgNetSavingsPerMonth.toLocaleString('he-IL')} ₪ לחודש`

  return (
    <div className="space-y-6">
      {/* Traffic Light */}
      <TrafficLight status={overallStatus} reason={overallReason} size="lg" />

      {/* Stats Grid - 5 columns with Net Savings */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          title="סה״כ הכנסות"
          value={totalRevenue}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="רווח נקי"
          value={totalProfit}
          trend={totalProfit >= 0 ? 'up' : 'down'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="יתרה לחיסכון"
          value={totalNetSavings}
          trend={totalNetSavings >= 0 ? 'up' : 'down'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="יחס החזר שיווקי"
          value={avgROI}
          format="number"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          title="יתרת בנק סופית"
          value={endingBalance}
          trend={endingBalance >= 0 ? 'up' : 'down'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>יתרה לחיסכון חודשית</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastChart data={forecast} dataKey="netSavings" color="#10b981" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>רווח/הפסד חודשי</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastChart data={forecast} dataKey="profitLossForecast" color="#3b82f6" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>יתרת בנק צפויה</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastChart data={forecast} dataKey="bankBalanceForecast" color="#8b5cf6" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פירוט הכנסות לפי ערוץ</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelBreakdownChart data={forecast} />
          </CardContent>
        </Card>
      </div>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>פירוט תחזית חודשית</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ForecastTable data={forecast} />
        </CardContent>
      </Card>
    </div>
  )
}
