from __future__ import annotations

from typing import Any

from app.ai_pipeline.base import PipelineContext, Stage
from app.ai_pipeline.providers.llm.anthropic_provider import LLMProvider
from app.models.pipeline_job import PipelineStage

SYSTEM_PROMPT = """You build a scene graph from extracted dream entities.
Output JSON with "nodes" (id, type in [character, location, object, emotion],
label, x, y) and "edges" (id, source, target, label) describing how entities
relate to each other."""


class SceneGraphBuilderStage(Stage):
    stage_id = PipelineStage.SCENE_GRAPH_BUILDER

    def __init__(self, llm: LLMProvider) -> None:
        self.llm = llm

    async def run(self, context: PipelineContext) -> dict[str, Any]:
        entities = context.get_result(PipelineStage.NLP_PARSER) or {}
        result = await self.llm.complete_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=f"Dream text: {context.raw_text}\nExtracted entities: {entities}",
        )
        context.set_result(self.stage_id, result)
        return result
