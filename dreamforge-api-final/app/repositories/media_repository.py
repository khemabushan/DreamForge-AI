from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.media_asset import MediaAsset, MediaType


class MediaRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(
        self,
        *,
        dream_id: UUID,
        panel_id: UUID | None,
        type: MediaType,
        provider: str | None,
        storage_url: str,
        asset_metadata: dict[str, Any] | None = None,
    ) -> MediaAsset:
        asset = MediaAsset(
            dream_id=dream_id,
            panel_id=panel_id,
            type=type,
            provider=provider,
            storage_url=storage_url,
            asset_metadata=asset_metadata or {},
        )
        self.db.add(asset)
        await self.db.flush()
        return asset

    async def get_by_id(self, media_id: UUID) -> MediaAsset | None:
        return await self.db.get(MediaAsset, media_id)

    async def list_for_dream(self, dream_id: UUID) -> list[MediaAsset]:
        result = await self.db.execute(select(MediaAsset).where(MediaAsset.dream_id == dream_id))
        return list(result.scalars().all())
