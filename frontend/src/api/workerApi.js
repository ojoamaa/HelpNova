import api from "./api";

function getStoredWorkerId() {
    const workerId = localStorage.getItem("helpnova_worker_id");

    if (!workerId) {
        throw new Error("Worker session is missing. Please log in again.");
    }

    return encodeURIComponent(workerId);
}

function normalizeCollection(data, keys = []) {
    if (Array.isArray(data)) {
        return data;
    }

    for (const key of keys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    return [];
}

function normalizeWallet(data = {}) {
    const source =
        data?.wallet ||
        data?.worker_wallet ||
        data ||
        {};

    const transactions = normalizeCollection(data, [
        "transactions",
        "wallet_transactions",
    ]);

    return {
        ...source,

        available_balance: Number(
            source.available_balance ??
            source.balance ??
            0
        ),

        pending_balance: Number(
            source.pending_balance ??
            source.escrow_balance ??
            source.unreleased_earnings ??
            0
        ),

        total_earned: Number(
            source.total_earned ??
            source.total_earnings ??
            0
        ),

        currency:
            source.currency ||
            "NGN",

        status:
            source.status ||
            source.wallet_status ||
            "active",

        transactions,
    };
}

function extractApiErrorMessage(error, fallback = "Request failed.") {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
        return detail;
    }

    if (Array.isArray(detail)) {
        const messages = detail
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                return (
                    item?.msg ||
                    item?.message ||
                    ""
                );
            })
            .filter(Boolean);

        if (messages.length > 0) {
            return messages.join("; ");
        }
    }

    if (detail && typeof detail === "object") {
        return (
            detail.msg ||
            detail.message ||
            fallback
        );
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}

function createApiError(error, fallback) {
    const normalizedError = new Error(
        extractApiErrorMessage(error, fallback)
    );

    normalizedError.response = error?.response;
    normalizedError.originalError = error;

    return normalizedError;
}

export async function getWorkerPerformance(workerId) {
    const resolvedWorkerId =
        workerId ||
        localStorage.getItem("helpnova_worker_id") ||
        "";

    if (!resolvedWorkerId) {
        throw new Error("Worker ID is required.");
    }

    try {
        const { data } = await api.get(
            `/admin/workers/performance/${encodeURIComponent(
                resolvedWorkerId
            )}`
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Unable to load worker performance."
        );
    }
}

export async function getWorkerJobs() {
    try {
        const { data } = await api.get(
            "/admin/job-operations/status/completed"
        );

        return normalizeCollection(data, [
            "jobs",
            "items",
            "results",
        ]);
    } catch (error) {
        throw createApiError(
            error,
            "Unable to load worker jobs."
        );
    }
}

export async function getWorkerWallet() {
    try {
        const { data } = await api.get(
            `/wallet/${getStoredWorkerId()}`
        );

        return normalizeWallet(data);
    } catch (error) {
        throw createApiError(
            error,
            "Unable to load worker wallet."
        );
    }
}

export async function getWorkerDashboard() {
    try {
        const { data } = await api.get(
            "/workers/dashboard"
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Unable to load worker dashboard."
        );
    }
}

export async function getWorkerJobRequests() {
    try {
        const { data } = await api.get(
            "/workers/jobs"
        );

        return normalizeCollection(data, [
            "jobs",
            "requests",
            "items",
            "results",
        ]);
    } catch (error) {
        throw createApiError(
            error,
            "Unable to load job requests."
        );
    }
}

export async function getAcceptedJobs() {
    try {
        const { data } = await api.get(
            "/workers/accepted-jobs"
        );

        return normalizeCollection(data, [
            "jobs",
            "accepted_jobs",
            "items",
            "results",
        ]);
    } catch (error) {
        throw createApiError(
            error,
            "Unable to load accepted jobs."
        );
    }
}

export async function acceptWorkerJob(jobId) {
    if (!jobId) {
        throw new Error("Job assignment ID is required.");
    }

    try {
        const { data } = await api.post(
            `/workers/jobs/${encodeURIComponent(jobId)}/accept`
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Unable to accept this job."
        );
    }
}

export async function rejectWorkerJob(jobId) {
    if (!jobId) {
        throw new Error("Job assignment ID is required.");
    }

    try {
        const { data } = await api.post(
            `/workers/jobs/${encodeURIComponent(jobId)}/reject`
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Unable to reject this job."
        );
    }
}

