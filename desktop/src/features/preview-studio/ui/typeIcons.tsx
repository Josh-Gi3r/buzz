import {
  Clapperboard,
  FileStack,
  FileText,
  Globe2,
  Image as ImageIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { ArtifactType } from "../lib/types";

const TYPE_ICONS: Partial<Record<ArtifactType, LucideIcon>> = {
  image: ImageIcon,
  video: Clapperboard,
  pdf: FileText,
  deck: FileStack,
  web_app: Globe2,
  website: Globe2,
};

export function artifactTypeIcon(type: ArtifactType): LucideIcon {
  return TYPE_ICONS[type] ?? Sparkles;
}
