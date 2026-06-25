from uuid import UUID

from pydantic import BaseModel, Field

from app.models.dream import DreamStatus
from app.schemas.common import TimestampedSchema


class DreamCreate(BaseModel):
    raw_text: str = Field(min_length=15, max_length=8000, description="The dream as the user remembers it.")
    mood: str | None = Field(default=None, max_length=60)
    style: str | None = Field(default=None, max_length=60, description="Desired visual style, e.g. 'Cinematic'.")


class DreamUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)


class DreamRead(TimestampedSchema):
    user_id: UUID
    raw_text: str
    title: str | None
    mood: str | None
    style: str | None
    status: DreamStatus


class DreamListItem(TimestampedSchema):
    """Lightweight representation for history listings."""

    title: str | None
    mood: str | None
    status: DreamStatus
