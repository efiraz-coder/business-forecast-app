import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    businessName: string
    role: string
    businessId: string | null
  }

  interface Session {
    user: {
      id: string
      username: string
      businessName: string
      role: string
      businessId: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    businessName: string
    role: string
    businessId: string | null
  }
}
