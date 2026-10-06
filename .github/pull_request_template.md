## Summary

(One line: what this PR does.)

## Checklist

- [ ] Docs updated (STATUS.md, AI_NOTES.md; HANDOFF.md if product state changed)
- [ ] `npm run test` passes
- [ ] `npx tsc --noEmit` and `npm run lint` pass
- [ ] `npm run build` passes
- [ ] `npx playwright test --workers=1` passes (if flows/selectors touched)
- [ ] Real-DB suite green: CI job `local-db`, or locally `supabase start --workdir e2e/local-db` then `npm run e2e:local-db` (required if the CI job did not run)
