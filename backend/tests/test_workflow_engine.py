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


def test_workflow_engine_variable_substitution():
    workflow = {
        "nodes": [
            {
                "id": "n1",
                "type": "prompt",
                "config": {"system_prompt": "Hello {{name}}", "user_prompt": "Input: {input}"},
            }
        ],
        "edges": [],
        "input": "test",
        "variables": {"name": "World"},
    }

    def _mock_llm(prompt, model=None):
        return prompt

    # Patch call_llm
    import node_executors.prompt_node
    node_executors.prompt_node.call_llm = _mock_llm

    async def _null_broadcast(x):
        pass

    result = asyncio.run(execute_workflow(workflow, _null_broadcast))
    # The config passed to prompt executor should have substituted values
    # But the execute_workflow currently doesn't return the substituted config in result
    # We can check the node_outputs which contains the result of call_llm
    # In our mock, call_llm returns the prompt itself
    output = result["node_outputs"]["n1"]["output"]
    assert "Hello World" in output
