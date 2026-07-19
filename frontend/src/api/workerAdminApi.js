import api from "./api";

/**
 * Return all workers available to the admin dashboard.
 */
export async function getAdminWorkers(status = "") {
    const response = await api.get("/admin/workers", {
        params: status ? { status } : {},
    });

    return response.data;
}

/**
 * Return the complete 360-degree record for one worker.
 */
export async function getAdminWorkerDetails(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    const response = await api.get(
        `/admin/workers/${encodeURIComponent(workerId)}`
    );

    return response.data;
}

/**
 * Approve a pending worker.
 */
export async function approveAdminWorker(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    const response = await api.patch(
        `/admin/workers/${encodeURIComponent(workerId)}/approve`
    );

    return response.data;
}

/**
 * Suspend an approved worker.
 */
export async function suspendAdminWorker(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    const response = await api.patch(
        `/admin/workers/${encodeURIComponent(workerId)}/suspend`
    );

    return response.data;
}

/**
 * Reactivate a suspended worker.
 */
export async function reactivateAdminWorker(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    const response = await api.patch(
        `/admin/workers/${encodeURIComponent(workerId)}/reactivate`
    );

    return response.data;
}

/**
 * Reject a pending worker application.
 */
export async function rejectAdminWorker(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    const response = await api.patch(
        `/admin/workers/${encodeURIComponent(workerId)}/reject`
    );

    return response.data;
}

/**
 * Return the worker wallet, balance and transaction information.
 *
 * Backend endpoint:
 * GET /wallet/{worker_id}
 */
export async function getAdminWorkerWallet(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    const response = await api.get(
        `/wallet/${encodeURIComponent(workerId)}`
    );

    return response.data;
}