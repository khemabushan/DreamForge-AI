from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.dream import Dream
from app.repositories.dream_repository import DreamRepository
from app.schemas.dream import DreamCreate


class DreamService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.dreams = DreamRepository(db)

    async def submit_dream(self, *, user_id: UUID, payload: DreamCreate) -> Dream:
        dream = await self.dreams.create(
            user_id=user_id,
            raw_text=payload.raw_text,
            mood=payload.mood,
            style=payload.style,
        )
        await self.db.commit()
        return dream

    async def get_owned_dream(self, *, dream_id: UUID, user_id: UUID) -> Dream:
        dream = await self.dreams.get_owned(dream_id, user_id)
        if dream is None:
            raise NotFoundError("Dream not found.")
        return dream

    async def list_dreams(self, *, user_id: UUID, limit: int = 50, offset: int = 0) -> list[Dream]:
        return await self.dreams.list_for_user(user_id, limit=limit, offset=offset)
