# Basket Functionality Implementation Guide

## Overview

This document provides comprehensive development instructions for the basket functionality implemented in the KaabaTrip application. The basket feature allows users to add packages to their basket for potential booking, with independent state management from the shortlist and compare features.

## 🏗️ Architecture Integration

### **Technology Stack Alignment**

- **Next.js 15** with App Router and React 19
- **TypeScript** with strict mode and proper type safety
- **CSS Modules** for component-scoped styling
- **State Management** with React hooks and Set data structure
- **Design System** integration with CSS custom properties

### **Component Architecture**

The basket functionality is implemented using a state-driven approach:

```
lib/
├── basket-types.ts              # Type definitions and utility functions
components/search/
├── PackageList.tsx              # State management and logic
├── PackageCard.tsx              # UI components with basket states
└── packages.module.css          # Styling for basket button states
```

## 📦 Implementation Details

### **1. Type Definitions (`lib/basket-types.ts`)**

```typescript
export interface BasketState {
  basketedPackages: string[]
  isBasketEnabled: boolean
  basketCount: number
}

export interface BasketPackage {
  id: string
  isInBasket: boolean
}
```

**Key Features:**

- Type-safe basket state management
- Utility functions for button states and text
- Accessibility-focused helper functions
- Clear separation of concerns

### **2. State Management (`components/search/PackageList.tsx`)**

**State Structure:**

```typescript
const [basketCount, setBasketCount] = useState(0)
const [basketedPackages, setBasketedPackages] = useState<Set<string>>(new Set())
```

**Key Implementation Details:**

- Uses Set data structure for efficient basket management
- Independent from shortlist and compare functionality
- Toggle functionality for adding/removing packages
- Real-time UI updates based on state changes

### **3. PackageCard Component Updates**

**New Props Interface:**

```typescript
interface PackageCardProps {
  package: Package
  onAddToShortlist: (packageId: string) => void
  onAddToCompare: (packageId: string) => void
  onAddToBasket: (packageId: string) => void
  isInShortlist: boolean
  isInBasket: boolean
  compareEnabled: boolean
  shortlistCount: number
}
```

**Button State Logic:**

- **Basket Button**: Shows "Add to Basket" or "Remove from Basket"
- **Visual States**: Different styling for default/added states
- **Independent State**: Separate from shortlist and compare functionality

### **4. Styling (`components/search/packages.module.css`)**

**Button State Classes:**

- `.basketButtonDefault`: Default state styling
- `.basketButtonAdded`: Visual feedback for basketed packages
- **Color Scheme**: Green accent for basket (vs yellow for shortlist)

**Status Display:**

- **Status Container**: Flex layout for shortlist and basket counts
- **Responsive Design**: Stacked on mobile, side-by-side on desktop
- **Live Regions**: Dynamic updates announced to screen readers

## 🎨 Design System Compliance

### **Color Palette**

