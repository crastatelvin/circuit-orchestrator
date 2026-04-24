# CIRCUIT - AI Workflow Orchestrator

Visual node-based AI workflow orchestrator with live execution updates.

## Stack
- Frontend: React
- Backend: FastAPI
- Model: Groq (via `groq` Python SDK)

## Current capabilities
- Drag and drop nodes from palette to canvas.
- Connect output and input ports to form pipelines.
- Configure node behavior from the config panel.
- Execute workflows through FastAPI and stream node events over WebSocket.
- Track execution status with animated wire pulses and node state highlights.
- Switch among multiple themes with persisted preference (`localStorage`).
- Load one-click demo workflows.

## Quick start demo
Add a project demo GIF once you record one:

```md
![CIRCUIT demo](./docs/media/demo.gif)
```

Suggested clip flow: add nodes -> connect ports -> run workflow -> show live node/edge updates -> final output panel.

### Screenshots and video slots
- Screenshot 1 (builder): `docs/media/screenshot-builder.png`
- Screenshot 2 (execution): `docs/media/screenshot-execution.png`
- Demo video (optional): `docs/media/demo.mp4`

## Run backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# set GROQ_API_KEY in .env
uvicorn main:app --reload
```

## Run frontend
```bash
cd frontend
npm install
npm start
```

## Project structure highlights
- `backend/main.py`: FastAPI API + WebSocket broadcast loop.
- `backend/workflow_engine.py`: execution ordering, node input merge, execution logging.
- `backend/node_executors/*.py`: one module per executor (`prompt`, `summarize`, `translate`, `classify`, `extract`, `transform`, `filter`).
- `frontend/src/hooks/useWorkflow.js`: workflow state and execution lifecycle.
- `frontend/src/hooks/useWebSocket.js`: live event subscription.
- `frontend/src/components/`: canvas, nodes, connections, controls, logs, output, and background.
- `DECISIONS.md`: architecture rationale.
- `docker-compose.yml` + Dockerfiles: containerized deployment.

## API examples

### Execute workflow
`POST /execute`

Request example:

```json
{
  "workflow": {
    "nodes": [
      { "id": "node_1", "type": "input", "label": "Input", "config": {} },
      { "id": "node_2", "type": "summarize", "label": "Summarize", "config": { "length": "short" } },
      { "id": "node_3", "type": "output", "label": "Output", "config": {} }
    ],
    "edges": [
      { "id": "edge_node_1_node_2", "source": "node_1", "target": "node_2" },
      { "id": "edge_node_2_node_3", "source": "node_2", "target": "node_3" }
    ],
    "input": "Long text to summarize."
  }
}
```

Response example:

```json
{
  "final_output": "Short summary output...",
  "node_outputs": {
    "node_1": { "output": "Long text to summarize.", "node_type": "input" },
    "node_2": { "output": "Short summary output...", "node_type": "summarize" },
    "node_3": { "output": "Short summary output...", "node_type": "output" }
  },
  "execution_log": [
    {
      "event": "node_complete",
      "node_id": "node_2",
      "node_type": "summarize",
      "message": "Summarize complete"
    }
  ],
  "nodes_executed": 3,
  "success": true
}
```

### Get node types
`GET /node-types`

Response returns a list of available nodes and display metadata (type, label, icon, color).

### WebSocket events
`WS /ws`

Event stream includes:
- `workflow_start`
- `node_start`
- `node_complete`
- `workflow_complete`
- `workflow_error`

## Production readiness

### Security and auth
- LLM provider: Groq (`backend/groq_service.py`).
- API key auth for protected APIs:
  - Set `APP_API_KEY` in `backend/.env`.
  - Send `X-API-Key: <APP_API_KEY>` for `POST /execute` and `GET /latest`.
  - For WebSocket `/ws`, include header `X-API-Key` when `APP_API_KEY` is enabled.

### Rate limiting
- `POST /execute`: `30/minute` per client IP.
- `GET /latest`: `60/minute` per client IP.

### Structured logging
- JSON logs are configured in `backend/logging_config.py`.
- Workflow request/completion/failure and websocket connect/disconnect events are logged.

### Tests
Run backend tests:

```bash
cd backend
venv\Scripts\activate
pytest -q
```

### Deploy with Docker
```bash
docker compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
