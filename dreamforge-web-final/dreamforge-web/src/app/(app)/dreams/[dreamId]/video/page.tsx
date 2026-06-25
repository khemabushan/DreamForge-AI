"use client";

import { useParams } from "next/navigation";
import { Loader2, RefreshCw, Clapperboard } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { DreamTabs } from "@/components/shared/DreamTabs";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { useDream } from "@/hooks/useDream";
import { useStoryboard, useDreamMedia, useRenderVideo } from "@/hooks/useStoryboard";
import { latestVideoAsset } from "@/lib/api";

export default function VideoPage() {
  const { dreamId } = useParams<{ dreamId: string }>();
  const { data: dream } = useDream(dreamId);

  const {
    data: storyboard,
    isLoading: isStoryboardLoading,
    isError: isStoryboardError,
    error: storyboardError,
    refetch: refetchStoryboard,
  } = useStoryboard(dreamId);

  const { data: mediaAssets, isLoading: isMediaLoading } = useDreamMedia(dreamId);
  const renderVideo = useRenderVideo(dreamId);

  const videoAsset = mediaAssets ? latestVideoAsset(mediaAssets) : undefined;
  const isLoading = isStoryboardLoading || isMediaLoading;

  return (
    <>
      <Topbar
        title="Final video"
        subtitle="Assembled from the rendered storyboard panels."
        action={
          <Button
            className="!px-5 !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => renderVideo.mutate()}
            disabled={renderVideo.isPending || !storyboard}
          >
            <Clapperboard size={15} className={renderVideo.isPending ? "animate-spin" : ""} />
            {renderVideo.isPending ? "Rendering…" : videoAsset ? "Re-render video" : "Render video"}
          </Button>
        }
      />
      <DreamTabs dreamId={dreamId} />

      <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
        {isLoading ? (
          <div className="glass flex flex-col items-center gap-3 rounded-xl2 px-6 py-20 text-center">
            <Loader2 size={22} className="animate-spin text-drift-soft" />
            <p className="font-body text-sm text-mist-muted">Loading…</p>
          </div>
        ) : isStoryboardError || !storyboard ? (
          <div className="glass flex flex-col items-center gap-3 rounded-xl2 px-6 py-20 text-center">
            <h3 className="font-display text-lg text-mist">Storyboard not ready yet</h3>
            <p className="max-w-sm font-body text-sm text-mist-muted">
              {storyboardError instanceof Error
                ? storyboardError.message
                : "A video can't be assembled until the storyboard exists."}
            </p>
            <Button variant="ghost" onClick={() => refetchStoryboard()} className="mt-2">
              <RefreshCw size={14} /> Try again
            </Button>
          </div>
        ) : (
          <>
            <VideoPlayer
              videoUrl={videoAsset?.storage_url}
              title={dream ? `${dream.title} — final cut` : undefined}
              provider={videoAsset?.provider ?? undefined}
            />

            <div className="mt-6 grid grid-cols-4 gap-3">
              {storyboard.panels.map((panel) =>
                panel.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={panel.id}
                    src={panel.imageUrl}
                    alt={`Panel ${panel.sequenceOrder}`}
                    className="aspect-video rounded-lg object-cover"
                  />
                ) : (
                  <div
                    key={panel.id}
                    className="glass flex aspect-video items-center justify-center rounded-lg font-mono text-[10px] text-mist-faint"
                  >
                    panel {panel.sequenceOrder}
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
