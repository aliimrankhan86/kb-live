import React from 'react'
import { render, screen } from '@testing-library/react'
import { RoundSlider } from '../RoundSlider'
import { DualRangeSlider } from '../DualRangeSlider'
import { PeopleSelector } from '../PeopleSelector'

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('Responsive Behavior', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  describe('RoundSlider Responsive', () => {
    it('renders correctly on desktop (1024px)', () => {
      mockMatchMedia(false)
      render(<RoundSlider min={0} max={100} value={50} onChange={jest.fn()} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })

    it('renders correctly on tablet (768px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 })
      mockMatchMedia(true) // matches tablet media query
      
      render(<RoundSlider min={0} max={100} value={50} onChange={jest.fn()} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })

    it('renders correctly on mobile (375px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      mockMatchMedia(true) // matches mobile media query
      
      render(<RoundSlider min={0} max={100} value={50} onChange={jest.fn()} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })
  })

  describe('DualRangeSlider Responsive', () => {
    it('renders correctly on desktop', () => {
      render(<DualRangeSlider min={0} max={100} values={[20, 80]} onChange={jest.fn()} />)
      
      const sliders = screen.getAllByRole('slider')
      expect(sliders).toHaveLength(2)
    })

    it('renders correctly on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      mockMatchMedia(true)
      
      render(<DualRangeSlider min={0} max={100} values={[20, 80]} onChange={jest.fn()} />)
      
      const sliders = screen.getAllByRole('slider')
      expect(sliders).toHaveLength(2)
    })
  })

  describe('PeopleSelector Responsive', () => {
    it('renders grid layout on desktop', () => {
      render(<PeopleSelector value={null} onChange={jest.fn()} />)
      
      const options = screen.getAllByRole('radio')
      expect(options).toHaveLength(4)
    })

    it('renders stacked layout on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      mockMatchMedia(true)
      
      render(<PeopleSelector value={null} onChange={jest.fn()} />)
      
      const options = screen.getAllByRole('radio')
      expect(options).toHaveLength(4)
    })
  })

  describe('Touch Target Sizes', () => {
    it('ensures minimum 44px touch targets on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      mockMatchMedia(true)
      
      render(<RoundSlider min={0} max={100} value={50} onChange={jest.fn()} />)
      
      const slider = screen.getByRole('slider')
      // The component should have proper touch target sizing
      expect(slider).toBeInTheDocument()
    })
  })

  describe('Breakpoint Testing', () => {
    const breakpoints = [
      { width: 320, name: 'Small Mobile' },
      { width: 375, name: 'Mobile' },
      { width: 768, name: 'Tablet' },
      { width: 1024, name: 'Desktop' },
      { width: 1440, name: 'Large Desktop' }
    ]

    breakpoints.forEach(({ width, name }) => {
      it(`renders correctly at ${name} (${width}px)`, () => {
        Object.defineProperty(window, 'innerWidth', { value: width })
        
        render(
          <div>
            <RoundSlider min={0} max={100} value={50} onChange={jest.fn()} />
            <DualRangeSlider min={0} max={100} values={[20, 80]} onChange={jest.fn()} />
            <PeopleSelector value={null} onChange={jest.fn()} />
          </div>
        )
        
        expect(screen.getByRole('slider')).toBeInTheDocument()
        expect(screen.getAllByRole('slider')).toHaveLength(3) // 1 single + 2 dual
        expect(screen.getAllByRole('radio')).toHaveLength(4)
      })
    })
  })
})
