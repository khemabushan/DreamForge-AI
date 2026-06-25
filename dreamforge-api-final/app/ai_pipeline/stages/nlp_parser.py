from __future__ import annotations

from typing import Any

from app.ai_pipeline.base import PipelineContext, Stage
from app.ai_pipeline.providers.llm.anthropic_provider import LLMProvider
from app.models.pipeline_job import PipelineStage

SYSTEM_PROMPT = """You are a dream analyst. Extract structured entities from a
described dream: characters, locations, objects, and the dominant emotion.
Respond with JSON only."""


class NLPParserStage(Stage):
    stage_id = PipelineStage.NLP_PARSER

    def __init__(self, llm: LLMProvider) -> None:
        self.llm = llm

    async def run(self, context: PipelineContext) -> dict[str, Any]:
        result = await self.llm.complete_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=context.raw_text,
        )
        context.set_result(self.stage_id, result)
        return result
