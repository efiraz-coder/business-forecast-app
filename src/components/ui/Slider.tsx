"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/cn"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  displayValue?: string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, displayValue, min = 0, max = 100, ...props }, ref) => {
  const value = props.value?.[0] ?? props.defaultValue?.[0] ?? 0
  const percentage = ((value - (min as number)) / ((max as number) - (min as number))) * 100
  
  return (
    <div className="space-y-3">
      {(label || displayValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {displayValue && (
            <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        className={cn(
          "relative flex w-full touch-none select-none items-center cursor-pointer group",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary to-primary/80" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-primary bg-white shadow-lg ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Root>
      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
