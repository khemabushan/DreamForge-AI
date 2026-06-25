import {
  Dream,
  SceneGraph,
  Storyboard,
  PipelineStageStatus,
} from "@/types";

export const mockDreams: Dream[] = [
  {
    id: "d1",
    title: "The Glass Lighthouse",
    rawText:
      "I was standing on a beach made of dark sand, and a lighthouse made entirely of glass kept changing color. My sister was there but she couldn't speak, only point at the sea.",
    mood: "uneasy",
    status: "completed",
    createdAt: "2026-06-20T19:12:00Z",
  },
  {
    id: "d2",
    title: "Falling Through the Library",
    rawText:
      "Every book on the shelf had my name on the spine. The floor gave way and I fell slowly, like through water, past floors of the same library.",
    mood: "vertiginous",
    status: "rendering_video",
    createdAt: "2026-06-22T08:40:00Z",
  },
  {
    id: "d3",
    title: "The Train That Breathed",
    rawText:
      "An old train pulled into a station that didn't exist anymore. It was breathing, like an animal. I knew I had to get on before it closed its doors.",
    mood: "tense",
    status: "storyboarding",
    createdAt: "2026-06-23T22:05:00Z",
  },
];

export const mockSceneGraph: SceneGraph = {
  id: "sg1",
  dreamId: "d1",
  nodes: [
    { id: "n1", type: "character", label: "Dreamer", x: 80, y: 220 },
    { id: "n2", type: "character", label: "Sister", x: 320, y: 100 },
    { id: "n3", type: "location", label: "Dark Sand Beach", x: 80, y: 60 },
    { id: "n4", type: "object", label: "Glass Lighthouse", x: 380, y: 280 },
    { id: "n5", type: "emotion", label: "Unease", x: 560, y: 140 },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n3", label: "stands on" },
    { id: "e2", source: "n2", target: "n1", label: "stands beside" },
    { id: "e3", source: "n2", target: "n4", label: "points at" },
    { id: "e4", source: "n4", target: "n5", label: "evokes" },
    { id: "e5", source: "n3", target: "n4", label: "overlooks" },
  ],
};

export const mockStoryboard: Storyboard = {
  id: "sb1",
  dreamId: "d1",
  panels: [
    {
      id: "p1",
      sequenceOrder: 1,
      sceneDescription: "Wide shot: dreamer alone on dark sand, lighthouse glowing faint blue in the distance.",
      cameraNotes: "Low angle, slow push-in",
      promptText: "cinematic wide shot, dark sand beach at dusk, distant glass lighthouse glowing pale blue, moody atmosphere",
      status: "ready",
    },
    {
      id: "p2",
      sequenceOrder: 2,
      sceneDescription: "Sister appears beside the dreamer, silent, pointing toward the sea.",
      cameraNotes: "Medium shot, static",
      promptText: "medium shot, woman silently pointing toward dark ocean, beach at night, cinematic lighting",
      status: "ready",
    },
    {
      id: "p3",
      sequenceOrder: 3,
      sceneDescription: "The lighthouse shifts color from blue to amber, glass panels rippling like water.",
      cameraNotes: "Close-up on lighthouse, slow zoom",
      promptText: "close-up glass lighthouse structure changing color, rippling glass texture, surreal lighting, dreamlike",
      status: "generating",
    },
    {
      id: "p4",
      sequenceOrder: 4,
      sceneDescription: "The sea begins to glow where the sister is pointing.",
      cameraNotes: "Wide, top-down drift",
      promptText: "wide aerial drift over glowing ocean water at night, bioluminescent surreal sea, cinematic",
      status: "pending",
    },
  ],
};

export const mockPipelineStatus: PipelineStageStatus[] = [
  { stage: "nlp_parser", status: "succeeded", progress: 100 },
  { stage: "scene_graph_builder", status: "succeeded", progress: 100 },
  { stage: "storyboard_generator", status: "running", progress: 64 },
  { stage: "image_generator", status: "queued", progress: 0 },
  { stage: "video_generator", status: "queued", progress: 0 },
];
