import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateTempPassword } from '@/lib/password-utils'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'נא להזין כתובת מייל' },
        { status: 400 }
      )
    }

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (!admin || !admin.recoveryEmailHash) {
      return NextResponse.json(
        { error: 'לא נמצא משתמש מנהל או שלא הוגדר מייל לשחזור' },
        { status: 400 }
      )
    }

    // Verify email matches
    const isEmailValid = await bcrypt.compare(
      email.toLowerCase().trim(), 
      admin.recoveryEmailHash
    )

    if (!isEmailValid) {
      return NextResponse.json(
        { error: 'כתובת המייל שגויה' },
        { status: 400 }
      )
    }

    // Generate temporary password
    const tempPassword = generateTempPassword()
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12)
    
    // Set expiry to 30 minutes from now
    const expiryTime = new Date()
    expiryTime.setMinutes(expiryTime.getMinutes() + 30)

    // Save temp password
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        tempPassword: hashedTempPassword,
        tempPasswordExpiry: expiryTime,
      },
    })

    // In production, you would send this via email
    // For now, we return it directly (for demonstration)
    return NextResponse.json({ 
      success: true,
      tempPassword,
      message: 'סיסמה זמנית נוצרה. בסביבת ייצור היא תישלח למייל.',
    })
  } catch (error) {
    console.error('Recovery error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשחזור הסיסמה' },
      { status: 500 }
    )
  }
}
