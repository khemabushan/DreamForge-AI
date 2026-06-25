import { useQuery } from "@tanstack/react-query";

import { api, toDream } from "@/lib/api";
import type { Dream } from "@/types";

export function useDream(dreamId: string | undefined) {
  return useQuery<Dream>({
    queryKey: ["dream", dreamId],
    queryFn: async () => {
      const apiDream = await api.dreams.get(dreamId as string);
      return toDream(apiDream);
    },
    enabled: Boolean(dreamId),
  });
}
