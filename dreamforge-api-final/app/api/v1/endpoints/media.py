from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import CurrentUser, DbSession
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.repositories.media_repository import MediaRepository
from app.schemas.media import MediaAssetRead, RenderVideoRequest
from app.services.dream_service import DreamService
from app.services.media_service import MediaService

router = APIRouter(tags=["media"])


@router.get("/dreams/{dream_id}/media", response_model=list[MediaAssetRead])
async def list_dream_media(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> list[MediaAssetRead]:
    """All rendered media (panel images + final video) for a dream.

    Added to support the frontend storyboard/video pages, which need to
    display already-rendered assets on page load rather than only the
    single asset returned by a regenerate/render call.
    """
    await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)
    assets = await MediaRepository(db).list_for_dream(dream_id)
    return [MediaAssetRead.model_validate(a) for a in assets]


@router.get("/media/{media_id}", response_model=MediaAssetRead)
async def get_media_asset(
    media_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> MediaAssetRead:
    asset = await MediaRepository(db).get_by_id(media_id)
    if asset is None:
        raise NotFoundError("Media asset not found.")
    await DreamService(db).get_owned_dream(dream_id=asset.dream_id, user_id=user.id)
    return MediaAssetRead.model_validate(asset)


@router.post("/dreams/{dream_id}/render-video", response_model=MediaAssetRead)
async def render_video(
    dream_id: UUID,
    payload: RenderVideoRequest,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> MediaAssetRead:
    """Manually (re)trigger final video assembly from the current storyboard panels."""
    await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)
    asset = await MediaService(db).render_video(dream_id=dream_id)
    return MediaAssetRead.model_validate(asset)
