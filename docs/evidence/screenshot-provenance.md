# Screenshot provenance

The five showcase images under `docs/assets/showcase/` come from deterministic, mocked Buzz desktop E2E state in `desktop/tests/e2e/preview-studio-showcase.spec.ts`. They are not captures of a private community, live agent, model provider, deployment, or unscripted build.

## PM reproduction record

The PM regenerated the showcase from a clean detached worktree at exact commit
`712fe36a088bf320d663a857bbd4d1b0eba159e4`. From the repository root:

```bash
cd desktop
. ../bin/activate-hermit
pnpm build:e2e && pnpm exec playwright test preview-studio-showcase --project=smoke
```

The smoke project passed `2/2` in 15.4 s. The Playwright viewport and screenshot outputs
were `1600x1000`. Regeneration produced zero Git diff and the exact SHA-256 hashes below.

| Image | SHA-256 | What it demonstrates | What it does not prove |
|---|---|---|---|
| `01-agent-build-chat.png` | `7305452f73647c0abe9f6b8af740f9d2c0220bc4a919c1c8436e651bfcc1b894` | Buzz channel UI and a scripted build conversation | A live agent, model, tool, or real build run. |
| `02-live-wedding-desktop.png` | `3ca056c61470ad7f1122449fc208aec292ce8d03a689fbd08881ec9db4249e41` | Preview Studio and a fixture website in desktop framing | Deployment, immutable capture, or a live agent-authored site. |
| `03-live-wedding-mobile-review.png` | `016916f8f4b337d019380e0118e6b600ed68555811eebea84197420477053890` | Mobile-width frame and local Inspector/review UI | Mobile app support or synchronized review. |
| `04-pricing-deck-review.png` | `d38fcc912905b8a9af8a7f1bbc2768befe277aa5e8f191eef7db1a680fdc1b09` | Fixture deck engine and slide review | General production deck import/create. |
| `05-wedding-film-review.png` | `1f40c43e8cd9b1884baa7fbed317542c4d2200c79dd56eb1cd25a7b45ba2957f` | Fixture film engine and time review | General production film import or in-app rerendering. |

The hashes also match the earlier repeated `2/2` PM runs, demonstrating deterministic output
for this mocked E2E story. They do not expand the product truth matrix or verify OpenAI,
Gemini, Higgsfield, HyperFrames, a live agent, or any external integration.

The final clean detached worktree had an empty status. Candidate `712fe36a` is not pushed or
publicly tagged; repeat a public clean-clone check after publication before tagging a
release.
