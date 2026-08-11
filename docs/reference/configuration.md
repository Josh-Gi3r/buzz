# Configuration reference

`.env.example` and the configuration structs in the relevant crates are authoritative. Configuration spans relay URL/host tenancy, Postgres, Redis, media/object storage, search, git, workflow hooks, push, audit, huddle audio, agent runtimes, remote providers, and mesh compute.

Not every service is required for every development task. Conversely, seeing its source or UI does not mean it is enabled. Documentation should label each deployment-dependent feature and name the config/service that makes it operational.

BUZZ — LIVE PREVIEW STUDIO's local library needs no relay configuration. Live sites must be reachable from the desktop. Image/video generation requires its external provider credentials/account or installed CLI. Provider keys entered in Studio use renderer-local storage.
