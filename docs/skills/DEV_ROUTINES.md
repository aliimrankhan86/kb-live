# Dev routines (skills)

## Why webpack crashes happen (and why they won't anymore)

The error `__webpack_modules__[moduleId] is not a function` is caused by stale webpack filesystem cache in `.next/cache/webpack/`. Module IDs from a previous dev session become invalid after file changes, branch switches, or dependency updates. HMR then references those stale IDs.

**Permanent fix (already applied in `next.config.ts`):**
1. `config.cache = { type: 'memory' }` in development — no persistent disk cache, clean on every restart.
2. `optimizePackageImports` for heavy deps — reduces total module count, fewer IDs to go stale.
3. `moduleIds: 'named'` and `chunkIds: 'named'` in dev — human-readable IDs that are stable across rebuilds.
4. `npm run dev` automatically clears `.next/cache/webpack/` on every start as an extra safeguard.

## Dev commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm run dev` | Kills port 3000, clears webpack cache, starts dev at 127.0.0.1:3000 | Default. Use this always. |
| `npm run dev:clean` | Kills port 3000, deletes entire `.next/`, starts dev | After branch switch, dependency change, or persistent errors |
| `npm run dev:reset` | Kills port 3000, deletes `.next/` + `node_modules/.cache`, starts dev | Nuclear option. After `npm install` or major config changes |
| `npm run dev:turbo` | Deletes `.next/`, starts with Turbopack | Experimental. Faster cold starts, less stable HMR |

## Recovery when Next dev breaks

| Symptom | Fix |
|---------|-----|
| `__webpack_modules__[moduleId] is not a function` | Stop dev → `npm run dev` (auto-clears webpack cache) |
| Chunk 404, blank screen, manifest ENOENT | Stop dev → `npm run dev:clean` → hard refresh (Cmd+Shift+R) |
| TypeScript errors after branch switch | `npm run dev:clean` (stale type cache) |
| Persistent build failures | `npm run dev:reset` → if still broken: `rm -rf node_modules && npm install && npm run dev:clean` |

## Rules to prevent instability

1. **Never edit files in `.next/`** — it's a build artifact.
2. **Always use `npm run dev`** — it clears webpack cache automatically.
3. **After `git checkout` to a different branch:** run `npm run dev:clean`.
4. **After `npm install`:** run `npm run dev:reset`.
5. **Dev binds to `127.0.0.1:3000` only** — do not use `0.0.0.0`.
6. **Hard refresh after restart:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux).
