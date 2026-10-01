"""Login rate limiting.

Counts FAILED login attempts in fixed windows, per identifier (username/email)
and per client IP. Uses Redis when REDIS_URL is set, otherwise falls back to a
process-local in-memory store (fine for local dev, resets on restart).
"""
import logging
import os
import threading
import time

logger = logging.getLogger(__name__)

LOGIN_MAX_ATTEMPTS_PER_ID = int(os.getenv("LOGIN_MAX_ATTEMPTS_PER_ID", "5"))
LOGIN_MAX_ATTEMPTS_PER_IP = int(os.getenv("LOGIN_MAX_ATTEMPTS_PER_IP", "20"))
LOGIN_WINDOW_SECONDS = int(os.getenv("LOGIN_WINDOW_SECONDS", "900"))  # 15 min


class _MemoryStore:
    def __init__(self):
        self._data = {}  # key -> (count, expires_at)
        self._lock = threading.Lock()

    def _live(self, key):
        item = self._data.get(key)
        if item and item[1] > time.time():
            return item
        self._data.pop(key, None)
        return None

    def get(self, key):
        with self._lock:
            item = self._live(key)
            return item[0] if item else 0

    def incr(self, key, window):
        with self._lock:
            item = self._live(key)
            if item:
                self._data[key] = (item[0] + 1, item[1])
            else:
                self._data[key] = (1, time.time() + window)

    def ttl(self, key):
        with self._lock:
            item = self._live(key)
            return max(1, int(item[1] - time.time())) if item else 0

    def delete(self, key):
        with self._lock:
            self._data.pop(key, None)


class _RedisStore:
    def __init__(self, url):
        import redis
        self._r = redis.Redis.from_url(url, decode_responses=True, socket_timeout=2)

    def get(self, key):
        return int(self._r.get(key) or 0)

    def incr(self, key, window):
        pipe = self._r.pipeline()
        pipe.incr(key)
        pipe.expire(key, window, nx=True)  # only set TTL when key has none -> fixed window
        pipe.execute()

    def ttl(self, key):
        return max(1, self._r.ttl(key))

    def delete(self, key):
        self._r.delete(key)


def _build_store():
    url = os.getenv("REDIS_URL")
    if url:
        try:
            store = _RedisStore(url)
            store._r.ping()
            logger.info("Login rate limiter: using Redis")
            return store
        except Exception as exc:
            logger.warning("Redis unavailable (%s); using in-memory rate limiter", exc)
    else:
        logger.warning("REDIS_URL not set; login rate limiter is in-memory (resets on restart)")
    return _MemoryStore()


_store = _build_store()


def _id_key(identifier: str) -> str:
    return f"rl:login:id:{identifier.strip().lower()}"


def _ip_key(ip: str) -> str:
    return f"rl:login:ip:{ip}"


def check_login_allowed(identifier: str, ip: str):
    """Return 0 if the attempt may proceed, else seconds until retry is allowed."""
    try:
        retry = 0
        if _store.get(_id_key(identifier)) >= LOGIN_MAX_ATTEMPTS_PER_ID:
            retry = max(retry, _store.ttl(_id_key(identifier)))
        if _store.get(_ip_key(ip)) >= LOGIN_MAX_ATTEMPTS_PER_IP:
            retry = max(retry, _store.ttl(_ip_key(ip)))
        return retry
    except Exception as exc:  # fail open: a Redis outage must not lock everyone out
        logger.error("Rate limiter check failed: %s", exc)
        return 0


def record_failed_login(identifier: str, ip: str):
    try:
        _store.incr(_id_key(identifier), LOGIN_WINDOW_SECONDS)
        _store.incr(_ip_key(ip), LOGIN_WINDOW_SECONDS)
    except Exception as exc:
        logger.error("Rate limiter record failed: %s", exc)


def reset_login_attempts(identifier: str):
    """Clear the per-identifier counter (the per-IP counter is left alone)."""
    try:
        _store.delete(_id_key(identifier))
    except Exception as exc:
        logger.error("Rate limiter reset failed: %s", exc)
