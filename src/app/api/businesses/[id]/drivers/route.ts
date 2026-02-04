import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const driverSchema = z.object({
  year: z.number().min(2020).max(2100),
  month: z.number().min(1).max(12),
  // New ROI model fields
  totalMarketingBudget: z.number().min(0).optional(),
  fixedPayroll: z.number().min(0).optional(),
  operatingExpenses: z.number().min(0).optional(),
  personalLivingExpenses: z.number().min(0).optional(),
  otherIncome: z.number().min(0).optional(),
  // Legacy fields (kept for backwards compatibility)
  expectedCustomers: z.number().min(0).optional(),
  avgRevenuePerCustomer: z.number().min(0).optional(),
  marketingBudget: z.number().min(0).optional(),
  headcount: z.number().min(0).optional(),
  payrollTotal: z.number().min(0).optional(),
  adminExpenses: z.number().min(0).optional(),
  creditCardFeeRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
})

// Helper function to check business access
async function checkBusinessAccess(businessId: string, userId: string) {
  const access = await prisma.advisorBusiness.findFirst({
    where: { businessId, advisorId: userId },
  })
  return !!access
}

// GET - רשימת דרייברים
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

    const drivers = await prisma.driver.findMany({
      where: { businessId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    })

    return NextResponse.json({ success: true, data: drivers })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת דרייברים' }, { status: 500 })
  }
}

// POST - יצירת או עדכון דרייבר (upsert)
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
    const validatedData = driverSchema.parse(body)

    const driver = await prisma.driver.upsert({
      where: {
        businessId_year_month: {
          businessId,
          year: validatedData.year,
          month: validatedData.month,
        },
      },
      update: {
        // New ROI model fields
        totalMarketingBudget: validatedData.totalMarketingBudget || validatedData.marketingBudget || 0,
        fixedPayroll: validatedData.fixedPayroll || validatedData.payrollTotal || 0,
        operatingExpenses: validatedData.operatingExpenses || 0,
        personalLivingExpenses: validatedData.personalLivingExpenses || 0,
        otherIncome: validatedData.otherIncome || 0,
        // Legacy fields
        expectedCustomers: validatedData.expectedCustomers || 0,
        avgRevenuePerCustomer: validatedData.avgRevenuePerCustomer || 0,
        marketingBudget: validatedData.marketingBudget || validatedData.totalMarketingBudget || 0,
        headcount: validatedData.headcount || 0,
        payrollTotal: validatedData.payrollTotal || validatedData.fixedPayroll || 0,
        adminExpenses: validatedData.adminExpenses || 0,
        creditCardFeeRate: validatedData.creditCardFeeRate || 0,
        notes: validatedData.notes,
      },
      create: {
        businessId,
        year: validatedData.year,
        month: validatedData.month,
        totalMarketingBudget: validatedData.totalMarketingBudget || validatedData.marketingBudget || 0,
        fixedPayroll: validatedData.fixedPayroll || validatedData.payrollTotal || 0,
        operatingExpenses: validatedData.operatingExpenses || 0,
        personalLivingExpenses: validatedData.personalLivingExpenses || 0,
        otherIncome: validatedData.otherIncome || 0,
        expectedCustomers: validatedData.expectedCustomers || 0,
        avgRevenuePerCustomer: validatedData.avgRevenuePerCustomer || 0,
        marketingBudget: validatedData.marketingBudget || validatedData.totalMarketingBudget || 0,
        headcount: validatedData.headcount || 0,
        payrollTotal: validatedData.payrollTotal || validatedData.fixedPayroll || 0,
        adminExpenses: validatedData.adminExpenses || 0,
        creditCardFeeRate: validatedData.creditCardFeeRate || 0,
        notes: validatedData.notes,
      },
    })

    return NextResponse.json({ success: true, data: driver })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error saving driver:', error)
    return NextResponse.json({ error: 'שגיאה בשמירת דרייבר' }, { status: 500 })
  }
}
