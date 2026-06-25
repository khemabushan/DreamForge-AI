from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import Any

from app.core.config import settings


class LLMProvider(ABC):
    """Abstraction over any chat-completion-style LLM used for structured extraction."""

    @abstractmethod
    async def complete_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        """Return a parsed JSON object from the model's response."""
        raise NotImplementedError


class MockLLMProvider(LLMProvider):
    """Deterministic offline provider so the pipeline is runnable without API keys.

    Used automatically when no ANTHROPIC_API_KEY / OPENAI_API_KEY is configured —
    handy for local development, tests, and demos.
    """

    async def complete_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        prompt_lower = system_prompt.lower()

        if "storyboard" in prompt_lower:
            return {
                "panels": [
                    {
                        "sequence_order": 1,
                        "scene_description": "Wide establishing shot of the dream setting.",
                        "camera_notes": "Low angle, slow push-in",
                        "prompt_text": "cinematic wide shot, dreamlike atmosphere, moody lighting",
                    },
                    {
                        "sequence_order": 2,
                        "scene_description": "The central figure becomes aware something is wrong.",
                        "camera_notes": "Medium shot, static",
                        "prompt_text": "medium shot, surreal unease, cinematic lighting",
                    },
                ]
            }
        if "scene graph" in prompt_lower:
            return {
                "nodes": [
                    {"id": "n1", "type": "character", "label": "Dreamer", "x": 80, "y": 200},
                    {"id": "n2", "type": "location", "label": "Unfamiliar place", "x": 280, "y": 80},
                    {"id": "n3", "type": "emotion", "label": "Unease", "x": 460, "y": 220},
                ],
                "edges": [
                    {"id": "e1", "source": "n1", "target": "n2", "label": "stands in"},
                    {"id": "e2", "source": "n2", "target": "n3", "label": "evokes"},
                ],
            }
        return {}


class AnthropicLLMProvider(LLMProvider):
    """Production provider backed by the Anthropic Messages API.

    Kept intentionally thin — the orchestrator only depends on the LLMProvider
    interface, so swapping this for OpenAI or any other vendor is a one-line change.
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6") -> None:
        self.api_key = api_key
        self.model = model

    async def complete_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        import httpx

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.model,
                    "max_tokens": 2000,
                    "system": system_prompt + "\nRespond with ONLY valid JSON, no prose.",
                    "messages": [{"role": "user", "content": user_prompt}],
                },
            )
            response.raise_for_status()
            payload = response.json()
            text = "".join(block.get("text", "") for block in payload.get("content", []))
            return json.loads(text)


def get_llm_provider() -> LLMProvider:

    if settings.OPENAI_API_KEY:

        from app.ai_pipeline.providers.llm.openai_provider import (
            OpenAILLMProvider,
        )

        return OpenAILLMProvider()

    if settings.ANTHROPIC_API_KEY:

        return AnthropicLLMProvider(
            api_key=settings.ANTHROPIC_API_KEY
        )

    return MockLLMProvider()
