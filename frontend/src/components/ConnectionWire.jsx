import { motion } from "framer-motion";

export default function ConnectionWire({ edge, nodes, isActive, isComplete, onRemove }) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return null;

  const x1 = source.x + 160;
  const y1 = source.y + 40;
  const x2 = target.x;
  const y2 = target.y + 40;
  const path = `M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`;

  return (
    <g onDoubleClick={() => onRemove(edge.id)} style={{ cursor: "pointer" }}>
      <path
        d={path}
        fill="none"
        stroke={isActive ? "#f7b267" : isComplete ? "#82ffc3" : "#7ad8ff"}
        strokeWidth={isActive ? "2.8" : "2.2"}
        strokeDasharray={isActive ? "none" : "7 5"}
      />
      {isActive && (
        <motion.path
          d={path}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, pathOffset: 0, opacity: 0.95 }}
          animate={{ pathLength: 0.24, pathOffset: 1, opacity: [0.95, 0.35, 0.95] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      )}
      <path d={path} fill="none" stroke="transparent" strokeWidth="10" />
    </g>
  );
}
