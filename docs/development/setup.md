# Development setup

Use the repository's pinned Hermit environment and tasks rather than installing ad hoc global tool versions.

```bash
git clone https://github.com/Josh-Gi3r/buzz.git
cd buzz
git checkout d36f39336b05036f90ba20e273746374c25aaf3e
. ./bin/activate-hermit
cp .env.example .env
just setup
just dev
```

Read `.env.example`, `CONTRIBUTING.md`, and the root `AGENTS.md` before changing runtime configuration. Full relay integration requires its configured Postgres/Redis services. Frontend-only `just desktop-dev` cannot provide native commands.

Use `./scripts/run-studio-sandbox.sh` for an isolated Studio-oriented development instance. It is a development helper, not a public installer or production deployment.
