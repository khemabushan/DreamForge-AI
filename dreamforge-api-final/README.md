# DreamForge AI — Backend

A production-grade FastAPI backend: authentication, dream submission, and a
modular five-stage AI pipeline (NLP parsing → scene graph → storyboard →
images → video), backed by PostgreSQL and Celery/Redis for background work.

This has been built and verified end-to-end in a real environment: Postgres
+ Redis + a Celery worker + the API server, with actual HTTP requests
exercising signup, login, dream submission, the full pipeline run, scene
graph edits, panel regeneration, video rendering, and live SSE progress.

## Stack
- FastAPI + Pydantic v2
- SQLAlchemy 2.0 (async, asyncpg) + Alembic migrations
- PostgreSQL
- Celery + Redis (background pipeline execution, pub/sub progress)
- JWT auth (access + refresh tokens), bcrypt password hashing
- Structured logging (structlog), RFC 7807 problem-detail error responses

## Folder structure
```
app/
  core/            # config, security (JWT/bcrypt), logging, exceptions
  api/v1/           # routers + endpoints, deps (auth guard)
  domain/           # (reserved for richer business-rule objects as the app grows)
  services/         # auth, dream, pipeline, media — orchestration layer
  repositories/      # data access, one per aggregate
  models/           # SQLAlchemy ORM models
  schemas/          # Pydantic request/response schemas
  ai_pipeline/      # the modular pipeline: base, orchestrator, stages/, providers/
  workers/          # Celery app + task wrapping the pipeline service
  middleware/       # request logging, rate limiting
  db/               # session/engine, declarative base
  tests/            # unit + integration
alembic/            # migrations
```

## Running locally (Docker)
```bash
cp .env.example .env   # then set a real SECRET_KEY
docker compose up --build
```
This starts Postgres, Redis, the API (with migrations applied automatically
on boot), and a Celery worker. API docs: http://localhost:8000/docs

## Running locally (without Docker)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # point DATABASE_URL/REDIS_URL at your own services

alembic upgrade head
uvicorn app.main:app --reload          # terminal 1
celery -A app.workers.celery_app worker --loglevel=info   # terminal 2
```

## Running tests
```bash
pytest app/tests/unit -v
```

## AI providers
Every model call goes through an abstract provider interface
(`LLMProvider`, `ImageGenProvider`, `VideoGenProvider`). With no API keys
set, the app automatically falls back to deterministic **mock providers** —
the entire pipeline runs and persists realistic-looking data with zero
external dependencies, which is what the test run above used. Set
`ANTHROPIC_API_KEY`, `STABILITY_API_KEY`, or `RUNWAY_API_KEY` in `.env` to
switch to real providers; no other code changes are needed.

## A note on async SQLAlchemy + Celery
asyncpg connections are bound to the event loop they were created on. The
Celery task (`app/workers/tasks.py`) creates a fresh engine scoped to each
task's own `asyncio.run()` call rather than reusing the FastAPI process's
long-lived engine — sharing one engine across multiple `asyncio.run()`
calls in the same worker process will intermittently fail with
`Future attached to a different loop`. This was caught and fixed during
the verification pass for this build.

## API surface
See `/docs` for the full OpenAPI schema. Summary:

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register |
| POST | `/api/v1/auth/login` | Get access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Rotate tokens |
| POST | `/api/v1/dreams` | Submit a dream, enqueues the pipeline |
| GET | `/api/v1/dreams` | List dream history |
| GET | `/api/v1/dreams/{id}` | Dream detail |
| GET | `/api/v1/dreams/{id}/events` | SSE pipeline progress |
| GET | `/api/v1/dreams/{id}/scene-graph` | Latest scene graph |
| PATCH | `/api/v1/scene-graphs/{id}` | Save manual edits (new version) |
| GET | `/api/v1/dreams/{id}/storyboard` | Storyboard + panels |
| PATCH | `/api/v1/storyboard-panels/{id}` | Edit panel text |
| POST | `/api/v1/storyboard-panels/{id}/regenerate-image` | Re-render one panel |
| POST | `/api/v1/dreams/{id}/render-video` | (Re)assemble final video |
| GET | `/api/v1/media/{id}` | Media asset detail |
| GET | `/api/v1/pipeline/{id}/jobs` | Per-stage job status |
| POST | `/api/v1/pipeline/{id}/run` | Manually (re)trigger the pipeline |
