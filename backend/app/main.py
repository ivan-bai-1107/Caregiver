from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import admin, ai, auth, care, community, home, knowledge, patients, records, tasks, trends, users
from app.core.config import get_settings
from app.core.redis import redis_is_available

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "请求失败，请稍后重试。"
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": message},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    first_error = exc.errors()[0] if exc.errors() else {}
    message = first_error.get("msg", "请求参数不正确。")
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": str(message), "errors": exc.errors()},
    )


@app.get("/health")
def health_check() -> dict[str, object]:
    return {"success": True, "data": {"status": "ok", "redis": "ok" if redis_is_available() else "unavailable"}}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(home.router, prefix=settings.api_prefix)
app.include_router(care.router, prefix=settings.api_prefix)
app.include_router(community.router, prefix=settings.api_prefix)
app.include_router(knowledge.router, prefix=settings.api_prefix)
app.include_router(patients.router, prefix=settings.api_prefix)
app.include_router(records.router, prefix=settings.api_prefix)
app.include_router(tasks.router, prefix=settings.api_prefix)
app.include_router(trends.router, prefix=settings.api_prefix)
app.include_router(ai.router, prefix=settings.api_prefix)
