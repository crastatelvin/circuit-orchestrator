import { useCallback, useMemo, useState } from "react";
import { executeWorkflow } from "../services/api";
import useWebSocket from "./useWebSocket";

let nodeCounter = 1;

const DEFAULT_CONFIGS = {
  input: {},
  prompt: { system_prompt: "You are a helpful AI assistant.", user_prompt: "{input}" },
  summarize: { length: "medium" },
  translate: { target_language: "Spanish" },
  classify: { categories: ["positive", "negative", "neutral"] },
  extract: { fields: [] },
  transform: { transform_type: "formal" },
  filter: { condition: "", pass_through: true },
  python: { script: "output = input_data.upper()" },
  output: {},
};

export default function useWorkflow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [inputText, setInputText] = useState("");
  const [variables, setVariables] = useState({});
  const [result, setResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [executionLog, setExecutionLog] = useState([]);
  const [executingNodes, setExecutingNodes] = useState(new Set());
  const [completedNodes, setCompletedNodes] = useState(new Set());

  const { connect, disconnect } = useWebSocket((data) => {
    if (data.event === "node_start" && data.node_id) {
      setExecutingNodes((prev) => new Set([...prev, data.node_id]));
    }
    if (data.event === "node_complete" && data.node_id) {
      setExecutingNodes((prev) => {
        const copy = new Set(prev);
        copy.delete(data.node_id);
        return copy;
      });
      setCompletedNodes((prev) => new Set([...prev, data.node_id]));
      setExecutionLog((prev) => [...prev, data]);
    }
  });

  const addNode = useCallback((nodeType, x, y) => {
    const id = `node_${nodeCounter++}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: nodeType.type,
        label: nodeType.label,
        icon: nodeType.icon,
        color: nodeType.color || "#00b894",
        x: Number.isFinite(x) ? x : 60 + prev.length * 180,
        y: Number.isFinite(y) ? y : 120 + (prev.length % 3) * 120,
        config: { ...DEFAULT_CONFIGS[nodeType.type] },
      },
    ]);
    setSelectedNodeId(id);
    return id;
  }, []);

  const updateNodePosition = useCallback((id, x, y) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x, y } : node)));
  }, []);

  const updateNodeConfig = useCallback((id, partialConfig) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, config: { ...node.config, ...partialConfig } } : node
      )
    );
  }, []);

  const addEdge = useCallback((source, target) => {
    setEdges((prev) => {
      if (source === target || prev.some((e) => e.source === source && e.target === target)) return prev;
      return [...prev, { id: `edge_${source}_${target}`, source, target }];
    });
  }, []);

  const removeNode = useCallback(
    (id) => {
      setNodes((prev) => prev.filter((node) => node.id !== id));
      setEdges((prev) => prev.filter((edge) => edge.source !== id && edge.target !== id));
      if (selectedNodeId === id) setSelectedNodeId(null);
    },
    [selectedNodeId]
  );

  const removeEdge = useCallback((id) => {
    setEdges((prev) => prev.filter((edge) => edge.id !== id));
  }, []);

  const runWorkflow = useCallback(async () => {
    if (!nodes.length || executing) return;
    setExecuting(true);
    setExecutionLog([]);
    setExecutingNodes(new Set());
    setCompletedNodes(new Set());
    connect();
    try {
      const workflow = {
        nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.label, config: n.config })),
        edges,
        input: inputText,
        variables,
      };
      const res = await executeWorkflow(workflow);
      setResult(res);
      if (!res.execution_log?.length) {
        setExecutionLog((prev) => (prev.length ? prev : []));
      }
    } finally {
      setTimeout(() => disconnect(), 350);
      setExecuting(false);
    }
  }, [nodes, edges, inputText, executing, connect, disconnect]);

  const reset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setResult(null);
    setExecutionLog([]);
    setExecutingNodes(new Set());
    setCompletedNodes(new Set());
    setSelectedNodeId(null);
    setConnectingFrom(null);
    setVariables({});
    nodeCounter = 1;
  }, []);
  
  const exportWorkflow = useCallback(() => {
    return {
      nodes,
      edges,
      variables,
      inputText,
    };
  }, [nodes, edges, variables, inputText]);

  const importWorkflow = useCallback((data) => {
    if (!data) return;
    setNodes(data.nodes || []);
    setEdges(data.edges || []);
    setVariables(data.variables || {});
    setInputText(data.inputText || "");
    // Update nodeCounter to avoid ID collisions
    const maxId = (data.nodes || []).reduce((max, node) => {
      const match = node.id.match(/node_(\d+)/);
      if (match) return Math.max(max, parseInt(match[1]));
      return max;
    }, 0);
    nodeCounter = maxId + 1;
  }, []);

  const clearLog = useCallback(() => setExecutionLog([]), []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  return useMemo(
    () => ({
      nodes,
      edges,
      inputText,
      setInputText,
      variables,
      setVariables,
      addNode,
      addEdge,
      removeNode,
      removeEdge,
      updateNodePosition,
      updateNodeConfig,
      selectedNodeId,
      setSelectedNodeId,
      selectedNode,
      connectingFrom,
      setConnectingFrom,
      runWorkflow,
      executing,
      result,
      executionLog,
      executingNodes,
      completedNodes,
      reset,
      clearLog,
      importWorkflow,
      exportWorkflow,
    }),
    [
      nodes,
      edges,
      inputText,
      variables,
      setVariables,
      addNode,
      addEdge,
      removeNode,
      removeEdge,
      updateNodePosition,
      updateNodeConfig,
      selectedNodeId,
      selectedNode,
      connectingFrom,
      runWorkflow,
      executing,
      result,
      executionLog,
      executingNodes,
      completedNodes,
      reset,
      clearLog,
      importWorkflow,
      exportWorkflow,
    ]
  );
}
