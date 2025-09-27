'use client'

import { cn } from '@/lib/utils'

interface StripedPatternProps {
  className?: string
  width?: number
  height?: number
  stripeWidth?: number
  stripeColor?: string
  backgroundColor?: string
  angle?: number
}

export function StripedPattern({
  className,
  width = 40,
  height = 40,
  stripeWidth = 2,
  stripeColor = 'rgba(255, 255, 255, 0.1)',
  backgroundColor = 'transparent',
  angle = 45,
  ...props
}: StripedPatternProps) {
  const patternId = `striped-pattern-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${angle})`}
        >
          <rect width={width} height={height} fill={backgroundColor} />
          <rect
            width={stripeWidth}
            height={height}
            fill={stripeColor}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
