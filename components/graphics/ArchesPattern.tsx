import React from 'react'

interface ArchesPatternProps {
  className?: string
  opacity?: number
}

export const ArchesPattern: React.FC<ArchesPatternProps> = ({ 
  className = '', 
  opacity = 0.05 
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="archesPattern"
          x="0"
          y="0"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          {/* Subtle arch shape */}
          <path
            d="M10 100 Q60 70 110 100 L110 120 L10 120 Z"
            fill="var(--yellow)"
            opacity="0.03"
          />
          <path
            d="M20 100 Q60 80 100 100 L100 120 L20 120 Z"
            fill="var(--yellow)"
            opacity="0.02"
          />
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#archesPattern)" />
    </svg>
  )
}
