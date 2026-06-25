from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any, Dict

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.dream import Dream


class SceneGraph(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Stores the extracted scene graph as JSONB: {"nodes": [...], "edges": [...]}."""

    __tablename__ = "scene_graphs"

    dream_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("dreams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    graph_json: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    dream: Mapped["Dream"] = relationship(back_populates="scene_graphs")

    def __repr__(self) -> str:
        return f"<SceneGraph id={self.id} dream_id={self.dream_id} v{self.version}>"
