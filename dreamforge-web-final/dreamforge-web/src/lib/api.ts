import type {
  Dream,
  DreamStatus,
  PipelineStageStatus,
  SceneEdge,
  SceneGraph,
  SceneNode,
  Storyboard,
  StoryboardPanel,
} from "@/types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

// ---------------------------------------------------------------------------
// Auth token storage
// ---------------------------------------------------------------------------

const ACCESS_TOKEN_KEY = "dreamforge_access_token";
const REFRESH_TOKEN_KEY = "dreamforge_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Error type — matches the backend's RFC 7807 problem+json error shape
// ---------------------------------------------------------------------------

export interface ApiProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export class ApiError extends Error {
  status: number;
  problem: ApiProblemDetail | null;

  constructor(status: number, message: string, problem: ApiProblemDetail | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // attach Authorization header (default true)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      0,
      "Could not reach the DreamForge API. Is the backend running at " +
        `${API_BASE_URL}?`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    // Backend errors are either RFC7807 problem+json ({type, title, status, detail})
    // or FastAPI's default validation error shape ({detail: [...] | string}).
    const problem: ApiProblemDetail | null =
      data && typeof data === "object" && "title" in data
        ? (data as ApiProblemDetail)
        : null;

    const message =
      problem?.detail ??
      (data && typeof data === "object" && "detail" in (data as any)
        ? formatValidationDetail((data as any).detail)
        : `Request failed with status ${response.status}`);

    throw new ApiError(response.status, message, problem);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatValidationDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d === "object" && d && "msg" in d ? String((d as any).msg) : JSON.stringify(d)))
      .join("; ");
  }
  return JSON.stringify(detail);
}

// ---------------------------------------------------------------------------
// Wire types — mirror the live backend OpenAPI schema exactly (snake_case,
// nullable fields as `| null`). Kept separate from the domain types in
// "@/types" so UI components never need to know about the wire format.
// ---------------------------------------------------------------------------

export interface ApiDreamListItem {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  mood: string | null;
  status: DreamStatus;
}

export interface ApiDream extends ApiDreamListItem {
  user_id: string;
  raw_text: string;
  style: string | null;
}

export interface ApiSceneNode {
  id: string;
  type: SceneNode["type"];
  label: string;
  description?: string | null;
  x: number;
  y: number;
}

export interface ApiSceneEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ApiSceneGraph {
  id: string;
  created_at: string;
  updated_at: string;
  dream_id: string;
  version: number;
  graph_json: {
    nodes: ApiSceneNode[];
    edges: ApiSceneEdge[];
  };
}

export interface ApiStoryboardPanel {
  id: string;
  created_at: string;
  updated_at: string;
  storyboard_id: string;
  sequence_order: number;
  scene_description: string | null;
  camera_notes: string | null;
  prompt_text: string | null;
  status: StoryboardPanel["status"];
}

export interface ApiStoryboard {
  id: string;
  created_at: string;
  updated_at: string;
  dream_id: string;
  scene_graph_id: string | null;
  panels: ApiStoryboardPanel[];
}

export interface ApiMediaAsset {
  id: string;
  created_at: string;
  updated_at: string;
  dream_id: string;
  panel_id: string | null;
  type: "image" | "video";
  provider: string | null;
  storage_url: string;
  asset_metadata: Record<string, unknown>;
}

export interface ApiPipelineJob {
  id: string;
  created_at: string;
  updated_at: string;
  dream_id: string;
  stage: PipelineStageStatus["stage"];
  status: PipelineStageStatus["status"];
  progress: number;
  error_message: string | null;
}

export interface ApiTokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiUser {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Domain mappers — wire format -> the existing frontend types in "@/types".
// This is the seam that keeps every page/component unaware of the API shape.
// ---------------------------------------------------------------------------

export function toDream(api: ApiDream): Dream {
  return {
    id: api.id,
    title: api.title ?? "Untitled dream",
    rawText: api.raw_text,
    mood: api.mood ?? "",
    status: api.status,
    createdAt: api.created_at,
  };
}

export function toDreamFromListItem(api: ApiDreamListItem): Dream {
  return {
    id: api.id,
    title: api.title ?? "Untitled dream",
    rawText: "", // not returned by the list endpoint
    mood: api.mood ?? "",
    status: api.status,
    createdAt: api.created_at,
  };
}

export function toSceneGraph(api: any): SceneGraph {
  // Support both:
  // 1. { id, dream_id, graph_json: { nodes, edges } }
  // 2. { nodes, edges }

  const graph = api.graph_json ?? api;

  const nodes: SceneNode[] = (graph.nodes ?? []).map((n: any) => ({
    id: n.id,
    type: n.type,
    label: n.label,
    description: n.description ?? undefined,
    x: n.x,
    y: n.y,
  }));

  const edges: SceneEdge[] = (graph.edges ?? []).map((e: any) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
  }));

  return {
    id: api.id ?? "temp",
    dreamId: api.dream_id ?? "",
    nodes,
    edges,
  };
}

