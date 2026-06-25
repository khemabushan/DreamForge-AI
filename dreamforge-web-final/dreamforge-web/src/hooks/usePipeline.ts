import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, toPipelineStageStatus } from "@/lib/api";
import type { PipelineStageStatus } from "@/types";

const POLL_INTERVAL_MS = 2000;

/**
 * Polls GET /pipeline/{dreamId}/jobs for live progress.
 *
 * The backend also exposes an SSE stream (`GET /dreams/{id}/events`), but the
 * browser's native EventSource API cannot send custom headers — it has no way
 * to attach the `Authorization: Bearer <token>` header that endpoint requires.
 * Polling avoids that mismatch entirely and is simpler to reason about; a
 * production iteration could instead accept a short-lived token as a query
 * param for the SSE endpoint, or consume it via a manual fetch+ReadableStream
 * reader (which does support headers).
 */
export function usePipeline(dreamId: string | undefined) {
  const query = useQuery<PipelineStageStatus[]>({
    queryKey: ["pipeline-jobs", dreamId],
    queryFn: async () => {
      const jobs = await api.pipeline.listJobs(dreamId as string);
      return toPipelineStageStatus(jobs);
    },
    enabled: Boolean(dreamId),
    refetchInterval: (query) => {
      const stages = query.state.data;
      if (!stages || stages.length === 0) return POLL_INTERVAL_MS;

      const isTerminal =
        stages.some((s) => s.status === "failed") ||
        stages.every((s) => s.status === "succeeded");

      return isTerminal ? false : POLL_INTERVAL_MS;
    },
  });

  return query;
}

export function useTriggerPipelineRun(dreamId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.pipeline.run(dreamId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-jobs", dreamId] });
      queryClient.invalidateQueries({ queryKey: ["dream", dreamId] });
    },
  });
}
