# Production-Ready Filter Overlay Component System

A comprehensive, accessible, and performant filter overlay system that seamlessly integrates with the KaabaTrip design system and architecture patterns.

## 🏗️ Architecture Overview

The filter overlay system is built with a modular, composable architecture that follows established patterns:

- **Context-based State Management**: Centralized state with React Context
- **Custom Hooks**: Reusable logic for focus management, keyboard navigation, and accessibility
- **Component Composition**: Modular components that can be mixed and matched
- **Design System Integration**: Full integration with CSS custom properties and design tokens
- **Performance Optimization**: Memoization, efficient rendering, and minimal DOM manipulation

## 📦 Components

### Core Components

#### `FilterOverlay`

The main overlay component that orchestrates the entire filter experience.

```tsx
import { FilterOverlay, FilterState } from '@/components/ui/FilterOverlay'

const [isOpen, setIsOpen] = useState(false)
const [filters, setFilters] = useState<FilterState | null>(null)

;<FilterOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onApply={newFilters => setFilters(newFilters)}
  onReset={() => setFilters(null)}
  initialFilters={filters || undefined}
  title="Filter Packages"
  showResetButton={true}
  closeOnBackdropClick={true}
  ariaLabel="Filter packages overlay"
/>
```

#### `FilterOverlayProvider`

Context provider that manages filter state and actions.

#### `FilterOverlayBackdrop`

Accessible backdrop with click-outside handling and proper ARIA attributes.

#### `FilterOverlayContent`

Main content container with focus management and animations.

#### `FilterOverlayHeader`

Header with title and close button, following accessibility best practices.

#### `FilterOverlayFooter`

Footer with action buttons (Apply/Reset) with proper keyboard navigation.

### Individual Filter Components

#### `EnhancedTimePeriodFilter`

Advanced time period selection with custom range slider and special occasion buttons.

```tsx
import { EnhancedTimePeriodFilter } from '@/components/ui/filters/EnhancedTimePeriodFilter'

// Automatically integrates with FilterOverlay context
;<EnhancedTimePeriodFilter />
```

## 🎣 Custom Hooks

### `useFocusTrap`

Implements focus trapping within the overlay for keyboard navigation.

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap'

const containerRef = useRef<HTMLDivElement>(null)
useFocusTrap(containerRef, isOpen)
```

### `useEscapeKey`

Handles escape key press to close the overlay.

```tsx
import { useEscapeKey } from '@/hooks/useEscapeKey'

useEscapeKey(isOpen, onClose)
```

### `useClickOutside`

Detects clicks outside the overlay to close it.

```tsx
import { useClickOutside } from '@/hooks/useClickOutside'

useClickOutside(overlayRef, isOpen ? onClose : () => {})
```

### `useReducedMotion`

Detects user's reduced motion preference for accessibility.

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion'

const prefersReducedMotion = useReducedMotion()
```

### `useFilter`

Hook for individual filter components to access and update filter state.

```tsx
import { useFilter } from '@/components/ui/FilterOverlayContext'

const [timePeriod, setTimePeriod] = useFilter('timePeriod')
const [budget, setBudget] = useFilter('budget')
```

## 🎨 Design System Integration

### CSS Custom Properties

The component system uses your established design tokens:

```css
:root {
  --filter-overlay-bg: var(--bg);
  --filter-overlay-text: var(--text);
  --filter-overlay-text-muted: var(--textMuted);
  --filter-overlay-yellow: var(--yellow);
  --filter-overlay-surface: var(--surfaceDark);

  /* Enhanced spacing system */
  --filter-spacing-xs: 0.25rem;
  --filter-spacing-sm: 0.5rem;
  --filter-spacing-md: 1rem;
  --filter-spacing-lg: 1.5rem;
  --filter-spacing-xl: 2rem;
  --filter-spacing-2xl: 3rem;

  /* Enhanced border radius system */
  --filter-radius-sm: 0.375rem;
  --filter-radius-md: 0.5rem;
  --filter-radius-lg: 0.75rem;
  --filter-radius-xl: 1rem;

  /* Enhanced shadow system */
  --filter-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --filter-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --filter-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --filter-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --filter-shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);

  /* Enhanced animation timing */
  --filter-transition-fast: 150ms ease-out;
  --filter-transition-normal: 200ms ease-out;
  --filter-transition-slow: 300ms ease-out;
}
```

### Typography

