const NODE_TYPES = [
  { type: "input", label: "Input", icon: "⬡", color: "#49a6ff" },
  { type: "prompt", label: "AI Prompt", icon: "🧠", color: "#ff7a59" },
  { type: "summarize", label: "Summarize", icon: "📋", color: "#7ad8ff" },
  { type: "translate", label: "Translate", icon: "🌐", color: "#f7b267" },
  { type: "classify", label: "Classify", icon: "🏷️", color: "#c792ea" },
  { type: "extract", label: "Extract", icon: "🔍", color: "#ff8fab" },
  { type: "transform", label: "Transform", icon: "⚙️", color: "#82ffc3" },
  { type: "filter", label: "Filter", icon: "🔽", color: "#ff9f1c" },
  { type: "output", label: "Output", icon: "📤", color: "#b8c0ff" },
];

export default function NodePalette({ onAddNode }) {
  const onDragStart = (event, node) => {
    event.dataTransfer.setData("nodeType", JSON.stringify(node));
  };

  return (
    <div className="panel">
      <h3>Node Palette</h3>
      {NODE_TYPES.map((node) => (
        <button
          key={node.type}
          draggable
          onDragStart={(event) => onDragStart(event, node)}
          onClick={() => onAddNode(node)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: 8,
            border: `1px solid ${node.color}`,
            background: `${node.color}22`,
          }}
        >
          {node.icon} {node.label}
        </button>
      ))}
    </div>
  );
}
