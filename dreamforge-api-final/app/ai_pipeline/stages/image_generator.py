from __future__ import annotations

import asyncio
from typing import Any

from app.ai_pipeline.base import PipelineContext, Stage
from app.ai_pipeline.providers.image.base import ImageGenProvider
from app.models.pipeline_job import PipelineStage


class ImageGeneratorStage(Stage):
    """Renders one image per storyboard panel."""

    stage_id = PipelineStage.IMAGE_GENERATOR

    def __init__(self, image_provider: ImageGenProvider) -> None:
        self.image_provider = image_provider

    async def run(self, context: PipelineContext) -> dict[str, Any]:
        storyboard = context.get_result(
            PipelineStage.STORYBOARD_GENERATOR
        ) or {}

        panels = storyboard.get("panels", [])

        shared_seed = abs(hash(context.dream_id)) % (2**31)

        images = []

        for i, panel in enumerate(panels):

            print(f"\nGenerating image {i + 1}/{len(panels)}")

            generated = await self.image_provider.generate(
                prompt=panel.get("prompt_text", ""),
                style=context.style,
                seed=shared_seed,
            )

            images.append(
                {
                    "sequence_order": panel.get("sequence_order"),
                    "storage_url": generated.storage_url,
                    "provider": generated.provider,
                    "metadata": generated.metadata,
                }
            )

            # Prevent Replicate rate limiting
            if i < len(panels) - 1:
                print("Waiting 10 seconds before next image...")
                await asyncio.sleep(10)

        result = {"images": images}

        context.set_result(self.stage_id, result)

        return result