from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai_pipeline.base import PipelineContext
from app.ai_pipeline.orchestrator import PipelineOrchestrator
from app.core.exceptions import NotFoundError, PipelineStageError
from app.core.logging import get_logger
from app.models.dream import DreamStatus
from app.models.media_asset import MediaType
from app.models.pipeline_job import JobStatus, PipelineStage
from app.repositories.dream_repository import DreamRepository
from app.repositories.media_repository import MediaRepository
from app.repositories.pipeline_job_repository import PipelineJobRepository
from app.repositories.scene_graph_repository import SceneGraphRepository
from app.repositories.storyboard_repository import StoryboardRepository

logger = get_logger(__name__)

# Maps each pipeline stage to the dream-level status shown in the UI.
STAGE_TO_DREAM_STATUS = {
    PipelineStage.NLP_PARSER: DreamStatus.PARSING,
    PipelineStage.SCENE_GRAPH_BUILDER: DreamStatus.GRAPHING,
    PipelineStage.STORYBOARD_GENERATOR: DreamStatus.STORYBOARDING,
    PipelineStage.IMAGE_GENERATOR: DreamStatus.RENDERING_IMAGES,
    PipelineStage.VIDEO_GENERATOR: DreamStatus.RENDERING_VIDEO,
}


class PipelineService:
    """Coordinates a full dream -> video run, persisting each stage's output.

    Intended to be invoked from a Celery task (see app.workers.tasks) so it
    never blocks the request/response cycle. Also usable directly (e.g. in
    tests or a synchronous demo) since it's plain async code.
    """

    def __init__(self, db: AsyncSession, *, publisher=None) -> None:
        self.db = db
        self.dreams = DreamRepository(db)
        self.scene_graphs = SceneGraphRepository(db)
        self.storyboards = StoryboardRepository(db)
        self.media = MediaRepository(db)
        self.jobs = PipelineJobRepository(db)
        self.orchestrator = PipelineOrchestrator()
        self.publisher = publisher  # optional Redis pub/sub client for SSE fan-out

    async def run_pipeline_for_dream(self, dream_id: UUID) -> None:
        dream = await self.dreams.get_by_id(dream_id)
        if dream is None:
            raise NotFoundError("Dream not found.")

        context = PipelineContext(
            dream_id=dream.id,
            raw_text=dream.raw_text,
            mood=dream.mood,
            style=dream.style,
        )

        async def on_progress(stage: PipelineStage, status: JobStatus, progress: int) -> None:
            job = await self.jobs.get_or_create(dream_id=dream.id, stage=stage)
            await self.jobs.update_status(job, status=status, progress=progress)

            if status == JobStatus.RUNNING and stage in STAGE_TO_DREAM_STATUS:
                await self.dreams.update_status(dream, STAGE_TO_DREAM_STATUS[stage])
            await self.db.commit()

            if self.publisher is not None:
                await self.publisher.publish_progress(
                    dream_id=dream.id, stage=stage, status=status, progress=progress
                )

        try:
            await self.orchestrator.run(context, on_progress=on_progress)
        except PipelineStageError:
            await self.dreams.update_status(dream, DreamStatus.FAILED)
            await self.db.commit()
            logger.error("dream_pipeline_failed", dream_id=str(dream_id))
            raise

        await self._persist_results(dream_id=dream.id, context=context)
        await self.dreams.update_status(dream, DreamStatus.COMPLETED)
        await self.db.commit()

    async def _persist_results(self, *, dream_id: UUID, context: PipelineContext) -> None:
        scene_graph_data = context.get_result(PipelineStage.SCENE_GRAPH_BUILDER) or {"nodes": [], "edges": []}
        scene_graph = await self.scene_graphs.create(dream_id=dream_id, graph_json=scene_graph_data)

        storyboard_data = context.get_result(PipelineStage.STORYBOARD_GENERATOR) or {"panels": []}
        storyboard = await self.storyboards.create_with_panels(
            dream_id=dream_id,
            scene_graph_id=scene_graph.id,
            panels=storyboard_data.get("panels", []),
        )

        panels_by_order = {panel.sequence_order: panel for panel in storyboard.panels}
        image_result = context.get_result(PipelineStage.IMAGE_GENERATOR) or {"images": []}
        for image in image_result.get("images", []):
            panel = panels_by_order.get(image.get("sequence_order"))
            await self.media.create(
                dream_id=dream_id,
                panel_id=panel.id if panel else None,
                type=MediaType.IMAGE,
                provider=image.get("provider"),
                storage_url=image.get("storage_url", ""),
                asset_metadata=image.get("metadata", {}),
            )
            if panel is not None:
                from app.models.storyboard import PanelStatus

                await self.storyboards.update_panel_status(panel, PanelStatus.READY)

        video_result = context.get_result(PipelineStage.VIDEO_GENERATOR)
        if video_result:
            await self.media.create(
                dream_id=dream_id,
                panel_id=None,
                type=MediaType.VIDEO,
                provider=video_result.get("provider"),
                storage_url=video_result.get("storage_url", ""),
                asset_metadata=video_result.get("metadata", {}),
            )

        await self.db.commit()
