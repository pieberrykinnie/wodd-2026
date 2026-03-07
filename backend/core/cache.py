import time
from typing import Any

_store: dict[str, tuple[float, Any]] = {}


def get(key: str, ttl: float = 3600.0) -> Any | None:
    if key in _store:
        timestamp, data = _store[key]
        if time.time() - timestamp < ttl:
            return data
        del _store[key]
    return None


def set(key: str, data: Any) -> None:
    _store[key] = (time.time(), data)


def clear() -> None:
    _store.clear()
