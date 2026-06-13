import React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: number
  isLight?: boolean
  'aria-label'?: string
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 32,
  isLight = false,
  'aria-label': ariaLabel = 'PilgrimCompare Logo'
}) => {
  return (
    <Image
      src={isLight ? '/text-logo-light.svg' : '/logo.svg'}
      alt="PilgrimCompare Logo"
      width={size}
      height={size}
      className={className}
      style={{ width: 'auto', height: 'auto' }}
      aria-label={ariaLabel}
      role="img"
    />
  )
}