import CircuitBackground from "./components/CircuitBackground";
import OrchestratorPage from "./pages/OrchestratorPage";
import "./styles/globals.css";

export default function App() {
  return (
    <>
      <CircuitBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <OrchestratorPage />
      </div>
    </>
  );
}
