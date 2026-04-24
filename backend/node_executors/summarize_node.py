# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

from typing import Any

from gemini_service import call_gemini


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    length = config.get("length", "medium")
    length_map = {"short": "2-3 sentences", "medium": "1 paragraph", "long": "3-4 paragraphs"}
    prompt = f"Summarize in {length_map.get(length, '1 paragraph')}:\n\n{input_data[:4000]}"
    return {"output": call_gemini(prompt), "node_type": "summarize"}
