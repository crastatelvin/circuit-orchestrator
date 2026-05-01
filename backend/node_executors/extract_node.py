# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

import json
import re
from typing import Any

from groq_service import call_llm


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    fields = config.get("fields", [])
    if fields:
        prompt = f"Extract JSON for fields: {', '.join(fields)}\n\n{input_data[:2500]}"
    else:
        prompt = f"Extract key entities and return JSON.\n\n{input_data[:2500]}"
    model = config.get("model", "llama-3.1-8b-instant")
    result = call_llm(prompt, model=model)
    try:
        match = re.search(r"\{.*\}", result, re.DOTALL)
        parsed = json.loads(match.group(0)) if match else None
        if parsed is not None:
            return {"output": json.dumps(parsed, indent=2), "parsed": parsed, "node_type": "extract"}
    except Exception:
        pass
    return {"output": result, "node_type": "extract"}
