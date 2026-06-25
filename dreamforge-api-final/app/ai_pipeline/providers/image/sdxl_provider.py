from __future__ import annotations

import uuid
import replicate

from app.core.config import settings
from app.ai_pipeline.providers.image.base import (
    GeneratedImage,
    ImageGenProvider,
)


class SDXLImageProvider(ImageGenProvider):

    async def generate(
        self,
        prompt: str,
        style: str | None,
        seed: int | None = None,
    ) -> GeneratedImage:

        full_prompt = f"{prompt}, {style} style" if style else prompt

        replicate_client = replicate.Client(
            api_token=settings.REPLICATE_API_TOKEN
        )

        output = replicate_client.run(
            "black-forest-labs/flux-schnell",
            input={
                "prompt": full_prompt,
                "seed": seed,
                "go_fast": True,
                "megapixels": "1",
                "num_outputs": 1,
                "output_format": "png",
                "output_quality": 90,
            },
        )

        image_url = str(output[0])

        return GeneratedImage(
            storage_url=image_url,
            provider="replicate-flux",
            metadata={
                "prompt": full_prompt,
                "seed": seed,
            },
        )