export function toStoryboard(api: ApiStoryboard, mediaAssets: ApiMediaAsset[] = []): Storyboard {
  // Most recently created image per panel wins (a regenerated image should
  // replace the one shown, without needing to refetch the panel itself).
  const latestImageByPanel = new Map<string, ApiMediaAsset>();
  for (const asset of mediaAssets) {
    if (asset.type !== "image" || !asset.panel_id) continue;
    const existing = latestImageByPanel.get(asset.panel_id);
    if (!existing || asset.created_at > existing.created_at) {
      latestImageByPanel.set(asset.panel_id, asset);
    }
  }

  const panels: StoryboardPanel[] = api.panels
    .slice()
    .sort((a, b) => a.sequence_order - b.sequence_order)
    .map((p) => ({
      id: p.id,
      sequenceOrder: p.sequence_order,
      sceneDescription: p.scene_description ?? "",
      cameraNotes: p.camera_notes ?? "",
      promptText: p.prompt_text ?? "",
      imageUrl: latestImageByPanel.get(p.id)?.storage_url,
      status: p.status,
    }));

  return { id: api.id, dreamId: api.dream_id, panels };
}

export function toPipelineStageStatus(jobs: ApiPipelineJob[]): PipelineStageStatus[] {
  return jobs.map((j) => ({ stage: j.stage, status: j.status, progress: j.progress }));
}

export function latestVideoAsset(mediaAssets: ApiMediaAsset[]): ApiMediaAsset | undefined {
  return mediaAssets
    .filter((a) => a.type === "video")
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))[0];
}

// ---------------------------------------------------------------------------
// Endpoint functions
// ---------------------------------------------------------------------------

export const api = {
  auth: {
    signup: (input: { email: string; password: string; display_name?: string }) =>
      request<ApiUser>("/auth/signup", { method: "POST", body: input, auth: false }),

    login: (input: { email: string; password: string }) =>
      request<ApiTokenPair>("/auth/login", { method: "POST", body: input, auth: false }),

    refresh: (refreshToken: string) =>
      request<ApiTokenPair>("/auth/refresh", {
        method: "POST",
        body: { refresh_token: refreshToken },
        auth: false,
      }),
  },

  dreams: {
    list: () => request<ApiDreamListItem[]>("/dreams"),

    get: (dreamId: string) => request<ApiDream>(`/dreams/${dreamId}`),

    create: (input: { raw_text: string; mood?: string; style?: string }) =>
      request<ApiDream>("/dreams", { method: "POST", body: input }),

    media: (dreamId: string) => request<ApiMediaAsset[]>(`/dreams/${dreamId}/media`),

    renderVideo: (dreamId: string, input: { include_narration?: boolean } = {}) =>
      request<ApiMediaAsset>(`/dreams/${dreamId}/render-video`, {
        method: "POST",
        body: { include_narration: input.include_narration ?? false },
      }),
  },

  sceneGraph: {
    get: (dreamId: string) => request<ApiSceneGraph>(`/dreams/${dreamId}/scene-graph`),

    update: (sceneGraphId: string, graphJson: { nodes: ApiSceneNode[]; edges: ApiSceneEdge[] }) =>
      request<ApiSceneGraph>(`/scene-graphs/${sceneGraphId}`, {
        method: "PATCH",
        body: { graph_json: graphJson },
      }),
  },

  storyboard: {
    get: (dreamId: string) => request<ApiStoryboard>(`/dreams/${dreamId}/storyboard`),

    updatePanel: (
      panelId: string,
      input: { scene_description?: string; camera_notes?: string; prompt_text?: string },
    ) => request<void>(`/storyboard-panels/${panelId}`, { method: "PATCH", body: input }),

    regenerateImage: (panelId: string, promptOverride?: string) =>
      request<ApiMediaAsset>(`/storyboard-panels/${panelId}/regenerate-image`, {
        method: "POST",
        body: { prompt_override: promptOverride ?? null },
      }),
  },

  pipeline: {
    listJobs: (dreamId: string) => request<ApiPipelineJob[]>(`/pipeline/${dreamId}/jobs`),

    run: (dreamId: string) =>
      request<{ status: string }>(`/pipeline/${dreamId}/run`, { method: "POST" }),
  },
};
