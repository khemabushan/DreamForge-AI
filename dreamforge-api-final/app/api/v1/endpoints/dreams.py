from __future__ import annotations

import asyncio
import traceback
from uuid import UUID

from fastapi import APIRouter, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import CurrentUser, DbSession
from app.core.config import settings
from app.models.media_asset import MediaType
from app.models.user import User
from app.repositories.media_repository import MediaRepository
from app.repositories.scene_graph_repository import SceneGraphRepository
from app.repositories.storyboard_repository import StoryboardRepository
from app.schemas.dream import DreamCreate, DreamListItem, DreamRead
from app.services.dream_service import DreamService

router = APIRouter(prefix="/dreams", tags=["dreams"])


@router.post("", response_model=DreamRead, status_code=status.HTTP_201_CREATED)
async def submit_dream(
    payload: DreamCreate,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> DreamRead:
    """Submit a dream. This persists the dream and enqueues the AI pipeline;
    it returns immediately rather than waiting for generation to finish.
    """

    dream = await DreamService(db).submit_dream(
        user_id=user.id,
        payload=payload,
    )

    try:
        from app.workers.tasks import run_dream_pipeline

        print("Submitting Celery task...")
        run_dream_pipeline.delay(str(dream.id))
        print("Celery task submitted.")

    except Exception:
        print("CELERY ERROR:")
        traceback.print_exc()
        raise

    return DreamRead.model_validate(dream)

@router.get("", response_model=list[DreamListItem])
async def list_dreams(
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[DreamListItem]:
    dreams = await DreamService(db).list_dreams(user_id=user.id, limit=limit, offset=offset)
    return [DreamListItem.model_validate(d) for d in dreams]


@router.get("/{dream_id}", response_model=DreamRead)
async def get_dream(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> DreamRead:
    dream = await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)
    return DreamRead.model_validate(dream)


@router.get("/{dream_id}/scene-graph")
async def get_scene_graph(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
):
    await DreamService(db).get_owned_dream(
        dream_id=dream_id,
        user_id=user.id,
    )

    scene_graph = await SceneGraphRepository(db).get_latest_for_dream(dream_id)

    if scene_graph is None:
        return {"nodes": [], "edges": []}

    return scene_graph.graph_json


@router.get("/{dream_id}/storyboard")
async def get_storyboard(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
):
    await DreamService(db).get_owned_dream(
        dream_id=dream_id,
        user_id=user.id,
    )

    storyboard = await StoryboardRepository(db).get_for_dream(dream_id)

    if storyboard is None:
        return {"panels": []}

    return {
        "id": str(storyboard.id),
        "panels": [
            {
                "id": str(panel.id),
                "sequence_order": panel.sequence_order,
                "scene_description": panel.scene_description,
                "camera_notes": panel.camera_notes,
                "prompt_text": panel.prompt_text,
                "status": panel.status.value,
            }
            for panel in storyboard.panels
        ],
    }

@router.get("/{dream_id}/events")
async def stream_dream_events(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
):
    """Server-Sent Events stream of pipeline progress for one dream.

    The frontend's `lib/ws-client.ts` connects here to drive the live
    generation timeline shown on the dream overview page.
    """
    # Confirm ownership before opening the stream.
    await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)

    async def event_generator():
        from redis.asyncio import Redis

        redis = Redis.from_url(settings.REDIS_URL)
        pubsub = redis.pubsub()
        await pubsub.subscribe(f"dream:{dream_id}:pipeline")
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=15)
                if message is not None:
                    data = message["data"]
                    yield f"data: {data.decode() if isinstance(data, bytes) else data}\n\n"
                else:
                    yield ": keep-alive\n\n"
                await asyncio.sleep(0.1)
        finally:
            await pubsub.unsubscribe(f"dream:{dream_id}:pipeline")
            await redis.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")

