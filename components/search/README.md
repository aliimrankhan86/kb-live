# Filter Overlay Component

A comprehensive filter overlay system for the search packages page that matches the existing design system and provides a modern, accessible filtering experience.

## Components

### FilterOverlay

The main overlay component that manages the filter state and provides the modal interface.

**Features:**

- Semi-transparent backdrop with blur effect
- Smooth slide-in animation
- Click-outside-to-close functionality
- Escape key to close
- Proper focus management and accessibility
- Responsive design for all screen sizes

### Individual Filter Components

#### TimePeriodFilter

- Custom range slider for selecting date ranges
- Pre-defined special occasion buttons (Christmas, Easter, Ramadan, Summer)
- Visual feedback with active track highlighting

#### BudgetFilter

- Dual-range slider for min/max budget selection
- Formatted currency display
- Range: $500 - $5,000

#### FlightTypeFilter

- Checkbox-based selection for flight types
- Options: Direct Flights, Stopover Flights
- Custom styled checkboxes with hover effects

#### HotelRatingsFilter

- Interactive star rating system
- Click to select rating (1-5 stars)
- Visual feedback with filled/empty stars

#### DistanceFilter

- Dual-range slider for distance from hotel
- Smart formatting (meters/kilometers)
- Range: 50m - 5km

## Usage

```tsx
import { FilterOverlay, FilterState } from './FilterOverlay'

const [isFilterOpen, setIsFilterOpen] = useState(false)
const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null)

;<FilterOverlay
  isOpen={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  onApply={filters => {
    setAppliedFilters(filters)
    // Apply filters to your data
  }}
  onReset={() => {
    setAppliedFilters(null)
    // Reset your data
  }}
  initialFilters={appliedFilters || undefined}
/>
```

## Filter State Interface

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

## Styling

The components use CSS modules with CSS variables for theming:

- `--bg`: Background color
- `--text`: Text color
- `--yellow`: Accent color for highlights and active states
- `--font-exo2`: Primary font family

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Escape
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Visible focus indicators and logical tab order
- **Live Regions**: Dynamic updates announced to assistive technology
- **Semantic HTML**: Proper use of roles, landmarks, and form elements

## Responsive Design

- **Desktop**: Full overlay with side-by-side layout
- **Tablet**: Optimized spacing and touch targets
- **Mobile**: Stacked layout with larger touch targets

## Integration

The filter overlay is already integrated into the `PackageList` component. To use it in other parts of the application:

1. Import the `FilterOverlay` component
2. Add state management for `isFilterOpen` and `appliedFilters`
3. Create handler functions for open, close, apply, and reset
4. Add the component to your JSX with the appropriate props

## Customization

### Adding New Filter Types

1. Create a new filter component in the `filters/` directory
2. Add the filter state to the `FilterState` interface
3. Import and add the component to the `FilterOverlay`
4. Update the default filters object

### Styling Customization

All styles use CSS variables, making it easy to customize:

- Colors: Update CSS variables in `globals.css`
- Spacing: Modify padding/margin values in component CSS modules
- Animations: Adjust timing and easing in the CSS keyframes

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- CSS Custom Properties (CSS Variables)
- ES6+ JavaScript features
- Touch events for mobile devices

## Performance

- Lazy loading of filter components
- Efficient state management with React hooks
- Optimized animations using CSS transforms
- Minimal re-renders with proper dependency arrays
