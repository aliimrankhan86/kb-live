import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoundSlider } from '../RoundSlider'

describe('RoundSlider', () => {
  const defaultProps = {
    min: 0,
    max: 100,
    value: 50,
    onChange: jest.fn(),
    label: 'Test Slider',
    ariaLabel: 'Test slider for accessibility'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct label and value', () => {
    render(<RoundSlider {...defaultProps} />)
    
    expect(screen.getByText('Test Slider')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('calls onChange when slider value changes', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(<RoundSlider {...defaultProps} onChange={onChange} />)
    
    const slider = screen.getByRole('slider')
    await user.click(slider)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('handles keyboard navigation correctly', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(<RoundSlider {...defaultProps} onChange={onChange} />)
    
    const slider = screen.getByRole('slider')
    await user.type(slider, '{arrowright}')
    
    expect(onChange).toHaveBeenCalled()
  })

  it('applies disabled state correctly', () => {
    render(<RoundSlider {...defaultProps} disabled={true} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toBeDisabled()
  })

  it('formats value correctly when formatValue is provided', () => {
    const formatValue = (value: number) => `$${value}`
    
    render(<RoundSlider {...defaultProps} formatValue={formatValue} />)
    
    expect(screen.getByText('$50')).toBeInTheDocument()
  })

  it('hides value display when showValue is false', () => {
    render(<RoundSlider {...defaultProps} showValue={false} />)
    
    expect(screen.queryByText('50')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<RoundSlider {...defaultProps} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-label', 'Test slider for accessibility')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })
})
