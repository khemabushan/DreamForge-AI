from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import CurrentUser, DbSession
from app.models.user import User
from app.repositories.pipeline_job_repository import PipelineJobRepository
from app.schemas.media import PipelineJobRead
from app.services.dream_service import DreamService

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("/{dream_id}/jobs", response_model=list[PipelineJobRead])
async def list_pipeline_jobs(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> list[PipelineJobRead]:
    await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)
    jobs = await PipelineJobRepository(db).list_for_dream(dream_id)
    return [PipelineJobRead.model_validate(j) for j in jobs]


@router.post("/{dream_id}/run", status_code=202)
async def trigger_pipeline_run(
    dream_id: UUID,
    user: User = CurrentUser,
    db: AsyncSession = DbSession,
) -> dict[str, str]:
    """Manually (re)enqueue the pipeline for a dream — useful in local
    development when Celery wasn't reachable at submission time, or to
    retry a failed run."""
    await DreamService(db).get_owned_dream(dream_id=dream_id, user_id=user.id)

    from app.workers.tasks import run_dream_pipeline

    run_dream_pipeline.delay(str(dream_id))
    return {"status": "queued"}
