// ============================================
// Project: CIRCUIT - AI Workflow Orchestrator
// License: MIT
// ============================================

export default function ElectricPulse({ active }) {
  if (!active) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: 14,
        top: 12,
        fontSize: 12,
        color: "var(--accent)",
        textShadow: "0 0 10px var(--accent)",
      }}
    >
      pulse-routing...
    </div>
  );
}
