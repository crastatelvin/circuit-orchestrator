// ============================================
// Project: CIRCUIT - AI Workflow Orchestrator
// License: MIT
// ============================================

import { useCallback, useRef } from "react";

export default function useWebSocket(onMessage) {
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage?.(parsed);
      } catch {
        // Ignore malformed frames from the server.
      }
    };
    wsRef.current = ws;
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { connect, disconnect };
}
