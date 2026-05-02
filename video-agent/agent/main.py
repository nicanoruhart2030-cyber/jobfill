"""Scheduler: daily JobFill short-form video pipeline."""

from __future__ import annotations

import os
import sys
import time
import traceback
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
import schedule
from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parent.parent
_AGENT = Path(__file__).resolve().parent
sys.path.insert(0, str(_ROOT))
sys.path.insert(0, str(_AGENT))

from caption import burn_captions  # noqa: E402
from digest import send_digest  # noqa: E402
from generate import build_video_prompt, generate_video  # noqa: E402
from logger import log_video  # noqa: E402
from models import CAPTION_TEMPLATES, VIDEO_ANGLES  # noqa: E402
from publish import post_instagram, post_reddit, post_tiktok, post_youtube  # noqa: E402
from script import generate_script  # noqa: E402


def _angle_for_today() -> dict:
    """Pick a template per calendar day in America/New_York (stable across restarts)."""
    tz = ZoneInfo(os.environ.get("TZ", "America/New_York"))
    now = datetime.now(tz)
    idx = now.toordinal() % len(VIDEO_ANGLES)
    return VIDEO_ANGLES[idx]


def run_daily() -> None:
    angle = _angle_for_today()
    print(f"[JobFill] angle={angle['id']} at {datetime.now().isoformat()}")
    local_path = ""
    captioned_path = ""

    try:
        script = generate_script(angle)
        print(f"[JobFill] hook={script.get('hook', '')!r}")

        prompt = build_video_prompt(angle, script)
        video_url = generate_video(
            prompt,
            aspect=str(angle.get("aspect", "9:16")),
            duration=int(angle.get("duration", 15)),
        )
        print(f"[JobFill] video_url={video_url}")

        stem = f"jobfill_{angle['id']}_{int(time.time())}"
        local_path = str(Path(os.environ.get("TEMP_DIR", "/tmp")) / f"{stem}.mp4")
        Path(local_path).parent.mkdir(parents=True, exist_ok=True)

        r = requests.get(video_url, timeout=300)
        r.raise_for_status()
        with open(local_path, "wb") as f:
            f.write(r.content)

        caps = script.get("captions") if isinstance(script.get("captions"), list) else []
        captioned_path = str(Path(local_path).with_name(f"{Path(local_path).stem}_captioned.mp4"))
        burn_captions(local_path, caps, captioned_path)

        caption = CAPTION_TEMPLATES.get(
            angle["id"],
            f"{angle.get('hook', '')}\n\njobfill.vercel.app\n\n#jobsearch #jobs",
        )

        tiktok_url = post_tiktok(captioned_path, caption)
        ig_url = post_instagram(captioned_path, caption)
        yt_url = post_youtube(captioned_path, angle["title"], caption)
        reddit_url = post_reddit(captioned_path, angle["title"], caption)

        log_video(
            angle,
            script,
            video_url,
            local_path,
            tiktok_url,
            ig_url,
            yt_url,
            reddit_url,
            status="published",
        )
        print(f"[JobFill] done tiktok={tiktok_url} ig={ig_url} yt={yt_url} reddit={reddit_url}")

    except Exception as e:
        err = f"{e}\n{traceback.format_exc()}"
        print(f"[JobFill] ERROR {err}")
        log_video(
            angle,
            {},
            "",
            local_path or "",
            "",
            "",
            "",
            "",
            status="failed",
            error=str(e),
        )
    finally:
        for p in (local_path, captioned_path):
            if p and os.path.isfile(p):
                try:
                    os.remove(p)
                except OSError:
                    pass


def main() -> None:
    load_dotenv()

    # Respect server TZ (Railway: TZ=America/New_York)
    schedule.every().day.at("09:00").do(run_daily)
    schedule.every().day.at("09:30").do(send_digest)

    if os.environ.get("RUN_STARTUP_JOB", "1").strip() in ("1", "true", "yes"):
        run_daily()

    print("[JobFill] scheduler running (09:00 run_daily, 09:30 digest). Ctrl+C to exit.")
    while True:
        schedule.run_pending()
        time.sleep(30)


if __name__ == "__main__":
    main()
