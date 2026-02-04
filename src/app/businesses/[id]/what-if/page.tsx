'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Slider } from '@/components/ui'
import { ForecastChart } from '@/components/charts/ForecastChart'
import { ForecastResult } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface RevenueChannel {
  id: string
  name: string
  marketingRoi: number
}

export default function WhatIfPage() {
  const params = useParams()
  const businessId = params.id as string
  const [baseForecast, setBaseForecast] = useState<ForecastResult[]>([])
  const [scenarioForecast, setScenarioForecast] = useState<ForecastResult[]>([])
  const [channels, setChannels] = useState<RevenueChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  // Scenario parameters - מודל ROI
  const [marketingBudgetMultiplier, setMarketingBudgetMultiplier] = useState(100)
  const [variableCostAdjustment, setVariableCostAdjustment] = useState(0)
  const [fixedCostsMultiplier, setFixedCostsMultiplier] = useState(100)
  const [channelRoiMultipliers, setChannelRoiMultipliers] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchData()
  }, [businessId])

  const fetchData = async () => {
    try {
      const [forecastRes, channelsRes] = await Promise.all([
        fetch(`/api/forecast?businessId=${businessId}&monthsAhead=12`),
        fetch(`/api/businesses/${businessId}/revenue-channels`),
      ])
      
      const forecastData = await forecastRes.json()
      const channelsData = await channelsRes.json()
      
      if (forecastData.success) setBaseForecast(forecastData.data)
      if (channelsData.success) {
        setChannels(channelsData.data)
        // Initialize ROI multipliers to 100%
        const initialMultipliers: Record<string, number> = {}
        channelsData.data.forEach((ch: RevenueChannel) => {
          initialMultipliers[ch.id] = 100
        })
        setChannelRoiMultipliers(initialMultipliers)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateScenario = async () => {
    setCalculating(true)
    try {
      const channelRoiOverrides = Object.entries(channelRoiMultipliers)
        .filter(([_, multiplier]) => multiplier !== 100)
        .map(([channelId, multiplier]) => ({
          channelId,
          roiMultiplier: multiplier / 100,
        }))

      const res = await fetch('/api/forecast/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          monthsAhead: 12,
          marketingBudgetMultiplier: marketingBudgetMultiplier / 100,
          channelRoiOverrides,
          variableCostRateAdjustment: variableCostAdjustment / 100,
          fixedCostsMultiplier: fixedCostsMultiplier / 100,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setScenarioForecast(data.data)
      }
    } catch (error) {
      console.error('Error calculating scenario:', error)
    } finally {
      setCalculating(false)
    }
  }

  const resetScenario = () => {
    setMarketingBudgetMultiplier(100)
    setVariableCostAdjustment(0)
    setFixedCostsMultiplier(100)
    const resetMultipliers: Record<string, number> = {}
    channels.forEach(ch => {
      resetMultipliers[ch.id] = 100
    })
    setChannelRoiMultipliers(resetMultipliers)
    setScenarioForecast([])
  }

  // Calculate summaries
  const baseProfit = baseForecast.reduce((sum, f) => sum + f.profitLossForecast, 0)
  const baseSavings = baseForecast.reduce((sum, f) => sum + (f.netSavings || 0), 0)
  const scenarioProfit = scenarioForecast.reduce((sum, f) => sum + f.profitLossForecast, 0)
  const scenarioSavings = scenarioForecast.reduce((sum, f) => sum + (f.netSavings || 0), 0)
  const profitDifference = scenarioForecast.length > 0 ? scenarioProfit - baseProfit : 0
  const savingsDifference = scenarioForecast.length > 0 ? scenarioSavings - baseSavings : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">מה יקרה אם...</h2>
        <p className="text-gray-600">שנה פרמטרים וראה את ההשפעה על הרווחיות והיתרה לחיסכון</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>פרמטרי תרחיש (מודל ROI)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Slider
              label="שינוי בתקציב שיווק"
              min={0}
              max={300}
              step={10}
              value={marketingBudgetMultiplier}
              onChange={(e) => setMarketingBudgetMultiplier(Number(e.target.value))}
              displayValue={`${marketingBudgetMultiplier}%`}
            />

            <Slider
              label="שינוי בהוצאות קבועות"
              min={50}
              max={200}
              step={5}
              value={fixedCostsMultiplier}
              onChange={(e) => setFixedCostsMultiplier(Number(e.target.value))}
              displayValue={`${fixedCostsMultiplier}%`}
            />

            <Slider
              label="שינוי באחוז עלות משתנה"
              min={-20}
              max={20}
              step={1}
              value={variableCostAdjustment}
              onChange={(e) => setVariableCostAdjustment(Number(e.target.value))}
              displayValue={variableCostAdjustment >= 0 ? `+${variableCostAdjustment}%` : `${variableCostAdjustment}%`}
            />

            {/* Per-channel ROI sliders */}
            {channels.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">יחס החזר שיווקי לפי ערוץ</h4>
                {channels.map(channel => (
                  <Slider
                    key={channel.id}
                    label={channel.name}
                    min={50}
                    max={200}
                    step={5}
                    value={channelRoiMultipliers[channel.id] || 100}
                    onChange={(e) => setChannelRoiMultipliers(prev => ({
                      ...prev,
                      [channel.id]: Number(e.target.value)
                    }))}
                    displayValue={`${channelRoiMultipliers[channel.id] || 100}%`}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={calculateScenario} loading={calculating} className="flex-1">
                חשב תרחיש
              </Button>
              <Button variant="secondary" onClick={resetScenario}>
                איפוס
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          {scenarioForecast.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">רווח בסיסי</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(baseProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">רווח תרחיש</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(scenarioProfit)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-500">הפרש רווח</p>
                  <p className={`text-xl font-bold ${profitDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitDifference >= 0 ? '+' : ''}{formatCurrency(profitDifference)}
                  </p>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">יתרה לחיסכון בסיסית</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(baseSavings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">יתרה לחיסכון תרחיש</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(scenarioSavings)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-500">הפרש יתרה לחיסכון</p>
                  <p className={`text-xl font-bold ${savingsDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {savingsDifference >= 0 ? '+' : ''}{formatCurrency(savingsDifference)}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle>השוואת יתרה לחיסכון</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-72 flex items-center justify-center text-gray-500">
                  טוען...
                </div>
              ) : (
                <ForecastChart
                  data={baseForecast}
                  dataKey="netSavings"
                  color="#10b981"
                  showComparison={scenarioForecast.length > 0}
                  comparisonData={scenarioForecast}
                  comparisonColor="#f59e0b"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>השוואת רווח/הפסד</CardTitle>
            </CardHeader>
            <CardContent>
              <ForecastChart
                data={baseForecast}
                dataKey="profitLossForecast"
                color="#3b82f6"
                showComparison={scenarioForecast.length > 0}
                comparisonData={scenarioForecast}
                comparisonColor="#f59e0b"
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          {scenarioForecast.length === 0 && (
            <Card className="bg-blue-50 border-blue-100">
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">איך להשתמש במודל ROI</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• <strong>תקציב שיווק</strong>: כמה להשקיע בפרסום (ההכנסה = תקציב × ROI)</li>
                      <li>• <strong>יחס החזר שיווקי</strong>: כמה שקלים חוזרים על כל שקל פרסום</li>
                      <li>• <strong>עלות משתנה</strong>: אחוז מההכנסה שהולך לכ&quot;א (למשל 37%)</li>
                      <li>• <strong>הוצאות קבועות</strong>: שכר קבוע, הנהלה, תפעול</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
