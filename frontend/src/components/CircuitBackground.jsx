// ============================================
// Project: CIRCUIT - AI Workflow Orchestrator
// License: MIT
// ============================================

export default function CircuitBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage:
          "linear-gradient(rgba(122,216,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(122,216,255,0.06) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    />
  );
}
