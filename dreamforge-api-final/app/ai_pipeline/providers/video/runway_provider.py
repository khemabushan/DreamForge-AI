from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

import httpx

from app.core.config import settings


@dataclass
class GeneratedVideo:
    storage_url: str
    provider: str
    metadata: dict


class VideoGenProvider(ABC):
    """Abstraction over any image-to-video / video assembly backend."""

    @abstractmethod
    async def generate(self, panel_image_urls: list[str], dream_id: str) -> GeneratedVideo:
        raise NotImplementedError


class MockVideoProvider(VideoGenProvider):

    async def generate(
        self,
        panel_image_urls: list[str],
        dream_id: str,
    ) -> GeneratedVideo:

        # Temporary placeholder video until Runway integration
        return GeneratedVideo(
            storage_url="https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
            provider="mock",
            metadata={
                "panel_count": len(panel_image_urls),
                "message": "AI video generation coming soon",
            },
        )


class RunwayVideoProvider(VideoGenProvider):
    """Production provider backed by Runway's image-to-video + assembly API."""

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def generate(self, panel_image_urls: list[str], dream_id: str) -> GeneratedVideo:
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                "https://api.runwayml.com/v1/image_to_video",
                headers={"authorization": f"Bearer {self.api_key}"},
                json={"prompt_images": panel_image_urls, "model": "gen3"},
            )
            response.raise_for_status()
            payload = response.json()

        return GeneratedVideo(
            storage_url=payload.get("output_url", ""),
            provider="runway",
            metadata={"job_id": payload.get("id"), "panel_count": len(panel_image_urls)},
        )


def get_video_provider() -> VideoGenProvider:
    if settings.RUNWAY_API_KEY:
        return RunwayVideoProvider(api_key=settings.RUNWAY_API_KEY)
    return MockVideoProvider()
