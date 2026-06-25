import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, toStoryboard } from "@/lib/api";
import type { ApiMediaAsset } from "@/lib/api";
import type { Storyboard } from "@/types";

export function useStoryboard(dreamId: string | undefined) {
  return useQuery<Storyboard>({
    queryKey: ["storyboard", dreamId],
    queryFn: async () => {
      const [apiStoryboard, mediaAssets] = await Promise.all([
        api.storyboard.get(dreamId as string),
        api.dreams.media(dreamId as string),
      ]);
      return toStoryboard(apiStoryboard, mediaAssets);
    },
    enabled: Boolean(dreamId),
    retry: 2,
  });
}

/** Raw media assets for a dream (panel images + final video). Used directly
 * by the video page, which needs the video asset rather than the panel-shaped
 * Storyboard type. */
export function useDreamMedia(dreamId: string | undefined) {
  return useQuery<ApiMediaAsset[]>({
    queryKey: ["dream-media", dreamId],
    queryFn: () => api.dreams.media(dreamId as string),
    enabled: Boolean(dreamId),
  });
}

export function useUpdateStoryboardPanel(dreamId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      panelId,
      sceneDescription,
      cameraNotes,
      promptText,
    }: {
      panelId: string;
      sceneDescription?: string;
      cameraNotes?: string;
      promptText?: string;
    }) =>
      api.storyboard.updatePanel(panelId, {
        scene_description: sceneDescription,
        camera_notes: cameraNotes,
        prompt_text: promptText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storyboard", dreamId] });
    },
  });
}

export function useRegeneratePanelImage(dreamId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ panelId, promptOverride }: { panelId: string; promptOverride?: string }) =>
      api.storyboard.regenerateImage(panelId, promptOverride),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storyboard", dreamId] });
      queryClient.invalidateQueries({ queryKey: ["dream-media", dreamId] });
    },
  });
}

export function useRenderVideo(dreamId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.dreams.renderVideo(dreamId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream-media", dreamId] });
    },
  });
}
