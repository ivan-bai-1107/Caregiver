from __future__ import annotations

from functools import lru_cache

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings


@lru_cache
def get_redis_client() -> Redis | None:
    settings = get_settings()
    if not settings.redis_enabled:
        return None

    return Redis.from_url(
        settings.redis_url,
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )


def redis_is_available() -> bool:
    client = get_redis_client()
    if client is None:
        return False

    try:
        return bool(client.ping())
    except RedisError:
        return False


def redis_get(key: str) -> str | None:
    client = get_redis_client()
    if client is None:
        return None

    try:
        value = client.get(key)
    except RedisError:
        return None
    return value if isinstance(value, str) else None


def redis_setex(key: str, seconds: int, value: str) -> bool:
    client = get_redis_client()
    if client is None:
        return False

    try:
        return bool(client.setex(key, seconds, value))
    except RedisError:
        return False


def redis_delete(key: str) -> bool:
    client = get_redis_client()
    if client is None:
        return False

    try:
        return bool(client.delete(key))
    except RedisError:
        return False
