import * as React from "react";

const PreviewStudioScreen = React.lazy(async () => {
  const module = await import(
    "@/features/preview-studio/ui/PreviewStudioScreen"
  );
  return { default: module.PreviewStudioScreen };
});

/**
 * Preview Studio on its own, with no community and no identity.
 *
 * Everything the studio does is local to the device — artifacts, revisions,
 * reviews and decisions never reach a relay — so it does not need the
 * onboarding a chat workspace requires. This lets the feature be opened and
 * used directly while the relay-backed version is still being built.
 *
 * Enabled by launching with `?studio=1`.
 */
export function isStandaloneStudioRequested(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(window.location.href).searchParams.get("studio") === "1";
  } catch {
    return false;
  }
}

export function StandaloneStudio() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Loading Preview Studio…
        </div>
      }
    >
      <div className="h-screen w-screen overflow-hidden bg-background">
        <PreviewStudioScreen />
      </div>
    </React.Suspense>
  );
}
