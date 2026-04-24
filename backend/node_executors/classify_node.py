# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

from typing import Any

from gemini_service import call_gemini


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    categories = config.get("categories", ["positive", "negative", "neutral"])
    prompt = f"Choose one category from {', '.join(categories)}:\n\n{input_data[:2500]}"
    result = call_gemini(prompt).strip()
    chosen = next((c for c in categories if c.lower() in result.lower()), categories[0])
    return {"output": chosen, "categories_detected": [chosen], "node_type": "classify"}
