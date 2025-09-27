"use client"

import { cn } from "@/lib/utils"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"

export function InteractiveGridPatternDemo() {
  return (
    <div className="bg-background relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border">
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <div className="relative z-10 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Interactive Grid Pattern
        </h2>
        <p className="text-muted-foreground">
          Hover over the grid to see the interactive effect
        </p>
      </div>
    </div>
  )
}
