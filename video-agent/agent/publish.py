"""Publish short-form video to TikTok, Instagram Reels, YouTube Shorts, and Reddit."""

from __future__ import annotations

import os
import re
import time
from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload


def _strip_hashtags_for_youtube_title(title: str) -> str:
    """YouTube title should stay clean; hashtags live in description."""
    return re.sub(r"#\w+", "", title).strip() or "JobFill"


def post_tiktok(video_path: str, caption: str) -> str:
    """
    TikTok: unofficial web upload via Playwright + saved login (storage state).

    1) Locally: log in at tiktok.com, then save storage:
       `python -m playwright codegen https://www.tiktok.com --save-storage=tiktok-state.json`
    2) Set TIKTOK_STORAGE_STATE_PATH=/path/to/tiktok-state.json on the worker.

    Set TIKTOK_SKIP=1 to return a sentinel URL without uploading (useful for dry runs).
    """
    if os.environ.get("TIKTOK_SKIP", "").strip().lower() in ("1", "true", "yes"):
        return "https://www.tiktok.com/upload?skipped=1"

    state_path = os.environ.get("TIKTOK_STORAGE_STATE_PATH", "").strip()
    if not state_path or not os.path.isfile(state_path):
        raise RuntimeError(
            "TikTok requires TIKTOK_STORAGE_STATE_PATH pointing to a Playwright "
            "storage_state JSON from an authenticated browser session. "
            "TikTokApi cannot upload videos; use Playwright or TikTok's official Content Posting API."
        )

    from playwright.sync_api import sync_playwright

    url = "https://www.tiktok.com/tiktokstudio/upload"
    final = url
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context(storage_state=state_path)
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=120_000)
            # File input for video
            page.set_input_files('input[type="file"]', video_path)
            # Wait for upload / transcode UI (times vary)
            page.wait_for_timeout(5000)
            box = page.locator(
                "div[contenteditable='true'], textarea, div.public-DraftEditor-content"
            ).first
            try:
                box.click(timeout=15_000)
                box.type(caption[:2100], delay=5)
            except Exception:
                pass
            publish = page.get_by_role("button", name=re.compile("post|publish", re.I))
            try:
                publish.first.click(timeout=30_000)
            except Exception:
                # Some locales use different labels; best-effort submit
                pass
            page.wait_for_timeout(15_000)
            final = page.url
        finally:
            browser.close()

    if "tiktokstudio" in final or "upload" in final:
        # Likely still on upload page — return studio link; operator can verify
        return final.split("?")[0]
    return final


def post_instagram(video_path: str, caption: str) -> str:
    """Instagram Reels via instagrapi."""
    if os.environ.get("INSTAGRAM_SKIP", "").strip().lower() in ("1", "true", "yes"):
        return "https://www.instagram.com/?skipped=1"

    from instagrapi import Client

    user = os.environ.get("INSTAGRAM_USERNAME", "").strip()
    password = os.environ.get("INSTAGRAM_PASSWORD", "").strip()
    if not user or not password:
        raise RuntimeError("INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD must be set")

    cl = Client()
    cl.login(user, password)
    media = cl.clip_upload(video_path, caption=caption)
    code = getattr(media, "code", None) or getattr(media, "pk", "")
    return f"https://www.instagram.com/reel/{code}/"


