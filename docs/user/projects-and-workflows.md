# Projects and workflows

Projects and workflows are inherited Buzz desktop preview features at this fork's baseline.

## Projects

Projects associate collaboration with repositories. Depending on relay storage and policy, the desktop can browse commits and source, group repositories, work with issues, patches and pull requests, leave inline review, and manage branch/tag or merge operations. The public web surface provides narrower repository and blob browsing.

Git smart HTTP is optional and requires configured storage and policy. A rendered repository control does not override server-side authorization.

## Workflows

Workflows provide definitions, triggers, runs, webhooks, approvals, and related desktop management. They remain preview/partial because generic executor paths still include placeholder actions. Document and test the exact action used rather than treating the presence of the workflow editor as proof that every action executes.

External webhook actions cross a network boundary. Buzz contains SSRF, response-size, and bounded-evaluation controls for relevant paths, but operators still need destination policy, credentials, audit configuration, and failure handling.

See the [feature truth matrix](../product/feature-matrix.md) and [source evidence](../reference/evidence-index.md).
