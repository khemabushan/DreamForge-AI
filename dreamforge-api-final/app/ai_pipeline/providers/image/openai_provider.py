from __future__ import annotations

import base64

from openai import AsyncOpenAI

from app.ai_pipeline.providers.image.base import (
    GeneratedImage,
    ImageGenProvider,
)
from app.core.config import settings


class OpenAIImageProvider(ImageGenProvider):

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY
        )

    async def generate(
        self,
        prompt: str,
        style: str | None,
        seed: int | None = None,
    ) -> GeneratedImage:

        full_prompt = (
            f"{prompt}, {style} style"
            if style
            else prompt
        )

        result = await self.client.images.generate(
            model="gpt-image-1",
            prompt=full_prompt,
            size="1024x1024"
        )

        image_base64 = result.data[0].b64_json

        return GeneratedImage(
            storage_url=f"data:image/png;base64,{image_base64}",
            provider="openai",
            metadata={
                "prompt": full_prompt,
                "seed": seed,
            },
        )