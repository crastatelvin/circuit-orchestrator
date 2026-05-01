// ============================================
// Project: CIRCUIT - AI Workflow Orchestrator
// License: MIT
// ============================================

export default function WorkflowControls({ executing, nodeCount, edgeCount, onRun, onClear }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "var(--muted)", fontSize: 12 }}>
        {nodeCount} nodes / {edgeCount} edges
      </span>
      <button className="secondary" onClick={onClear}>Clear</button>
      <button onClick={onRun} disabled={executing || nodeCount === 0}>
        {executing ? "Running..." : "Run"}
      </button>
    </div>
  );
}
