import { MonitorPlay } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  extractPreviewUrl,
  upsertAgentPreview,
} from "../lib/agentPreviewBridge";
import { useAppNavigation } from "@/app/navigation/useAppNavigation";
import { Button } from "@/shared/ui/button";

export default function AgentPreviewHandoff({
  author,
  authorPubkey,
  body,
  channelId,
  messageId,
}: {
  author: string;
  authorPubkey?: string;
  body: string;
  channelId?: string | null;
  messageId: string;
}) {
  const { goPreviewStudio } = useAppNavigation();
  const url = React.useMemo(() => extractPreviewUrl(body), [body]);

  if (!url) return null;

  const host = new URL(url).host;
  return (
    <div className="mt-2 flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 max-w-full gap-1.5"
        data-testid="agent-preview-open"
        onClick={() => {
          const result = upsertAgentPreview({
            messageId,
            url,
            author,
            authorPubkey,
            channelId,
          });
          if (!result.persisted) {
            toast.error("Couldn’t save this preview on device.");
            return;
          }
          void goPreviewStudio();
        }}
      >
        <MonitorPlay className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Open live preview · {host}</span>
      </Button>
    </div>
  );
}
