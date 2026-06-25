from __future__ import annotations

from fastapi import APIRouter, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import DbSession
from app.schemas.auth import RefreshRequest, TokenPair, UserCreate, UserLogin, UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, db: AsyncSession = DbSession) -> UserRead:
    user = await AuthService(db).register(payload)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenPair)
async def login(payload: UserLogin, db: AsyncSession = DbSession) -> TokenPair:
    return await AuthService(db).authenticate(payload)


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, db: AsyncSession = DbSession) -> TokenPair:
    return await AuthService(db).refresh(payload.refresh_token)
