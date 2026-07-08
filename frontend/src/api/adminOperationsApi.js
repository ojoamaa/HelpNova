import api from "./api";

export async function getLiveOperationsSummary() {
  const res = await api.get("/operations/summary");
  return res.data;
}

export async function getLiveJobQueue() {
    const response = await api.get("/operations/live-jobs");
    return response.data;
}