- **Font Family**: Uses `var(--font-exo2)` for consistency
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold)
- **Line Heights**: Optimized for readability (1.2-1.3)

### Color System

- **Primary**: `var(--filter-overlay-yellow)` for accents and active states
- **Background**: `var(--filter-overlay-bg)` for main background
- **Text**: `var(--filter-overlay-text)` for primary text
- **Muted Text**: `var(--filter-overlay-text-muted)` for secondary text

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Escape
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader Support**: Proper ARIA labels, roles, and descriptions
- **Color Contrast**: Meets WCAG AA contrast requirements
- **Reduced Motion**: Respects user's motion preferences

### ARIA Implementation

```tsx
// Proper ARIA attributes
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="filter-title"
  aria-label="Filter packages overlay"
>
  <h2 id="filter-title">Filter Packages</h2>
  {/* Content */}
</div>
```

### Focus Management

- **Focus Trap**: Keeps focus within the overlay when open
- **Focus Restoration**: Returns focus to trigger element when closed
- **Visible Focus**: Clear focus indicators for all interactive elements

## 📱 Responsive Design

### Breakpoints

- **Desktop**: Full layout with side-by-side elements
- **Tablet** (≤768px): Optimized spacing and touch targets
- **Mobile** (≤480px): Stacked layout with larger touch targets

### Touch Optimization

- **Touch Targets**: Minimum 44px for all interactive elements
- **Gesture Support**: Swipe and touch-friendly interactions
- **Viewport Optimization**: Proper viewport handling for mobile

## ⚡ Performance Optimizations

### React Optimizations

- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Memoizes event handlers
- **useMemo**: Optimizes expensive calculations
- **Portal Rendering**: Efficient DOM manipulation

### CSS Optimizations

- **will-change**: Optimizes animations
- **transform**: Uses GPU acceleration
- **contain**: Improves layout performance
- **scroll-behavior**: Smooth scrolling

### Bundle Optimization

- **Tree Shaking**: Only imports used components
- **Code Splitting**: Lazy loading of filter components
- **Minimal Dependencies**: No external dependencies

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterOverlay } from '@/components/ui/FilterOverlay'

test('opens and closes filter overlay', () => {
  const onClose = jest.fn()
  render(
    <FilterOverlay
      isOpen={true}
      onClose={onClose}
      onApply={jest.fn()}
      onReset={jest.fn()}
    />
  )

  fireEvent.click(screen.getByLabelText('Close filter overlay'))
  expect(onClose).toHaveBeenCalled()
})
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

