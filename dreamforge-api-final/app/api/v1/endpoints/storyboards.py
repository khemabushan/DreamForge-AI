from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import CurrentUser, DbSession
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.repositories.storyboard_repository import StoryboardRepository
from app.schemas.media import MediaAssetRead
from app.schemas.storyboard import RegenerateImageRequest, StoryboardPanelUpdate, StoryboardRead
from app.services.dream_service import DreamService
from app.services.media_service import MediaService

router = APIRouter(tags=["storyboards"])


@router.get("/dreams/{dream_id}/storyboard", response_model=StoryboardRead)
async def get_storyboard(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> StoryboardRead:
    await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)
    storyboard = await StoryboardRepository(db).get_for_dream(dream_id)
    if storyboard is None:
        raise NotFoundError("Storyboard not generated yet.")
    return StoryboardRead.model_validate(storyboard)


@router.patch("/storyboard-panels/{panel_id}", response_model=MediaAssetRead | None)
async def update_panel(
    panel_id: UUID,
    payload: StoryboardPanelUpdate,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
):
    repo = StoryboardRepository(db)
    panel = await repo.get_panel(panel_id)
    if panel is None:
        raise NotFoundError("Storyboard panel not found.")

    await DreamService(db).get_owned_dream(dream_id=panel.storyboard.dream_id, user_id=user.id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(panel, field, value)
    await db.commit()
    return None


@router.post("/storyboard-panels/{panel_id}/regenerate-image", response_model=MediaAssetRead)
async def regenerate_panel_image(
    panel_id: UUID,
    payload: RegenerateImageRequest,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> MediaAssetRead:
    repo = StoryboardRepository(db)
    panel = await repo.get_panel(panel_id)
    if panel is None:
        raise NotFoundError("Storyboard panel not found.")

    await DreamService(db).get_owned_dream(dream_id=panel.storyboard.dream_id, user_id=user.id)

    asset = await MediaService(db).regenerate_panel_image(
        panel_id=panel_id, prompt_override=payload.prompt_override
    )
    return MediaAssetRead.model_validate(asset)
