import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, toDreamFromListItem } from "@/lib/api";
import type { Dream } from "@/types";

export function useDreams() {
  return useQuery<Dream[]>({
    queryKey: ["dreams"],
    queryFn: async () => {
      const items = await api.dreams.list();
      return items.map(toDreamFromListItem);
    },
  });
}

interface CreateDreamInput {
  rawText: string;
  mood?: string;
  style?: string;
}

export function useCreateDream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDreamInput) =>
      api.dreams.create({
        raw_text: input.rawText,
        mood: input.mood,
        style: input.style,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
    },
  });
}
