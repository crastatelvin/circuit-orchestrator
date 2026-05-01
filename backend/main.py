from __future__ import annotations

import json
import logging

from fastapi import Depends, FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from logging_config import configure_logging
from security import require_api_key
from workflow_engine import execute_workflow
from database import init_db, save_execution, get_history

configure_logging()
logger = logging.getLogger("circuit.api")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="CIRCUIT - AI Workflow Orchestrator")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
init_db()

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
    expected = __import__("os").getenv("APP_API_KEY", "").strip()
    supplied = websocket.headers.get("x-api-key")
    if expected and supplied != expected:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    connections.append(websocket)
    logger.info("websocket_connected", extra={"connections": len(connections)})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connections:
            connections.remove(websocket)
        logger.info("websocket_disconnected", extra={"connections": len(connections)})


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
            {"type": "python", "label": "Python Script", "icon": "🐍", "color": "#ffeaa7"},
            {"type": "output", "label": "Output", "icon": "📤", "color": "#55efc4"},
        ]
    )


@app.post("/execute")
@limiter.limit("30/minute")
async def execute(request: Request, body: dict, _: None = Depends(require_api_key)) -> JSONResponse:
    workflow = body.get("workflow", {})
    if not workflow.get("nodes"):
        return JSONResponse(status_code=400, content={"error": "Workflow has no nodes"})

    logger.info("workflow_execute_requested", extra={"nodes": len(workflow.get("nodes", []))})
    await broadcast({"event": "workflow_start", "message": "Workflow execution started"})
    try:
        result = await execute_workflow(workflow, broadcast)
        execution_store["latest"] = result
        save_execution(result, workflow)
        await broadcast({"event": "workflow_complete", "message": "Workflow complete"})
        logger.info(
            "workflow_execute_complete",
            extra={"nodes_executed": result.get("nodes_executed", 0), "success": result.get("success", False)},
        )
        return JSONResponse(result)
    except Exception as exc:  # noqa: BLE001
        await broadcast({"event": "workflow_error", "message": str(exc)[:200]})
        logger.exception("workflow_execute_failed")
        return JSONResponse(status_code=500, content={"error": str(exc)})


@app.get("/latest")
@limiter.limit("60/minute")
def latest(request: Request, _: None = Depends(require_api_key)) -> JSONResponse:
    if "latest" not in execution_store:
        return JSONResponse(status_code=404, content={"error": "No execution available"})
    return JSONResponse(execution_store["latest"])


@app.get("/history")
@limiter.limit("30/minute")
def history(request: Request, _: None = Depends(require_api_key)) -> JSONResponse:
    return JSONResponse(get_history())
