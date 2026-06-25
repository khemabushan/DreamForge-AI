from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.dream import Dream
    from app.models.media_asset import MediaAsset


class PanelStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    READY = "ready"
    FAILED = "failed"


class Storyboard(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "storyboards"

    dream_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("dreams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    scene_graph_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("scene_graphs.id", ondelete="SET NULL"), nullable=True
    )

    dream: Mapped["Dream"] = relationship(back_populates="storyboards")
    panels: Mapped[List["StoryboardPanel"]] = relationship(
        back_populates="storyboard", cascade="all, delete-orphan", order_by="StoryboardPanel.sequence_order"
    )

    def __repr__(self) -> str:
        return f"<Storyboard id={self.id} dream_id={self.dream_id}>"


class StoryboardPanel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "storyboard_panels"

    storyboard_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("storyboards.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    scene_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    camera_notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    prompt_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[PanelStatus] = mapped_column(
        SAEnum(PanelStatus, name="panel_status"), default=PanelStatus.PENDING, nullable=False
    )

    storyboard: Mapped["Storyboard"] = relationship(back_populates="panels")
    media_assets: Mapped[List["MediaAsset"]] = relationship(
        back_populates="panel", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<StoryboardPanel id={self.id} order={self.sequence_order}>"
