import React from 'react'

interface LogoProps {
  className?: string
  size?: number
  'aria-label'?: string
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 32,
  'aria-label': ariaLabel = 'KaabaTrip Logo'
}) => {
  return (
    <img
      src="/logo.svg"
      alt="KaabaTrip Logo"
      width={size}
      height={size}
      className={className}
      aria-label={ariaLabel}
      role="img"
    />
  )
}