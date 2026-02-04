import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const businessSchema = z.object({
  name: z.string().min(2, 'שם העסק חייב להכיל לפחות 2 תווים'),
  ownerName: z.string().optional(),
})

// GET - רשימת עסקים של היועץ
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const businesses = await prisma.business.findMany({
      where: {
        advisors: {
          some: {
            advisorId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            drivers: true,
            loans: true,
            investments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: businesses })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת עסקים' }, { status: 500 })
  }
}

// POST - יצירת עסק חדש
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = businessSchema.parse(body)

    const business = await prisma.business.create({
      data: {
        name: validatedData.name,
        ownerName: validatedData.ownerName,
        advisors: {
          create: {
            advisorId: session.user.id,
            role: 'owner',
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: business }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error creating business:', error)
    return NextResponse.json({ error: 'שגיאה ביצירת עסק' }, { status: 500 })
  }
}
