import React from 'react'
import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/graphics/Logo'

describe('Logo Component', () => {
  it('renders logo with correct attributes', () => {
    render(<Logo />)
    
    const logo = screen.getByLabelText('KaabaTrip Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('width', '32')
    expect(logo).toHaveAttribute('height', '32')
  })

  it('accepts custom size prop', () => {
    render(<Logo size={64} />)
    
    const logo = screen.getByLabelText('KaabaTrip Logo')
    expect(logo).toHaveAttribute('width', '64')
    expect(logo).toHaveAttribute('height', '64')
  })
})
