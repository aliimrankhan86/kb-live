# Accessibility Standards (WCAG 2.1 AA)

## Core Principles

- **Perceivable**: Information and UI components must be presentable to users in ways they can perceive.
- **Operable**: User interface components and navigation must be operable.
- **Understandable**: Information and the operation of user interface must be understandable.
- **Robust**: Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.

## Checklist for New Features

### Keyboard Navigation

- [ ] All interactive elements (buttons, links, inputs) are focusable via `Tab`.
- [ ] No keyboard traps (focus can move in and out of all regions).
- [ ] Drag and drop interfaces (Kanban) provide keyboard alternatives or are compatible with screen readers (using `dnd-kit`'s keyboard sensors).

### Focus Management

- [ ] Overlays/Modals trap focus when open.
- [ ] Focus returns to the trigger element when Overlay closes.
- [ ] Focus indicators are clearly visible (e.g., `ring-2 ring-yellow-400`).

### ARIA & Semantics

- [ ] Custom controls have appropriate `role` attributes (e.g., `role="slider"`).
- [ ] Interactive elements have accessible names (`aria-label` or visible text).
- [ ] State changes are communicated (e.g., `aria-expanded`, `aria-checked`).

### Visual Design

- [ ] Text contrast ratio is at least 4.5:1 for normal text.
- [ ] Color is not the only means of conveying information (e.g., error states use text/icon + color).
- [ ] Animations respect `prefers-reduced-motion`.

## Implementation Details

### Overlays

We use Radix UI primitives for Dialogs, which handle:

- Focus trapping
- ARIA attributes (`aria-modal`, `role="dialog"`)
- Keyboard dismissal (`Esc`)

### Sliders

We use Radix UI Slider, which handles:

- Keyboard interaction (Arrow keys)
- ARIA values (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`)

### Kanban Board

We use `dnd-kit` with `KeyboardSensor` and `sortableKeyboardCoordinates` to ensure items can be reordered using keyboard (Space/Enter to pick up, Arrows to move, Space/Enter to drop).
