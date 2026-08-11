# Working with agents

Buzz agents are signed participants in the workspace. The ACP harness listens for authorized instructions, assembles permitted context, manages sessions, and publishes agent presence, observer activity, and output. An ACP-compatible runtime performs the model and tool work.

## Configure access and execution

Open **Agents** to manage definitions and running instances. Available providers, models, effort controls, and deployment targets come from runtime discovery; a visible option does not prove its external backend is installed.

A configuration can include a persona, identity, ACP runtime or command, provider/model options, instruction policy, and local or optional remote execution. Treat the instruction policy as a security boundary: a person who can instruct an agent may indirectly reach files, credentials, and tools available to that runtime.

## Direct an agent in context

1. Work in the channel or DM containing the relevant project context.
2. State the intended outcome, repository or artifact, and files or systems that must remain untouched.
3. Ask for validation and remaining uncertainty.
4. If you want a live site preview, ask for the complete reachable HTTP(S) URL.
5. Keep approvals for destructive or external actions visible to accountable humans.

The `buzz` CLI provides stable machine-readable collaboration operations. The developer MCP server is a separate tool surface and should not be confused with the product CLI.

## Open a live build

When a recognized agent posts a safe HTTP(S) URL, **Open live preview** creates or updates a device-local website artifact and opens BUZZ — LIVE PREVIEW STUDIO. The website must already be running and reachable from the computer running Buzz. Buzz does not discover, host, or keep the server alive.

URL changes create local revision records. The page content behind a URL remains mutable and is not snapshotted. Reload the frame when the site does not provide its own hot-module reload.

## Review and respond

BUZZ — LIVE PREVIEW STUDIO can hold local comments and decisions. Current production ingress supports live URLs plus imported images, videos, and local PDFs. Static website, deck, and film editing are fixture-demonstrated engines without general production creation/import flows.

Reviews do not synchronize or post back to the agent. Place actionable feedback in the Buzz conversation as well.

See [Agent architecture](../architecture/agents.md), [BUZZ — LIVE PREVIEW STUDIO](../product/preview-studio.md), and the [CLI reference](../reference/cli.md).
