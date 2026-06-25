from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import TimestampedSchema


class SceneNodeType(str, Enum):
    CHARACTER = "character"
    LOCATION = "location"
    OBJECT = "object"
    EMOTION = "emotion"


class SceneNode(BaseModel):
    id: str
    type: SceneNodeType
    label: str
    description: str | None = None
    x: float = 0
    y: float = 0


class SceneEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str


class SceneGraphData(BaseModel):
    nodes: list[SceneNode]
    edges: list[SceneEdge]


class SceneGraphRead(TimestampedSchema):
    dream_id: UUID
    version: int
    graph_json: SceneGraphData


class SceneGraphUpdate(BaseModel):
    """Manual edits to a scene graph (e.g. dragging nodes, renaming labels)."""

    graph_json: SceneGraphData = Field(..., description="Full replacement graph payload.")
