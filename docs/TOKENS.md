# Tokens

Design tokens are defined in `styles/tokens.css`.

## Current tokens

- `--bg`: application background
- `--text`: primary foreground text
- `--textMuted`: secondary/muted text
- `--yellow`: primary accent/action color
- `--surfaceDark`: surface/card background

## Usage

- Reference tokens via CSS variables (example: `text-[var(--text)]`).
- Do not hardcode repeated colors in components when a token exists.
- Prefer token-first styling in all shared UI primitives.

## Adding new tokens

1. Add token to `styles/tokens.css`.
2. Use clear semantic naming (`--success`, `--danger`, `--borderSubtle`).
3. Avoid route-specific names (`--homeHeroYellow` is not allowed).
4. Update this document with name and purpose.
5. Only add tokens for repeated design needs across multiple screens.

## Naming convention

- Use lowercase kebab-case.
- Use semantic intent over raw value.
- Keep names stable; avoid renaming without migration.
