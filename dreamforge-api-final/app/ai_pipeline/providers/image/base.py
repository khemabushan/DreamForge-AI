from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class GeneratedImage:
    storage_url: str
    provider: str
    metadata: dict


class ImageGenProvider(ABC):
    """Abstraction over any text-to-image backend (SDXL, DALL-E, Flux, ...)."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        style: str | None,
        seed: int | None = None,
    ) -> GeneratedImage:
        raise NotImplementedError


class MockImageProvider(ImageGenProvider):
    """Returns a deterministic placeholder URL."""

    async def generate(
        self,
        prompt: str,
        style: str | None,
        seed: int | None = None,
    ) -> GeneratedImage:
        slug = abs(hash(prompt)) % 100000

        return GeneratedImage(
            storage_url=f"https://placehold.co/1024x576/0B0B14/EDEDF5?text=Panel+{slug}",
            provider="mock",
            metadata={
                "prompt": prompt,
                "style": style,
                "seed": seed,
            },
        )


def get_image_provider() -> ImageGenProvider:
    # USE REPLICATE FLUX ONLY
    from app.ai_pipeline.providers.image.sdxl_provider import SDXLImageProvider

    return SDXLImageProvider()