from __future__ import annotations

import asyncio
from uuid import UUID

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.logging import get_logger
from app.services.pipeline_service import PipelineService
#from app.services.progress_publisher import PipelineProgressPublisher
from app.workers.celery_app import celery_app

logger = get_logger(__name__)


async def _run_pipeline(dream_id: str) -> None:
    # Each task execution gets its own engine, scoped to the event loop that
    # `asyncio.run()` creates below. asyncpg connections are bound to the loop
    # they were opened on, so sharing the FastAPI-process-wide engine (or any
    # engine that outlives a single asyncio.run() call) across Celery's
    # prefork task invocations raises "Future attached to a different loop".
    engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
    session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)

    try:
        async with session_factory() as db:
            service = PipelineService(db, publisher=None)
            await service.run_pipeline_for_dream(UUID(dream_id))
    finally:
        await engine.dispose()


@celery_app.task(name="run_dream_pipeline", bind=True, max_retries=0)
def run_dream_pipeline(self, dream_id: str) -> None:
    """Entry point invoked by `dreams.submit_dream` via `.delay(...)`.

    Runs the full five-stage pipeline for one dream and persists every
    stage's output. Retries are intentionally disabled at the task level —
    per-panel image retries are handled inside the image generation stage;
    a whole-pipeline retry would re-run (and re-bill) successful stages.
    """
    try:
        asyncio.run(_run_pipeline(dream_id))
    except Exception:
        logger.error("dream_pipeline_task_failed", dream_id=dream_id)
        raise
