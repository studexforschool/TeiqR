'use client'

import { StripedPattern } from "@/components/ui/striped-pattern"

export function StripedPatternDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background">
      <StripedPattern className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]" />
      <div className="relative z-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Striped Pattern Background
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Beautiful striped pattern with radial gradient mask
        </p>
      </div>
    </div>
  )
}
