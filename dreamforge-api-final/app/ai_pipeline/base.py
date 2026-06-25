from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from app.models.pipeline_job import PipelineStage


@dataclass
class PipelineContext:
    """Mutable context threaded through every pipeline stage.

    Each stage reads what it needs from `data` and writes its output back into
    `data` under its own key, so later stages (and the orchestrator) can inspect
    the full trace if a later stage fails.
    """

    dream_id: UUID
    raw_text: str
    mood: str | None = None
    style: str | None = None
    data: dict[str, Any] = field(default_factory=dict)

    def set_result(self, stage: PipelineStage, result: Any) -> None:
        self.data[stage.value] = result

    def get_result(self, stage: PipelineStage) -> Any:
        return self.data.get(stage.value)


class Stage(ABC):
    """Abstract interface every pipeline stage must implement.

    Stages are intentionally side-effect-aware: `run` performs the actual model
    call (or talks to the orchestrator's chosen provider) and returns a plain,
    JSON-serializable result that is both persisted to the DB by the calling
    service and stashed on the context for downstream stages.
    """

    stage_id: PipelineStage

    @abstractmethod
    async def run(self, context: PipelineContext) -> Any:
        """Execute this stage and return its result payload."""
        raise NotImplementedError
