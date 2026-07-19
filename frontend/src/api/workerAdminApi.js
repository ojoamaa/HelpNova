import api from "./api";

/**
 * Return every worker visible to the HelpNova administrator.
 */
export async function getAdminWorkers(status = "") {
    const params = {};

    if (status) {
        params.status = status;
    }

    const response = await api.get("/admin/workers", {
        params,
    });

    return response.data;
}

/**
 * Return the complete administrative record for one worker.
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
 * Approve a pending or rejected worker.
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
 * Reject a worker application.
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

export async function getAdminWorkerWallet(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    const response = await api.get(
        `/wallet/${encodeURIComponent(workerId)}`
    );

    return response.data;
}