- **Basket Primary**: Green (#22c55e) for basket active states
- **Basket Hover**: Darker green (#16a34a) for hover effects
- **Background**: `var(--bg)` (#0B0B0B) for main background
- **Text**: `var(--text)` (#FFFFFF) for primary text

### **Button States**

- **Default**: Transparent background with border
- **Hover**: Green accent with background highlight
- **Active/Added**: Green background with darker text
- **Consistent**: Follows same patterns as shortlist buttons

### **Typography**

- **Font Family**: `var(--font-exo2)` for consistency
- **Font Weights**: 400 (normal), 500 (medium)
- **Responsive Scaling**: Proper font size adjustments

## ♿ Accessibility Implementation

### **WCAG 2.1 AA Compliance**

- **Keyboard Navigation**: Full support for all interactive elements
- **Screen Reader Support**: Dynamic ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets AA contrast requirements
- **Live Regions**: Dynamic updates announced to assistive technology

### **ARIA Implementation**

```tsx
// Dynamic ARIA labels based on state
aria-label={getBasketAriaLabel(isInBasket, packageName)}

// Live regions for status updates
aria-live="polite"
aria-label={getBasketCountAriaLabel(basketCount)}
```

### **Accessibility Features**

- **Live Regions**: Basket count updates announced
- **Contextual Labels**: Button text changes based on state
- **Focus Management**: Clear focus indicators for all states
- **Screen Reader Support**: Proper role attributes and descriptions

## 📱 Responsive Design

### **Breakpoints**

- **Desktop** (>768px): Side-by-side status display
- **Tablet** (≤768px): Optimized spacing and touch targets
- **Mobile** (≤480px): Stacked layout with larger touch targets

### **Touch Optimization**

- **Minimum Touch Targets**: 44px+ for all interactive elements
- **Gesture Support**: Touch-friendly interactions
- **Visual Feedback**: Clear state changes on interaction

## ⚡ Performance Optimizations

### **React Optimizations**

- **Efficient State Updates**: Minimal re-renders
- **Set Data Structure**: O(1) lookup and manipulation
- **Independent State**: No unnecessary dependencies
- **Memoized Calculations**: Prevent unnecessary recalculations

### **State Management**

- **Set Operations**: Efficient add/remove operations
- **State Normalization**: Single source of truth for basket
- **Independent Logic**: Separate from shortlist and compare

## 🧪 Testing Considerations

### **Unit Tests**

```typescript
// Example test structure
describe('Basket Functionality', () => {
  test('adds package to basket on click', () => {
    // Test basket add logic
  })

  test('removes package from basket on click', () => {
    // Test basket remove logic
  })

  test('updates button text based on basket state', () => {
    // Test dynamic button text
  })
})
```

### **Integration Tests**

- PackageList component state management
- PackageCard component prop passing
- Button state synchronization
- Accessibility compliance

### **User Experience Tests**

- Basket toggle functionality
- Visual feedback for all states
- Independent operation from shortlist
- Keyboard navigation flow

## 🔧 Customization Guide

### **Adding New Basket Features**

1. Update `BasketState` interface in `lib/basket-types.ts`
2. Add new utility functions for new features
3. Update component props and handlers
4. Add corresponding CSS classes

### **Styling Customization**

- Colors: Update CSS custom properties
- Button States: Modify state-specific styles
- Animations: Add transition effects
- Typography: Update font weights and sizes

### **Behavior Customization**

- Button text customization
- Visual feedback modifications
- Accessibility enhancements
- Integration with other features

## 🚀 Future Enhancements

### **Potential Improvements**

- **Basket Modal**: Full basket management interface
- **Bulk Actions**: Select multiple packages at once
- **Basket Persistence**: Remember basket across sessions
- **Export Basket**: Save basket for later

### **Advanced Features**

- **Smart Recommendations**: Suggest packages for basket
- **Basket Analytics**: Track user preferences
- **Social Sharing**: Share basket with others
- **Mobile Optimization**: Touch-optimized basket management

## 📋 Maintenance Guidelines

### **Code Quality**

- Follow TypeScript strict mode
- Maintain accessibility standards
- Keep components modular and reusable
- Document any new features

### **Testing Requirements**

- Write tests for new functionality
- Maintain accessibility test coverage
- Test responsive behavior
- Validate keyboard navigation

### **Performance Monitoring**

- Monitor state update performance
- Check re-render frequency
- Validate memory usage
- Test with large package lists

## 🎯 Success Metrics

### **Functionality**

- ✅ Basket button toggles correctly
- ✅ Independent from shortlist and compare
- ✅ Visual feedback is clear and consistent
- ✅ State management is efficient

### **Accessibility**

- ✅ WCAG 2.1 AA compliance
- ✅ Full keyboard support
- ✅ Screen reader friendly
- ✅ Dynamic ARIA labels

### **Performance**

- ✅ Efficient state management
- ✅ Minimal re-renders
- ✅ Fast button state updates
- ✅ Smooth user interactions

### **User Experience**

- ✅ Intuitive button behavior
- ✅ Clear visual feedback
- ✅ Responsive design
- ✅ Consistent with design system

## 🔍 Implementation Status

**Current Features:**

- ✅ Basket toggle functionality
- ✅ Independent state management
- ✅ Visual feedback for all states
- ✅ Accessibility compliance
- ✅ Responsive design
- ✅ Status display in header

**Ready for:**

- Basket modal implementation
- Advanced basket features
- Bulk selection functionality
- Export capabilities

## 🎨 Visual Design

### **Button States**

- **Default**: Transparent with border
- **Added**: Green background with darker text
- **Hover**: Enhanced green with background highlight
- **Focus**: Clear focus indicators

### **Status Display**

- **Layout**: Flex container with gap
- **Responsive**: Stacked on mobile, side-by-side on desktop
- **Typography**: Consistent with design system
- **Colors**: Green accent for basket, yellow for shortlist

### **Integration**

- **Independent**: Separate from shortlist and compare
- **Consistent**: Follows same patterns as other features
- **Accessible**: Full keyboard and screen reader support
- **Responsive**: Works across all device sizes

---

**Implementation Status**: ✅ Complete
**Last Updated**: Current
**Maintainer**: Development Team
