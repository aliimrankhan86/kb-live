import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PeopleSelector, PeopleBucket } from '../PeopleSelector'

describe('PeopleSelector', () => {
  const defaultProps = {
    value: null as PeopleBucket | null,
    onChange: jest.fn(),
    label: 'Number of people'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct label and all four options', () => {
    render(<PeopleSelector {...defaultProps} />)
    
    expect(screen.getByText('Number of people')).toBeInTheDocument()
    expect(screen.getByText('1 to 2')).toBeInTheDocument()
    expect(screen.getByText('3 to 4')).toBeInTheDocument()
    expect(screen.getByText('up to 5')).toBeInTheDocument()
    expect(screen.getByText('more than 5')).toBeInTheDocument()
  })

  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(<PeopleSelector {...defaultProps} onChange={onChange} />)
    
    const option = screen.getByText('1 to 2')
    await user.click(option)
    
    expect(onChange).toHaveBeenCalledWith('1-2')
  })

  it('shows selected state correctly', () => {
    render(<PeopleSelector {...defaultProps} value="3-4" />)
    
    const selectedOption = screen.getByDisplayValue('3-4')
    expect(selectedOption).toBeChecked()
  })

  it('handles keyboard navigation correctly', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    
    render(<PeopleSelector {...defaultProps} onChange={onChange} />)
    
    const firstOption = screen.getByDisplayValue('1-2')
    await user.type(firstOption, '{arrowright}')
    await user.type(firstOption, '{enter}')
    
    expect(onChange).toHaveBeenCalledWith('3-4')
  })

  it('applies disabled state correctly', () => {
    render(<PeopleSelector {...defaultProps} disabled={true} />)
    
    const options = screen.getAllByRole('radio')
    options.forEach(option => {
      expect(option).toBeDisabled()
    })
  })

  it('shows required indicator when required is true', () => {
    render(<PeopleSelector {...defaultProps} required={true} />)
    
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<PeopleSelector {...defaultProps} />)
    
    const fieldset = screen.getByRole('radiogroup')
    expect(fieldset).toHaveAttribute('aria-label', 'Number of people')
    
    const options = screen.getAllByRole('radio')
    expect(options).toHaveLength(4)
    
    options.forEach(option => {
      expect(option).toHaveAttribute('name', 'numberOfPeopleBucket')
    })
  })

  it('renders all four options with correct values', () => {
    render(<PeopleSelector {...defaultProps} />)
    
    expect(screen.getByDisplayValue('1-2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3-4')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5+')).toBeInTheDocument()
  })

  it('shows descriptions for each option', () => {
    render(<PeopleSelector {...defaultProps} />)
    
    expect(screen.getByText('1-2 people')).toBeInTheDocument()
    expect(screen.getByText('3-4 people')).toBeInTheDocument()
    expect(screen.getByText('Up to 5 people')).toBeInTheDocument()
    expect(screen.getByText('More than 5 people')).toBeInTheDocument()
  })
})
