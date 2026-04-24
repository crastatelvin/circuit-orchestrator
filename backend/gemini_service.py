# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=_api_key) if _api_key else None


def call_gemini(prompt: str, model: str = "gemini-1.5-flash") -> str:
    if not client:
        return "[ERROR] GEMINI_API_KEY is not configured."
    try:
        response = client.models.generate_content(model=model, contents=prompt)
        return (response.text or "").strip()
    except Exception as exc:  # noqa: BLE001
        return f"[ERROR] {str(exc)[:200]}"
