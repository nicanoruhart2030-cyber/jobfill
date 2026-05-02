"""Burn caption lines onto video with MoviePy."""

from __future__ import annotations

import os
import shutil
from typing import Sequence

from moviepy.editor import CompositeVideoClip, TextClip, VideoFileClip


def burn_captions(
    video_path: str,
    captions: Sequence[str],
    output_path: str,
    *,
    fontsize: int = 52,
) -> str:
    """Overlay captions across the timeline (equal time per line). Returns output_path."""
    lines = [str(c).strip() for c in captions if str(c).strip()]
    if not lines:
        shutil.copy2(os.path.abspath(video_path), output_path)
        return output_path

    video = VideoFileClip(video_path)
    try:
        duration = float(video.duration or 0) or 1.0
        clip_duration = duration / len(lines)
        text_clips = []
        # Syne is rarely installed on servers; Helvetica-Bold is ImageMagick-standard
        font = os.environ.get("CAPTION_FONT", "Helvetica-Bold")
        for i, caption in enumerate(lines):
            txt = TextClip(
                caption,
                fontsize=fontsize,
                font=font,
                color="white",
                stroke_color="black",
                stroke_width=2,
                method="caption",
                size=(max(int(video.w) - 80, 320), None),
            ).set_start(i * clip_duration).set_duration(clip_duration).set_position(
                ("center", 0.72), relative=True
            )
            text_clips.append(txt)

        final = CompositeVideoClip([video] + text_clips)
        final.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=30,
            threads=4,
            logger=None,
        )
    finally:
        video.close()

    return output_path
