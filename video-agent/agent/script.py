"""Thin wrapper around Kimi script generation."""

from __future__ import annotations

from typing import Any

from lib.kimi import generate_script as _generate_script


def generate_script(angle: dict[str, Any]) -> dict[str, Any]:
    return _generate_script(angle)
