import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/Text';

interface Point {
  label: string;
  value: number;
}

interface ChartContainerProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export function ChartContainer({ title, subtitle, className, children, ...props }: ChartContainerProps) {
  return (
    <div className={cn('rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5', className)} {...props}>
      <Text className="text-base font-semibold">{title}</Text>
      {subtitle && (
        <Text size="sm" tone="muted" className="mt-0.5">
          {subtitle}
        </Text>
      )}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function getScaledPoints(points: Point[], width: number, height: number, padding: number) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const range = Math.max(max - min, 1);

  return points.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
}

export function LineChart({ points, className }: { points: Point[]; className?: string }) {
  const width = 640;
  const height = 220;
  const padding = 24;
  const scaled = getScaledPoints(points, width, height, padding);
  const path = scaled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-56 w-full', className)} role="img" aria-label="Line chart">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />
      <path d={path} fill="none" stroke="var(--yellow)" strokeWidth="3" strokeLinecap="round" />
      {scaled.map((point, index) => (
        <g key={`${point.label}-${index}`}>
          <circle cx={point.x} cy={point.y} r="4" fill="var(--yellow)" />
          <text x={point.x} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--textMuted)">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function BarChart({ points, className }: { points: Point[]; className?: string }) {
  const width = 640;
  const height = 240;
  const paddingX = 8;
  const paddingTop = 24;
  const paddingBottom = 28;
  const chartH = height - paddingTop - paddingBottom;
  const max = Math.max(...points.map((p) => p.value), 1);
  const barW = (width - paddingX * 2) / Math.max(points.length, 1);
  const gap = Math.max(barW * 0.18, 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-60 w-full', className)}
      role="img"
      aria-label="Activity bar chart"
    >
      {/* Baseline */}
      <line
        x1={paddingX}
        y1={height - paddingBottom}
        x2={width - paddingX}
        y2={height - paddingBottom}
        stroke="var(--borderSubtle)"
        strokeWidth="1"
      />
      {points.map((point, index) => {
        const h = Math.max((point.value / max) * chartH, point.value > 0 ? 3 : 0);
        const x = paddingX + index * barW + gap;
        const bw = Math.max(barW - gap * 2, 2);
        const y = height - paddingBottom - h;
        return (
          <g key={`${point.label}-${index}`} role="img" aria-label={`${point.label || index}: ${point.value}`}>
            {/* Value label above bar */}
            {point.value > 0 && (
              <text
                x={x + bw / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="10"
                fill="var(--textMuted)"
                fontFamily="inherit"
              >
                {point.value}
              </text>
            )}
            <rect
              x={x}
              y={y}
              width={bw}
              height={h}
              rx="3"
              fill="var(--yellow)"
              fillOpacity="0.75"
            />
            {/* Date label */}
            {point.label && (
              <text
                x={x + bw / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="var(--textMuted)"
                fontFamily="inherit"
              >
                {point.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
