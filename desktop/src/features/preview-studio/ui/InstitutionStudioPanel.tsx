import { Bot, Check, ChevronRight, ShieldCheck, X } from "lucide-react";
import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { isTauri } from "@tauri-apps/api/core";

import { INSTITUTION_PACKS, institutionPack } from "../lib/institutionPacks";
import {
  provisionInstitutionPack,
  type InstitutionProvisionResult,
} from "../lib/institutionProvisioning";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

type InstitutionStudioPanelProps = { onClose: () => void };

export function InstitutionStudioPanel({
  onClose,
}: InstitutionStudioPanelProps) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = React.useState("remittance-corridor");
  const [creating, setCreating] = React.useState(false);
  const [result, setResult] = React.useState<InstitutionProvisionResult | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const pack = institutionPack(selectedId);
  const canProvision = isTauri();

  async function createPack() {
    if (!canProvision) {
      setError("Open Preview Studio in the Buzz desktop app to create teams.");
      return;
    }
    setCreating(true);
    setError(null);
    setResult(null);
    try {
      setResult(await provisionInstitutionPack(selectedId));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not create the team template",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <aside
      className="flex w-[26rem] shrink-0 flex-col border-l border-border/50 bg-background/70 backdrop-blur-xl"
      data-testid="institution-studio-panel"
    >
      <div className="flex items-start gap-3 border-b border-border/50 px-4 py-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Institution Studio</h2>
          <p className="mt-0.5 text-2xs leading-relaxed text-muted-foreground">
            Create a specialist team template, then deploy it through Buzz’s
            existing Agents flow.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
          aria-label="Close Institution Studio"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="space-y-2">
          <p className="text-3xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Product pack
          </p>
          <div className="grid grid-cols-2 gap-2">
            {INSTITUTION_PACKS.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => {
                  setSelectedId(candidate.id);
                  setResult(null);
                  setError(null);
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-2xs transition-colors",
                  candidate.id === selectedId
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/50 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {candidate.name}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-background/45 p-3">
          <h3 className="text-sm font-semibold">{pack.name}</h3>
          <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
            {pack.summary}
          </p>
          <p className="mt-2 rounded-lg bg-muted/40 px-2.5 py-2 text-2xs leading-relaxed text-foreground">
            {pack.example}
          </p>
          <ul className="mt-3 space-y-1.5">
            {pack.roles.map((role) => (
              <li key={role.id} className="flex items-center gap-2 text-2xs">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>{role.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex gap-2 rounded-xl border border-border/50 bg-background/45 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-2xs leading-relaxed text-muted-foreground">
            The specialists leave runtime, model, and provider unset so Buzz
            applies the builder’s defaults when they are deployed. No credential
            is copied. This step creates no live agent, channel membership,
            deployment, financial transaction, or production asset.
          </p>
        </section>

        {error ? (
          <p
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-2xs text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {result ? (
          <div
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3"
            data-testid="institution-studio-result"
          >
            <p className="text-xs font-semibold text-emerald-500">
              Team template ready
            </p>
            <p className="mt-1 text-2xs text-muted-foreground">
              {result.team.name} · {result.createdPersonaCount} specialists
              created · {result.reusedPersonaCount} reused
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-3 w-full gap-1.5"
              onClick={() => void navigate({ to: "/agents" })}
            >
              Open Agents and deploy <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null}
        {!canProvision ? (
          <p
            className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-2xs text-muted-foreground"
            data-testid="institution-studio-desktop-required"
          >
            Team creation uses Buzz’s protected local agent store. Open this
            project in the Buzz desktop app to create or refresh the template.
          </p>
        ) : null}
      </div>

      <div className="border-t border-border/50 p-4">
        <Button
          type="button"
          className="w-full"
          disabled={creating || !canProvision}
          onClick={() => void createPack()}
          data-testid="institution-studio-create-team"
        >
          {creating
            ? "Creating team…"
            : result
              ? "Refresh team template"
              : "Create team template"}
        </Button>
      </div>
    </aside>
  );
}
