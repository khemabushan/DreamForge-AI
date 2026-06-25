from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.dream import Dream


class PipelineStage(str, enum.Enum):
    NLP_PARSER = "nlp_parser"
    SCENE_GRAPH_BUILDER = "scene_graph_builder"
    STORYBOARD_GENERATOR = "storyboard_generator"
    IMAGE_GENERATOR = "image_generator"
    VIDEO_GENERATOR = "video_generator"


class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class PipelineJob(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "pipeline_jobs"

    dream_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("dreams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stage: Mapped[PipelineStage] = mapped_column(SAEnum(PipelineStage, name="pipeline_stage"), nullable=False)
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus, name="job_status"), default=JobStatus.QUEUED, nullable=False
    )
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    dream: Mapped["Dream"] = relationship(back_populates="pipeline_jobs")

    def __repr__(self) -> str:
        return f"<PipelineJob id={self.id} stage={self.stage} status={self.status}>"
