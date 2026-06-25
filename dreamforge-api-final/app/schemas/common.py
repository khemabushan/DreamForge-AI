from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    """Base schema for models read directly from SQLAlchemy ORM objects."""

    model_config = ConfigDict(from_attributes=True)


class TimestampedSchema(ORMBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
