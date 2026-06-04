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
    <div className={cn('rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4', className)} {...props}>
      <Text size="sm" tone="muted">
        {subtitle ?? 'Dashboard metric'}
      </Text>
      <Text className="mt-1 text-lg font-semibold">{title}</Text>
      <div className="mt-4">{children}</div>
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
  const height = 220;
  const padding = 24;
  const max = Math.max(...points.map((p) => p.value), 1);
  const barWidth = (width - padding * 2) / Math.max(points.length, 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-56 w-full', className)} role="img" aria-label="Bar chart">
      {points.map((point, index) => {
        const h = (point.value / max) * (height - padding * 2);
        const x = padding + index * barWidth + 6;
        const y = height - padding - h;
        return (
          <g key={`${point.label}-${index}`}>
            <rect x={x} y={y} width={Math.max(barWidth - 12, 10)} height={h} rx="6" fill="var(--info)" />
            <text x={x + (Math.max(barWidth - 12, 10) / 2)} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--textMuted)">
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
