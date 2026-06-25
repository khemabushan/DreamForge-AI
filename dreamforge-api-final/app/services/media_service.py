from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai_pipeline.providers.image.base import get_image_provider
from app.ai_pipeline.providers.video.runway_provider import get_video_provider
from app.core.exceptions import NotFoundError
from app.models.media_asset import MediaType
from app.models.storyboard import PanelStatus
from app.repositories.dream_repository import DreamRepository
from app.repositories.media_repository import MediaRepository
from app.repositories.storyboard_repository import StoryboardRepository


class MediaService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.dreams = DreamRepository(db)
        self.storyboards = StoryboardRepository(db)
        self.media = MediaRepository(db)

    async def regenerate_panel_image(self, *, panel_id: UUID, prompt_override: str | None = None):
        panel = await self.storyboards.get_panel(panel_id)
        if panel is None:
            raise NotFoundError("Storyboard panel not found.")

        await self.storyboards.update_panel_status(panel, PanelStatus.GENERATING)
        await self.db.commit()

        dream = await self.dreams.get_by_id(panel.storyboard.dream_id) if panel.storyboard else None
        provider = get_image_provider()
        generated = await provider.generate(
            prompt=prompt_override or panel.prompt_text or "",
            style=dream.style if dream else None,
        )

        asset = await self.media.create(
            dream_id=panel.storyboard.dream_id,
            panel_id=panel.id,
            type=MediaType.IMAGE,
            provider=generated.provider,
            storage_url=generated.storage_url,
            asset_metadata=generated.metadata,
        )
        await self.storyboards.update_panel_status(panel, PanelStatus.READY)
        await self.db.commit()
        return asset

    async def render_video(self, *, dream_id: UUID):
        storyboard = await self.storyboards.get_for_dream(dream_id)
        if storyboard is None:
            raise NotFoundError("No storyboard found for this dream yet.")

        image_assets = [a for a in await self.media.list_for_dream(dream_id) if a.type == MediaType.IMAGE]
        urls = [a.storage_url for a in image_assets]

        provider = get_video_provider()
        generated = await provider.generate(panel_image_urls=urls, dream_id=str(dream_id))

        asset = await self.media.create(
            dream_id=dream_id,
            panel_id=None,
            type=MediaType.VIDEO,
            provider=generated.provider,
            storage_url=generated.storage_url,
            asset_metadata=generated.metadata,
        )
        await self.db.commit()
        return asset
