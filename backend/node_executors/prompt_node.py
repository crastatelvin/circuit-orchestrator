# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

from typing import Any

from gemini_service import call_gemini


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    system_prompt = config.get("system_prompt", "You are a helpful AI assistant.")
    user_prompt = config.get("user_prompt", "{input}")
    full_prompt = f"{system_prompt}\n\n{user_prompt.replace('{input}', input_data)}"
    return {"output": call_gemini(full_prompt), "node_type": "prompt"}
