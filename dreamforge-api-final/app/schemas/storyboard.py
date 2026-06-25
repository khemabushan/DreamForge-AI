from uuid import UUID

from pydantic import BaseModel, Field

from app.models.storyboard import PanelStatus
from app.schemas.common import TimestampedSchema


class StoryboardPanelRead(TimestampedSchema):
    storyboard_id: UUID
    sequence_order: int
    scene_description: str | None
    camera_notes: str | None
    prompt_text: str | None
    status: PanelStatus


class StoryboardRead(TimestampedSchema):
    dream_id: UUID
    scene_graph_id: UUID | None
    panels: list[StoryboardPanelRead]


class StoryboardPanelUpdate(BaseModel):
    scene_description: str | None = Field(default=None, max_length=2000)
    camera_notes: str | None = Field(default=None, max_length=255)
    prompt_text: str | None = Field(default=None, max_length=2000)


class RegenerateImageRequest(BaseModel):
    """Optional override prompt for a single-panel regeneration."""

    prompt_override: str | None = Field(default=None, max_length=2000)
