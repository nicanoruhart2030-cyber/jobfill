"""Supabase REST helpers (service role)."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

import requests


def _base_headers() -> dict[str, str]:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _rest_url(table: str) -> str:
    base = os.environ.get("SUPABASE_URL", "").rstrip("/")
    return f"{base}/rest/v1/{table}"


def insert_video(row: dict[str, Any]) -> dict[str, Any]:
    r = requests.post(_rest_url("videos"), headers=_base_headers(), json=row, timeout=60)
    r.raise_for_status()
    data = r.json()
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    return {}


def patch_video(video_id: str, fields: dict[str, Any]) -> None:
    url = _rest_url("videos")
    r = requests.patch(
        f"{url}?id=eq.{video_id}",
        headers=_base_headers(),
        json=fields,
        timeout=60,
    )
    r.raise_for_status()


def fetch_videos_since(iso_timestamp: str) -> list[dict[str, Any]]:
    url = _rest_url("videos")
    params = {
        "select": "*",
        "created_at": f"gte.{iso_timestamp}",
        "order": "created_at.desc",
    }
    r = requests.get(url, headers=_base_headers(), params=params, timeout=60)
    r.raise_for_status()
    data = r.json()
    return data if isinstance(data, list) else []


def fetch_videos_today_utc() -> list[dict[str, Any]]:
    start = datetime.now(timezone.utc).date().isoformat()
    return fetch_videos_since(f"{start}T00:00:00Z")


def load_agent_state(key: str, default: str = "0") -> str:
    """Fallback key/value in Supabase table agent_kv (optional)."""
    try:
        url = _rest_url("agent_kv")
        r = requests.get(
            f"{url}?key=eq.{key}&select=value&limit=1",
            headers=_base_headers(),
            timeout=30,
        )
        r.raise_for_status()
        rows = r.json()
        if isinstance(rows, list) and rows and rows[0].get("value") is not None:
            return str(rows[0]["value"])
    except Exception:
        pass
    return default


def save_agent_state(key: str, value: str) -> None:
    try:
        url = _rest_url("agent_kv")
        headers = _base_headers()
        headers["Prefer"] = "resolution=merge-duplicates"
        r = requests.post(
            url,
            headers=headers,
            json={"key": key, "value": value},
            timeout=30,
        )
        if r.status_code >= 400:
            # Table may not exist; ignore
            return
    except Exception:
        return
