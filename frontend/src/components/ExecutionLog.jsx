export default function ExecutionLog({ logs, onClear }) {
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Execution Log</h3>
        <button className="secondary" style={{ fontSize: "0.75em", padding: "4px 8px" }} onClick={onClear}>Clear</button>
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto", fontFamily: "monospace", fontSize: 12, color: "#cfd5ff" }}>
        {logs.length === 0 && <div style={{ color: "#aeb5de" }}>No events yet.</div>}
        {logs.map((log, idx) => (
          <div key={idx} style={{ borderLeft: "2px solid #7ad8ff", paddingLeft: 8, marginBottom: 4 }}>
            [{log.node_type || log.event}] {log.message || log.output_preview || ""}
          </div>
        ))}
      </div>
    </div>
  );
}
