# Tokens

Design tokens are defined in `styles/tokens.css` and are the source of visual consistency.

## Current token set

- Surface + text:
  - `--bg`
  - `--surfaceDark`
  - `--text`
  - `--textMuted`
- Brand + semantic colors:
  - `--yellow`
  - `--success`
  - `--warning`
  - `--danger`
  - `--info`
- Borders + focus:
  - `--borderSubtle`
  - `--borderStrong`
  - `--focusRing`
- Radius:
  - `--radiusSm`
  - `--radiusMd`
  - `--radiusLg`
- Spacing:
  - `--spaceXs`
  - `--spaceSm`
  - `--spaceMd`
  - `--spaceLg`
- Shadow:
  - `--shadowSoft`

## Usage rules

1. Prefer tokens in primitives and shared components.
2. Avoid route-specific or temporary token names.
3. Do not hardcode repeated colors when a semantic token exists.
4. Use `var(--token-name)` in CSS/Tailwind arbitrary values.

## Adding tokens

1. Add token to `styles/tokens.css`.
2. Use semantic names (`--danger`, `--borderStrong`), not page names.
3. Apply the token in at least one shared primitive before introducing it into feature UI.
4. Update this file and `docs/DESIGN_SYSTEM.md` if behavior guidance changed.

## Naming convention

- lowercase kebab-case
- semantic intent over literal value
- keep names stable to avoid broad migration churn
