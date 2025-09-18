import React from 'react'

interface KaabaIllustrationProps {
  className?: string
  width?: number
  height?: number
}

export const KaabaIllustration: React.FC<KaabaIllustrationProps> = ({
  className = '',
  width = 400,
  height = 500
}) => {
  return (
    <div className={className} style={{ width, height }}>
      <img
        src="/kaaba-illustration.svg"
        alt="Kaaba and Minarets Illustration"
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          filter: 'none',
          opacity: 1
        }}
      />
    </div>
  )
}
