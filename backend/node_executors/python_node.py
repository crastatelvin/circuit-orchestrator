# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

from typing import Any


def execute(input_data: str, config: dict[str, Any]) -> dict[str, Any]:
    """
    Executes a custom Python script.
    The script has access to 'input_data' and should set 'output'.
    """
    script = config.get("script", "output = input_data")
    
    # Context for execution
    ctx = {"input_data": input_data, "output": ""}
    
    try:
        # We use a restricted set of globals if needed, but for now we'll be permissive
        # for a "power user" feature.
        exec(script, {}, ctx)
        return {"output": str(ctx.get("output", "")), "node_type": "python"}
    except Exception as exc:
        return {"output": f"[Python Error] {str(exc)}", "error": True, "node_type": "python"}
