import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  ownerName: z.string().optional(),
})

// Helper function to check business access
async function checkBusinessAccess(businessId: string, userId: string) {
  const access = await prisma.advisorBusiness.findFirst({
    where: {
      businessId,
      advisorId: userId,
    },
  })
  return !!access
}

// GET - פרטי עסק בודד
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const hasAccess = await checkBusinessAccess(id, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'אין הרשאה לעסק זה' }, { status: 403 })
    }

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        revenueChannels: true,
        expenseItems: {
          include: { expenseGroup: true },
        },
        drivers: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
        loans: true,
        investments: true,
        historicalActuals: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'עסק לא נמצא' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: business })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת עסק' }, { status: 500 })
  }
}

// PUT - עדכון עסק
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const hasAccess = await checkBusinessAccess(id, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'אין הרשאה לעסק זה' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateBusinessSchema.parse(body)

    const business = await prisma.business.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({ success: true, data: business })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'שגיאה בעדכון עסק' }, { status: 500 })
  }
}

// DELETE - מחיקת עסק
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const hasAccess = await checkBusinessAccess(id, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'אין הרשאה לעסק זה' }, { status: 403 })
    }

    await prisma.business.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json({ error: 'שגיאה במחיקת עסק' }, { status: 500 })
  }
}
