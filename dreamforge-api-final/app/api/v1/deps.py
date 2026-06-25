from __future__ import annotations

from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError
from app.core.security import TokenPayloadError, decode_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if token is None:
        raise UnauthorizedError("Missing bearer token.")

    try:
        subject = decode_token(token, expected_type="access")
    except TokenPayloadError as exc:
        raise UnauthorizedError("Invalid or expired access token.") from exc

    user = await UserRepository(db).get_by_id(UUID(subject))
    if user is None or not user.is_active:
        raise UnauthorizedError("Account no longer available.")

    return user


CurrentUser = Depends(get_current_user)
DbSession = Depends(get_db)
