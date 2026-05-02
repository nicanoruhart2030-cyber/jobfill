"""Kimi K2.6 via Moonshot OpenAI-compatible API."""

from __future__ import annotations

import json
import os
import re
from typing import Any

from openai import OpenAI


def _client() -> OpenAI:
    key = os.environ.get("MOONSHOT_API_KEY", "").strip()
    if not key:
        raise RuntimeError("MOONSHOT_API_KEY is not set")
    return OpenAI(api_key=key, base_url="https://api.moonshot.ai/v1")


def _parse_script_json(content: str) -> dict[str, Any]:
    content = content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{[\s\S]*\}", content)
    if not match:
        return {}
    try:
        return json.loads(match.group())
    except json.JSONDecodeError:
        return {}


def generate_script(angle: dict[str, Any]) -> dict[str, Any]:
    client = _client()
    response = client.chat.completions.create(
        model="kimi-k2.6",
        max_tokens=400,
        temperature=0.8,
        messages=[
            {
                "role": "system",
                "content": """You write short-form video scripts for TikTok and Instagram Reels.
Rules:
- Hook in first 2 seconds — bold, direct claim
- No fluff, no "hey guys", no "don't forget to like"
- Gen Z tone — dry, confident, direct
- Max 80 words for a 15s video, 120 words for 20s
- End with a natural CTA, not a command
- Output JSON only: { "hook": str, "body": str, "cta": str, "captions": [str] }
  captions = list of 4-6 short caption lines for on-screen text""",
            },
            {
                "role": "user",
                "content": f"""Write a script for this video:
Angle: {angle["title"]}
Hook: {angle["hook"]}
Concept: {angle["concept"]}
Duration: {angle["duration"]} seconds
CTA url: {angle["cta"]}""",
            },
        ],
    )
    message = response.choices[0].message.content
    if not message:
        return {}
    parsed = _parse_script_json(message)
    if not parsed.get("captions"):
        body = str(parsed.get("body", "")).strip()
        parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", body) if p.strip()]
        parsed["captions"] = (parts[:6] if parts else [str(parsed.get("hook", ""))])[:6]
    return parsed


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    _demo: dict[str, Any] = {
        "id": "swipe_demo",
        "title": "POV: job applications in 2026",
        "hook": "I applied to 47 jobs in one morning.",
        "concept": "Screen recording style — JobFill UI, fast swipes.",
        "duration": 15,
        "aspect": "9:16",
        "cta": "jobfill.vercel.app",
    }
    print(json.dumps(generate_script(_demo), indent=2))
