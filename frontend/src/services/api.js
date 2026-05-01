import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const executeWorkflow = async (workflow) =>
  (await axios.post(`${BASE}/execute`, { workflow }, { timeout: 120000 })).data;

export const getNodeTypes = async () => (await axios.get(`${BASE}/node-types`)).data;
export const fetchHistory = async () => (await axios.get(`${BASE}/history`)).data;
