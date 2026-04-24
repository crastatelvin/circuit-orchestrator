# CIRCUIT - AI Workflow Orchestrator

Visual node-based AI workflow orchestrator with live execution updates.

## Stack
- Frontend: React
- Backend: FastAPI
- Model: Gemini (via `google-genai`)

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
![CIRCUIT demo](./docs/demo.gif)
```

Suggested clip flow: add nodes -> connect ports -> run workflow -> show live node/edge updates -> final output panel.

## Run backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# set GEMINI_API_KEY in .env
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
