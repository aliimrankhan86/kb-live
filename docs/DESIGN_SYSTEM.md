# Design System

Core UI primitives live in `components/ui` and are the default path for all feature UI.

## Architecture

- Tokens: `styles/tokens.css` is the visual source of truth.
- Primitives: `components/ui/*` contains reusable building blocks.
- Exports: import from `components/ui/index.ts` for feature usage.
- Playground: `/showcase` is the live validation surface.

## Current primitives

- Typography: `Text`, `Heading`
- Form controls: `Button`, `Input`, `Select`, `Slider`, `Checkbox`, `Radio`, `Switch`
- Feedback: `Alert`
- Overlay: `Dialog` + `OverlayContent` + related overlay slots
- Navigation: `Pagination`
- Data display: `Card`, `Badge`, `Table`
- Charts: `ChartContainer`, `LineChart`, `BarChart`

## Rules for feature development

1. Use existing primitives first; avoid one-off component clones.
2. Style using design tokens (or classes mapped to tokens), not hardcoded repeated values.
3. Keep primitive APIs semantic (`variant`, `size`, `tone`) and reuse-focused.
4. Preserve accessibility defaults:
   - keyboard support
   - visible focus styles
   - labels/aria wiring for controls
   - disabled states
5. Keep minimum tap target around 44px for primary controls.

## When to add a variant

Add a new variant only when all are true:

1. At least two features need the same visual/behavioral pattern.
2. Existing variants cannot represent the pattern safely.
3. The new variant remains generic (not route-specific).

## Playground requirements

`/showcase` should continue to demonstrate component states with live examples:

- default
- focus/hover sample
- disabled
- error
- loading (where applicable)
- mobile notes where behavior differs

## Non-goals

- No Storybook in this repo.
- No business logic in UI primitives.
