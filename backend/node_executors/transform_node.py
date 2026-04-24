# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

from typing import Any

from gemini_service import call_gemini


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    transform_type = config.get("transform_type", "formal")
    custom_instruction = config.get("custom_instruction", "")
    instruction = custom_instruction or f"Rewrite as {transform_type.replace('_', ' ')}."
    return {"output": call_gemini(f"{instruction}\n\n{input_data[:3000]}"), "node_type": "transform"}
