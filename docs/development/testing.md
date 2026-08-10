# Testing

The repository's primary quality gate is:

```bash
. ./bin/activate-hermit
just ci
```

`just test-unit` runs infrastructure-free unit tests. `just test` includes integration coverage and requires configured Postgres and Redis. Desktop E2E uses Playwright from `desktop/`; mobile and web have their own tasks described in `TESTING.md` and the `Justfile`.

Preview Studio has focused Node tests under `desktop/src/features/preview-studio/lib/` and E2E specs under `desktop/tests/e2e/`. Keep these evidence distinctions:

- `agent-preview-handoff.spec.ts` exercises the production URL-handoff journey.
- deck, web, and film specs exercise fixture-backed engines.
- generation specs exercise configuration and fail-closed UI unless a separately recorded live-provider test says otherwise.
- `preview-studio-showcase.spec.ts` is a deterministic documentation narrative, not a live agent/provider test.

Before release, record exact commit, commands, environment, pass/fail totals, skipped tests, and external services in [QA evidence](../evidence/qa-evidence.md). A count copied from another commit is not release evidence.
