from fastapi import APIRouter

from app.api.v1.endpoints import auth, dreams, media, pipeline, scene_graphs, storyboards

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(dreams.router)
api_router.include_router(scene_graphs.router)
api_router.include_router(storyboards.router)
api_router.include_router(media.router)
api_router.include_router(pipeline.router)
