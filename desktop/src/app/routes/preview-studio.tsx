import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { usePreviewFeatureWarning } from "@/shared/features";
import { ViewLoadingFallback } from "@/shared/ui/ViewLoadingFallback";

const PreviewStudioScreen = React.lazy(async () => {
  const module = await import(
    "@/features/preview-studio/ui/PreviewStudioScreen"
  );
  return { default: module.PreviewStudioScreen };
});

export const Route = createFileRoute("/preview-studio")({
  component: PreviewStudioRouteComponent,
});

function PreviewStudioRouteComponent() {
  usePreviewFeatureWarning("preview-studio");
  return (
    <React.Suspense
      fallback={<ViewLoadingFallback includeHeader kind="preview-studio" />}
    >
      <PreviewStudioScreen />
    </React.Suspense>
  );
}
