# Compare Functionality Implementation Guide

## Overview

This document provides comprehensive development instructions for the compare functionality implemented in the PilgrimCompare application. The compare feature enables users to compare packages when they have 2 or more packages in their shortlist.

## 🏗️ Architecture Integration

### **Technology Stack Alignment**

- **Next.js 15** with App Router and React 19
- **TypeScript** with strict mode and proper type safety
- **CSS Modules** for component-scoped styling
- **State Management** with React hooks and Set data structure
- **Design System** integration with CSS custom properties

### **Component Architecture**

The compare functionality is implemented using a state-driven approach:

```
lib/
├── compare-types.ts              # Type definitions and utility functions
components/search/
├── PackageList.tsx              # State management and logic
├── PackageCard.tsx              # UI components with compare states
└── packages.module.css          # Styling for compare button states
```

## 📦 Implementation Details

### **1. Type Definitions (`lib/compare-types.ts`)**

```typescript
export interface CompareState {
  shortlistedPackages: string[]
  isCompareEnabled: boolean
  compareCount: number
}

export interface ComparePackage {
  id: string
  isInShortlist: boolean
  isInCompare: boolean
}
```

**Key Features:**

- Type-safe compare state management
- Utility functions for button states and text
- Accessibility-focused helper functions
- Clear separation of concerns

### **2. State Management (`components/search/PackageList.tsx`)**

**State Structure:**

```typescript
const [shortlistCount, setShortlistCount] = useState(0)
const [shortlistedPackages, setShortlistedPackages] = useState<Set<string>>(
  new Set()
)
const [compareEnabled, setCompareEnabled] = useState(false)
```

**Key Implementation Details:**

- Uses Set data structure for efficient shortlist management
- Memoized compare state calculation
- Toggle functionality for adding/removing packages
- Real-time UI updates based on state changes

### **3. PackageCard Component Updates**

**New Props Interface:**

```typescript
interface PackageCardProps {
  package: Package
  onAddToShortlist: (packageId: string) => void
  onAddToCompare: (packageId: string) => void
  isInShortlist: boolean
  compareEnabled: boolean
  shortlistCount: number
}
```

**Button State Logic:**

- **Shortlist Button**: Shows "Add to Shortlist" or "Remove from Shortlist"
- **Compare Button**: Dynamic text based on shortlist count
- **Visual States**: Different styling for enabled/disabled/added states

### **4. Styling (`components/search/packages.module.css`)**

**Button State Classes:**

- `.shortlistAdded`: Visual feedback for shortlisted packages
- `.compareButtonDisabled`: Disabled state styling
- `.compareButtonEnabled`: Enabled state styling
- `.compareButtonAdded`: Added to compare styling

## 🎨 Design System Compliance

### **Color Palette**

- **Primary**: `var(--yellow)` (#FFD31D) for active states
- **Background**: `var(--bg)` (#0B0B0B) for main background
- **Text**: `var(--text)` (#FFFFFF) for primary text
- **Muted Text**: `var(--textMuted)` for secondary text

### **Button States**

- **Default**: Transparent background with border
- **Hover**: Yellow accent with background highlight
- **Active/Added**: Yellow background with darker text
- **Disabled**: Reduced opacity with disabled cursor

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
aria-label={`${isInShortlist ? 'Remove' : 'Add'} ${packageName} ${isInShortlist ? 'from' : 'to'} shortlist`}

// Compare button with context-aware labels
aria-label={getCompareAriaLabel(shortlistCount)}
```

### **Accessibility Features**

- **Live Regions**: Shortlist count updates announced
- **Contextual Labels**: Button text changes based on state
- **Disabled States**: Proper disabled attribute and styling
- **Focus Management**: Clear focus indicators for all states

## 📱 Responsive Design

### **Breakpoints**

- **Desktop** (>768px): Full layout with side-by-side controls
- **Tablet** (≤768px): Optimized spacing and touch targets
- **Mobile** (≤480px): Stacked layout with larger touch targets

### **Touch Optimization**

- **Minimum Touch Targets**: 44px+ for all interactive elements
- **Gesture Support**: Touch-friendly interactions
- **Visual Feedback**: Clear state changes on interaction

## ⚡ Performance Optimizations

### **React Optimizations**

- **useMemo**: Memoized compare state calculation
- **Efficient State Updates**: Minimal re-renders
- **Set Data Structure**: O(1) lookup and manipulation
- **Conditional Rendering**: Only render necessary elements

### **State Management**

- **Set Operations**: Efficient add/remove operations
- **Memoized Calculations**: Prevent unnecessary recalculations
- **State Normalization**: Single source of truth for shortlist

## 🧪 Testing Considerations

### **Unit Tests**

```typescript
// Example test structure
describe('Compare Functionality', () => {
  test('enables compare when 2+ packages in shortlist', () => {
    // Test compare enable logic
  })

  test('disables compare when less than 2 packages', () => {
    // Test compare disable logic
  })

  test('updates button text based on shortlist count', () => {
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

- Shortlist toggle functionality
- Compare button enable/disable
- Visual feedback for all states
- Keyboard navigation flow

## 🔧 Customization Guide

### **Adding New Compare Features**

1. Update `CompareState` interface in `lib/compare-types.ts`
2. Add new utility functions for new features
3. Update component props and handlers
4. Add corresponding CSS classes

### **Styling Customization**

- Colors: Update CSS custom properties
- Button States: Modify state-specific styles
- Animations: Add transition effects
- Typography: Update font weights and sizes

### **Behavior Customization**

- Minimum shortlist count (currently 2)
- Button text customization
- Visual feedback modifications
- Accessibility enhancements

## 🚀 Future Enhancements

### **Potential Improvements**

- **Compare Modal**: Full comparison interface
- **Bulk Actions**: Select multiple packages at once
- **Compare History**: Remember previous comparisons
- **Export Comparison**: Save comparison results

### **Advanced Features**

- **Smart Recommendations**: Suggest packages to compare
- **Comparison Metrics**: Detailed comparison criteria
- **Social Sharing**: Share comparison results
- **Mobile Optimization**: Touch-optimized comparison

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

- ✅ Compare button enables with 2+ packages
- ✅ Compare button disables with <2 packages
- ✅ Shortlist toggle works correctly
- ✅ Visual feedback is clear and consistent

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

- ✅ Shortlist toggle functionality
- ✅ Compare button enable/disable logic
- ✅ Dynamic button text and states
- ✅ Visual feedback for all states
- ✅ Accessibility compliance
- ✅ Responsive design

**Ready for:**

- Compare modal implementation
- Advanced comparison features
- Bulk selection functionality
- Export capabilities

---

**Implementation Status**: ✅ Complete
**Last Updated**: Current
**Maintainer**: Development Team
