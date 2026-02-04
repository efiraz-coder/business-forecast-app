'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Settings, 
  BarChart3, 
  Sliders, 
  Edit3,
  ChevronLeft,
  LogIn,
  LogOut,
  Shield,
  User,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export function MainNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Don't show nav on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  const navItems = [
    { href: '/', label: 'ראשי', icon: Home },
    { href: '/wizard/step-1', label: 'הגדרות', icon: Settings, requireAuth: true },
    { href: '/dashboard', label: 'דשבורד', icon: BarChart3, requireAuth: true },
    { href: '/what-if', label: 'תרחישים', icon: Sliders, requireAuth: true },
  ]

  const isWizardPage = pathname?.startsWith('/wizard')
  const isAdmin = session?.user?.role === 'admin'

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo + Business Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">תכנון פיננסי</span>
            </Link>
            {session?.user?.businessName && (
              <>
                <ChevronLeft className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 font-medium">{session.user.businessName}</span>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href === '/wizard/step-1' && isWizardPage)
              
              // Hide protected routes if not logged in
              if (item.requireAuth && !session) {
                return null
              }
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}

            {/* Admin Link */}
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant={pathname === '/admin' ? "default" : "outline"}
                  size="sm"
                  className="gap-2 bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <Shield className="h-4 w-4" />
                  ניהול
                </Button>
              </Link>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2">
            {status === 'loading' ? (
              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded" />
            ) : session ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.user.username}</span>
                  {isAdmin && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                      מנהל
                    </span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">יציאה</span>
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="default" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  התחברות
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
