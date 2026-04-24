import asyncio

from workflow_engine import execute_workflow


def test_workflow_engine_merges_inputs():
    workflow = {
        "nodes": [
            {"id": "n1", "type": "input", "label": "Input", "config": {}},
            {"id": "n2", "type": "output", "label": "Output", "config": {}},
        ],
        "edges": [{"id": "e1", "source": "n1", "target": "n2"}],
        "input": "merge-check",
    }

    events = []

    async def _broadcast(payload):
        events.append(payload["event"])

    result = asyncio.run(execute_workflow(workflow, _broadcast))
    assert result["success"] is True
    assert result["final_output"] == "merge-check"
    assert "node_start" in events
    assert "node_complete" in events
