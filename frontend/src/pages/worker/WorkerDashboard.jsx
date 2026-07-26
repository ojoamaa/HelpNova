import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Bell,
    Briefcase,
    CheckCircle2,
    Circle,
    MapPin,
    RefreshCw,
    Star,
    ToggleLeft,
    ToggleRight,
    Wallet,
} from "lucide-react";

import api from "../../api/api";
import {
    getAcceptedJobs,
    getWorkerPerformance,
} from "../../api/workerApi";
import { getWorkerActivation } from "../../utils/workerActivation";

function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
    return safeNumber(value).toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function normalizeJobs(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.jobs)) {
        return value.jobs;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    return [];
}

export default function WorkerDashboard() {
    const navigate = useNavigate();

    const workerId = localStorage.getItem("helpnova_worker_id");
    const storedName = localStorage.getItem("helpnova_worker_name");

    const [worker, setWorker] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [acceptedJobs, setAcceptedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [availabilityBusy, setAvailabilityBusy] = useState(false);

    async function loadWorkerData({ showRefresh = false } = {}) {
        if (!workerId) {
            navigate("/worker/login", {
                replace: true,
            });
            return;
        }

        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const results = await Promise.allSettled([
                api.get(`/workers/${encodeURIComponent(workerId)}`),
                getWorkerPerformance(workerId),
                getAcceptedJobs(workerId),
            ]);

            const [workerResult, performanceResult, jobsResult] = results;

            if (workerResult.status === "fulfilled") {
                setWorker(workerResult.value?.data || null);
            } else {
                throw workerResult.reason;
            }

            if (performanceResult.status === "fulfilled") {
                setPerformance(performanceResult.value || null);
            } else {
                console.warn(
                    "Worker performance could not be loaded:",
                    performanceResult.reason
                );
                setPerformance(null);
            }

            if (jobsResult.status === "fulfilled") {
                setAcceptedJobs(normalizeJobs(jobsResult.value));
            } else {
                console.warn(
                    "Accepted jobs could not be loaded:",
                    jobsResult.reason
                );
                setAcceptedJobs([]);
            }
        } catch (err) {
            if (err?.response?.status === 404) {
                setError("The authenticated worker profile could not be found.");
            } else {
                setError(
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Unable to load the worker dashboard."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadWorkerData();
    }, [workerId]);

    const performanceData =
        performance?.performance || performance || {};

    const jobsSummary =
        performanceData?.jobs || performance?.jobs || {};

    const wallet =
        performanceData?.wallet || performance?.wallet || {};

    const ratings =
        performanceData?.ratings || performance?.ratings || {};

    const mergedWorker = useMemo(
        () => ({
            ...(performanceData?.worker || {}),
            ...(performance?.worker || {}),
            ...(worker || {}),
        }),
        [performance, performanceData, worker]
    );

    const currentJob = useMemo(
        () =>
            acceptedJobs.find(
                (job) =>
                    job.assignment_status === "accepted" ||
                    job.status === "accepted" ||
                    job.status === "in_progress"
            ) || null,
        [acceptedJobs]
    );

    const activation = useMemo(
        () =>
            getWorkerActivation({
                ...mergedWorker,
                ...performanceData,

                full_name:
                    mergedWorker.full_name ||
                    mergedWorker.name ||
                    storedName ||
                    "HelpNova Worker",

                guarantor_status:
                    mergedWorker.guarantor_status ||
                    mergedWorker.guarantor_verification_status ||
                    mergedWorker.guarantorStatus ||
                    mergedWorker.guarantorVerificationStatus ||
                    "not_started",

                verification_status:
                    mergedWorker.verification_status || "pending",

                availability_status:
                    mergedWorker.availability_status || "offline",

                jobs: jobsSummary,

                wallet_status: wallet.status,
                wallet_id: wallet.wallet_id || wallet.id,
                wallet_balance:
                    wallet.available_balance ??
                    wallet.balance ??
                    mergedWorker.wallet_balance,

                average_rating:
                    ratings.average_rating ??
                    mergedWorker.average_rating ??
                    0,
            }),
        [
            jobsSummary,
            mergedWorker,
            performanceData,
            ratings.average_rating,
            storedName,
            wallet,
        ]
    );

    const workerName =
        mergedWorker.full_name ||
        mergedWorker.name ||
        storedName ||
        "HelpNova Worker";

    const isOnline =
        String(mergedWorker.availability_status).toLowerCase() ===
        "online" ||
        mergedWorker.is_available === true;

    const guarantorApproved =
        String(
            mergedWorker.guarantor_status ||
            mergedWorker.guarantor_verification_status ||
            mergedWorker.guarantorStatus ||
            mergedWorker.guarantorVerificationStatus ||
            ""
        ).toLowerCase() === "approved";

    async function toggleAvailability() {
        if (!workerId || availabilityBusy) {
            return;
        }

        const nextStatus = isOnline ? "offline" : "online";

        setAvailabilityBusy(true);
        setError("");

        try {
            const response = await api.patch(
                `/workers/${encodeURIComponent(workerId)}/availability`,
                {
                    availability_status: nextStatus,
                }
            );

            const updatedWorker = response?.data || {};

            setWorker((current) => ({
                ...(current || {}),
                ...updatedWorker,
                availability_status:
                    updatedWorker.availability_status || nextStatus,
            }));
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to update availability."
            );
        } finally {
            setAvailabilityBusy(false);
        }
    }

    function continueActivation() {
        const nextIncompleteCheck = activation.checks.find(
            (check) => !check.complete
        );

        if (nextIncompleteCheck?.key === "guarantor") {
            navigate("/worker/guarantors");
            return;
        }

        if (
            nextIncompleteCheck?.key === "wallet" ||
            nextIncompleteCheck?.key === "finance"
        ) {
            navigate("/worker/wallet");
            return;
        }

        navigate("/worker/profile");
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
                <p className="text-slate-600">
                    Loading worker dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-24">
            <div className="mx-auto max-w-md space-y-4">
                <div className="rounded-2xl bg-blue-600 p-5 text-white shadow">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Worker Dashboard
                            </h1>

                            <p className="mt-1 text-blue-100">
                                Welcome back, {workerName}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                loadWorkerData({
                                    showRefresh: true,
                                })
                            }
                            disabled={refreshing}
                            className="rounded-xl bg-white/15 p-2 hover:bg-white/25 disabled:opacity-50"
                            aria-label="Refresh dashboard"
                        >
                            <RefreshCw
                                size={19}
                                className={refreshing ? "animate-spin" : ""}
                            />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {guarantorApproved && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        <p className="font-semibold">
                            Primary guarantor approved
                        </p>
                        <p className="mt-1">
                            Your approved guarantor now contributes to your
                            HelpNova trust and activation status.
                        </p>
                    </div>
                )}

                <div className="rounded-2xl bg-white p-5 shadow">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-blue-600">
                                ACCOUNT ACTIVATION
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                {activation.level}
                            </h2>

                            <p className="mt-1 text-sm text-slate-600">
                                {activation.opportunity}
                            </p>
                        </div>

                        <div
                            className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
                            style={{
                                background: `conic-gradient(#2563eb ${activation.score}%, #dbeafe 0)`,
                            }}
                        >
                            <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center">
                                <div>
                                    <p className="text-xl font-bold text-blue-700">
                                        {activation.score}%
                                    </p>

                                    <p className="text-[9px] font-semibold text-blue-600">
                                        {activation.rewardTier}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-semibold text-slate-700">
                            Matching Priority
                        </span>

                        <span className="tracking-widest text-amber-500">
                            {"★".repeat(activation.priority.stars)}
                            {"☆".repeat(5 - activation.priority.stars)}
                        </span>

                        <span className="font-semibold text-slate-600">
                            {activation.priority.label}
                        </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                                width: `${activation.score}%`,
                            }}
                        />
                    </div>

                    <div className="mt-4 space-y-2">
                        {activation.checks.map((check) => (
                            <div
                                key={check.key}
                                className="rounded-xl border border-slate-100 p-3"
                            >
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        {check.complete ? (
                                            <CheckCircle2
                                                size={17}
                                                className="shrink-0 text-green-600"
                                            />
                                        ) : (
                                            <Circle
                                                size={17}
                                                className="shrink-0 text-amber-500"
                                            />
                                        )}

                                        <span
                                            className={
                                                check.complete
                                                    ? "text-slate-700"
                                                    : "font-medium text-slate-800"
                                            }
                                        >
                                            {check.label}
                                        </span>
                                    </div>

                                    <span
                                        className={
                                            check.complete
                                                ? "text-green-700"
                                                : "text-amber-700"
                                        }
                                    >
                                        {check.complete ? "Done" : "Pending"}
                                    </span>
                                </div>

                                {!check.complete && (
                                    <div className="mt-2 pl-6">
                                        <p className="text-xs text-slate-500">
                                            {check.action}
                                        </p>

                                        {Array.isArray(check.unlocks) &&
                                            check.unlocks.length > 0 && (
                                                <div className="mt-2 rounded-lg bg-blue-50 p-2">
                                                    <p className="text-[10px] font-bold uppercase text-blue-700">
                                                        Completing this unlocks
                                                    </p>

                                                    {check.unlocks.map((item) => (
                                                        <p
                                                            key={item}
                                                            className="mt-1 text-xs text-blue-800"
                                                        >
                                                            ✓ {item}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {!activation.isFullyActivated && (
                        <>
                            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                <p className="font-semibold">Next step</p>
                                <p>{activation.nextStep}</p>

                                <p className="mt-1 text-xs">
                                    Completing verification improves matching
                                    priority and access to higher-value
                                    opportunities.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={continueActivation}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                Continue Activation
                                <ArrowRight size={18} />
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={toggleAvailability}
                    disabled={availabilityBusy}
                    className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow disabled:opacity-60"
                >
                    <div>
                        <p className="text-sm text-slate-500">
                            Availability
                        </p>

                        <h2
                            className={`text-lg font-bold ${isOnline ? "text-green-600" : "text-slate-500"
                                }`}
                        >
                            {availabilityBusy
                                ? "Updating..."
                                : isOnline
                                    ? "Online"
                                    : "Offline"}
                        </h2>
                    </div>

                    {isOnline ? (
                        <ToggleRight size={42} className="text-green-600" />
                    ) : (
                        <ToggleLeft size={42} className="text-slate-400" />
                    )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <Briefcase className="text-blue-600" />

                        <p className="mt-2 text-sm text-slate-500">
                            Active Jobs
                        </p>

                        <h2 className="text-2xl font-bold">
                            {safeNumber(
                                jobsSummary.active ??
                                jobsSummary.active_jobs ??
                                acceptedJobs.length
                            )}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow">
                        <Wallet className="text-green-600" />

                        <p className="mt-2 text-sm text-slate-500">
                            Wallet Balance
                        </p>

                        <h2 className="text-2xl font-bold">
                            ₦
                            {formatMoney(
                                wallet.available_balance ??
                                wallet.balance ??
                                mergedWorker.wallet_balance
                            )}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow">
                        <Star className="text-yellow-500" />

                        <p className="mt-2 text-sm text-slate-500">
                            Rating
                        </p>

                        <h2 className="text-2xl font-bold">
                            {safeNumber(
                                ratings.average_rating ??
                                mergedWorker.average_rating
                            ).toFixed(1)}{" "}
                            ★
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow">
                        <Bell className="text-red-500" />

                        <p className="mt-2 text-sm text-slate-500">
                            Assignments
                        </p>

                        <h2 className="text-2xl font-bold">
                            {safeNumber(
                                jobsSummary.total_assigned ??
                                jobsSummary.total_jobs ??
                                acceptedJobs.length
                            )}
                        </h2>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow">
                    <h2 className="text-lg font-bold">Current Job</h2>

                    {currentJob ? (
                        <div className="mt-3 space-y-2">
                            <p className="font-semibold">
                                {currentJob.title ||
                                    currentJob.service_name ||
                                    "Assigned service"}
                            </p>

                            <p className="text-slate-600">
                                Customer:{" "}
                                {currentJob.customer_name || "HelpNova customer"}
                            </p>

                            <div className="flex items-center gap-2 text-slate-600">
                                <MapPin size={18} />
                                <span>
                                    {currentJob.location ||
                                        currentJob.address ||
                                        "Location not provided"}
                                </span>
                            </div>

                            {currentJob.priority && (
                                <p className="font-semibold text-orange-600">
                                    Priority: {currentJob.priority}
                                </p>
                            )}

                            <p className="font-semibold text-green-600">
                                Status:{" "}
                                {currentJob.status ||
                                    currentJob.assignment_status ||
                                    "accepted"}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-3 text-slate-500">
                            No accepted job.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/worker/current-job")}
                        disabled={!currentJob}
                        className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Open Job Details
                    </button>
                </div>
            </div>
        </div>
    );
}