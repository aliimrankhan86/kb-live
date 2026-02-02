'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
      <SliderPrimitive.Range className="absolute h-full bg-[#FFD31D]" />
    </SliderPrimitive.Track>
    {props.defaultValue?.map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className="block h-5 w-5 rounded-full border-2 border-[#FFD31D] bg-[#0B0B0B] ring-offset-[#0B0B0B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD31D] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      />
    )) || props.value?.map((_, i) => (
       <SliderPrimitive.Thumb
        key={i}
        className="block h-5 w-5 rounded-full border-2 border-[#FFD31D] bg-[#0B0B0B] ring-offset-[#0B0B0B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD31D] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
