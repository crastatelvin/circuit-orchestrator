import ConnectionWire from "./ConnectionWire";
import ElectricPulse from "./ElectricPulse";
import WorkflowNode from "./WorkflowNode";

export default function CircuitCanvas({
  nodes,
  edges,
  executingNodes,
  completedNodes,
  connectingFrom,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  onDeleteNode,
  onPortClick,
  onAddNode,
  onRemoveEdge,
}) {
  const onDrop = (event) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("nodeType");
    if (!raw) return;
    try {
      const node = JSON.parse(raw);
      const rect = event.currentTarget.getBoundingClientRect();
      onAddNode(node, event.clientX - rect.left - 80, event.clientY - rect.top - 30);
    } catch {
      // ignore bad drag payloads
    }
  };

  const activeEdgeIds = new Set();
  const completeEdgeIds = new Set();
  edges.forEach((edge) => {
    if (executingNodes.has(edge.source) || executingNodes.has(edge.target)) activeEdgeIds.add(edge.id);
    if (completedNodes.has(edge.source) && completedNodes.has(edge.target)) completeEdgeIds.add(edge.id);
  });

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      style={{
        position: "relative",
        height: 520,
        border: "1px solid #3a427a",
        borderRadius: 12,
        background:
          "linear-gradient(180deg, rgba(36,42,77,0.65) 0%, rgba(23,26,51,0.8) 100%)",
      }}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {edges.map((edge) => (
          <ConnectionWire
            key={edge.id}
            edge={edge}
            nodes={nodes}
            isActive={activeEdgeIds.has(edge.id)}
            isComplete={completeEdgeIds.has(edge.id)}
            onRemove={onRemoveEdge}
          />
        ))}
      </svg>
      <ElectricPulse active={Boolean(connectingFrom)} />
      {nodes.map((node) => (
        <WorkflowNode
          key={node.id}
          node={node}
          selected={selectedNodeId === node.id}
          isExecuting={executingNodes.has(node.id)}
          isComplete={completedNodes.has(node.id)}
          onSelect={onSelectNode}
          onMove={onMoveNode}
          onDelete={onDeleteNode}
          onPortClick={onPortClick}
        />
      ))}
    </div>
  );
}