export async function updateWorkerAvailability(isAvailable) {
    const availabilityStatus =
        Boolean(isAvailable)
            ? "online"
            : "offline";

    try {
        /*
         * The authenticated-worker endpoint expects a JSON body:
         *
         * {
         *   availability_status: "online" | "offline"
         * }
         */
        const { data } = await api.patch(
            "/workers/availability",
            {
                availability_status: availabilityStatus,
            }
        );

        return data;
    } catch (error) {
        const status = error?.response?.status;
        const workerId = localStorage.getItem(
            "helpnova_worker_id"
        );

        /*
         * Compatibility fallback for installations still using:
         *
         * PATCH /workers/{worker_id}/availability
         *
         * This endpoint also expects availability_status in the JSON body.
         */
        if (
            workerId &&
            [404, 405].includes(status)
        ) {
            try {
                const { data } = await api.patch(
                    `/workers/${encodeURIComponent(
                        workerId
                    )}/availability`,
                    {
                        availability_status: availabilityStatus,
                    }
                );

                return data;
            } catch (fallbackError) {
                throw createApiError(
                    fallbackError,
                    "Availability update failed."
                );
            }
        }

        throw createApiError(
            error,
            "Availability update failed."
        );
    }
}

export async function requestWorkerWithdrawal(amount) {
    const numericAmount = Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {
        throw new Error(
            "Enter a valid withdrawal amount."
        );
    }

    try {
        const { data } = await api.post(
            "/workers/wallet/withdraw",
            {
                amount: numericAmount,
            }
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Withdrawal request failed."
        );
    }
}

export async function getWorkerProfile() {
    try {
        const { data } = await api.get(
            "/workers/profile"
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Unable to load worker profile."
        );
    }
}

export async function updateWorkerProfile(profile) {
    if (
        !profile ||
        typeof profile !== "object" ||
        Array.isArray(profile)
    ) {
        throw new Error(
            "Valid worker profile information is required."
        );
    }

    try {
        const { data } = await api.patch(
            "/workers/profile",
            profile
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Profile update failed."
        );
    }
}

export async function uploadWorkerProfilePhoto(file) {
    if (!(file instanceof File)) {
        throw new Error(
            "Please select a valid profile photo."
        );
    }

    const allowedTypes = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
    ]);

    if (!allowedTypes.has(file.type)) {
        throw new Error(
            "Only JPEG, PNG and WebP profile photos are allowed."
        );
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error(
            "Profile photo must not exceed 5 MB."
        );
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
        /*
         * Do not manually set Content-Type.
         * The browser must add the multipart boundary automatically.
         */
        const { data } = await api.post(
            "/workers/profile/photo",
            formData
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Photo upload failed."
        );
    }
}

async function updateLifecycle(
    endpoint,
    jobId,
    workerId
) {
    const resolvedWorkerId =
        workerId ||
        localStorage.getItem("helpnova_worker_id");

    if (!resolvedWorkerId) {
        throw new Error("Worker ID is required.");
    }

    if (!jobId) {
        throw new Error("Job ID is required.");
    }

    try {
        const { data } = await api.post(
            `/job-lifecycle/${endpoint}`,
            {
                job_id: jobId,
                worker_id: resolvedWorkerId,
            }
        );

        return data;
    } catch (error) {
        throw createApiError(
            error,
            "Unable to update the job status."
        );
    }
}

export const markWorkerOnMyWay = (
    jobId,
    workerId
) =>
    updateLifecycle(
        "on-my-way",
        jobId,
        workerId
    );

export const markWorkerArrived = (
    jobId,
    workerId
) =>
    updateLifecycle(
        "arrived",
        jobId,
        workerId
    );

export const startWorkerJob = (
    jobId,
    workerId
) =>
    updateLifecycle(
        "start",
        jobId,
        workerId
    );

export const completeWorkerJob = (
    jobId,
    workerId
) =>
    updateLifecycle(
        "complete",
        jobId,
        workerId
    );

export async function getWorkerWalletTransactions() {
    const wallet = await getWorkerWallet();

    return Array.isArray(wallet.transactions)
        ? wallet.transactions
        : [];
}

export {
    extractApiErrorMessage,
};

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