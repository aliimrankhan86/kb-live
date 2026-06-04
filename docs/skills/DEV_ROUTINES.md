# Dev routines (skills)

## Architecture decision: Turbopack for development

As of this commit, **all dev commands use Turbopack** (`--turbopack`). This is a permanent fix, not a workaround.

**Why:** Webpack's HMR (Hot Module Replacement) has a fundamental bug where its module registry (`__webpack_modules__`) accumulates stale module IDs during development — from file edits, branch switches, dependency changes, and rapid saves. This causes `__webpack_modules__[moduleId] is not a function` repeatedly. Cache clearing is a bandaid that doesn't prevent it from happening again within the same session.

**Why Turbopack eliminates it:** Turbopack is a Rust-based bundler built into Next.js 15. It has a completely different module system — there is no `__webpack_modules__` registry. The error literally cannot occur. It is the officially stable dev bundler for Next.js 15.5.3.

**Production builds still use webpack** via `next build`. This is safe because webpack is stable for one-shot builds (the HMR bug only affects hot reloading during development).

## Dev commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm run dev` | Kills port 3000, starts Turbopack dev at 127.0.0.1:3000 | **Default. Use this always.** |
| `npm run dev:clean` | Kills port 3000, deletes `.next/`, starts Turbopack | After branch switch or persistent issues |
| `npm run dev:reset` | Kills port 3000, deletes `.next/` + `node_modules/.cache`, starts Turbopack | After `npm install` or major changes |
| `npm run dev:webpack` | Kills port 3000, clears webpack cache, starts with webpack (legacy) | Only if Turbopack has a specific incompatibility |

## Recovery

| Symptom | Fix |
|---------|-----|
| Port already in use | `npm run dev` (auto-kills port 3000) |
| Stale UI / wrong styles | `npm run dev:clean` → hard refresh (Cmd+Shift+R) |
| TypeScript errors after branch switch | `npm run dev:clean` |
| Build failure after npm install | `npm run dev:reset` |
| Any issue with Turbopack | `npm run dev:webpack` (temporary fallback) |

## Rules

1. **Always use `npm run dev`** — it uses Turbopack by default.
2. **After `git checkout`:** run `npm run dev:clean`.
3. **After `npm install`:** run `npm run dev:reset`.
4. **Dev binds to `127.0.0.1:3000`** — do not change this.
5. **`npm run build` uses webpack** — this is correct and expected. Do not add `--turbopack` to build.
