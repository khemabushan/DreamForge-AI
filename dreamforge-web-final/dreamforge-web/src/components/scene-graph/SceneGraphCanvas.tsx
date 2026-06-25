"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

import { User, MapPin, Box, Heart } from "lucide-react";
import { SceneGraph, SceneNodeType } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  SceneNodeType,
  {
    icon: typeof User;
    color: string;
    ring: string;
  }
> = {
  character: {
    icon: User,
    color: "text-drift-soft",
    ring: "border-drift/40",
  },
  location: {
    icon: MapPin,
    color: "text-emerald-300",
    ring: "border-emerald-400/40",
  },
  object: {
    icon: Box,
    color: "text-wake-soft",
    ring: "border-wake/40",
  },
  emotion: {
    icon: Heart,
    color: "text-rose-300",
    ring: "border-rose-400/40",
  },
};

function SceneNodeComponent({
  data,
}: NodeProps<{ label: string; type: SceneNodeType }>) {
  const meta = TYPE_META[data.type];

  return (
    <div
      className={cn(
        "glass-strong flex items-center gap-2.5 rounded-xl border px-4 py-2.5 shadow-glass",
        meta.ring
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-drift/60"
      />

      <meta.icon
        size={14}
        className={meta.color}
        strokeWidth={1.5}
      />

      <div>
        <div className="font-body text-sm text-mist">
          {data.label}
        </div>

        <div className="font-mono text-[10px] uppercase tracking-wider text-mist-faint">
          {data.type}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-drift/60"
      />
    </div>
  );
}

const nodeTypes = {
  sceneNode: SceneNodeComponent,
};

export function SceneGraphCanvas({
  graph,
}: {
  graph: SceneGraph;
}) {
  const nodes: Node[] = useMemo(
    () =>
      (graph?.nodes ?? []).map((n) => ({
        id: n.id,
        type: "sceneNode",
        position: {
          x: n.x,
          y: n.y,
        },
        data: {
          label: n.label,
          type: n.type,
        },
      })),
    [graph]
  );

  const edges: Edge[] = useMemo(
    () =>
      (graph?.edges ?? []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        labelStyle: {
          fill: "#9494AB",
          fontSize: 11,
          fontFamily: "var(--font-jbmono)",
        },
        labelBgStyle: {
          fill: "#0B0B14",
          fillOpacity: 0.8,
        },
        style: {
          stroke: "#7C8CFF",
          strokeOpacity: 0.4,
        },
        animated: true,
      })),
    [graph]
  );

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl2 border border-glass-border bg-ink-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#23232F" gap={24} />

        <Controls
          className="
            !border-glass-border
            !bg-ink-50
            [&>button]:!border-glass-border
            [&>button]:!bg-ink-100
            [&>button]:!fill-mist
          "
        />
      </ReactFlow>
    </div>
  );
}