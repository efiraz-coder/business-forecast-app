import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const loanSchema = z.object({
  name: z.string().optional(),
  principal: z.number().positive('סכום ההלוואה חייב להיות חיובי'),
  interestRate: z.number().min(0).max(1),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  paymentFrequency: z.string().default('monthly'),
})

async function checkBusinessAccess(businessId: string, userId: string) {
  const access = await prisma.advisorBusiness.findFirst({
    where: { businessId, advisorId: userId },
  })
  return !!access
}

// GET - רשימת הלוואות
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

    const loans = await prisma.loan.findMany({
      where: { businessId },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({ success: true, data: loans })
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת הלוואות' }, { status: 500 })
  }
}

// POST - יצירת הלוואה חדשה
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
    const validatedData = loanSchema.parse(body)

    const loan = await prisma.loan.create({
      data: {
        businessId,
        name: validatedData.name || 'הלוואה',
        principal: validatedData.principal,
        interestRate: validatedData.interestRate,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        paymentFrequency: validatedData.paymentFrequency,
      },
    })

    return NextResponse.json({ success: true, data: loan }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error creating loan:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת הלוואה' }, { status: 500 })
  }
}
