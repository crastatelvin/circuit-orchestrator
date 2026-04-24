# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

import json
import re
from typing import Any

from gemini_service import call_gemini


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    fields = config.get("fields", [])
    if fields:
        prompt = f"Extract JSON for fields: {', '.join(fields)}\n\n{input_data[:2500]}"
    else:
        prompt = f"Extract key entities and return JSON.\n\n{input_data[:2500]}"
    result = call_gemini(prompt)
    try:
        match = re.search(r"\{.*\}", result, re.DOTALL)
        parsed = json.loads(match.group(0)) if match else None
        if parsed is not None:
            return {"output": json.dumps(parsed, indent=2), "parsed": parsed, "node_type": "extract"}
    except Exception:
        pass
    return {"output": result, "node_type": "extract"}
