import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      username, 
      password, 
      businessName, 
      securityAnswer1, 
      securityAnswer2 
    } = body

    // Validation
    if (!username || !password || !businessName || !securityAnswer1 || !securityAnswer2) {
      return NextResponse.json(
        { error: 'כל השדות הם חובה' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'שם המשתמש כבר קיים במערכת' },
        { status: 400 }
      )
    }

    // Hash password and security answers
    const hashedPassword = await bcrypt.hash(password, 12)
    const hashedAnswer1 = await bcrypt.hash(securityAnswer1.toLowerCase().trim(), 12)
    const hashedAnswer2 = await bcrypt.hash(securityAnswer2.toLowerCase().trim(), 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        businessName,
        role: 'user',
        securityQuestion1: 'מה שם בית הספר היסודי שלך?',
        securityAnswer1: hashedAnswer1,
        securityQuestion2: 'מה שם חיית המחמד שלך?',
        securityAnswer2: hashedAnswer2,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'המשתמש נוצר בהצלחה',
      userId: user.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת המשתמש' },
      { status: 500 }
    )
  }
}
