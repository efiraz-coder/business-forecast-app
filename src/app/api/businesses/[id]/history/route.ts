import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const historySchema = z.object({
  year: z.number().min(2020).max(2100),
  month: z.number().min(1).max(12),
  revenueAmountTotal: z.number().min(0),
  profitLossTotal: z.number(),
  cashFlowTotal: z.number().optional(),
})

async function checkBusinessAccess(businessId: string, userId: string) {
  const access = await prisma.advisorBusiness.findFirst({
    where: { businessId, advisorId: userId },
  })
  return !!access
}

// GET - היסטוריית ביצועים
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const hasAccess = await checkBusinessAccess(businessId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
    }

    const history = await prisma.historicalActual.findMany({
      where: { businessId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת היסטוריה' }, { status: 500 })
  }
}

// POST - הוספת/עדכון נתון היסטורי (upsert)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const hasAccess = await checkBusinessAccess(businessId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = historySchema.parse(body)

    const history = await prisma.historicalActual.upsert({
      where: {
        businessId_year_month: {
          businessId,
          year: validatedData.year,
          month: validatedData.month,
        },
      },
      update: {
        revenueAmountTotal: validatedData.revenueAmountTotal,
        profitLossTotal: validatedData.profitLossTotal,
        cashFlowTotal: validatedData.cashFlowTotal,
      },
      create: {
        businessId,
        ...validatedData,
      },
    })

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error saving history:', error)
    return NextResponse.json({ error: 'שגיאה בשמירת היסטוריה' }, { status: 500 })
  }
}
