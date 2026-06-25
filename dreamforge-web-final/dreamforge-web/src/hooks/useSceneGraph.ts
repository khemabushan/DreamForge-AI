import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, toSceneGraph } from "@/lib/api";
import type { SceneEdge, SceneGraph, SceneNode } from "@/types";

export function useSceneGraph(dreamId: string | undefined) {
  return useQuery<SceneGraph>({
    queryKey: ["scene-graph", dreamId],
    queryFn: async () => {
      const apiGraph = await api.sceneGraph.get(dreamId as string);
      return toSceneGraph(apiGraph);
    },
    enabled: Boolean(dreamId),
    // The scene graph isn't generated until the pipeline reaches that stage —
    // retry a couple of times in case the page loads slightly before it exists.
    retry: 2,
  });
}

export function useUpdateSceneGraph(dreamId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sceneGraphId,
      nodes,
      edges,
    }: {
      sceneGraphId: string;
      nodes: SceneNode[];
      edges: SceneEdge[];
    }) =>
      api.sceneGraph.update(sceneGraphId, {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          label: n.label,
          description: n.description ?? null,
          x: n.x,
          y: n.y,
        })),
        edges,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scene-graph", dreamId] });
    },
  });
}
