import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWhatIfForecast } from '@/lib/forecast'
import { z } from 'zod'

const whatIfSchema = z.object({
  businessId: z.string().min(1),
  monthsAhead: z.number().min(1).max(24).default(12),
  openingBalance: z.number().default(0),
  customerMultiplier: z.number().min(0).max(3).default(1),
  revenueMultiplier: z.number().min(0).max(3).default(1),
  marketingMultiplier: z.number().min(0).max(3).default(1),
  headcountAdjustment: z.number().min(-100).max(100).default(0),
})

// POST - חישוב תרחיש "מה יקרה אם"
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = whatIfSchema.parse(body)

    // Check access
    const access = await prisma.advisorBusiness.findFirst({
      where: { businessId: validatedData.businessId, advisorId: session.user.id },
    })

    if (!access) {
      return NextResponse.json({ error: 'אין הרשאה לעסק זה' }, { status: 403 })
    }

    const forecast = await getWhatIfForecast(validatedData)

    return NextResponse.json({ success: true, data: forecast })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error generating what-if forecast:', error)
    return NextResponse.json({ error: 'שגיאה בחישוב תרחיש' }, { status: 500 })
  }
}
