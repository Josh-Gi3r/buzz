# Screenshot provenance

The five showcase images under `docs/assets/showcase/` come from deterministic, mocked Buzz desktop E2E state in `desktop/tests/e2e/preview-studio-showcase.spec.ts`. They are not captures of a private community, live agent, model provider, deployment, or unscripted build.

## Reproduction record

The showcase was regenerated locally from the source shipped in this repository. From
the repository root:

```bash
cd desktop
. ../bin/activate-hermit
pnpm build:e2e && pnpm exec playwright test preview-studio-showcase --project=smoke
```

The smoke project passed `2/2` in 16.1 s. The Playwright viewport and screenshot outputs
were `1600x1000`. The generated files were copied from
`desktop/test-results/documentation-showcase/` to `docs/assets/showcase/` and have the
exact SHA-256 hashes below.

| Image | SHA-256 | What it demonstrates | What it does not prove |
|---|---|---|---|
| `01-agent-build-chat.png` | `6b038d966d18988a08107c6b46806b605e44b8cbcfbb8fdf8e1442f83cf28883` | Buzz channel UI and a scripted build conversation | A live agent, model, tool, or real build run. |
| `02-live-wedding-desktop.png` | `35c8567b8c12701fd4381de433d6abcefe70b621769f1e2b7097ffd9c947d186` | BUZZ — LIVE PREVIEW STUDIO and a fixture website in desktop framing | Deployment, immutable capture, or a live agent-authored site. |
| `03-live-wedding-mobile-review.png` | `717b56d6b53793d72590ddab0c3d70967654053254ab42f7681cae545ddb1159` | Mobile-width frame and local Inspector/review UI | Mobile app support or synchronized review. |
| `04-pricing-deck-review.png` | `a2c08f65cb6f94b16b64646d0a8b61d4f2cbbf9b4cb8a377fe92c0c0c5795562` | Fixture deck engine and slide review | General production deck import/create. |
| `05-wedding-film-review.png` | `9d662f2dc14dcb952cf8af0ccb1583565035047e574524d88ab967e324315ffb` | Fixture film engine and time review | General production film import or in-app rerendering. |

The files are deterministic outputs of this mocked E2E story. They do not expand the
product truth matrix or verify OpenAI, Gemini, Higgsfield, HyperFrames, a live agent, or
any external integration.
