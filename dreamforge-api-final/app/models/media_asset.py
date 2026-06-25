from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.dream import Dream
    from app.models.storyboard import StoryboardPanel


class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class MediaAsset(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "media_assets"

    dream_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("dreams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    panel_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("storyboard_panels.id", ondelete="CASCADE"), nullable=True
    )
    type: Mapped[MediaType] = mapped_column(SAEnum(MediaType, name="media_type"), nullable=False)
    provider: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    storage_url: Mapped[str] = mapped_column(String(500), nullable=False)
    asset_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    dream: Mapped["Dream"] = relationship(back_populates="media_assets")
    panel: Mapped[Optional["StoryboardPanel"]] = relationship(back_populates="media_assets")

    def __repr__(self) -> str:
        return f"<MediaAsset id={self.id} type={self.type}>"
