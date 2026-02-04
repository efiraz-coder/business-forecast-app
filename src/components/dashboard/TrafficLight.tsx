'use client'

import { cn } from '@/lib/utils'

interface TrafficLightProps {
  status: 'green' | 'yellow' | 'red'
  reason: string
  size?: 'sm' | 'md' | 'lg'
}

export function TrafficLight({ status, reason, size = 'md' }: TrafficLightProps) {
  const colors = {
    green: {
      bg: 'bg-green-100',
      ring: 'ring-green-500',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'מצב תקין',
    },
    yellow: {
      bg: 'bg-amber-100',
      ring: 'ring-amber-500',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'נדרשת תשומת לב',
    },
    red: {
      bg: 'bg-red-100',
      ring: 'ring-red-500',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'אזהרה',
    },
  }

  const sizes = {
    sm: {
      container: 'p-3',
      dot: 'w-8 h-8',
      title: 'text-sm',
      reason: 'text-xs',
    },
    md: {
      container: 'p-4',
      dot: 'w-12 h-12',
      title: 'text-base',
      reason: 'text-sm',
    },
    lg: {
      container: 'p-6',
      dot: 'w-16 h-16',
      title: 'text-lg',
      reason: 'text-base',
    },
  }

  const colorConfig = colors[status]
  const sizeConfig = sizes[size]

  return (
    <div
      className={cn(
        'rounded-xl',
        colorConfig.bg,
        sizeConfig.container
      )}
    >
      <div className="flex items-center gap-4">
        {/* Traffic light indicator */}
        <div
          className={cn(
            'rounded-full flex items-center justify-center ring-4',
            colorConfig.dot,
            colorConfig.ring,
            sizeConfig.dot
          )}
        >
          {status === 'green' && (
            <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'yellow' && (
            <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
            </svg>
          )}
          {status === 'red' && (
            <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <h4 className={cn('font-semibold', colorConfig.text, sizeConfig.title)}>
            {colorConfig.label}
          </h4>
          <p className={cn('mt-0.5', colorConfig.text, 'opacity-80', sizeConfig.reason)}>
            {reason}
          </p>
        </div>
      </div>
    </div>
  )
}
