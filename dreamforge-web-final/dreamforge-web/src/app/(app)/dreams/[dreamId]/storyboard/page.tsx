"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Clapperboard, Loader2, RefreshCw, LayoutGrid } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { DreamTabs } from "@/components/shared/DreamTabs";
import { StoryboardPanelCard } from "@/components/storyboard/StoryboardPanelCard";
import { useStoryboard, useRegeneratePanelImage } from "@/hooks/useStoryboard";

export default function StoryboardPage() {
  const { dreamId } = useParams<{ dreamId: string }>();
  const { data: storyboard, isLoading, isError, error, refetch } = useStoryboard(dreamId);
  const regenerateImage = useRegeneratePanelImage(dreamId);

  const readyCount = storyboard?.panels.filter((p) => p.status === "ready").length ?? 0;
  const totalCount = storyboard?.panels.length ?? 0;

  return (
    <>
      <Topbar
        title="Storyboard"
        subtitle={
          isLoading
            ? "Loading panels…"
            : storyboard
              ? `${readyCount} of ${totalCount} panels rendered`
              : "Storyboard not available yet"
        }
        action={
          <Link href={`/dreams/${dreamId}/video`}>
            <Button className="!px-5 !py-2.5 text-sm">
              <Clapperboard size={15} /> Render video
            </Button>
          </Link>
        }
      />
      <DreamTabs dreamId={dreamId} />

      <div className="px-6 py-8 md:px-10">
        {isLoading ? (
          <div className="glass flex flex-col items-center gap-3 rounded-xl2 px-6 py-20 text-center">
            <Loader2 size={22} className="animate-spin text-drift-soft" />
            <p className="font-body text-sm text-mist-muted">Loading storyboard…</p>
          </div>
        ) : isError || !storyboard ? (
          <div className="glass flex flex-col items-center gap-3 rounded-xl2 px-6 py-20 text-center">
            <LayoutGrid size={22} className="text-mist-faint" />
            <h3 className="font-display text-lg text-mist">Storyboard not ready yet</h3>
            <p className="max-w-sm font-body text-sm text-mist-muted">
              {error instanceof Error
                ? error.message
                : "This dream hasn't reached the storyboard stage yet, or it failed to load."}
            </p>
            <Button variant="ghost" onClick={() => refetch()} className="mt-2">
              <RefreshCw size={14} /> Try again
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {storyboard.panels.map((panel) => (
              <StoryboardPanelCard
                key={panel.id}
                panel={panel}
                isRegenerating={
                  regenerateImage.isPending && regenerateImage.variables?.panelId === panel.id
                }
                onRegenerate={(panelId, promptOverride) =>
                  regenerateImage.mutate({ panelId, promptOverride })
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
