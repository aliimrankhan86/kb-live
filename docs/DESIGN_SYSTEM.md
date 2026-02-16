# Design System

## Source of truth

- Tokens live in `styles/tokens.css`.
- UI primitives live in `components/ui/*`.
- Feature imports should come from `components/ui/index.ts`.
- `/showcase` is the validation surface for component states.

## Rules (non-negotiable)

1. Feature pages must use design-system primitives for controls and overlays.
2. Do not add one-off `input`, `select`, `textarea`, button, or modal implementations in feature folders when a primitive exists.
3. Style with tokens (or classes mapped to tokens), not repeated hardcoded values.
4. Keep accessibility defaults: labels/aria wiring, keyboard support, visible focus, disabled states.

## How to add or update components

1. Add or update the primitive in `components/ui`.
2. Export it from `components/ui/index.ts`.
3. Add/adjust token(s) in `styles/tokens.css` only if needed for reusable styling.
4. Add or update live examples in `/showcase`.
5. Update docs when rules or component APIs change.
