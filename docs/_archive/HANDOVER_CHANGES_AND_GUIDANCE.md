# Handover: Changes & Guidance

**Purpose:** Short change log and known issues for any AI (Cursor/Codex/Gemini/ChatGPT). Details live in NOW.md and CURSOR_CONTEXT.md.

---

## Recent change log (dated, newest first)

- **Architectural cleanup (main-v2-UI):** viewport export (layout.tsx), shared getErrorMessage (lib/), Radix Description fix (Overlay.tsx), not-found metadata, next.config.ts populated (reactStrictMode, poweredByHeader, images), tsconfig hardened, color-scheme: dark, dead deps removed, Header/Hero converted to server components, cn() extracted to lib/utils.ts, redundant ARIA removed, ComparisonTable caption, stale docs archived, all docs updated to main-v2-UI.
- **Mobile responsiveness + docs discipline:** Hero, header, Umrah form, search packages CSS (breakpoints 640/768/1024; 44px tap targets; compare modal scroll; overflow guardrails). DOCS_MERGE_CHECKLIST.md added; NOW.md, CURSOR_CONTEXT.md trimmed; README "Definition of Done for any PR".
- **UX Option A search flow:** /umrah → /search/packages with query params; shortlist (localStorage); compare (max 3, modal); seed packages (pkg4, pkg5); error boundaries; dev:clean/dev:turbo scripts; progressive enhancement on Umrah form.

---

## Known issues & fixes

- **Chunk 404s / app "broken" in dev:** Use `npm run dev:clean` (or `dev:turbo`). Umrah form works without JS (native form submit).
- **clientReferenceManifest / _document.js ENOENT:** Stale .next; App Router only. Fix: dev:clean or dev:turbo.
- **Missing error components:** Resolved by app/error.tsx, global-error.tsx, not-found.tsx.

---

## Where to look

- **Landing / Umrah / Search packages:** docs/NOW.md "What works" + CURSOR_CONTEXT "File map".
- **Merge and doc discipline:** docs/DOCS_MERGE_CHECKLIST.md.
- **Dev routines and recovery:** docs/skills/DEV_ROUTINES.md.
- **Current stack:** Next.js 15.5.3, React 19, App Router only, Tailwind v4, TypeScript. No `pages/` directory.
