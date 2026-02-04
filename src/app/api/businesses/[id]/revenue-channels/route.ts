import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const revenueChannelSchema = z.object({
  name: z.string().min(1, 'נא להזין שם ערוץ'),
  isActive: z.boolean().default(true),
  marketingRoi: z.number().min(0).default(3.0),
  conversionRate: z.number().min(0).max(1).default(0.05),
  variableCostRate: z.number().min(0).max(1).default(0.37),
})

async function checkBusinessAccess(businessId: string, userId: string) {
  const access = await prisma.advisorBusiness.findFirst({
    where: { businessId, advisorId: userId },
  })
  return !!access
}

// GET - רשימת ערוצי מכירה
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

    const channels = await prisma.revenueChannel.findMany({
      where: { businessId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: channels })
  } catch (error) {
    console.error('Error fetching revenue channels:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת ערוצי מכירה' }, { status: 500 })
  }
}

// POST - יצירת ערוץ מכירה חדש
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
    const validatedData = revenueChannelSchema.parse(body)

    const channel = await prisma.revenueChannel.create({
      data: {
        businessId,
        name: validatedData.name,
        isActive: validatedData.isActive,
        marketingRoi: validatedData.marketingRoi,
        conversionRate: validatedData.conversionRate,
        variableCostRate: validatedData.variableCostRate,
      },
    })

    return NextResponse.json({ success: true, data: channel }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error creating revenue channel:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת ערוץ מכירה' }, { status: 500 })
  }
}
