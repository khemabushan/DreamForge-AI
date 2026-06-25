from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.storyboard import PanelStatus, Storyboard, StoryboardPanel


class StoryboardRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_with_panels(
        self, *, dream_id: UUID, scene_graph_id: UUID | None, panels: list[dict[str, Any]]
    ) -> Storyboard:
        storyboard = Storyboard(dream_id=dream_id, scene_graph_id=scene_graph_id)
        self.db.add(storyboard)
        await self.db.flush()

        for panel_data in panels:
            panel = StoryboardPanel(
                storyboard_id=storyboard.id,
                sequence_order=panel_data.get("sequence_order", 0),
                scene_description=panel_data.get("scene_description"),
                camera_notes=panel_data.get("camera_notes"),
                prompt_text=panel_data.get("prompt_text"),
                status=PanelStatus.PENDING,
            )
            self.db.add(panel)

        await self.db.flush()
        return await self.get_for_dream(dream_id)  # reload with panels eagerly loaded

    async def get_for_dream(self, dream_id: UUID) -> Storyboard | None:
        result = await self.db.execute(
            select(Storyboard)
            .where(Storyboard.dream_id == dream_id)
            .options(selectinload(Storyboard.panels))
            .order_by(Storyboard.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_panel(self, panel_id: UUID) -> StoryboardPanel | None:
        result = await self.db.execute(
            select(StoryboardPanel)
            .where(StoryboardPanel.id == panel_id)
            .options(selectinload(StoryboardPanel.storyboard))
        )
        return result.scalar_one_or_none()

    async def update_panel_status(self, panel: StoryboardPanel, status: PanelStatus) -> StoryboardPanel:
        panel.status = status
        await self.db.flush()
        return panel
