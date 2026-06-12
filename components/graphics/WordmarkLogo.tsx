import type { CSSProperties } from 'react'

interface WordmarkLogoProps {
  className?: string
  color?: string
  pilgrimColor?: string
  height?: number
  style?: CSSProperties
}

export function WordmarkLogo({
  className = '',
  color = 'currentColor',
  pilgrimColor,
  height = 32,
  style,
}: WordmarkLogoProps) {
  return (
    <svg
      viewBox="0 0 264 40"
      height={height}
      width={Math.round(height * 264 / 40)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PilgrimCompare"
      role="img"
      className={className}
      style={{ display: 'block', fill: color, ...style }}
    >
      <text
        x="0"
        y="31"
        fontFamily="'Nunito', 'Nunito Variable', system-ui, sans-serif"
        fontSize="30"
        fontWeight="800"
        fill={pilgrimColor ? undefined : color}
        letterSpacing="0"
      >
        {pilgrimColor
          ? <><tspan fill={pilgrimColor}>Pilgrim</tspan><tspan fill={color}>Compare</tspan></>
          : 'PilgrimCompare'
        }
      </text>
    </svg>
  )
}
