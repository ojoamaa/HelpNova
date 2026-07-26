import api from "./api";
/**
 * Ensures that a required worker ID exists before making a request.
 */
function requireWorkerId(workerId) {
    if (!workerId) {
        throw new Error("Worker ID is required.");
    }

    return encodeURIComponent(workerId);
}

/**
 * Converts a value to a safe number.
 */
function safeNumber(value) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

/**
 * Converts inconsistent backend transaction fields into one structure
 * that WorkerManagement.jsx can safely display.
 */
function normalizeWalletTransaction(transaction = {}) {
    const transactionType = String(
        transaction.transaction_type ??
        transaction.type ??
        transaction.category ??
        "transaction"
    ).toLowerCase();

    const rawAmount = safeNumber(transaction.amount);

    const isDebit =
        transactionType.includes("debit") ||
        transactionType.includes("withdraw") ||
        transactionType.includes("commission") ||
        transactionType.includes("refund");

    return {
        transaction_id:
            transaction.transaction_id ??
            transaction.id ??
            transaction.reference ??
            transaction.payment_reference ??
            "Not available",

        wallet_id:
            transaction.wallet_id ??
            null,

        worker_id:
            transaction.worker_id ??
            null,

        job_id:
            transaction.job_id ??
            null,

        payment_id:
            transaction.payment_id ??
            null,

        withdrawal_id:
            transaction.withdrawal_id ??
            null,

        transaction_type: transactionType,

        description:
            transaction.description ??
            transaction.note ??
            transaction.narration ??
            transactionType.replaceAll("_", " "),

        amount: Math.abs(rawAmount),

        direction:
            transaction.direction ??
            (isDebit ? "debit" : "credit"),

        status:
            String(
                transaction.status ??
                "completed"
            ).toLowerCase(),

        reference:
            transaction.reference ??
            transaction.payment_reference ??
            transaction.transaction_reference ??
            null,

        balance_before: safeNumber(
            transaction.balance_before
        ),

        balance_after: safeNumber(
            transaction.balance_after
        ),

        created_at:
            transaction.created_at ??
            transaction.transaction_date ??
            transaction.updated_at ??
            null,
    };
}

/**
 * Converts the wallet endpoint response into one predictable shape.
 *
 * Supported backend formats include:
 *
 * {
 *   wallet: {...},
 *   transactions: [...]
 * }
 *
 * or:
 *
 * {
 *   wallet_id: "...",
 *   balance: 0,
 *   transactions: [...]
 * }
 */
function normalizeWorkerWalletResponse(data = {}) {
    const walletSource =
        data.wallet ??
        data.worker_wallet ??
        data;

    const transactionsSource =
        data.transactions ??
        data.wallet_transactions ??
        walletSource.transactions ??
        [];

    return {
        wallet: {
            wallet_id:
                walletSource.wallet_id ??
                walletSource.id ??
                null,

            worker_id:
                walletSource.worker_id ??
                data.worker_id ??
                null,

            status:
                String(
                    walletSource.status ??
                    walletSource.wallet_status ??
                    "active"
                ).toLowerCase(),

            available_balance: safeNumber(
                walletSource.available_balance ??
                walletSource.balance
            ),

            total_earnings: safeNumber(
                walletSource.total_earnings ??
                data.total_earnings
            ),

            pending_withdrawal: safeNumber(
                walletSource.pending_withdrawal ??
                walletSource.pending_withdrawals ??
                data.pending_withdrawal
            ),

            total_withdrawn: safeNumber(
                walletSource.total_withdrawn ??
                data.total_withdrawn
            ),

            platform_commission: safeNumber(
                walletSource.platform_commission ??
                walletSource.total_commission ??
                data.platform_commission
            ),

            escrow_balance: safeNumber(
                walletSource.escrow_balance ??
                walletSource.unreleased_earnings ??
                data.escrow_balance
            ),

            created_at:
                walletSource.created_at ??
                null,

            updated_at:
                walletSource.updated_at ??
                null,
        },

        transactions: Array.isArray(transactionsSource)
            ? transactionsSource.map(normalizeWalletTransaction)
            : [],
    };
}

/**
 * Load all workers visible to the admin.
 */
export async function getAdminWorkers(status = "") {
    const response = await api.get("/admin/workers", {
        params: status ? { status } : {},
    });

    return Array.isArray(response.data)
        ? response.data
        : [];
}

/**
 * Load a worker's complete administrative record.
 */
export async function getAdminWorkerDetails(workerId) {
    const safeWorkerId = requireWorkerId(workerId);

    const response = await api.get(
        `/admin/workers/${safeWorkerId}`
    );

    return response.data;
}

/**
 * Approve a worker.
 */
export async function approveAdminWorker(workerId) {
    const safeWorkerId = requireWorkerId(workerId);

    const response = await api.patch(
        `/admin/workers/${safeWorkerId}/approve`
    );

    return response.data;
}

/**
 * Suspend a worker.
 */
export async function suspendAdminWorker(workerId) {
    const safeWorkerId = requireWorkerId(workerId);

    const response = await api.patch(
        `/admin/workers/${safeWorkerId}/suspend`
    );

    return response.data;
}

/**
 * Reactivate a suspended worker.
 */
export async function reactivateAdminWorker(workerId) {
    const safeWorkerId = requireWorkerId(workerId);

    const response = await api.patch(
        `/admin/workers/${safeWorkerId}/reactivate`
    );

    return response.data;
}

/**
 * Reject a worker application.
 */
export async function rejectAdminWorker(workerId) {
    const safeWorkerId = requireWorkerId(workerId);

    const response = await api.patch(
        `/admin/workers/${safeWorkerId}/reject`
    );

    return response.data;
}

/**
 * Load a worker's wallet and transaction history.
 *
 * Current backend endpoint:
 * GET /wallet/{worker_id}
 */
export async function getAdminWorkerWallet(workerId) {
    const safeWorkerId = requireWorkerId(workerId);

    const response = await api.get(
        `/wallet/${safeWorkerId}`
    );

    return normalizeWorkerWalletResponse(
        response.data
    );
}

/**
 * Load only a worker's normalized wallet transactions.
 *
 * This reuses GET /wallet/{worker_id}, because that endpoint
 * already returns both wallet information and transactions.
 */
export async function getAdminWorkerWalletTransactions(workerId) {
    const walletData = await getAdminWorkerWallet(workerId);

    return Array.isArray(walletData?.transactions)
        ? walletData.transactions
        : [];
}