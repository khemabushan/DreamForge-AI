from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pipeline_job import JobStatus, PipelineJob, PipelineStage


class PipelineJobRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_queued(self, *, dream_id: UUID, stage: PipelineStage) -> PipelineJob:
        job = PipelineJob(dream_id=dream_id, stage=stage, status=JobStatus.QUEUED, progress=0)
        self.db.add(job)
        await self.db.flush()
        return job

    async def get_or_create(self, *, dream_id: UUID, stage: PipelineStage) -> PipelineJob:
        result = await self.db.execute(
            select(PipelineJob).where(PipelineJob.dream_id == dream_id, PipelineJob.stage == stage)
        )
        job = result.scalar_one_or_none()
        if job is None:
            job = await self.create_queued(dream_id=dream_id, stage=stage)
        return job

    async def update_status(
        self, job: PipelineJob, *, status: JobStatus, progress: int, error_message: str | None = None
    ) -> PipelineJob:
        job.status = status
        job.progress = progress
        job.error_message = error_message
        if status == JobStatus.RUNNING and job.started_at is None:
            job.started_at = datetime.now(timezone.utc)
        if status in (JobStatus.SUCCEEDED, JobStatus.FAILED):
            job.finished_at = datetime.now(timezone.utc)
        await self.db.flush()
        return job

    async def list_for_dream(self, dream_id: UUID) -> list[PipelineJob]:
        result = await self.db.execute(
            select(PipelineJob).where(PipelineJob.dream_id == dream_id).order_by(PipelineJob.created_at)
        )
        return list(result.scalars().all())
