import { useEffect, useState } from "react";
import {
    Lock,
    Landmark,
    CheckCircle,
    RotateCcw,
    Wallet as WalletIcon,
} from "lucide-react";

import {
    getWorkerWallet,
    getWorkerWalletTransactions,
    requestWorkerWithdrawal,
} from "../../api/workerApi";

export default function WorkerWallet() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadWallet();
    }, []);

    async function loadWallet() {
        try {
            const walletData = await getWorkerWallet();
            const transactionData = await getWorkerWalletTransactions();

            setWallet(walletData);
            setTransactions(transactionData || []);
        } catch (err) {
            console.error("Failed to load wallet:", err);
            setError("Unable to load wallet.");
        } finally {
            setLoading(false);
        }
    }

    function isWithdrawal(tx) {
        const type = tx.transaction_type || "";
        const description = tx.description || "";

        return (
            type.includes("withdrawal") ||
            description.toLowerCase().includes("withdrawal")
        );
    }

    function isEscrow(tx) {
        return tx.transaction_type === "pending_credit";
    }

    function getTransactionTitle(tx) {
        const type = tx.transaction_type || "";
        const description = tx.description || "";

        if (type === "pending_credit") return "Job Payment Held in Escrow";
        if (type === "release_credit") return "Job Payment Released";
        if (type === "withdrawal") return "Withdrawal Request";
        if (type === "withdrawal_paid") return "Withdrawal Completed";
        if (type === "reversal") return "Transaction Reversed";

        if (description.toLowerCase().includes("withdrawal paid")) {
            return "Withdrawal Completed";
        }

        if (description.toLowerCase().includes("withdrawal request")) {
            return "Withdrawal Request";
        }

        return description || type || "Wallet Transaction";
    }

    function getStatusLabel(tx) {
        const type = tx.transaction_type || "";
        const status = tx.status || "";

        if (type === "pending_credit") return "Held in Escrow";
        if (type === "release_credit") return "Released";

        if (type === "withdrawal") {
            return status === "pending" ? "Pending Approval" : "Approved";
        }

        if (type === "withdrawal_paid") return "Completed";
        if (status === "success") return "Completed";
        if (status === "pending") return "Pending Approval";

        return status || "Unknown";
    }

    function getBadgeClass(tx) {
        if (tx.transaction_type === "pending_credit") {
            return "bg-yellow-100 text-yellow-700";
        }

        if (tx.transaction_type === "release_credit") {
            return "bg-green-100 text-green-700";
        }

        if (tx.transaction_type === "withdrawal" && tx.status === "pending") {
            return "bg-orange-100 text-orange-700";
        }

        if (tx.status === "success") {
            return "bg-green-100 text-green-700";
        }

        return "bg-slate-100 text-slate-700";
    }

    function getTransactionIcon(tx) {
        if (tx.transaction_type === "pending_credit") {
            return <Lock size={18} className="text-yellow-600" />;
        }

        if (tx.transaction_type === "release_credit") {
            return <WalletIcon size={18} className="text-green-600" />;
        }

        if (isWithdrawal(tx) && tx.status === "success") {
            return <CheckCircle size={18} className="text-green-600" />;
        }

        if (isWithdrawal(tx)) {
            return <Landmark size={18} className="text-red-600" />;
        }

        if (tx.transaction_type === "reversal") {
            return <RotateCcw size={18} className="text-purple-600" />;
        }

        return <WalletIcon size={18} className="text-slate-600" />;
    }

    const filteredTransactions = transactions.filter((tx) => {
        if (filter === "credits") return !isWithdrawal(tx);
        if (filter === "withdrawals") return isWithdrawal(tx);
        if (filter === "pending") return tx.status === "pending";
        return true;
    });

    function getEmptyMessage() {
        if (filter === "pending") return "No pending transactions.";
        if (filter === "withdrawals") return "No withdrawals yet.";
        if (filter === "credits") return "No payment credits yet.";
        return "No transactions yet.";
    }

    async function handleWithdrawal() {
        setMessage("");
        setError("");

        const amount = Number(withdrawAmount);

        if (!amount || amount <= 0) {
            setError("Enter a valid withdrawal amount.");
            return;
        }

        if (wallet && amount > Number(wallet.available_balance || 0)) {
            setError("Withdrawal amount is higher than available balance.");
            return;
        }

        try {
            await requestWorkerWithdrawal(amount);
            setMessage("Withdrawal request submitted successfully.");
            setWithdrawAmount("");
            await loadWallet();
        } catch (err) {
            console.error("Withdrawal request failed:", err);
            setError("Unable to submit withdrawal request.");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
                <p className="text-slate-600">Loading wallet...</p>
            </div>
        );
    }

    const availableBalance = Number(wallet?.available_balance || 0);

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                <h1 className="text-2xl font-bold">Wallet</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
                        {message}
                    </div>
                )}

                <div className="bg-green-600 text-white rounded-2xl shadow p-5">
                    <p className="text-green-100">Available Balance</p>
                    <h2 className="text-3xl font-bold mt-2">
                        NGN {availableBalance.toLocaleString()}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl shadow p-5 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-slate-500 text-sm">Pending Escrow</p>
                        <h2 className="text-xl font-bold">
                            NGN {Number(wallet?.pending_balance || 0).toLocaleString()}
                        </h2>
                    </div>

                    <div>
                        <p className="text-slate-500 text-sm">Lifetime Earnings</p>
                        <h2 className="text-xl font-bold">
                            NGN {Number(wallet?.total_earned || 0).toLocaleString()}
                        </h2>
                    </div>

                    <div>
                        <p className="text-slate-500 text-sm">Currency</p>
                        <h2 className="font-semibold">{wallet?.currency || "NGN"}</h2>
                    </div>

                    <div>
                        <p className="text-slate-500 text-sm">Status</p>
                        <h2 className="font-semibold capitalize">
                            {wallet?.status || "active"}
                        </h2>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-3 text-sm">
                    Escrow funds become available after the customer confirms successful job completion.
                </div>

                <div className="bg-white rounded-2xl shadow p-5 space-y-4">
                    <h2 className="font-bold text-lg">Recent Transactions</h2>

                    <div className="grid grid-cols-4 gap-2 text-sm">
                        {["all", "credits", "withdrawals", "pending"].map((item) => (
                            <button
                                key={item}
                                onClick={() => setFilter(item)}
                                className={`py-2 rounded-xl font-semibold capitalize ${filter === item
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <p className="text-slate-500">{getEmptyMessage()}</p>
                    ) : (
                        filteredTransactions.map((tx) => {
                            const escrow = isEscrow(tx);
                            const withdrawal = isWithdrawal(tx);

                            return (
                                <div
                                    key={tx.id}
                                    className="border-b border-slate-100 py-4 px-2 hover:bg-slate-50 transition rounded-lg last:border-b-0"
                                >
                                    <div className="flex justify-between gap-3">
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                {getTransactionIcon(tx)}
                                            </div>

                                            <div>
                                                <p className="font-semibold">
                                                    {getTransactionTitle(tx)}
                                                </p>

                                                <span
                                                    className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getBadgeClass(tx)}`}
                                                >
                                                    {getStatusLabel(tx)}
                                                </span>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    {tx.created_at
                                                        ? new Date(tx.created_at).toLocaleDateString()
                                                        : ""}
                                                    {" • "}
                                                    {tx.created_at
                                                        ? new Date(tx.created_at).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : ""}
                                                </p>

                                                {tx.reference && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Ref: {tx.reference}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <p
                                            className={`font-bold text-right ${escrow
                                                    ? "text-green-600"
                                                    : withdrawal
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                        >
                                            {withdrawal ? "-" : "+"}
                                            NGN {Number(tx.amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow p-5 space-y-4">
                    <h2 className="font-bold text-lg">Request Withdrawal</h2>

                    <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount"
                        disabled={availableBalance <= 0}
                        className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                    />

                    <button
                        onClick={handleWithdrawal}
                        disabled={availableBalance <= 0}
                        className={`w-full py-3 rounded-xl font-semibold text-white ${availableBalance <= 0
                                ? "bg-gray-400"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {availableBalance <= 0
                            ? "No funds available"
                            : "Submit Withdrawal Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}