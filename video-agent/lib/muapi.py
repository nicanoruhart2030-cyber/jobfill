"""MuAPI.ai — HappyHorse 1.0 primary, Seedance 2.0 fallback."""

from __future__ import annotations

import os
import time
from typing import Any

import requests

MUAPI_BASE = "https://api.muapi.ai/api/v1"


def _headers() -> dict[str, str]:
    key = os.environ.get("MUAPI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("MUAPI_API_KEY is not set")
    return {"x-api-key": key, "Content-Type": "application/json"}


def _clamp_happyhorse_duration(seconds: int) -> int:
    return max(4, min(15, int(seconds)))


def _clamp_seedance_duration(seconds: int) -> int:
    s = int(seconds)
    if s <= 5:
        return 5
    if s <= 10:
        return 10
    return 15


def _poll_result(request_id: str, max_attempts: int = 120, sleep_s: int = 5) -> dict[str, Any]:
    url = f"{MUAPI_BASE}/predictions/{request_id}/result"
    last: dict[str, Any] = {}
    for _ in range(max_attempts):
        resp = requests.get(url, headers=_headers(), timeout=120)
        resp.raise_for_status()
        last = resp.json()
        status = (last.get("status") or "").lower()
        if status in ("completed", "succeeded"):
            return last
        if status in ("failed", "error", "cancelled", "canceled"):
            raise RuntimeError(f"MuAPI job failed: {last}")
        time.sleep(sleep_s)
    raise TimeoutError(f"Video generation timed out: {request_id} last={last}")


def _output_url(result: dict[str, Any]) -> str:
    outputs = result.get("outputs") or []
    if not outputs:
        raise RuntimeError(f"No outputs in result: {result}")
    url = outputs[0]
    if not isinstance(url, str) or not url.startswith("http"):
        raise RuntimeError(f"Unexpected output: {outputs[0]!r}")
    return url


def generate_video_happyhorse(
    prompt: str,
    aspect: str = "9:16",
    duration: int = 15,
) -> str:
    duration = _clamp_happyhorse_duration(duration)
    endpoint = f"{MUAPI_BASE}/happy-horse-1-text-to-video-1080p"
    body = {
        "prompt": prompt,
        "aspect_ratio": aspect,
        "duration": duration,
    }
    r = requests.post(endpoint, headers=_headers(), json=body, timeout=120)
    r.raise_for_status()
    data = r.json()
    request_id = data.get("request_id")
    if not request_id:
        raise RuntimeError(f"No request_id in response: {data}")
    result = _poll_result(request_id, max_attempts=90, sleep_s=5)
    return _output_url(result)


def generate_video_seedance(
    prompt: str,
    aspect: str = "9:16",
    duration: int = 15,
) -> str:
    duration = _clamp_seedance_duration(duration)
    endpoint = f"{MUAPI_BASE}/seedance-v2.0-t2v"
    body = {
        "prompt": prompt,
        "aspect_ratio": aspect,
        "duration": duration,
        "quality": "high",
    }
    r = requests.post(endpoint, headers=_headers(), json=body, timeout=120)
    r.raise_for_status()
    data = r.json()
    request_id = data.get("request_id")
    if not request_id:
        raise RuntimeError(f"No request_id in response: {data}")
    result = _poll_result(request_id, max_attempts=120, sleep_s=5)
    return _output_url(result)


def generate_video(
    prompt: str,
    aspect: str = "9:16",
    duration: int = 15,
) -> str:
    """Returns HTTPS URL of generated video (HappyHorse; Seedance if HappyHorse errors or times out)."""
    try:
        return generate_video_happyhorse(prompt, aspect=aspect, duration=duration)
    except Exception:
        # 403 closed beta, polling failure, or transient API errors → fallback model
        return generate_video_seedance(prompt, aspect=aspect, duration=duration)


def build_video_prompt(angle: dict[str, Any], script: dict[str, Any]) -> str:
    """Converts angle + script into a MuAPI video prompt."""
    hook = script.get("hook", "") if isinstance(script, dict) else ""
    concept = angle.get("concept", "")
    return f"""{concept}

Style: cinematic, phone screen recording aesthetic, dark background, teal accent colors matching JobFill brand (#00E5A0).
Text overlays: white bold sans-serif on dark background.
Aspect ratio: 9:16 vertical for TikTok and Reels.
Motion: smooth, professional, no jarring cuts.
Hook moment at 0-2 seconds: {hook}
No faces. No people. UI-focused screen recording style.
End frame: jobfill.vercel.app URL centered on screen."""


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    test_prompt = (
        "Cinematic vertical phone UI mockup, dark mode job application dashboard, "
        "teal accents, smooth subtle motion, no people, high contrast, 9:16."
    )
    url = generate_video(test_prompt, aspect="9:16", duration=8)
    print(url)
