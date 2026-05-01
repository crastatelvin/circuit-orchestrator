import { useEffect, useState } from "react";
import { fetchHistory } from "../services/api";

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3>Execution History</h3>
        <button onClick={load} disabled={loading}>{loading ? "..." : "Refresh"}</button>
      </div>
      <div style={{ maxHeight: 300, overflowY: "auto", fontSize: "0.9em" }}>
        {history.length === 0 && <p style={{ color: "var(--muted)" }}>No history yet.</p>}
        {history.map((h) => (
          <div key={h.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: h.success ? "var(--success)" : "var(--error)" }}>
                {h.success ? "✓ Success" : "✗ Failed"}
              </span>
              <span style={{ color: "var(--muted)", fontSize: "0.8em" }}>
                {new Date(h.timestamp).toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#cfd5ff" }}>
              {h.final_output || "No output"}
            </div>
            <div style={{ fontSize: "0.8em", color: "var(--muted)" }}>
              {h.nodes_executed} nodes executed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
