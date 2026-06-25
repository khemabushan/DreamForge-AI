import { cn } from "@/lib/utils";
import { DreamStatus } from "@/types";

const STATUS_LABEL: Record<DreamStatus, string> = {
  pending: "Queued",
  parsing: "Reading dream",
  graphing: "Mapping scene",
  storyboarding: "Storyboarding",
  rendering_images: "Rendering images",
  rendering_video: "Rendering video",
  completed: "Complete",
  failed: "Failed",
};

const STATUS_COLOR: Record<DreamStatus, string> = {
  pending: "bg-mist/10 text-mist-muted",
  parsing: "bg-drift/15 text-drift-soft",
  graphing: "bg-drift/15 text-drift-soft",
  storyboarding: "bg-drift/15 text-drift-soft",
  rendering_images: "bg-wake/15 text-wake-soft",
  rendering_video: "bg-wake/15 text-wake-soft",
  completed: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-red-500/15 text-red-300",
};

export function StatusBadge({ status }: { status: DreamStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider",
        STATUS_COLOR[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
