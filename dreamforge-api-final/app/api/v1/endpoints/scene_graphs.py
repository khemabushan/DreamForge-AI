from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import CurrentUser, DbSession
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.repositories.scene_graph_repository import SceneGraphRepository
from app.schemas.scene_graph import SceneGraphRead, SceneGraphUpdate
from app.services.dream_service import DreamService

router = APIRouter(tags=["scene-graphs"])


@router.get("/dreams/{dream_id}/scene-graph", response_model=SceneGraphRead)
async def get_scene_graph(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> SceneGraphRead:
    await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)
    scene_graph = await SceneGraphRepository(db).get_latest_for_dream(dream_id)
    if scene_graph is None:
        raise NotFoundError("Scene graph not generated yet.")
    return SceneGraphRead.model_validate(scene_graph)


@router.patch("/scene-graphs/{scene_graph_id}", response_model=SceneGraphRead)
async def update_scene_graph(
    scene_graph_id: UUID,
    payload: SceneGraphUpdate,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> SceneGraphRead:
    """Manual edit (e.g. dragging a node, renaming a label). Stored as a new version."""
    repo = SceneGraphRepository(db)
    existing = await repo.get_by_id(scene_graph_id)
    if existing is None:
        raise NotFoundError("Scene graph not found.")

    await DreamService(db).get_owned_dream(dream_id=existing.dream_id, user_id=user.id)

    updated = await repo.create_new_version(
        dream_id=existing.dream_id,
        graph_json=payload.graph_json.model_dump(),
    )
    await db.commit()
    return SceneGraphRead.model_validate(updated)
