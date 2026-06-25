"use client";

import { useState } from "react";
import { Play, Pause, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  provider?: string;
}

export function VideoPlayer({ videoUrl, title, provider }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-ink-100 via-drift/10 to-wake/10">
        {videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={videoUrl} controls className="h-full w-full object-cover" />
        ) : (
          <>
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause preview" : "Play preview"}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-glass-border bg-ink/60 text-mist backdrop-blur-md transition hover:scale-105"
            >
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 font-mono text-xs text-mist-muted">
              Not rendered yet
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-glass-border px-6 py-4">
        <div>
          <h3 className="font-display text-base text-mist">{title ?? "Final cut"}</h3>
          <p className="font-mono text-xs text-mist-faint">
            {provider ? `rendered via ${provider} provider` : "Render the video to see it here"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="!px-4 !py-2 text-xs" disabled={!videoUrl}>
            <Share2 size={13} /> Share
          </Button>
          {videoUrl ? (
            <a
              href={videoUrl}
              download
              className="btn-primary !px-4 !py-2 text-xs"
            >
              <Download size={13} /> Export
            </a>
          ) : (
            <Button className="!px-4 !py-2 text-xs" disabled>
              <Download size={13} /> Export
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
