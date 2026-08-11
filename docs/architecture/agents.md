# Agent architecture

```text
Channel or DM instruction
        | signed event
        v
     buzz-relay
        | authorized subscription
        v
      buzz-acp ---- session / cancel / steer ---- ACP agent process
        |                                         |
        |                                         +-- model provider
        |                                         +-- MCP tools
        |                                         +-- buzz CLI
        v
presence, observer activity, signed agent output
```

Desktop owns agent definitions, personas, teams, runtime discovery, access settings, and deployment choices. `buzz-acp` owns relay-facing trigger gates, context, deduplication, session lifecycle, output, and recovery. The ACP-compatible process owns model/tool execution.

Local, remote-provider, and relay-mesh execution are different lifecycles. Each needs its own configuration and health evidence. Owner attestation, allowlists, recipients, and stricter DM rules prevent a broad channel setting from automatically becoming private instruction access.

The CLI is the product-facing tool surface for stable Buzz operations. `buzz-dev-mcp` is a separate development file/shell tool and should not be described as if every Buzz agent receives it.

Preview Studio does not control agents. It recognizes a URL already posted by an agent and opens that reachable site locally. Studio comments and decisions do not flow back through ACP or the relay.
