from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scene_graph import SceneGraph


class SceneGraphRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, *, dream_id: UUID, graph_json: dict[str, Any]) -> SceneGraph:
        scene_graph = SceneGraph(dream_id=dream_id, graph_json=graph_json, version=1)
        self.db.add(scene_graph)
        await self.db.flush()
        return scene_graph

    async def get_latest_for_dream(self, dream_id: UUID) -> SceneGraph | None:
        result = await self.db.execute(
            select(SceneGraph)
            .where(SceneGraph.dream_id == dream_id)
            .order_by(SceneGraph.version.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, scene_graph_id: UUID) -> SceneGraph | None:
        return await self.db.get(SceneGraph, scene_graph_id)

    async def create_new_version(self, *, dream_id: UUID, graph_json: dict[str, Any]) -> SceneGraph:
        latest = await self.get_latest_for_dream(dream_id)
        next_version = (latest.version + 1) if latest else 1
        scene_graph = SceneGraph(dream_id=dream_id, graph_json=graph_json, version=next_version)
        self.db.add(scene_graph)
        await self.db.flush()
        return scene_graph
