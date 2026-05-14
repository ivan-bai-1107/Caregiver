from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings


@lru_cache
def get_redis_client() -> Redis | None:
    settings = get_settings()
    if not settings.redis_enabled:
        return None

    try:
        return Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=0.2,
            socket_timeout=0.2,
        )
    except (RedisError, ValueError):
        return None


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


def redis_incr(key: str) -> int | None:
    client = get_redis_client()
    if client is None:
        return None

    try:
        return int(client.incr(key))
    except RedisError:
        return None


def redis_expire(key: str, seconds: int) -> bool:
    client = get_redis_client()
    if client is None:
        return False

    try:
        return bool(client.expire(key, seconds))
    except RedisError:
        return False


def redis_ttl(key: str) -> int | None:
    client = get_redis_client()
    if client is None:
        return None

    try:
        return int(client.ttl(key))
    except RedisError:
        return None


def redis_get_int(key: str) -> int | None:
    value = redis_get(key)
    if value is None:
        return None

    try:
        return int(value)
    except ValueError:
        return None


def redis_set_json(key: str, seconds: int, value: object) -> bool:
    try:
        payload = json.dumps(value, ensure_ascii=False)
    except (TypeError, ValueError):
        return False

    return redis_setex(key, seconds, payload)


def redis_get_json(key: str) -> Any | None:
    value = redis_get(key)
    if value is None:
        return None

    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return None


def redis_delete_pattern(pattern: str) -> int:
    client = get_redis_client()
    if client is None:
        return 0

    deleted = 0
    try:
        for key in client.scan_iter(match=pattern, count=100):
            deleted += int(client.delete(key))
    except RedisError:
        return 0
    return deleted
