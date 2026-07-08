import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Wallet,
    Banknote,
    Clock,
    CheckCircle,
    RefreshCcw,
    Download,
    Search,
    ArrowLeft,
} from "lucide-react";

import {
    getFinanceSummary,
    getAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    markWithdrawalPaid,
} from "../../api/adminFinanceApi";

function getStatusBadge(status) {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "approved") return "bg-blue-100 text-blue-700";
    if (status === "paid") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
}

function getCardStyle(index) {
    const styles = [
        "from-blue-50 to-white border-blue-200",
        "from-amber-50 to-white border-amber-200",
        "from-green-50 to-white border-green-200",
        "from-orange-50 to-white border-orange-200",
        "from-indigo-50 to-white border-indigo-200",
        "from-emerald-50 to-white border-emerald-200",
    ];

    return styles[index] || "from-slate-50 to-white border-slate-200";
}

export default function AdminFinanceDashboard() {
    const [summary, setSummary] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        loadFinanceData();
    }, []);

    async function loadFinanceData() {
        try {
            const summaryData = await getFinanceSummary();
            const withdrawalData = await getAllWithdrawals();

            setSummary(summaryData);
            setWithdrawals(withdrawalData || []);
        } catch (err) {
            console.error("Failed to load finance dashboard:", err);
        } finally {
            setLoading(false);
        }
    }

    function money(value) {
        return `NGN ${Number(value || 0).toLocaleString()}`;
    }

    async function handleAction(type, withdrawalId, amount) {
        const message =
            type === "approve"
                ? `Approve withdrawal of ${money(amount)}?`
                : type === "reject"
                    ? `Reject withdrawal of ${money(amount)}?`
                    : `Mark withdrawal of ${money(amount)} as paid?`;

        if (!confirm(message)) return;

        try {
            setActionLoading(withdrawalId);

            if (type === "approve") await approveWithdrawal(withdrawalId);
            if (type === "reject") await rejectWithdrawal(withdrawalId);
            if (type === "paid") await markWithdrawalPaid(withdrawalId);

            await loadFinanceData();
        } catch (err) {
            console.error("Finance action failed:", err);
            alert("Action failed. Please check wallet balance or withdrawal status.");
        } finally {
            setActionLoading("");
        }
    }

    const filteredWithdrawals = withdrawals.filter((w) => {
        const text = `${w.worker_id} ${w.account_name} ${w.bank_name} ${w.account_number}`.toLowerCase();
        return (
            text.includes(search.toLowerCase()) &&
            (statusFilter === "all" || w.status === statusFilter)
        );
    });

    function exportCSV() {
        const rows = [
            ["Worker", "Worker ID", "Amount", "Bank", "Account Name", "Account Number", "Status", "Requested"],
            ...filteredWithdrawals.map((w) => [
                w.account_name || "Worker",
                w.worker_id,
                w.amount,
                w.bank_name,
                w.account_name,
                w.account_number,
                w.status,
                w.requested_at,
            ]),
        ];

        const csv = rows.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "helpnova-withdrawals.csv";
        link.click();
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
                <p>Loading finance dashboard...</p>
            </div>
        );
    }

    const cards = [
        { title: "Total Wallet Balance", value: money(summary?.total_wallet_balance), icon: Wallet },
        { title: "Pending Escrow", value: money(summary?.total_pending_escrow), icon: Clock },
        { title: "Worker Earnings", value: money(summary?.total_worker_earned), icon: Banknote },
        { title: "Pending Withdrawals", value: money(summary?.pending_withdrawals), icon: RefreshCcw },
        { title: "Approved Withdrawals", value: money(summary?.approved_withdrawals), icon: CheckCircle },
        { title: "Paid Withdrawals", value: money(summary?.paid_withdrawals), icon: Banknote },
    ];

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-24">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-semibold"
                    >
                        <ArrowLeft size={18} />
                        Back to Admin Dashboard
                    </Link>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Financial Operations
                    </h1>
                    <p className="text-slate-500">
                        Monitor wallet balances, escrow, and worker withdrawals.
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow p-4 text-sm text-slate-600">
                    <span className="font-semibold text-green-700">Wallet Healthy</span>
                    <span className="mx-3">•</span>
                    <span>{summary?.withdrawal_count || 0} Withdrawals</span>
                    <span className="mx-3">•</span>
                    <span>{money(summary?.approved_withdrawals)} Approved</span>
                    <span className="mx-3">•</span>
                    <span>Last Updated: {new Date().toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cards.map((card, index) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className={`rounded-2xl bg-gradient-to-br ${getCardStyle(
                                    index
                                )} border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-slate-500 text-sm">{card.title}</p>
                                        <h2 className="text-2xl font-bold mt-2 text-slate-900">
                                            {card.value}
                                        </h2>
                                    </div>
                                    <Icon className="text-blue-600" size={40} strokeWidth={1.5} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-2xl shadow p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <h2 className="text-xl font-bold">Withdrawal Management</h2>

                        <button
                            onClick={exportCSV}
                            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search worker, bank, account..."
                                className="w-full border rounded-xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-slate-500">
                                    <th className="py-3">Worker</th>
                                    <th>Amount</th>
                                    <th>Bank</th>
                                    <th>Status</th>
                                    <th>Requested</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredWithdrawals.map((w) => (
                                    <tr key={w.id} className="border-b hover:bg-slate-50">
                                        <td className="py-3">
                                            <div className="font-semibold">👤 {w.account_name || "Worker"}</div>
                                            <div className="text-xs text-slate-500">Verified Worker</div>
                                            <div className="text-xs text-slate-400">ID: {w.worker_id}</div>
                                        </td>

                                        <td className="font-semibold">{money(w.amount)}</td>

                                        <td>
                                            <div>{w.bank_name}</div>
                                            <div className="text-slate-500">{w.account_name}</div>
                                            <div className="text-slate-400">{w.account_number}</div>
                                        </td>

                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(w.status)}`}
                                            >
                                                {w.status}
                                            </span>
                                        </td>

                                        <td>
                                            {w.requested_at
                                                ? new Date(w.requested_at).toLocaleString()
                                                : "-"}
                                        </td>

                                        <td className="space-x-2">
                                            {w.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction("approve", w.id, w.amount)}
                                                        disabled={actionLoading === w.id}
                                                        className="bg-green-600 text-white px-3 py-1 rounded-full"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        onClick={() => handleAction("reject", w.id, w.amount)}
                                                        disabled={actionLoading === w.id}
                                                        className="bg-red-600 text-white px-3 py-1 rounded-full"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {w.status === "approved" && (
                                                <button
                                                    onClick={() => handleAction("paid", w.id, w.amount)}
                                                    disabled={actionLoading === w.id}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded-full"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}

                                            {w.status === "paid" && (
                                                <span className="text-green-600 font-semibold">
                                                    Completed
                                                </span>
                                            )}

                                            {w.status === "rejected" && (
                                                <span className="text-red-600 font-semibold">
                                                    Rejected
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {filteredWithdrawals.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center text-slate-500">
                                            No withdrawals found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}