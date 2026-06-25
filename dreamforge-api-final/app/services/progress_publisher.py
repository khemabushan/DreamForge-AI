from __future__ import annotations

import json
from uuid import UUID

from redis.asyncio import Redis

from app.core.config import settings
from app.models.pipeline_job import JobStatus, PipelineStage


def _channel_for(dream_id: UUID) -> str:
    return f"dream:{dream_id}:pipeline"


class PipelineProgressPublisher:
    """Publishes stage progress to a per-dream Redis channel.

    The SSE endpoint (`/dreams/{id}/events`) subscribes to the same channel
    and forwards messages to the browser, decoupling the worker process
    (which runs the pipeline) from the API process (which serves the stream).
    """

    def __init__(self, redis: Redis | None = None) -> None:
        self.redis = redis or Redis.from_url(settings.REDIS_URL)

    async def publish_progress(
        self, *, dream_id: UUID, stage: PipelineStage, status: JobStatus, progress: int
    ) -> None:
        payload = {
            "dream_id": str(dream_id),
            "stage": stage.value,
            "status": status.value,
            "progress": progress,
        }
        await self.redis.publish(_channel_for(dream_id), json.dumps(payload))

    async def subscribe(self, dream_id: UUID):
        pubsub = self.redis.pubsub()
        await pubsub.subscribe(_channel_for(dream_id))
        return pubsub
