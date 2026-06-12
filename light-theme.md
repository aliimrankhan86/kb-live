# Light Theme (Madinah) – Product & UX Specification

> This document defines **only the light theme** for the app and how users can switch between light and dark.
> It does **not** change any existing dark theme behaviour or other business logic.

---

## 1. Goal

- Add a **Madinah-inspired light theme** that users can optionally enable.
- Provide a **simple "Theme" switch** in the header (desktop) and hamburger menu (mobile) to toggle between **Light** and **Dark**.
- Persist the user's choice using `localStorage` so the app respects their preference on future visits.
- Default remains the **existing dark theme** for all users who have not explicitly chosen a theme.

---

## 2. Light Theme Visual Identity (Madinah)

The light theme is inspired by **Madinah** and **Masjid an-Nabawi**:

- Overall feel: **calm, bright, welcoming**, like the courtyard of the Prophet's Mosque in daylight.
- Base colours: **warm off-white stone** + **prophetic green accents** + **subtle gold highlights**.
- Visual message: "Madinah serenity", complementing (not replacing) the existing dark theme.

---

## 3. Light Theme Colour Tokens

Define the light theme using the **same token names** as the dark theme where possible, so the implementation is a simple theme swap and does not branch the codebase.

### 3.1. Neutrals & Backgrounds

- `--color-bg`: `#F6F4EE`
- `--color-surface`: `#FFFFFF`
- `--color-surface-subtle`: `#F9F7F2`
- `--color-border-subtle`: `#E2E0D8`
- `--color-border-strong`: `#D1D5DB`

### 3.2. Brand / Action Colours (Madinah)

- `--color-primary`: `#0A6937`
- `--color-primary-dark`: `#064124`
- `--color-primary-soft`: `#E1F3E9`
- `--color-accent-teal`: `#005F61`

### 3.3. Metallic Accent

- `--color-accent-gold`: use existing brand gold from the dark theme unchanged.
- Usage: small icon accents, thin borders or underlines in headers, "Recommended" tags.

### 3.4. Text

- `--color-text-primary`: `#111827`
- `--color-text-secondary`: `#4B5563`
- `--color-text-muted`: `#6B7280`
- `--color-text-on-brand`: `#F9FAFB`

### 3.5. Semantic Colours

- `--color-success`: `#0A6937`
- `--color-warning`: `#D97706`
- `--color-error`: `#B91C1C`
- `--color-info`: `#005F61`

---

## 4. Component Behaviour in Light Theme

### 4.1. Layout & Background

- Page background: `--color-bg`
- Cards, modals, drawers: `--color-surface`
- Section groupings: `--color-surface-subtle`

### 4.2. Header

- Background: `--color-surface`
- Bottom border: `--color-border-subtle` or 1–2px line in `--color-accent-gold`
- Nav links default: `--color-text-secondary`
- Nav links hover/active: `--color-primary`

### 4.3. Logo

- Dark theme: existing light-on-dark logo (unchanged).
- Light theme: text-logo-light.svg — identical structure to text-logo.svg with the "Pilgrim" tspan colour changed from #FFFFFF to #111827. Everything else unchanged.
- Only the logo src swaps on theme change. No layout or size changes.

### 4.4. Buttons

- Primary: background `--color-primary`, text `--color-text-on-brand`, hover `--color-primary-dark`
- Secondary: border `--color-primary`, text `--color-primary`, background transparent
- Tertiary: no border, text `--color-primary`

### 4.5. Filters, Chips, Sliders

- Default chip: background `--color-surface-subtle`, border `--color-border-subtle`, text `--color-text-secondary`
- Selected chip: background `--color-primary-soft`, text `--color-primary`
- Slider track: `--color-border-subtle`, filled track `--color-primary`, thumb white with `--color-primary` border

### 4.6. Tables & Comparison Cards

- Card background: `--color-surface`
- Card border: `--color-border-subtle`
- Price callout: text `--color-primary` or chip background `--color-primary-soft`
- "Recommended" badge: background `--color-primary-soft`, text `--color-primary`, optional gold accent

---

## 5. Theme Switching – UX Behaviour

- Two themes: `dark` (default) and `light`.
- No explicit user choice = dark always.
- Explicit choice stored in `localStorage` under key `theme` with values `"dark"` or `"light"`.
- On page load: read localStorage, apply immediately before hydration to prevent flash.
- OS `prefers-color-scheme` is ignored. Dark is always the fallback.

### Toggle placement

- Desktop: icon button (Sun/Moon from Lucide React) in the header right cluster alongside auth controls.
- Mobile: labelled row item in the hamburger slide-over menu, above nav links.

### Toggle behaviour

- Sun icon shown when theme is dark (clicking switches to light).
- Moon icon shown when theme is light (clicking switches to dark).
- aria-label updates dynamically: "Switch to light theme" / "Switch to dark theme".
- Minimum tap target: 44×44px.

---

## 6. Implementation Rules

- Light theme is additive. Dark theme tokens, layouts, routes, and logic are untouched.
- All components read colours from CSS variable tokens. No component-level branching on theme value except for the logo src swap.
- No new UI libraries. No next-themes or other theme packages unless already installed.
- Flash prevention via a blocking inline script in <head> that sets data-theme before React hydrates.
- localStorage only for persistence. No Supabase or server-side persistence in this session.
