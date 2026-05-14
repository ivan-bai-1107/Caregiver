from typing import Annotated
import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.redis import redis_expire, redis_incr
from app.core.responses import success_response
from app.core.responses import serialize_payload
from app.models.user import User
from app.schemas.ai import AiAssistantRequest
from app.services.ai_service import handle_assistant_message

router = APIRouter(prefix="/ai", tags=["ai"])

AI_MINUTE_LIMIT = 10
AI_DAY_LIMIT = 200


def increment_ai_counter(key: str, seconds: int) -> int | None:
    count = redis_incr(key)
    if count == 1:
        redis_expire(key, seconds)
    return count


def ensure_ai_rate_limit(user_id: str) -> None:
    minute_count = increment_ai_counter(f"rate:ai:user:{user_id}:minute", 60)
    if minute_count is not None and minute_count > AI_MINUTE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI 调用过于频繁，请稍后再试。",
        )

    day_count = increment_ai_counter(f"rate:ai:user:{user_id}:day", 60 * 60 * 24)
    if day_count is not None and day_count > AI_DAY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI 调用过于频繁，请稍后再试。",
        )


@router.post("/assistant")
def assistant(
    payload: AiAssistantRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    ensure_ai_rate_limit(current_user.id)
    return success_response(handle_assistant_message(db, current_user, payload))


def sse_payload(event_type: str, data: object) -> str:
    return f"data: {json.dumps({'type': event_type, 'data': data}, ensure_ascii=False)}\n\n"


@router.post("/assistant/stream")
def assistant_stream(
    payload: AiAssistantRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> StreamingResponse:
    ensure_ai_rate_limit(current_user.id)
    response = handle_assistant_message(db, current_user, payload)

    def event_stream():
        text = response.answer_text
        chunk_size = 12
        yield sse_payload("start", {"conversationId": response.conversation_id})
        for index in range(0, len(text), chunk_size):
            yield sse_payload("delta", text[index:index + chunk_size])
        yield sse_payload("done", serialize_payload(response))

    return StreamingResponse(event_stream(), media_type="text/event-stream")
