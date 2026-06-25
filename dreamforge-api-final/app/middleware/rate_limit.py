from __future__ import annotations

import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.types import ASGIApp

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Per-client-IP sliding-window rate limit.

    This in-memory implementation is fine for a single API process (or as a
    defense-in-depth layer behind a proper edge rate limiter). For multi-instance
    deployments, swap the in-memory deque for a Redis-backed counter — the
    interface here stays the same either way.
    """

    def __init__(self, app: ASGIApp, requests_per_minute: int | None = None) -> None:
        super().__init__(app)
        self.limit = requests_per_minute or settings.RATE_LIMIT_PER_MINUTE
        self.window_seconds = 60
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        client_id = request.client.host if request.client else "unknown"
        now = time.time()
        hits = self._hits[client_id]

        while hits and now - hits[0] > self.window_seconds:
            hits.popleft()

        if len(hits) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={
                    "type": "rate-limit-exceeded",
                    "title": "Too many requests",
                    "status": 429,
                    "detail": f"Limit of {self.limit} requests per minute exceeded.",
                },
                media_type="application/problem+json",
            )

        hits.append(now)
        return await call_next(request)
