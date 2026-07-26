import api from "./api";

function getStoredWorkerId() {
    const workerId = localStorage.getItem("helpnova_worker_id");

    if (!workerId) {
        throw new Error("Worker session is missing. Please log in again.");
    }

    return encodeURIComponent(workerId);
}

function normalizeCollection(data, keys = []) {
    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
}

function normalizeWallet(data = {}) {
    const source = data.wallet || data.worker_wallet || data;
    const transactions = normalizeCollection(data, [
        "transactions",
        "wallet_transactions",
    ]);

    return {
        ...source,
        available_balance: Number(
            source.available_balance ?? source.balance ?? 0
        ),
        pending_balance: Number(
            source.pending_balance ??
            source.escrow_balance ??
            source.unreleased_earnings ??
            0
        ),
        total_earned: Number(
            source.total_earned ?? source.total_earnings ?? 0
        ),
        currency: source.currency || "NGN",
        status: source.status || source.wallet_status || "active",
        transactions,
    };
}

export async function getWorkerPerformance(workerId) {
    const id = encodeURIComponent(workerId || localStorage.getItem("helpnova_worker_id") || "");
    if (!id) throw new Error("Worker ID is required.");
    const { data } = await api.get(`/admin/workers/performance/${id}`);
    return data;
}

export async function getWorkerJobs() {
    const { data } = await api.get("/admin/job-operations/status/completed");
    return normalizeCollection(data, ["jobs", "items", "results"]);
}

export async function getWorkerWallet() {
    const { data } = await api.get(`/wallet/${getStoredWorkerId()}`);
    return normalizeWallet(data);
}

export async function getWorkerDashboard() {
    const { data } = await api.get("/workers/dashboard");
    return data;
}

export async function getWorkerJobRequests() {
    const { data } = await api.get("/workers/jobs");
    return normalizeCollection(data, ["jobs", "requests", "items", "results"]);
}

export async function getAcceptedJobs() {
    const { data } = await api.get("/workers/accepted-jobs");
    return normalizeCollection(data, ["jobs", "accepted_jobs", "items", "results"]);
}

export async function acceptWorkerJob(jobId) {
    const { data } = await api.post(`/workers/jobs/${encodeURIComponent(jobId)}/accept`);
    return data;
}

export async function rejectWorkerJob(jobId) {
    const { data } = await api.post(`/workers/jobs/${encodeURIComponent(jobId)}/reject`);
    return data;
}

export async function updateWorkerAvailability(isAvailable) {
    const { data } = await api.patch("/workers/availability", {
        is_available: isAvailable,
    });
    return data;
}

export async function requestWorkerWithdrawal(amount) {
    const { data } = await api.post("/workers/wallet/withdraw", { amount });
    return data;
}

export async function getWorkerProfile() {
    const { data } = await api.get("/workers/profile");
    return data;
}

export async function updateWorkerProfile(profile) {
    const { data } = await api.patch("/workers/profile", profile);
    return data;
}

export async function uploadWorkerProfilePhoto(file) {
    const formData = new FormData();
    formData.append("photo", file);

    const { data } = await api.post("/workers/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

async function updateLifecycle(endpoint, jobId, workerId) {
    const resolvedWorkerId = workerId || localStorage.getItem("helpnova_worker_id");
    if (!resolvedWorkerId) throw new Error("Worker ID is required.");

    const { data } = await api.post(`/job-lifecycle/${endpoint}`, {
        job_id: jobId,
        worker_id: resolvedWorkerId,
    });
    return data;
}

export const markWorkerOnMyWay = (jobId, workerId) =>
    updateLifecycle("on-my-way", jobId, workerId);
export const markWorkerArrived = (jobId, workerId) =>
    updateLifecycle("arrived", jobId, workerId);
export const startWorkerJob = (jobId, workerId) =>
    updateLifecycle("start", jobId, workerId);
export const completeWorkerJob = (jobId, workerId) =>
    updateLifecycle("complete", jobId, workerId);

export async function getWorkerWalletTransactions() {
    const wallet = await getWorkerWallet();
    return Array.isArray(wallet.transactions) ? wallet.transactions : [];
}

export default {
    getWorkerPerformance,
    getWorkerJobs,
    getWorkerWallet,
    getWorkerDashboard,
    getWorkerJobRequests,
    getAcceptedJobs,
    acceptWorkerJob,
    rejectWorkerJob,
    updateWorkerAvailability,
    requestWorkerWithdrawal,
    getWorkerProfile,
    updateWorkerProfile,
    uploadWorkerProfilePhoto,
    markWorkerOnMyWay,
    markWorkerArrived,
    startWorkerJob,
    completeWorkerJob,
    getWorkerWalletTransactions,
};
