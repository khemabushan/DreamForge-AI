"use client";

import { useParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DreamTabs } from "@/components/shared/DreamTabs";
import { PipelineProgress } from "@/components/shared/PipelineProgress";
import { useDream } from "@/hooks/useDream";
import { usePipeline } from "@/hooks/usePipeline";

export default function DreamOverviewPage() {
  const { dreamId } = useParams<{ dreamId: string }>();

  const {
    data: dream,
    isLoading: isDreamLoading,
    isError: isDreamError,
    error: dreamError,
    refetch: refetchDream,
  } = useDream(dreamId);

  const {
    data: stages,
    isLoading: isPipelineLoading,
    isError: isPipelineError,
  } = usePipeline(dreamId);

  if (isDreamLoading) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <Loader2 size={22} className="animate-spin text-drift-soft" />
        <p className="font-body text-sm text-mist-muted">Loading dream…</p>
      </div>
    );
  }

  if (isDreamError || !dream) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <h3 className="font-display text-xl text-mist">Couldn&apos;t load this dream</h3>
        <p className="max-w-sm font-body text-sm text-mist-muted">
          {dreamError instanceof Error ? dreamError.message : "Something went wrong talking to the API."}
        </p>
        <Button variant="ghost" onClick={() => refetchDream()} className="mt-2">
          <RefreshCw size={14} /> Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <Topbar
        title={dream.title}
        subtitle="Submitted dream and its pipeline status."
        action={<StatusBadge status={dream.status} />}
      />
      <DreamTabs dreamId={dream.id} />

      <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
        <Card>
          <span className="eyebrow">Original text</span>
          <p className="mt-3 font-display text-lg italic leading-relaxed text-mist">
            &ldquo;{dream.rawText}&rdquo;
          </p>
          <div className="mt-5 flex gap-2 font-mono text-xs text-mist-faint">
            <span className="rounded-full bg-white/5 px-3 py-1">mood: {dream.mood}</span>
          </div>
        </Card>

        <div className="mt-6">
          {isPipelineLoading ? (
            <div className="glass flex items-center justify-center gap-3 rounded-xl2 p-6">
              <Loader2 size={16} className="animate-spin text-drift-soft" />
              <span className="font-body text-sm text-mist-muted">Loading pipeline status…</span>
            </div>
          ) : isPipelineError || !stages ? (
            <div className="glass rounded-xl2 p-6 text-center font-body text-sm text-mist-muted">
              Couldn&apos;t load pipeline status.
            </div>
          ) : (
            <PipelineProgress stages={stages} />
          )}
        </div>
      </div>
    </>
  );
}
