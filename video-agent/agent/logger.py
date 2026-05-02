"""Supabase logging for the video pipeline."""

from __future__ import annotations

import json
import os
from typing import Any

from lib.supabase import insert_video


def log_video(
    angle: dict[str, Any],
    script: dict[str, Any],
    video_url: str,
    local_path: str,
    tiktok_url: str,
    instagram_url: str,
    youtube_url: str,
    reddit_url: str = "",
    *,
    status: str = "published",
    error: str | None = None,
) -> dict[str, Any]:
    """Insert a row into `videos`. Skips DB write if Supabase env is unset."""
    if not os.environ.get("SUPABASE_URL") or not os.environ.get("SUPABASE_SERVICE_ROLE_KEY"):
        return {}

    row = {
        "angle": str(angle.get("id", "unknown")),
        "script": json.dumps(script, ensure_ascii=False) if script else None,
        "video_url": video_url or None,
        "local_path": local_path or None,
        "tiktok_url": tiktok_url or None,
        "instagram_url": instagram_url or None,
        "youtube_url": youtube_url or None,
        "reddit_url": reddit_url or None,
        "status": status,
        "error": error,
    }
    try:
        return insert_video(row)
    except Exception:
        # Avoid crashing the agent if Supabase is misconfigured mid-run
        return {}
