from __future__ import annotations

from typing import Any

from app.ai_pipeline.base import PipelineContext, Stage
from app.ai_pipeline.providers.video.runway_provider import VideoGenProvider
from app.models.pipeline_job import PipelineStage


class VideoGeneratorStage(Stage):
    """Stitches the rendered panel images into a single video cut."""

    stage_id = PipelineStage.VIDEO_GENERATOR

    def __init__(self, video_provider: VideoGenProvider) -> None:
        self.video_provider = video_provider

    async def run(self, context: PipelineContext) -> dict[str, Any]:

        print("\n===== VIDEO GENERATOR STARTED =====")

        image_result = context.get_result(
            PipelineStage.IMAGE_GENERATOR
        ) or {}

        images = sorted(
            image_result.get("images", []),
            key=lambda i: i.get("sequence_order", 0),
        )

        print(f"Images found: {len(images)}")

        urls = [img["storage_url"] for img in images]

        print("\nImage URLs:")
        for url in urls:
            print(url)

        generated = await self.video_provider.generate(
            panel_image_urls=urls,
            dream_id=str(context.dream_id),
        )

        print("\n===== VIDEO GENERATED =====")
        print(generated)

        result = {
            "storage_url": generated.storage_url,
            "provider": generated.provider,
            "metadata": generated.metadata,
        }

        context.set_result(self.stage_id, result)

        return result