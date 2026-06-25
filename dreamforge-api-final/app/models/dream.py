from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.media_asset import MediaAsset
    from app.models.pipeline_job import PipelineJob
    from app.models.scene_graph import SceneGraph
    from app.models.storyboard import Storyboard
    from app.models.user import User


class DreamStatus(str, enum.Enum):
    PENDING = "pending"
    PARSING = "parsing"
    GRAPHING = "graphing"
    STORYBOARDING = "storyboarding"
    RENDERING_IMAGES = "rendering_images"
    RENDERING_VIDEO = "rendering_video"
    COMPLETED = "completed"
    FAILED = "failed"


class Dream(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "dreams"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    mood: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    style: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    status: Mapped[DreamStatus] = mapped_column(
        SAEnum(DreamStatus, name="dream_status"), default=DreamStatus.PENDING, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="dreams")
    scene_graphs: Mapped[List["SceneGraph"]] = relationship(
        back_populates="dream", cascade="all, delete-orphan"
    )
    storyboards: Mapped[List["Storyboard"]] = relationship(
        back_populates="dream", cascade="all, delete-orphan"
    )
    media_assets: Mapped[List["MediaAsset"]] = relationship(
        back_populates="dream", cascade="all, delete-orphan"
    )
    pipeline_jobs: Mapped[List["PipelineJob"]] = relationship(
        back_populates="dream", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Dream id={self.id} status={self.status}>"
