# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from __future__ import annotations

import asyncio
from collections import deque
from datetime import datetime, timezone
from typing import Any

from node_executors import NODE_EXECUTORS


def _topological_layers(nodes: dict[str, Any], edges: list[dict[str, str]]) -> list[str]:
    incoming: dict[str, int] = {node_id: 0 for node_id in nodes}
    outgoing: dict[str, list[str]] = {node_id: [] for node_id in nodes}
    for edge in edges:
        src, tgt = edge["source"], edge["target"]
        if src in nodes and tgt in nodes:
            outgoing[src].append(tgt)
            incoming[tgt] += 1

    queue = deque([node_id for node_id, degree in incoming.items() if degree == 0])
    ordered: list[str] = []
    while queue:
        current = queue.popleft()
        ordered.append(current)
        for neighbor in outgoing[current]:
            incoming[neighbor] -= 1
            if incoming[neighbor] == 0:
                queue.append(neighbor)

    return ordered if len(ordered) == len(nodes) else list(nodes.keys())


def _merge_inputs(predecessor_ids: list[str], outputs: dict[str, dict[str, Any]], fallback: str) -> str:
    if not predecessor_ids:
        return fallback
    values = [outputs.get(pid, {}).get("output", "").strip() for pid in predecessor_ids]
    joined = "\n\n".join([value for value in values if value])
    return joined or fallback


async def execute_workflow(workflow: dict[str, Any], broadcast_fn) -> dict[str, Any]:
    nodes = {node["id"]: node for node in workflow.get("nodes", [])}
    edges = workflow.get("edges", [])
    input_text = workflow.get("input", "")
    execution_order = _topological_layers(nodes, edges)

    node_outputs: dict[str, dict[str, Any]] = {}
    execution_log: list[dict[str, Any]] = []

    for node_id in execution_order:
        node = nodes[node_id]
        node_type = node["type"]
        predecessors = [e["source"] for e in edges if e["target"] == node_id]
        current_input = _merge_inputs(predecessors, node_outputs, input_text)

        await broadcast_fn(
            {
                "event": "node_start",
                "node_id": node_id,
                "node_type": node_type,
                "message": f"Executing {node_type}: {node.get('label', node_id)}",
            }
        )
        await asyncio.sleep(0.2)

        if node_type == "input":
            result = {"output": current_input, "node_type": "input"}
        elif node_type == "output":
            result = {"output": current_input, "node_type": "output"}
        elif node_type in NODE_EXECUTORS:
            try:
                result = NODE_EXECUTORS[node_type](current_input, node.get("config", {}))
            except Exception as exc:  # noqa: BLE001
                result = {"output": f"[ERROR] {str(exc)[:200]}", "error": True, "node_type": node_type}
        else:
            result = {"output": current_input, "node_type": node_type}

        node_outputs[node_id] = result
        entry = {
            "node_id": node_id,
            "node_type": node_type,
            "label": node.get("label", node_type),
            "output_preview": result.get("output", "")[:150],
            "success": not result.get("error"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": f"{node.get('label', node_type)} complete",
        }
        execution_log.append(entry)
        await broadcast_fn({"event": "node_complete", **entry})

    output_nodes = [node for node in nodes.values() if node["type"] == "output"]
    final_output = ""
    if output_nodes:
        final_output = node_outputs.get(output_nodes[0]["id"], {}).get("output", "")
    elif execution_order:
        final_output = node_outputs.get(execution_order[-1], {}).get("output", "")

    return {
        "final_output": final_output,
        "node_outputs": node_outputs,
        "execution_log": execution_log,
        "nodes_executed": len(execution_order),
        "success": True,
    }
