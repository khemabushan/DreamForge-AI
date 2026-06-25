"use client";

import { useState } from "react";
import { RefreshCw, ImageIcon, Loader2, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StoryboardPanel } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_ICON = {
  pending: Clock,
  generating: Loader2,
  ready: ImageIcon,
  failed: ImageIcon,
};

interface StoryboardPanelCardProps {
  panel: StoryboardPanel;
  onRegenerate?: (panelId: string, promptOverride: string) => void;
  isRegenerating?: boolean;
}

export function StoryboardPanelCard({ panel, onRegenerate, isRegenerating }: StoryboardPanelCardProps) {
  const [prompt, setPrompt] = useState(panel.promptText);
  const StatusIcon = STATUS_ICON[panel.status];

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-drift-soft">
          Panel {panel.sequenceOrder}
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider",
            panel.status === "ready" && "text-emerald-300",
            panel.status === "generating" && "text-wake-soft",
            panel.status === "pending" && "text-mist-faint",
            panel.status === "failed" && "text-red-300"
          )}
        >
          <StatusIcon size={12} className={panel.status === "generating" ? "animate-spin" : ""} />
          {panel.status}
        </span>
      </div>

      <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-ink-100">
        {panel.status === "ready" && panel.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={panel.imageUrl}
            alt={panel.sceneDescription || `Panel ${panel.sequenceOrder}`}
            className="h-full w-full object-cover"
          />
        ) : panel.status === "ready" ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-drift/20 to-wake/10 font-mono text-xs text-mist-faint">
            rendered_frame.png
          </div>
        ) : panel.status === "generating" || isRegenerating ? (
          <Loader2 size={20} className="animate-spin text-drift-soft" />
        ) : (
          <ImageIcon size={20} className="text-mist-faint" />
        )}
      </div>

      <p className="mt-4 font-body text-sm text-mist">{panel.sceneDescription}</p>
      <p className="mt-1 font-mono text-[11px] text-mist-faint">{panel.cameraNotes}</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        className="mt-3 w-full resize-none rounded-lg border border-glass-border bg-white/[0.02] px-3 py-2 font-mono text-xs text-mist-muted focus:outline-none"
      />

      <Button
        variant="ghost"
        className="mt-3 w-full !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isRegenerating}
        onClick={() => onRegenerate?.(panel.id, prompt)}
      >
        <RefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />
        {isRegenerating ? "Regenerating…" : "Regenerate image"}
      </Button>
    </Card>
  );
}
