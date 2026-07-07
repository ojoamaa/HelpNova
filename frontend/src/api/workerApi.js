import { api } from "./api";

const WORKER_ID = "a5dc9b43-fd1e-47fa-9b48-acf0b1277dff";

export async function getWorkerPerformance() {
    const { data } = await api.get(`/admin/workers/performance/${WORKER_ID}`);
    return data;
}

export async function getWorkerJobs() {
    const { data } = await api.get("/admin/job-operations/status/completed");
    return data;
}

export async function getWorkerWallet() {
    const { data } = await api.get(`/wallet/${WORKER_ID}`);
    return data;
}

export async function getWorkerDashboard() {
    const { data } = await api.get("/workers/dashboard");
    return data;
}

export async function getWorkerJobRequests() {
    const { data } = await api.get("/workers/jobs");
    return data;
}

export async function getAcceptedJobs() {
    const response = await api.get("/workers/accepted-jobs");
    return response.data.jobs;
}

export async function acceptWorkerJob(jobId) {
    const { data } = await api.post(`/workers/jobs/${jobId}/accept`);
    return data;
}

export async function rejectWorkerJob(jobId) {
    const { data } = await api.post(`/workers/jobs/${jobId}/reject`);
    return data;
}

export async function updateWorkerAvailability(isAvailable) {
    const { data } = await api.patch("/workers/availability", {
        is_available: isAvailable,
    });
    return data;
}

export async function requestWorkerWithdrawal(amount) {
    const { data } = await api.post("/workers/wallet/withdraw", {
        amount,
    });
    return data;
}

export async function getWorkerProfile() {
    const { data } = await api.get("/workers/profile");
    return data;
}

export async function markWorkerOnMyWay(jobId, workerId) {
    const { data } = await api.post("/job-lifecycle/on-my-way", {
        job_id: jobId,
        worker_id: workerId,
    });

    return data;
}

export async function markWorkerArrived(jobId, workerId) {
    const { data } = await api.post("/job-lifecycle/arrived", {
        job_id: jobId,
        worker_id: workerId,
    });

    return data;
}

export async function startWorkerJob(jobId, workerId) {
    const { data } = await api.post("/job-lifecycle/start", {
        job_id: jobId,
        worker_id: workerId,
    });

    return data;
}

export async function completeWorkerJob(jobId, workerId) {
    const { data } = await api.post("/job-lifecycle/complete", {
        job_id: jobId,
        worker_id: workerId,
    });

    return data;
}

export async function getWorkerWalletTransactions() {
    const { data } = await api.get(`/wallet/${WORKER_ID}/transactions`);
    return data;
}

const workerApi = {
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
    markWorkerOnMyWay,
    markWorkerArrived,
    startWorkerJob,
    completeWorkerJob,
    getWorkerWalletTransactions,
};

export default workerApi;