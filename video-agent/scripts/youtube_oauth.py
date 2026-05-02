#!/usr/bin/env python3
"""One-shot OAuth to obtain YOUTUBE_REFRESH_TOKEN (YouTube Data API v3, upload scope)."""

from __future__ import annotations

import os
import json
import sys
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    client_path = os.environ.get("YOUTUBE_CLIENT_SECRET_FILE", "").strip()
    if not client_path:
        # Default: Google Cloud "Desktop app" OAuth client JSON downloaded as client_secret.json
        candidate = ROOT / "client_secret.json"
        client_path = str(candidate) if candidate.is_file() else ""

    if not client_path or not Path(client_path).is_file():
        print(
            "Set YOUTUBE_CLIENT_SECRET_FILE to your downloaded OAuth client JSON "
            "(Desktop app), or place client_secret.json in the project root.",
            file=sys.stderr,
        )
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(client_path, SCOPES)
    creds = flow.run_local_server(port=8080, prompt="consent", access_type="offline")
    refresh = creds.refresh_token
    if not refresh:
        print("No refresh_token returned — revoke app access in Google Account and retry.", file=sys.stderr)
        sys.exit(1)
    print(json.dumps({"refresh_token": refresh}, indent=2))
    print("\nAdd to .env:\nYOUTUBE_REFRESH_TOKEN=" + refresh)


if __name__ == "__main__":
    main()