def post_youtube(video_path: str, title: str, description: str) -> str:
    """YouTube Shorts via YouTube Data API v3 (OAuth refresh token)."""
    if os.environ.get("YOUTUBE_SKIP", "").strip().lower() in ("1", "true", "yes"):
        return "https://www.youtube.com/upload?skipped=1"

    cid = os.environ.get("YOUTUBE_CLIENT_ID", "").strip()
    secret = os.environ.get("YOUTUBE_CLIENT_SECRET", "").strip()
    refresh = os.environ.get("YOUTUBE_REFRESH_TOKEN", "").strip()
    if not cid or not secret or not refresh:
        raise RuntimeError(
            "YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN must be set"
        )

    creds = Credentials(
        token=None,
        refresh_token=refresh,
        client_id=cid,
        client_secret=secret,
        token_uri="https://oauth2.googleapis.com/token",
    )

    youtube = build("youtube", "v3", credentials=creds, cache_discovery=False)
    body: dict[str, Any] = {
        "snippet": {
            "title": _strip_hashtags_for_youtube_title(title)[:100],
            "description": f"{description}\n\n#Shorts",
            "tags": [
                "jobsearch",
                "jobs",
                "career",
                "jobfill",
                "autoapply",
                "shorts",
            ],
            "categoryId": "28",
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response: dict[str, Any] = request.execute()
    vid = response.get("id", "")
    time.sleep(1)
    return f"https://www.youtube.com/shorts/{vid}"


def _reddit_client():
    import praw

    cid = os.environ.get("REDDIT_CLIENT_ID", "").strip()
    secret = os.environ.get("REDDIT_CLIENT_SECRET", "").strip()
    if not cid or not secret:
        raise RuntimeError("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set")

    ua = os.environ.get("REDDIT_USER_AGENT", "").strip()
    if not ua:
        uname = os.environ.get("REDDIT_USERNAME", "JobFillVideoAgent").strip()
        ua = f"JobFillVideoAgent/1.0 (marketing automation; contact: {uname})"

    refresh = os.environ.get("REDDIT_REFRESH_TOKEN", "").strip()
    if refresh:
        return praw.Reddit(
            client_id=cid,
            client_secret=secret,
            refresh_token=refresh,
            user_agent=ua,
        )

    user = os.environ.get("REDDIT_USERNAME", "").strip()
    password = os.environ.get("REDDIT_PASSWORD", "").strip()
    if not user or not password:
        raise RuntimeError(
            "Set REDDIT_REFRESH_TOKEN or both REDDIT_USERNAME and REDDIT_PASSWORD "
            "(script-type app at https://www.reddit.com/prefs/apps)"
        )
    return praw.Reddit(
        client_id=cid,
        client_secret=secret,
        username=user,
        password=password,
        user_agent=ua,
    )


def post_reddit(video_path: str, title: str, description: str) -> str:
    """Native Reddit video via PRAW (subreddit must allow video; account needs join rights)."""
    if os.environ.get("REDDIT_SKIP", "").strip().lower() in ("1", "true", "yes"):
        return "https://www.reddit.com/submit?skipped=1"

    raw = os.environ.get("REDDIT_SUBREDDIT", "").strip()
    sub_name = raw[2:].strip() if raw[:2].lower() == "r/" else raw
    if not sub_name:
        raise RuntimeError(
            "REDDIT_SUBREDDIT is required (e.g. yourcommunity — no r/ prefix needed)"
        )

    reddit = _reddit_client()
    subreddit = reddit.subreddit(sub_name)

    title_clean = _strip_hashtags_for_youtube_title(title)[:300] or "JobFill"
    body = (description or "").strip()[:40000] or None

    # Headless servers often break Reddit's upload websocket; without_websockets avoids that.
    submission = subreddit.submit_video(
        title=title_clean,
        video_path=video_path,
        selftext=body,
        send_replies=os.environ.get("REDDIT_SEND_REPLIES", "").strip().lower()
        in ("1", "true", "yes"),
        without_websockets=True,
        timeout=int(os.environ.get("REDDIT_UPLOAD_TIMEOUT", "600")),
    )
    if submission is not None:
        return f"https://www.reddit.com{submission.permalink}"

    me = reddit.user.me()
    if me is None:
        raise RuntimeError("Reddit auth failed: user.me() is None")
    for s in me.submissions.new(limit=5):
        if s.subreddit.display_name.lower() == sub_name.lower() and s.title == title_clean:
            return f"https://www.reddit.com{s.permalink}"
    latest = next(me.submissions.new(limit=1), None)
    if latest:
        return f"https://www.reddit.com{latest.permalink}"
    raise RuntimeError(
        "Reddit upload finished but permalink could not be resolved; check the subreddit manually."
    )
