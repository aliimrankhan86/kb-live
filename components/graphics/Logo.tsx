import React from 'react'
import Image from 'next/image'

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
    <Image
      src="/logo.svg"
      alt="KaabaTrip Logo"
      width={size}
      height={size}
      className={className}
      style={{ width: 'auto', height: 'auto' }}
      aria-label={ariaLabel}
      role="img"
    />
  )
}