export default function NodeConfig({ node, onChange }) {
  if (!node) return <div className="panel">Select a node</div>;

  const update = (key, value) => onChange(node.id, { [key]: value });

  return (
    <div className="panel">
      <h3>Config - {node.label}</h3>
      {node.type === "prompt" && (
        <>
          <label style={{ color: "#cfd5ff" }}>System prompt</label>
          <textarea
            value={node.config.system_prompt || ""}
            onChange={(e) => update("system_prompt", e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
          <label style={{ color: "#cfd5ff" }}>User prompt</label>
          <textarea
            value={node.config.user_prompt || ""}
            onChange={(e) => update("user_prompt", e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
        </>
      )}
      {node.type === "translate" && (
        <>
          <label style={{ color: "#cfd5ff" }}>Target language</label>
          <input
            value={node.config.target_language || ""}
            onChange={(e) => update("target_language", e.target.value)}
            style={{ width: "100%" }}
          />
        </>
      )}
      {node.type === "summarize" && (
        <>
          <label style={{ color: "#cfd5ff" }}>Length</label>
          <select value={node.config.length || "medium"} onChange={(e) => update("length", e.target.value)} style={{ width: "100%" }}>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </>
      )}
      {node.type === "classify" && (
        <>
          <label style={{ color: "#cfd5ff" }}>Categories (comma separated)</label>
          <input
            value={(node.config.categories || []).join(", ")}
            onChange={(e) =>
              update(
                "categories",
                e.target.value
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean)
              )
            }
            style={{ width: "100%" }}
          />
        </>
      )}
      {node.type === "transform" && (
        <>
          <label style={{ color: "#cfd5ff" }}>Transform type</label>
          <input
            value={node.config.transform_type || "formal"}
            onChange={(e) => update("transform_type", e.target.value)}
            style={{ width: "100%" }}
          />
          <label style={{ color: "#cfd5ff" }}>Custom instruction</label>
          <input
            value={node.config.custom_instruction || ""}
            onChange={(e) => update("custom_instruction", e.target.value)}
            style={{ width: "100%" }}
          />
        </>
      )}
      {node.type === "extract" && (
        <>
          <label style={{ color: "#cfd5ff" }}>Fields (comma separated)</label>
          <input
            value={(node.config.fields || []).join(", ")}
            onChange={(e) =>
              update(
                "fields",
                e.target.value
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean)
              )
            }
            style={{ width: "100%" }}
          />
        </>
      )}
      {node.type === "filter" && (
        <>
          <label style={{ color: "#cfd5ff" }}>Condition</label>
          <input
            value={node.config.condition || ""}
            onChange={(e) => update("condition", e.target.value)}
            style={{ width: "100%" }}
          />
        </>
      )}
      {node.type === "python" && (
        <>
          <label style={{ color: "#cfd5ff" }}>Python Script (output = ...)</label>
          <textarea
            value={node.config.script || ""}
            onChange={(e) => update("script", e.target.value)}
            rows={10}
            style={{ width: "100%", fontFamily: "monospace" }}
          />
          <p style={{ fontSize: "0.8em", color: "var(--muted)" }}>
            Access input via <code>input_data</code>. Set <code>output</code> to return.
          </p>
        </>
      )}
    </div>
  );
}
