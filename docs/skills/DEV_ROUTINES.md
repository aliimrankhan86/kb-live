# Dev routines (skills)

**One recommended dev command (preferred)**  
- `npm run dev:clean` — Clears port 3000, removes `.next`, then starts dev. Use this when starting work or after pull to avoid chunk/manifest issues.  
- For a quick restart without wiping cache: `npm run dev` (kills anything on 3000, then starts).

**Recovery when Next dev breaks**  
- Chunk 404, blank screen, or manifest/ENOENT: stop dev, run `npm run dev:clean`, then hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or use an incognito window.  
- If it persists: run `npm run dev:reset` (kills port 3000, removes `.next` and `node_modules/.cache`, then starts dev).  
- Last resort: `rm -rf .next node_modules/.cache` then `npm run dev:clean`.

**Known-good port/host**  
- Dev binds to **127.0.0.1:3000** only (localhost). Do not use 0.0.0.0 unless required; it can cause stale chunk requests.

**Hard refresh safely**  
- Browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux). Or DevTools → right-click refresh → Empty Cache and Hard Reload.  
- Do not rely on normal refresh after a dev:clean; hard refresh once so the browser drops old script URLs.
