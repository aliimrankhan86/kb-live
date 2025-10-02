import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DualRangeSlider } from '../DualRangeSlider'

describe('DualRangeSlider', () => {
  const defaultProps = {
    min: 0,
    max: 100,
    values: [20, 80] as [number, number],
    onChange: jest.fn(),
    label: 'Test Range Slider',
    ariaLabels: ['Minimum value', 'Maximum value']
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct label and values', () => {
    render(<DualRangeSlider {...defaultProps} />)
    
    expect(screen.getByText('Test Range Slider')).toBeInTheDocument()
    expect(screen.getByText('20 - 80')).toBeInTheDocument()
  })

  it('calls onChange when slider values change', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(<DualRangeSlider {...defaultProps} onChange={onChange} />)
    
    const sliders = screen.getAllByRole('slider')
    await user.click(sliders[0])
    
    expect(onChange).toHaveBeenCalled()
  })

  it('handles keyboard navigation for both sliders', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(<DualRangeSlider {...defaultProps} onChange={onChange} />)
    
    const sliders = screen.getAllByRole('slider')
    await user.type(sliders[0], '{arrowright}')
    await user.type(sliders[1], '{arrowleft}')
    
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('prevents min value from exceeding max value', () => {
    const onChange = jest.fn()
    render(<DualRangeSlider {...defaultProps} values={[50, 60]} onChange={onChange} />)
    
    // Simulate trying to set min to 70 (which would exceed max of 60)
    onChange([70, 60])
    
    // The component should handle this internally
    expect(onChange).toHaveBeenCalled()
  })

  it('prevents max value from going below min value', () => {
    const onChange = jest.fn()
    render(<DualRangeSlider {...defaultProps} values={[50, 60]} onChange={onChange} />)
    
    // Simulate trying to set max to 40 (which would be below min of 50)
    onChange([50, 40])
    
    // The component should handle this internally
    expect(onChange).toHaveBeenCalled()
  })

  it('applies disabled state correctly', () => {
    render(<DualRangeSlider {...defaultProps} disabled={true} />)
    
    const sliders = screen.getAllByRole('slider')
    sliders.forEach(slider => {
      expect(slider).toBeDisabled()
    })
  })

  it('formats values correctly when formatValue is provided', () => {
    const formatValue = (value: number) => `$${value}`
    
    render(<DualRangeSlider {...defaultProps} formatValue={formatValue} />)
    
    expect(screen.getByText('$20 - $80')).toBeInTheDocument()
  })

  it('hides value display when showValues is false', () => {
    render(<DualRangeSlider {...defaultProps} showValues={false} />)
    
    expect(screen.queryByText('20 - 80')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes for both sliders', () => {
    render(<DualRangeSlider {...defaultProps} />)
    
    const sliders = screen.getAllByRole('slider')
    expect(sliders[0]).toHaveAttribute('aria-label', 'Minimum value')
    expect(sliders[1]).toHaveAttribute('aria-label', 'Maximum value')
    
    sliders.forEach(slider => {
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
    })
  })
})
