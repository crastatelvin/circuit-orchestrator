from fastapi.testclient import TestClient

from main import app


def test_root_health():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CIRCUIT ONLINE"


def test_node_types_available():
    client = TestClient(app)
    response = client.get("/node-types")
    assert response.status_code == 200
    node_types = response.json()
    assert any(node["type"] == "input" for node in node_types)
    assert any(node["type"] == "output" for node in node_types)


def test_execute_minimal_workflow_without_external_model():
    client = TestClient(app)
    workflow = {
        "nodes": [
            {"id": "n1", "type": "input", "label": "Input", "config": {}},
            {"id": "n2", "type": "output", "label": "Output", "config": {}},
        ],
        "edges": [{"id": "e1", "source": "n1", "target": "n2"}],
        "input": "hello",
    }
    response = client.post("/execute", json={"workflow": workflow})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["final_output"] == "hello"


def test_execute_requires_api_key_when_enabled(monkeypatch):
    client = TestClient(app)
    monkeypatch.setenv("APP_API_KEY", "secret-key")
    workflow = {
        "nodes": [
            {"id": "n1", "type": "input", "label": "Input", "config": {}},
            {"id": "n2", "type": "output", "label": "Output", "config": {}},
        ],
        "edges": [{"id": "e1", "source": "n1", "target": "n2"}],
        "input": "secure",
    }
    no_key = client.post("/execute", json={"workflow": workflow})
    assert no_key.status_code == 401

    with_key = client.post("/execute", json={"workflow": workflow}, headers={"X-API-Key": "secret-key"})
    assert with_key.status_code == 200
