"use client";

import { motion } from "framer-motion";
import { FileText, Network, LayoutGrid, ImageIcon, Clapperboard, Loader2, Check, Clock } from "lucide-react";
import { PipelineStageStatus } from "@/types";
import { cn } from "@/lib/utils";

const STAGE_META = {
  nlp_parser: { label: "Reading dream", icon: FileText },
  scene_graph_builder: { label: "Mapping scene graph", icon: Network },
  storyboard_generator: { label: "Drafting storyboard", icon: LayoutGrid },
  image_generator: { label: "Rendering images", icon: ImageIcon },
  video_generator: { label: "Assembling video", icon: Clapperboard },
} as const;

export function PipelineProgress({ stages }: { stages: PipelineStageStatus[] }) {
  return (
    <div className="glass rounded-xl2 p-6">
      <h3 className="font-display text-base text-mist">Generation pipeline</h3>
      <div className="mt-5 flex flex-col gap-1">
        {stages.map((stage, i) => {
          const meta = STAGE_META[stage.stage];
          return (
            <div key={stage.stage} className="flex items-center gap-4 py-2.5">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  stage.status === "succeeded" && "bg-emerald-500/15 text-emerald-300",
                  stage.status === "running" && "bg-drift/15 text-drift-soft",
                  stage.status === "queued" && "bg-white/5 text-mist-faint",
                  stage.status === "failed" && "bg-red-500/15 text-red-300"
                )}
              >
                {stage.status === "succeeded" && <Check size={14} />}
                {stage.status === "running" && <Loader2 size={14} className="animate-spin" />}
                {stage.status === "queued" && <Clock size={14} />}
                {stage.status === "failed" && <meta.icon size={14} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-mist">{meta.label}</span>
                  <span className="font-mono text-xs text-mist-faint">{stage.progress}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      stage.status === "failed" ? "bg-red-400" : "bg-drift"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.progress}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
