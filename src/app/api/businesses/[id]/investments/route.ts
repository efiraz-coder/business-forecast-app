import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const investmentSchema = z.object({
  name: z.string().min(1, 'נא להזין שם השקעה'),
  amount: z.number().positive('סכום ההשקעה חייב להיות חיובי'),
  date: z.string().transform((val) => new Date(val)),
  depreciationPeriodMonths: z.number().min(0).default(0),
})

async function checkBusinessAccess(businessId: string, userId: string) {
  const access = await prisma.advisorBusiness.findFirst({
    where: { businessId, advisorId: userId },
  })
  return !!access
}

// GET - רשימת השקעות
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

    const investments = await prisma.investment.findMany({
      where: { businessId },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ success: true, data: investments })
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת השקעות' }, { status: 500 })
  }
}

// POST - יצירת השקעה חדשה
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
    const validatedData = investmentSchema.parse(body)

    const investment = await prisma.investment.create({
      data: {
        businessId,
        name: validatedData.name,
        amount: validatedData.amount,
        date: validatedData.date,
        depreciationPeriodMonths: validatedData.depreciationPeriodMonths,
      },
    })

    return NextResponse.json({ success: true, data: investment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error creating investment:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת השקעה' }, { status: 500 })
  }
}
