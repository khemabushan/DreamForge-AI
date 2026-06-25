from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dream import Dream, DreamStatus


class DreamRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(
        self, *, user_id: UUID, raw_text: str, mood: str | None, style: str | None
    ) -> Dream:
        dream = Dream(
            user_id=user_id,
            raw_text=raw_text,
            mood=mood,
            style=style,
            status=DreamStatus.PENDING,
            title=self._derive_title(raw_text),
        )
        self.db.add(dream)
        await self.db.flush()
        return dream

    async def get_by_id(self, dream_id: UUID) -> Dream | None:
        return await self.db.get(Dream, dream_id)

    async def get_owned(self, dream_id: UUID, user_id: UUID) -> Dream | None:
        result = await self.db.execute(
            select(Dream).where(Dream.id == dream_id, Dream.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: UUID, *, limit: int = 50, offset: int = 0) -> list[Dream]:
        result = await self.db.execute(
            select(Dream)
            .where(Dream.user_id == user_id)
            .order_by(Dream.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def update_status(self, dream: Dream, status: DreamStatus) -> Dream:
        dream.status = status
        await self.db.flush()
        return dream

    @staticmethod
    def _derive_title(raw_text: str, max_words: int = 6) -> str:
        words = raw_text.strip().split()
        title = " ".join(words[:max_words])
        return title + ("…" if len(words) > max_words else "")
