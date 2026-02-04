/**
 * Password utilities for generating and validating strong passwords
 * Requirements: 4 lowercase, 4 numbers, 2 uppercase
 */

// Generate a strong password: 4 lowercase + 4 numbers + 2 uppercase
export function generateStrongPassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'

  let password = ''
  
  // 4 lowercase letters
  for (let i = 0; i < 4; i++) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
  }
  
  // 4 numbers
  for (let i = 0; i < 4; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)]
  }
  
  // 2 uppercase letters
  for (let i = 0; i < 2; i++) {
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Validate password strength
export function validateStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  const lowercaseCount = (password.match(/[a-z]/g) || []).length
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length
  const numberCount = (password.match(/[0-9]/g) || []).length

  if (lowercaseCount < 4) {
    errors.push('הסיסמה חייבת להכיל לפחות 4 אותיות קטנות באנגלית')
  }
  if (numberCount < 4) {
    errors.push('הסיסמה חייבת להכיל לפחות 4 מספרים')
  }
  if (uppercaseCount < 2) {
    errors.push('הסיסמה חייבת להכיל לפחות 2 אותיות גדולות באנגלית')
  }
  if (password.length < 10) {
    errors.push('הסיסמה חייבת להכיל לפחות 10 תווים')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Generate temporary password (8 chars)
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

// Mask email for display: te**@gm***.com
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  
  const [domainName, ext] = domain.split('.')
  
  const maskedLocal = local.slice(0, 2) + '**'
  const maskedDomain = domainName.slice(0, 2) + '***'
  
  return `${maskedLocal}@${maskedDomain}.${ext || 'com'}`
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
