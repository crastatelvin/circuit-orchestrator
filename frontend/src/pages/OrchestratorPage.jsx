import { useCallback, useEffect, useState } from "react";
import CircuitCanvas from "../components/CircuitCanvas";
import ExecutionLog from "../components/ExecutionLog";
import NodeConfig from "../components/NodeConfig";
import NodePalette from "../components/NodePalette";
import ResultPanel from "../components/ResultPanel";
import WorkflowControls from "../components/WorkflowControls";
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
          <ExecutionLog logs={executionLog} />
          <div style={{ height: 12 }} />
          <ResultPanel result={result} />
        </div>
      </div>
    </div>
  );
}
