# Design System

Core UI primitives live in `components/ui` and are the default starting point for all new feature UI.

## Primitives

- `components/ui/Text.tsx`
- `components/ui/Heading.tsx`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Select.tsx`

All primitives must:

- Use tokens from `styles/tokens.css`
- Use `cn()` from `lib/utils.ts` for class merging
- Keep accessibility defaults (focus-visible styles, disabled states, minimum target size)

## Usage rules

1. Prefer primitives over one-off styles in feature components.
2. Add a new variant only when at least 2 features need it.
3. Keep variant names semantic (`primary`, `secondary`, `danger`) not page-specific.
4. Do not introduce duplicate primitives in feature folders.
5. Keep primitives behavior-light; business logic belongs in feature components.

## Showcase

`/showcase` is the styleguide surface for quick visual validation.

Required states shown:

- Buttons: variants, sizes, loading, disabled
- Inputs: normal, disabled, error
- Select: normal, disabled
- Typography: heading + text scale

## When to extend

Add or change primitive variants only when:

- Existing primitive cannot express a repeated design need, and
- The change improves consistency across multiple routes/components.
