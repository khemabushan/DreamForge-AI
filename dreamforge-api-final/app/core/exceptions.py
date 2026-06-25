from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base class for application-level errors that should map to clean HTTP responses."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    error_type: str = "about:blank"
    title: str = "Application error"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.title
        super().__init__(self.detail)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    error_type = "not-found"
    title = "Resource not found"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    error_type = "conflict"
    title = "Resource conflict"


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_type = "unauthorized"
    title = "Authentication required"


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    error_type = "forbidden"
    title = "Not allowed"


class ValidationAppError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_type = "validation-error"
    title = "Validation failed"


class PipelineStageError(AppError):
    status_code = status.HTTP_502_BAD_GATEWAY
    error_type = "pipeline-stage-error"
    title = "AI pipeline stage failed"


def _problem_response(status_code: int, error_type: str, title: str, detail: str, instance: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "type": error_type,
            "title": title,
            "status": status_code,
            "detail": detail,
            "instance": instance,
        },
        media_type="application/problem+json",
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return _problem_response(
            status_code=exc.status_code,
            error_type=exc.error_type,
            title=exc.title,
            detail=exc.detail,
            instance=str(request.url),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return _problem_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type="internal-server-error",
            title="Internal server error",
            detail="An unexpected error occurred. Please try again.",
            instance=str(request.url),
        )
