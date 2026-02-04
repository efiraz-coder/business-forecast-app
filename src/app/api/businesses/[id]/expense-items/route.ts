import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const expenseItemSchema = z.object({
  name: z.string().min(1, 'נא להזין שם פריט הוצאה'),
  expenseGroupId: z.string().min(1, 'נא לבחור קבוצת הוצאה'),
  monthlyAmount: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
})

async function checkBusinessAccess(businessId: string, userId: string) {
  const access = await prisma.advisorBusiness.findFirst({
    where: { businessId, advisorId: userId },
  })
  return !!access
}

// GET - רשימת פריטי הוצאה
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

    const items = await prisma.expenseItem.findMany({
      where: { businessId },
      include: { expenseGroup: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Error fetching expense items:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת פריטי הוצאה' }, { status: 500 })
  }
}

// POST - יצירת פריט הוצאה חדש
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
    const validatedData = expenseItemSchema.parse(body)

    const item = await prisma.expenseItem.create({
      data: {
        businessId,
        name: validatedData.name,
        expenseGroupId: validatedData.expenseGroupId,
        monthlyAmount: validatedData.monthlyAmount,
        isActive: validatedData.isActive,
      },
      include: { expenseGroup: true },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error creating expense item:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת פריט הוצאה' }, { status: 500 })
  }
}
