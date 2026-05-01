import { useCallback, useEffect, useState } from "react";
import CircuitCanvas from "../components/CircuitCanvas";
import ExecutionLog from "../components/ExecutionLog";
import NodeConfig from "../components/NodeConfig";
import NodePalette from "../components/NodePalette";
import ResultPanel from "../components/ResultPanel";
import WorkflowControls from "../components/WorkflowControls";
import HistoryPanel from "../components/HistoryPanel";
import useWorkflow from "../hooks/useWorkflow";

const THEME_STORAGE_KEY = "circuit-theme";
const DEMO_NODES = {
  input: { type: "input", label: "Input", icon: "⬡", color: "#49a6ff" },
  summarize: { type: "summarize", label: "Summarize", icon: "📋", color: "#7ad8ff" },
  translate: { type: "translate", label: "Translate", icon: "🌐", color: "#f7b267" },
  output: { type: "output", label: "Output", icon: "📤", color: "#b8c0ff" },
  prompt: { type: "prompt", label: "AI Prompt", icon: "🧠", color: "#ff7a59" },
  classify: { type: "classify", label: "Classify", icon: "🏷️", color: "#c792ea" },
};

export default function OrchestratorPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || "midnight-coral");
  const {
    nodes,
    edges,
    inputText,
    setInputText,
    variables,
    setVariables,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    updateNodePosition,
    updateNodeConfig,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    connectingFrom,
    setConnectingFrom,
    runWorkflow,
    executing,
    result,
    executionLog,
    executingNodes,
    completedNodes,
    reset,
    clearLog,
    importWorkflow,
    exportWorkflow,
  } = useWorkflow();

  const onPortClick = useCallback(
    (portType, nodeId) => {
      if (portType === "out") {
        setConnectingFrom(nodeId);
        return;
      }
      if (portType === "in" && connectingFrom) {
        addEdge(connectingFrom, nodeId);
        setConnectingFrom(null);
      }
    },
    [connectingFrom, addEdge, setConnectingFrom]
  );

  useEffect(() => {
    const next = theme === "midnight-coral" ? "" : theme;
    if (next) document.body.setAttribute("data-theme", next);
    else document.body.removeAttribute("data-theme");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    return () => document.body.removeAttribute("data-theme");
  }, [theme]);

  const loadDemo = useCallback(
    (kind) => {
      reset();
      if (kind === "sum-translate") {
        const id1 = addNode(DEMO_NODES.input, 70, 120);
        const id2 = addNode(DEMO_NODES.summarize, 290, 120);
        const id3 = addNode(DEMO_NODES.translate, 510, 120);
        const id4 = addNode(DEMO_NODES.output, 730, 120);
        addEdge(id1, id2);
        addEdge(id2, id3);
        addEdge(id3, id4);
      } else {
        const id1 = addNode(DEMO_NODES.input, 70, 280);
        const id2 = addNode(DEMO_NODES.prompt, 290, 280);
        const id3 = addNode(DEMO_NODES.classify, 510, 280);
        const id4 = addNode(DEMO_NODES.output, 730, 280);
        addEdge(id1, id2);
        addEdge(id2, id3);
        addEdge(id3, id4);
      }
    },
    [addEdge, addNode, reset]
  );

  const handleExport = useCallback(() => {
    const data = exportWorkflow();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `circuit-workflow-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportWorkflow]);

  const handleImport = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          importWorkflow(data);
        } catch (err) {
          alert("Invalid workflow file");
        }
      };
      reader.readAsText(file);
    },
    [importWorkflow]
  );

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <h1 style={{ marginBottom: 6 }}>CIRCUIT - AI Workflow Orchestrator</h1>
          <p style={{ color: "var(--muted)", marginTop: 0 }}>
            Drag nodes to the canvas, connect output to input ports, and run live execution.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => loadDemo("sum-translate")}>Demo: Summarize + Translate</button>
            <button onClick={() => loadDemo("prompt-classify")}>Demo: Prompt + Classify</button>
            <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 8px" }} />
            <button onClick={handleExport} style={{ backgroundColor: "var(--accent)", color: "white" }}>Export JSON</button>
            <label className="button" style={{ cursor: "pointer" }}>
              Import JSON
              <input type="file" onChange={handleImport} style={{ display: "none" }} accept=".json" />
            </label>
          </div>
        </div>
        <div className="panel" style={{ minWidth: 240 }}>
          <h3 style={{ marginTop: 0 }}>Theme</h3>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: "100%" }}>
            <option value="midnight-coral">Midnight Coral</option>
            <option value="light-minimal">Light Minimal</option>
            <option value="mono-neon">Monochrome Neon</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div style={{ width: 220 }}>
          <NodePalette onAddNode={addNode} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="panel">
            <h3>Input Text</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Input text"
              rows={5}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <WorkflowControls
                executing={executing}
                nodeCount={nodes.length}
                edgeCount={edges.length}
                onRun={runWorkflow}
                onClear={reset}
              />
              {connectingFrom && (
                <span style={{ marginLeft: 12, color: "var(--accent)" }}>Connecting from: {connectingFrom}</span>
              )}
            </div>
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <h3>Global Variables</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(variables).map(([key, val]) => (
                <div key={key} style={{ display: "flex", gap: 8 }}>
                  <input
                    value={key}
                    onChange={(e) => {
                      const newVars = { ...variables };
                      delete newVars[key];
                      newVars[e.target.value] = val;
                      setVariables(newVars);
                    }}
                    placeholder="Key"
                    style={{ flex: 1 }}
                  />
                  <input
                    value={val}
                    onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                    placeholder="Value"
                    style={{ flex: 2 }}
                  />
                  <button
                    className="danger"
                    onClick={() => {
                      const next = { ...variables };
                      delete next[key];
                      setVariables(next);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="secondary"
                onClick={() => setVariables({ ...variables, [`var_${Object.keys(variables).length + 1}`]: "" })}
                style={{ alignSelf: "flex-start", marginTop: 8 }}
              >
                + Add Variable
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <CircuitCanvas
              nodes={nodes}
              edges={edges}
              executingNodes={executingNodes}
              completedNodes={completedNodes}
              connectingFrom={connectingFrom}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onMoveNode={updateNodePosition}
              onDeleteNode={removeNode}
              onPortClick={onPortClick}
              onAddNode={addNode}
              onRemoveEdge={removeEdge}
            />
          </div>
        </div>
        <div style={{ width: 360 }}>
          <NodeConfig node={selectedNode} onChange={updateNodeConfig} />
          <div style={{ height: 12 }} />
          <ExecutionLog logs={executionLog} onClear={clearLog} />
          <div style={{ height: 12 }} />
          <ResultPanel result={result} />
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}
