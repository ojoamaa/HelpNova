import { useEffect, useState } from "react";
import { getWorkerWallet, requestWorkerWithdrawal } from "../../api/workerApi";

export default function WorkerWallet() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadWallet() {
            try {
                const data = await getWorkerWallet();
                setWallet(data);
            } catch (err) {
                console.error("Failed to load wallet:", err);
                setError("Unable to load wallet.");
            } finally {
                setLoading(false);
            }
        }

        loadWallet();
    }, []);

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
                        NGN {Number(wallet?.available_balance || 0).toLocaleString()}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl shadow p-5 space-y-3">
                    <div>
                        <p className="text-slate-500">Pending Balance</p>
                        <h2 className="text-2xl font-bold">
                            NGN {Number(wallet?.pending_balance || 0).toLocaleString()}
                        </h2>
                    </div>

                    <div>
                        <p className="text-slate-500">Total Earned</p>
                        <h2 className="text-2xl font-bold">
                            NGN {Number(wallet?.total_earned || 0).toLocaleString()}
                        </h2>
                    </div>

                    <div>
                        <p className="text-slate-500">Currency</p>
                        <h2 className="font-semibold">{wallet?.currency || "NGN"}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-5 space-y-4">
                    <h2 className="font-bold text-lg">Request Withdrawal</h2>

                    <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={handleWithdrawal}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                    >
                        Submit Withdrawal Request
                    </button>
                </div>
            </div>
        </div>
    );
}