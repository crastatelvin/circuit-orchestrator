# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

from typing import Any

from gemini_service import call_gemini


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    condition = config.get("condition", "")
    pass_through = config.get("pass_through", True)
    if not condition:
        return {"output": input_data, "passed": True, "node_type": "filter"}
    prompt = f"Condition: {condition}\nText: {input_data[:2000]}\nAnswer TRUE or FALSE only."
    passed = "TRUE" in call_gemini(prompt).upper()
    return {
        "output": input_data if (passed or pass_through) else "",
        "passed": passed,
        "status": "PASSED" if passed else "FILTERED",
        "node_type": "filter",
    }
