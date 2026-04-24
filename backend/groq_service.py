# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=_api_key) if _api_key else None


def call_llm(prompt: str, model: str = "llama-3.1-8b-instant") -> str:
    if not client:
        return "[ERROR] GROQ_API_KEY is not configured."
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return (completion.choices[0].message.content or "").strip()
    except Exception as exc:  # noqa: BLE001
        return f"[ERROR] {str(exc)[:200]}"
