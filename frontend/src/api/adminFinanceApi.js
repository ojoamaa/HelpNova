import api from "./api";

export async function getFinanceSummary() {
  const res = await api.get("/finance/summary");
  return res.data;
}

export async function getAllWithdrawals() {
  const res = await api.get("/finance/withdrawals");
  return res.data;
}

export async function approveWithdrawal(withdrawalId) {
  const res = await api.post(`/finance/withdrawals/${withdrawalId}/approve`);
  return res.data;
}

export async function rejectWithdrawal(withdrawalId) {
  const res = await api.post(`/finance/withdrawals/${withdrawalId}/reject`);
  return res.data;
}

export async function markWithdrawalPaid(withdrawalId) {
  const res = await api.post(`/finance/withdrawals/${withdrawalId}/paid`);
  return res.data;
}
