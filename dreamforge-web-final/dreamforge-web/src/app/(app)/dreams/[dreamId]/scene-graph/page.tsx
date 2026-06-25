"use client";

import { useParams } from "next/navigation";
import { User, MapPin, Box, Heart, Loader2, RefreshCw, Network } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DreamTabs } from "@/components/shared/DreamTabs";
import { Button } from "@/components/ui/Button";
import { SceneGraphCanvas } from "@/components/scene-graph/SceneGraphCanvas";
import { useSceneGraph } from "@/hooks/useSceneGraph";

const LEGEND = [
  { type: "Character", icon: User, color: "text-drift-soft" },
  { type: "Location", icon: MapPin, color: "text-emerald-300" },
  { type: "Object", icon: Box, color: "text-wake-soft" },
  { type: "Emotion", icon: Heart, color: "text-rose-300" },
];

export default function SceneGraphPage() {
  const { dreamId } = useParams<{ dreamId: string }>();
  const {
    data: sceneGraph,
    isLoading,
    isError,
    error,
    refetch,
  } = useSceneGraph(dreamId);

  return (
    <>
      <Topbar
        title="Scene graph"
        subtitle="Drag nodes to rearrange. This structure feeds the storyboard."
      />
      <DreamTabs dreamId={dreamId} />

      <div className="px-6 py-8 md:px-10">
        <div className="mb-4 flex flex-wrap gap-4">
          {LEGEND.map((item) => (
            <div key={item.type} className="flex items-center gap-2 font-mono text-xs text-mist-muted">
              <item.icon size={13} className={item.color} strokeWidth={1.5} />
              {item.type}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="glass flex h-[560px] flex-col items-center justify-center gap-3 rounded-xl2">
            <Loader2 size={22} className="animate-spin text-drift-soft" />
            <p className="font-body text-sm text-mist-muted">Loading scene graph…</p>
          </div>
        ) : isError || !sceneGraph ? (
          <div className="glass flex h-[560px] flex-col items-center justify-center gap-3 rounded-xl2 px-6 text-center">
            <Network size={22} className="text-mist-faint" />
            <h3 className="font-display text-lg text-mist">Scene graph not ready yet</h3>
            <p className="max-w-sm font-body text-sm text-mist-muted">
              {error instanceof Error
                ? error.message
                : "This dream hasn't reached the scene graph stage yet, or it failed to load."}
            </p>
            <Button variant="ghost" onClick={() => refetch()} className="mt-2">
              <RefreshCw size={14} /> Try again
            </Button>
          </div>
        ) : (
          <SceneGraphCanvas graph={sceneGraph} />
        )}
      </div>
    </>
  );
}
