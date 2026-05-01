# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

from typing import Any

from groq_service import call_llm


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    lang = config.get("target_language", "Spanish")
    model = config.get("model", "llama-3.1-8b-instant")
    prompt = f"Translate to {lang}. Return only translation.\n\n{input_data[:3000]}"
    return {"output": call_llm(prompt, model=model), "target": lang, "node_type": "translate"}
