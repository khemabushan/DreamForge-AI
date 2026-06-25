from typing import Any
from uuid import UUID

from pydantic import BaseModel

from app.models.media_asset import MediaType
from app.models.pipeline_job import JobStatus, PipelineStage
from app.schemas.common import TimestampedSchema


class MediaAssetRead(TimestampedSchema):
    dream_id: UUID
    panel_id: UUID | None
    type: MediaType
    provider: str | None
    storage_url: str
    asset_metadata: dict[str, Any]


class PipelineJobRead(TimestampedSchema):
    dream_id: UUID
    stage: PipelineStage
    status: JobStatus
    progress: int
    error_message: str | None


class PipelineStatusEvent(BaseModel):
    """Shape streamed over SSE for live pipeline progress."""

    dream_id: UUID
    stage: PipelineStage
    status: JobStatus
    progress: int


class RenderVideoRequest(BaseModel):
    """No body fields required today; reserved for future options (music, narration)."""

    include_narration: bool = False
