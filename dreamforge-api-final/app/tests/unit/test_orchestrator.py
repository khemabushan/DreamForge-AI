import uuid

import pytest

from app.ai_pipeline.base import PipelineContext, Stage
from app.ai_pipeline.orchestrator import PipelineOrchestrator
from app.core.exceptions import PipelineStageError
from app.models.pipeline_job import JobStatus, PipelineStage


class _AlwaysSucceedsStage(Stage):
    stage_id = PipelineStage.NLP_PARSER

    async def run(self, context: PipelineContext):
        context.set_result(self.stage_id, {"ok": True})
        return {"ok": True}


class _AlwaysFailsStage(Stage):
    stage_id = PipelineStage.SCENE_GRAPH_BUILDER

    async def run(self, context: PipelineContext):
        raise RuntimeError("simulated provider outage")


class _NeverReachedStage(Stage):
    stage_id = PipelineStage.STORYBOARD_GENERATOR
    called = False

    async def run(self, context: PipelineContext):
        type(self).called = True
        return {}


def _make_context() -> PipelineContext:
    return PipelineContext(dream_id=uuid.uuid4(), raw_text="A dream about stairs that never end.")


@pytest.mark.asyncio
async def test_orchestrator_runs_stages_in_order_and_reports_progress():
    events: list[tuple[str, str, int]] = []

    async def on_progress(stage, status, progress):
        events.append((stage.value, status.value, progress))

    orchestrator = PipelineOrchestrator(stages=[_AlwaysSucceedsStage()])
    context = await orchestrator.run(_make_context(), on_progress=on_progress)

    assert context.get_result(PipelineStage.NLP_PARSER) == {"ok": True}
    assert events == [
        ("nlp_parser", "running", 0),
        ("nlp_parser", "succeeded", 100),
    ]


@pytest.mark.asyncio
async def test_orchestrator_stops_after_failed_stage():
    never_reached = _NeverReachedStage()
    orchestrator = PipelineOrchestrator(
        stages=[_AlwaysSucceedsStage(), _AlwaysFailsStage(), never_reached]
    )

    with pytest.raises(PipelineStageError):
        await orchestrator.run(_make_context())

    assert _NeverReachedStage.called is False
