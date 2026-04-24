import { useEffect, useState } from "react";

export default function WorkflowNode({
  node,
  selected,
  isExecuting,
  isComplete,
  onSelect,
  onMove,
  onDelete,
  onPortClick,
}) {
  const [dragStart, setDragStart] = useState(null);

  const onMouseDown = (e) => {
    if (e.target.dataset.port) return;
    setDragStart({ x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y });
    onSelect(node.id);
  };

  const onMouseMove = (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    onMove(node.id, dragStart.nodeX + dx, dragStart.nodeY + dy);
  };

  const onMouseUp = () => setDragStart(null);

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  });

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: 160,
        border: `1px solid ${selected ? node.color : `${node.color}66`}`,
        borderRadius: 10,
        background: "linear-gradient(180deg, #2b3160 0%, #1e2447 100%)",
        color: "#f6f7ff",
        cursor: "grab",
        zIndex: selected ? 10 : 5,
        boxShadow: isExecuting
          ? `0 0 0 2px #f7b267, 0 0 18px #f7b26766`
          : isComplete
          ? `0 0 0 2px #82ffc355, 0 0 14px #82ffc344`
          : selected
          ? `0 0 0 2px ${node.color}55`
          : "none",
        transition: "box-shadow 0.18s ease",
        animation: isExecuting
          ? "node-execute 0.85s ease-in-out infinite"
          : isComplete
          ? "node-complete 0.5s ease"
          : "none",
      }}
    >
      <div style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
        <span>{node.icon}</span>
        <strong style={{ fontSize: 12 }}>{node.label}</strong>
        <button
          onClick={() => onDelete(node.id)}
          style={{ marginLeft: "auto", padding: "2px 8px", background: "rgba(0,0,0,0.25)" }}
        >
          x
        </button>
      </div>
      <div style={{ padding: 8, fontSize: 12 }}>
        {node.type}
        {isExecuting ? <span style={{ marginLeft: 8, color: "#f7b267" }}>running</span> : null}
        {!isExecuting && isComplete ? <span style={{ marginLeft: 8, color: "#82ffc3" }}>done</span> : null}
      </div>
      {node.type !== "input" && (
        <button
          data-port="in"
          onClick={(e) => {
            e.stopPropagation();
            onPortClick("in", node.id);
          }}
          style={{
            position: "absolute",
            left: -8,
            top: "45%",
            background: node.color,
            color: "#0f1226",
            padding: "0 4px",
          }}
        >
          o
        </button>
      )}
      {node.type !== "output" && (
        <button
          data-port="out"
          onClick={(e) => {
            e.stopPropagation();
            onPortClick("out", node.id);
          }}
          style={{
            position: "absolute",
            right: -8,
            top: "45%",
            background: node.color,
            color: "#0f1226",
            padding: "0 4px",
          }}
        >
          o
        </button>
      )}
    </div>
  );
}
