import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getForecastForBusiness } from '@/lib/forecast'

// GET - קבלת תחזית לעסק
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const monthsAhead = parseInt(searchParams.get('monthsAhead') || '12')
    const openingBalance = parseFloat(searchParams.get('openingBalance') || '0')

    if (!businessId) {
      return NextResponse.json({ error: 'נא לספק מזהה עסק' }, { status: 400 })
    }

    // Check access
    const access = await prisma.advisorBusiness.findFirst({
      where: { businessId, advisorId: session.user.id },
    })

    if (!access) {
      return NextResponse.json({ error: 'אין הרשאה לעסק זה' }, { status: 403 })
    }

    const forecast = await getForecastForBusiness(businessId, monthsAhead, openingBalance)

    return NextResponse.json({ success: true, data: forecast })
  } catch (error) {
    console.error('Error generating forecast:', error)
    return NextResponse.json({ error: 'שגיאה בחישוב תחזית' }, { status: 500 })
  }
}
