from __future__ import annotations

import json
from typing import Any

from openai import AsyncOpenAI

from app.ai_pipeline.providers.llm.anthropic_provider import LLMProvider
from app.core.config import settings


class OpenAILLMProvider(LLMProvider):
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4.1-mini"

    async def complete_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any]:

        response = await self.client.chat.completions.create(
            model=self.model,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                    + "\nRespond ONLY with valid JSON.",
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.7,
        )

        text = response.choices[0].message.content

        return json.loads(text)