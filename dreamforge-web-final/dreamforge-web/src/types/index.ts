export type DreamStatus =
  | "pending"
  | "parsing"
  | "graphing"
  | "storyboarding"
  | "rendering_images"
  | "rendering_video"
  | "completed"
  | "failed";

export interface Dream {
  id: string;
  title: string;
  rawText: string;
  mood: string;
  status: DreamStatus;
  createdAt: string;
  coverImageUrl?: string;
}

export type SceneNodeType = "character" | "location" | "object" | "emotion";

export interface SceneNode {
  id: string;
  type: SceneNodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
}

export interface SceneEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface SceneGraph {
  id: string;
  dreamId: string;
  nodes: SceneNode[];
  edges: SceneEdge[];
}

export interface StoryboardPanel {
  id: string;
  sequenceOrder: number;
  sceneDescription: string;
  cameraNotes: string;
  promptText: string;
  imageUrl?: string;
  status: "pending" | "generating" | "ready" | "failed";
}

export interface Storyboard {
  id: string;
  dreamId: string;
  panels: StoryboardPanel[];
}

export interface PipelineStageStatus {
  stage:
    | "nlp_parser"
    | "scene_graph_builder"
    | "storyboard_generator"
    | "image_generator"
    | "video_generator";
  status: "queued" | "running" | "succeeded" | "failed";
  progress: number;
}
