from __future__ import annotations

import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from workflow_engine import execute_workflow

app = FastAPI(title="CIRCUIT - AI Workflow Orchestrator")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

connections: list[WebSocket] = []
execution_store: dict[str, dict] = {}


async def broadcast(data: dict) -> None:
    for socket in connections[:]:
        try:
            await socket.send_text(json.dumps(data))
        except Exception:  # noqa: BLE001
            if socket in connections:
                connections.remove(socket)


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connections:
            connections.remove(websocket)


@app.get("/")
def root() -> dict:
    return {"status": "CIRCUIT ONLINE", "version": "1.0", "license": "MIT"}


@app.get("/node-types")
def get_node_types() -> JSONResponse:
    return JSONResponse(
        [
            {"type": "input", "label": "Input", "icon": "⬡", "color": "#0984e3"},
            {"type": "prompt", "label": "AI Prompt", "icon": "🧠", "color": "#00b894"},
            {"type": "summarize", "label": "Summarize", "icon": "📋", "color": "#00cec9"},
            {"type": "translate", "label": "Translate", "icon": "🌐", "color": "#fdcb6e"},
            {"type": "classify", "label": "Classify", "icon": "🏷️", "color": "#a29bfe"},
            {"type": "extract", "label": "Extract", "icon": "🔍", "color": "#fd79a8"},
            {"type": "transform", "label": "Transform", "icon": "⚙️", "color": "#74b9ff"},
            {"type": "filter", "label": "Filter", "icon": "🔽", "color": "#e17055"},
            {"type": "output", "label": "Output", "icon": "📤", "color": "#55efc4"},
        ]
    )


@app.post("/execute")
async def execute(body: dict) -> JSONResponse:
    workflow = body.get("workflow", {})
    if not workflow.get("nodes"):
        return JSONResponse(status_code=400, content={"error": "Workflow has no nodes"})
    await broadcast({"event": "workflow_start", "message": "Workflow execution started"})
    try:
        result = await execute_workflow(workflow, broadcast)
        execution_store["latest"] = result
        await broadcast({"event": "workflow_complete", "message": "Workflow complete"})
        return JSONResponse(result)
    except Exception as exc:  # noqa: BLE001
        await broadcast({"event": "workflow_error", "message": str(exc)[:200]})
        return JSONResponse(status_code=500, content={"error": str(exc)})


@app.get("/latest")
def latest() -> JSONResponse:
    if "latest" not in execution_store:
        return JSONResponse(status_code=404, content={"error": "No execution available"})
    return JSONResponse(execution_store["latest"])
