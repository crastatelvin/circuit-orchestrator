import { useState } from "react";

export default function ResultPanel({ result }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.final_output || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="panel">
      <h3>Workflow Output</h3>
      <button className="secondary" onClick={handleCopy}>{copied ? "Copied" : "Copy"}</button>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          color: "#f6f7ff",
          background: "#171a33",
          border: "1px solid #3a427a",
          borderRadius: 8,
          padding: 10,
        }}
      >
        {result?.final_output || "No output yet."}
      </pre>
    </div>
  );
}
