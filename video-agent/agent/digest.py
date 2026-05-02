"""Daily email digest via Resend."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from html import escape
from typing import Any

import requests

from lib.supabase import fetch_videos_since


def _resend_send(to: str, subject: str, html: str) -> None:
    key = os.environ.get("RESEND_API_KEY", "").strip()
    from_email = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev").strip()
    if not key:
        raise RuntimeError("RESEND_API_KEY is not set")

    r = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "from": from_email,
            "to": [to],
            "subject": subject,
            "html": html,
        },
        timeout=60,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Resend error {r.status_code}: {r.text}")


def _fmt_row(row: dict[str, Any]) -> str:
    angle = escape(str(row.get("angle", "")))
    status = escape(str(row.get("status", "")))
    err = row.get("error")
    err_html = f"<p style='color:#b00020'>{escape(str(err))}</p>" if err else ""
    links = [
        ("TikTok", row.get("tiktok_url")),
        ("Instagram", row.get("instagram_url")),
        ("YouTube", row.get("youtube_url")),
        ("Reddit", row.get("reddit_url")),
        ("Source video", row.get("video_url")),
    ]
    parts = [
        f"<h3 style='margin:12px 0 4px'>{angle}</h3>",
        f"<p style='margin:0'><b>Status:</b> {status}</p>",
        err_html,
        "<ul style='margin:8px 0'>",
    ]
    for label, url in links:
        if url:
            u = str(url)
            parts.append(f"<li><b>{escape(label)}:</b> <a href=\"{escape(u, quote=True)}\">{escape(u)}</a></li>")
    parts.append("</ul>")
    views = (
        f"<p style='margin:0;font-size:13px;color:#444'>"
        f"Views — TikTok: {row.get('tiktok_views', 0)}, "
        f"IG: {row.get('instagram_views', 0)}, "
        f"YT: {row.get('youtube_views', 0)}, "
        f"Reddit: {row.get('reddit_views', 0)}"
        f"</p>"
    )
    parts.append(views)
    return "".join(parts)


def send_digest() -> None:
    to = os.environ.get("NOTIFY_EMAIL", "").strip()
    if not to:
        return

    since = (datetime.now(timezone.utc) - timedelta(hours=26)).isoformat()
    rows: list[dict[str, Any]] = []
    try:
        rows = fetch_videos_since(since)
    except Exception:
        rows = []

    if not rows:
        html = "<p>No JobFill video runs logged in Supabase for the last ~26 hours.</p>"
    else:
        blocks = [_fmt_row(r) for r in rows]
        html = "<div style='font-family:system-ui,sans-serif'>" + "".join(blocks) + "</div>"

    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    _resend_send(to, f"JobFill video agent — daily digest {day}", html)


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    send_digest()
    print("digest sent")