test('has no accessibility violations', async () => {
  const { container } = render(<FilterOverlay {...props} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### E2E Tests

```tsx
import { test, expect } from '@playwright/test'

test('filter overlay workflow', async ({ page }) => {
  await page.goto('/search/packages')
  await page.click('[aria-label="Filter packages"]')
  await expect(page.locator('[role="dialog"]')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('[role="dialog"]')).not.toBeVisible()
})
```

## 🚀 Integration Examples

### Basic Integration

```tsx
import { FilterOverlay } from '@/components/ui/FilterOverlay'

function SearchPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState(null)

  return (
    <>
      <button onClick={() => setIsFilterOpen(true)}>Filter Packages</button>

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={setFilters}
        onReset={() => setFilters(null)}
        initialFilters={filters}
      />
    </>
  )
}
```

### Advanced Integration with Custom Filters

```tsx
import {
  FilterOverlay,
  FilterOverlayProvider,
  FilterOverlayContent,
  FilterOverlayHeader,
  FilterOverlayFooter,
} from '@/components/ui/FilterOverlay'

function CustomFilterPage() {
  return (
    <FilterOverlay
      isOpen={isOpen}
      onClose={onClose}
      onApply={onApply}
      onReset={onReset}
      title="Advanced Filters"
      showResetButton={true}
    >
      <FilterOverlayContent>
        <FilterOverlayHeader title="Advanced Filters" onClose={onClose} />

        <div className="content">
          <CustomFilterComponent />
          <AnotherCustomFilter />
        </div>

        <FilterOverlayFooter
          showResetButton={true}
          onApply={onApply}
          onReset={onReset}
        />
      </FilterOverlayContent>
    </FilterOverlay>
  )
}
```

### Integration with Existing Components

```tsx
// Replace existing FilterOverlay with enhanced version
import { FilterOverlay } from '@/components/ui/FilterOverlay'
// Remove: import { FilterOverlay } from '@/components/search/FilterOverlay';

// The interface is compatible, so no other changes needed
;<FilterOverlay
  isOpen={isFilterOpen}
  onClose={handleFilterClose}
  onApply={handleFilterApply}
  onReset={handleFilterReset}
  initialFilters={appliedFilters || undefined}
/>
```

## 🔧 Customization

### Adding New Filter Types

1. Create a new filter component in `components/ui/filters/`
2. Use the `useFilter` hook to access state
3. Add the filter to the `FilterState` interface
4. Import and use in your overlay

### Styling Customization

- **Colors**: Update CSS custom properties
- **Spacing**: Modify spacing variables
- **Animations**: Adjust timing and easing functions
- **Layout**: Customize grid and flexbox properties

### Behavior Customization

- **Close Behavior**: Customize when overlay closes
- **Validation**: Add custom validation logic
- **Persistence**: Implement filter state persistence
- **Analytics**: Add tracking for filter interactions

## 📚 API Reference

### FilterOverlay Props

| Prop                   | Type                             | Default                     | Description             |
| ---------------------- | -------------------------------- | --------------------------- | ----------------------- |
| `isOpen`               | `boolean`                        | -                           | Whether overlay is open |
| `onClose`              | `() => void`                     | -                           | Close handler           |
| `onApply`              | `(filters: FilterState) => void` | -                           | Apply handler           |
| `onReset`              | `() => void`                     | -                           | Reset handler           |
| `initialFilters`       | `Partial<FilterState>`           | `{}`                        | Initial filter values   |
| `title`                | `string`                         | `'Filter Packages'`         | Overlay title           |
| `showResetButton`      | `boolean`                        | `true`                      | Show reset button       |
| `className`            | `string`                         | `''`                        | Custom CSS class        |
| `ariaLabel`            | `string`                         | `'Filter packages overlay'` | ARIA label              |
| `closeOnBackdropClick` | `boolean`                        | `true`                      | Close on backdrop click |
| `zIndex`               | `number`                         | `1000`                      | Z-index value           |

### FilterState Interface

```tsx
interface FilterState {
  timePeriod: {
    start: string
    end: string
  }
  specialOccasion: string | null
  budget: {
    min: number
    max: number
  }
  flightType: {
    direct: boolean
    stopover: boolean
  }
  hotelRatings: number
  distance: {
    min: number
    max: number
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Overlay Not Opening

- Check if `isOpen` prop is `true`
- Verify no CSS conflicts with z-index
- Ensure proper event handler setup

#### Focus Management Issues

- Verify focus trap is working
- Check for conflicting focus management
- Ensure proper ARIA attributes

#### Styling Issues

- Check CSS custom properties are defined
- Verify CSS modules are imported correctly
- Check for conflicting styles

#### Performance Issues

- Use React DevTools Profiler
- Check for unnecessary re-renders
- Verify memoization is working

### Debug Mode

```tsx
<FilterOverlay
  {...props}
  // Add debug logging
  onApply={filters => {
    console.log('Applied filters:', filters)
    onApply(filters)
  }}
/>
```

## 🔄 Migration Guide

### From Existing FilterOverlay

1. **Update Imports**:

   ```tsx
   // Old
   import { FilterOverlay } from '@/components/search/FilterOverlay'

   // New
   import { FilterOverlay } from '@/components/ui/FilterOverlay'
   ```

2. **Props Compatibility**: The interface is fully compatible, no changes needed

3. **Enhanced Features**: New features are opt-in via props

### Gradual Migration

- Start with the main `FilterOverlay` component
- Gradually replace individual filter components
- Update styling to use new CSS custom properties
- Add enhanced accessibility features

## 📈 Future Enhancements

### Planned Features

- **Filter Presets**: Save and load filter configurations
- **Advanced Validation**: Real-time validation with error messages
- **Filter History**: Undo/redo functionality
- **Export/Import**: Share filter configurations
- **Analytics Integration**: Track filter usage patterns

### Performance Improvements

- **Virtual Scrolling**: For large filter lists
- **Lazy Loading**: Load filter components on demand
- **Service Worker**: Cache filter configurations
- **Web Workers**: Offload heavy filter operations

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow established rules
- **Prettier**: Consistent formatting
- **Testing**: Unit and E2E tests required
- **Accessibility**: WCAG 2.1 AA compliance

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback

---

This production-ready filter overlay system provides a solid foundation for building accessible, performant, and maintainable filter interfaces that seamlessly integrate with your existing codebase architecture.
