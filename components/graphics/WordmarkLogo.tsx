import type { CSSProperties } from 'react'

interface WordmarkLogoProps {
  className?: string
  color?: string
  height?: number
  style?: CSSProperties
}

export function WordmarkLogo({
  className = '',
  color = 'currentColor',
  height = 32,
  style,
}: WordmarkLogoProps) {
  return (
    <svg
      viewBox="0 0 264 40"
      height={height}
      width="auto"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PilgrimCompare"
      role="img"
      className={className}
      style={{ display: 'block', fill: color, ...style }}
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&display=swap');`}</style>
      </defs>
      <text
        x="0"
        y="31"
        fontFamily="'Nunito', 'Nunito Variable', system-ui, sans-serif"
        fontSize="30"
        fontWeight="800"
        fill={color}
        letterSpacing="0"
      >
        PilgrimCompare
      </text>
    </svg>
  )
}
