import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - רשימת קבוצות הוצאה מערכתיות
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const groups = await prisma.expenseGroup.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: groups })
  } catch (error) {
    console.error('Error fetching expense groups:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת קבוצות הוצאה' }, { status: 500 })
  }
}
