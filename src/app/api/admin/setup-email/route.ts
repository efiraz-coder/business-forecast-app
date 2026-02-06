import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { email } = await request.json()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'כתובת מייל לא תקינה' },
        { status: 400 }
      )
    }

    // Check if already setup
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (admin?.isEmailVerified) {
      return NextResponse.json(
        { error: 'כתובת המייל כבר הוגדרה ולא ניתן לשנותה' },
        { status: 400 }
      )
    }

    // Hash the email for verification later (when recovering)
    const emailHash = await bcrypt.hash(email.toLowerCase().trim(), 12)

    // Encrypt email (simple base64 for display masking - in production use proper encryption)
    const encryptedEmail = Buffer.from(email).toString('base64')

    // Update admin user
    await prisma.user.updateMany({
      where: { role: 'admin' },
      data: {
        recoveryEmail: encryptedEmail,
        recoveryEmailHash: emailHash,
        isEmailVerified: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting up email:', error)
    return NextResponse.json(
      { error: 'שגיאה בשמירת כתובת המייל' },
      { status: 500 }
    )
  }
}
