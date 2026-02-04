'use client'

import { Progress } from '@/components/ui/progress'
import { useWizardStore } from '@/store/wizard-store'
import { 
  Building2, 
  Package, 
  Users, 
  Receipt,
  TrendingUp,
  UserPlus,
  Megaphone,
  FileText,
  Wallet,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const WIZARD_STEPS = [
  { id: 1, name: 'פרטי עסק', icon: Building2, path: '/wizard/step-1', layer: 1 },
  { id: 2, name: 'מוצרים/שירותים', icon: Package, path: '/wizard/step-2', layer: 1 },
  { id: 3, name: 'כוח אדם', icon: Users, path: '/wizard/step-3', layer: 1 },
  { id: 4, name: 'הוצאות קבועות', icon: Receipt, path: '/wizard/step-4', layer: 1 },
  { id: 5, name: 'תחזית מכירות', icon: TrendingUp, path: '/wizard/step-5', layer: 2 },
  { id: 6, name: 'תחזית כ"א', icon: UserPlus, path: '/wizard/step-6', layer: 2 },
  { id: 7, name: 'תקציב שיווק', icon: Megaphone, path: '/wizard/step-7', layer: 2 },
  { id: 8, name: 'הוצאות הנהלה', icon: FileText, path: '/wizard/step-8', layer: 3 },
  { id: 9, name: 'מימון', icon: Wallet, path: '/wizard/step-9', layer: 3 },
  { id: 10, name: 'סיכום', icon: BarChart3, path: '/wizard/summary', layer: 3 },
]

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { currentStep, layer1Done, layer2Done } = useWizardStore()
  
  const progress = (currentStep / 10) * 100

  const getLayerStatus = (layer: number) => {
    if (layer === 1) return layer1Done ? 'completed' : currentStep >= 1 && currentStep <= 4 ? 'active' : 'pending'
    if (layer === 2) return layer2Done ? 'completed' : currentStep >= 5 && currentStep <= 7 ? 'active' : 'pending'
    if (layer === 3) return currentStep >= 8 ? 'active' : 'pending'
    return 'pending'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">תכנון כלכלי</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">שלב {currentStep} מתוך 10</span>
              <div className="w-48">
                <Progress value={progress} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
            {/* Layer 1 */}
            <div className="mb-4">
              <div className={cn(
                "flex items-center gap-2 mb-2 px-2 py-1 rounded",
                getLayerStatus(1) === 'completed' && "bg-green-50 text-green-700",
                getLayerStatus(1) === 'active' && "bg-primary/10 text-primary"
              )}>
                <span className="text-xs font-medium">שכבה 1: ליבת המודל</span>
              </div>
              <nav className="space-y-1">
                {WIZARD_STEPS.filter(s => s.layer === 1).map(step => (
                  <StepLink key={step.id} step={step} pathname={pathname} currentStep={currentStep} />
                ))}
              </nav>
            </div>

            {/* Layer 2 */}
            <div className="mb-4">
              <div className={cn(
                "flex items-center gap-2 mb-2 px-2 py-1 rounded",
                getLayerStatus(2) === 'completed' && "bg-green-50 text-green-700",
                getLayerStatus(2) === 'active' && "bg-primary/10 text-primary",
                !layer1Done && "opacity-50"
              )}>
                <span className="text-xs font-medium">שכבה 2: תחזית כמותית</span>
              </div>
              <nav className="space-y-1">
                {WIZARD_STEPS.filter(s => s.layer === 2).map(step => (
                  <StepLink 
                    key={step.id} 
                    step={step} 
                    pathname={pathname} 
                    currentStep={currentStep}
                    disabled={!layer1Done && currentStep < 5}
                  />
                ))}
              </nav>
            </div>

            {/* Layer 3 */}
            <div>
              <div className={cn(
                "flex items-center gap-2 mb-2 px-2 py-1 rounded",
                getLayerStatus(3) === 'active' && "bg-primary/10 text-primary",
                !layer2Done && "opacity-50"
              )}>
                <span className="text-xs font-medium">שכבה 3: פירוט מתקדם</span>
              </div>
              <nav className="space-y-1">
                {WIZARD_STEPS.filter(s => s.layer === 3).map(step => (
                  <StepLink 
                    key={step.id} 
                    step={step} 
                    pathname={pathname} 
                    currentStep={currentStep}
                    disabled={!layer2Done && currentStep < 8}
                  />
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

function StepLink({ 
  step, 
  pathname, 
  currentStep,
  disabled = false 
}: { 
  step: typeof WIZARD_STEPS[0]
  pathname: string
  currentStep: number
  disabled?: boolean
}) {
  const isActive = pathname === step.path
  const isCompleted = currentStep > step.id
  const Icon = step.icon

  return (
    <Link
      href={disabled ? '#' : step.path}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive && "bg-primary text-white",
        !isActive && isCompleted && "text-green-600 hover:bg-green-50",
        !isActive && !isCompleted && !disabled && "text-gray-600 hover:bg-gray-100",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={e => disabled && e.preventDefault()}
    >
      <Icon className="h-4 w-4" />
      <span>{step.name}</span>
      {isCompleted && !isActive && (
        <svg className="h-4 w-4 mr-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </Link>
  )
}
