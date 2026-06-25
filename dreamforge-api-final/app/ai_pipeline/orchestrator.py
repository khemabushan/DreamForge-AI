from __future__ import annotations

from typing import Awaitable, Callable

from app.ai_pipeline.base import PipelineContext, Stage
from app.ai_pipeline.providers.image.base import get_image_provider
from app.ai_pipeline.providers.llm.anthropic_provider import get_llm_provider
from app.ai_pipeline.providers.video.runway_provider import get_video_provider
from app.ai_pipeline.stages.image_generator import ImageGeneratorStage
from app.ai_pipeline.stages.nlp_parser import NLPParserStage
from app.ai_pipeline.stages.scene_graph_builder import SceneGraphBuilderStage
from app.ai_pipeline.stages.storyboard_generator import StoryboardGeneratorStage
from app.ai_pipeline.stages.video_generator import VideoGeneratorStage
from app.core.exceptions import PipelineStageError
from app.core.logging import get_logger
from app.models.pipeline_job import JobStatus, PipelineStage as StageEnum

logger = get_logger(__name__)

# Called after every stage transition: (stage, status, progress) -> None
ProgressCallback = Callable[[StageEnum, JobStatus, int], Awaitable[None]]


def build_default_pipeline() -> list[Stage]:
    """Wires up the five stages with whichever providers are configured.

    This is the single place that decides which concrete provider backs each
    stage — swap a provider here (or make it config-driven) without touching
    any stage or the orchestrator itself.
    """
    llm = get_llm_provider()
    return [
        NLPParserStage(llm=llm),
        SceneGraphBuilderStage(llm=llm),
        StoryboardGeneratorStage(llm=llm),
        ImageGeneratorStage(image_provider=get_image_provider()),
        VideoGeneratorStage(video_provider=get_video_provider()),
    ]


class PipelineOrchestrator:
    """Runs an ordered list of stages against a shared context.

    Failure isolation: if a stage raises, the orchestrator reports that stage
    as failed via the progress callback and stops — it does not attempt to run
    downstream stages against incomplete data. Per-panel retry (e.g. one failed
    image in a storyboard) is handled inside ImageGeneratorStage, not here.
    """

    def __init__(self, stages: list[Stage] | None = None) -> None:
        self.stages = stages or build_default_pipeline()

    async def run(
        self,
        context: PipelineContext,
        on_progress: ProgressCallback | None = None,
    ) -> PipelineContext:
        async def emit(stage: StageEnum, status: JobStatus, progress: int) -> None:
            if on_progress is not None:
                await on_progress(stage, status, progress)

        for stage in self.stages:
            await emit(stage.stage_id, JobStatus.RUNNING, 0)
            try:
                await stage.run(context)
            except Exception as exc:  # noqa: BLE001 - we deliberately convert any provider error
                logger.error("pipeline_stage_failed", stage=stage.stage_id.value, error=str(exc))
                await emit(stage.stage_id, JobStatus.FAILED, 0)
                raise PipelineStageError(
                    f"Stage '{stage.stage_id.value}' failed: {exc}"
                ) from exc
            await emit(stage.stage_id, JobStatus.SUCCEEDED, 100)

        return context
