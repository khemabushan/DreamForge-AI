from __future__ import annotations

from typing import Any

from app.ai_pipeline.base import PipelineContext, Stage
from app.ai_pipeline.providers.llm.anthropic_provider import LLMProvider
from app.models.pipeline_job import PipelineStage


SYSTEM_PROMPT = """
You break a scene graph into a sequential storyboard.

Return STRICT JSON in this format:

{
    "panels": [
        {
            "sequence_order": 1,
            "scene_description": "...",
            "camera_notes": "...",
            "prompt_text": "..."
        }
    ]
}

Create 4-6 panels that tell a coherent visual story.
"""


class StoryboardGeneratorStage(Stage):
    stage_id = PipelineStage.STORYBOARD_GENERATOR

    def __init__(self, llm: LLMProvider) -> None:
        self.llm = llm

    async def run(self, context: PipelineContext) -> dict[str, Any]:
        scene_graph = context.get_result(
            PipelineStage.SCENE_GRAPH_BUILDER
        ) or {}

        result = await self.llm.complete_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=(
                f"Scene graph: {scene_graph}\n"
                f"Mood: {context.mood}\n"
                f"Style: {context.style}"
            ),
        )

        print("\n===== STORYBOARD RESULT =====")
        print(result)
        print("=============================\n")

        context.set_result(self.stage_id, result)

        return result