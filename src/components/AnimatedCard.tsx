'use client'

import { ReactNode, useState } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        hover:scale-105 hover:-translate-y-2 hover:rotate-1
        hover:shadow-2xl hover:shadow-blue-500/20
        animate-fade-in-up
        ${className}
      `}
      style={{
        animationDelay: `${delay}ms`,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative transition-all duration-300
          ${isHovered ? 'transform rotateX-5 rotateY-5' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {children}
        
        {/* 3D shadow effect */}
        <div
          className={`
            absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10
            transform translate-x-2 translate-y-2 rounded-lg
            transition-all duration-300
            ${isHovered ? 'translate-x-4 translate-y-4 opacity-60' : 'opacity-30'}
          `}
        />
        
        {/* Floating particles effect */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 3) * 30}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
