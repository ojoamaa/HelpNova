import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Wallet, Star, ToggleRight, MapPin, Bell } from "lucide-react";
import {
    getWorkerPerformance,
    getAcceptedJobs,
} from "../../api/workerApi";

export default function WorkerDashboard() {
    const navigate = useNavigate();

    const [performance, setPerformance] = useState(null);
    const [acceptedJobs, setAcceptedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadWorkerData() {
            const timeout = new Promise((resolve) =>
                setTimeout(() => resolve("timeout"), 5000)
            );

            try {
                const result = await Promise.race([
                    Promise.allSettled([
                        getWorkerPerformance(),
                        getAcceptedJobs(),
                    ]),
                    timeout,
                ]);

                if (!isMounted) return;

                if (result === "timeout") {
                    console.error("Dashboard API timeout");
                    setPerformance(null);
                    setAcceptedJobs([]);
                    setLoading(false);
                    return;
                }

                const [performanceResult, jobsResult] = result;

                if (performanceResult.status === "fulfilled") {
                    setPerformance(performanceResult.value);
                }

                if (jobsResult.status === "fulfilled") {
                    setAcceptedJobs(jobsResult.value || []);
                }
            } catch (error) {
                console.error("Dashboard load failed:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadWorkerData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
                <p className="text-slate-600">Loading worker dashboard...</p>
            </div>
        );
    }

    const worker = performance?.performance?.worker || performance?.worker || {};
    const jobs = performance?.performance?.jobs || performance?.jobs || {};
    const wallet = performance?.performance?.wallet || performance?.wallet || {};
    const ratings = performance?.performance?.ratings || performance?.ratings || {};

    const currentJob =
        acceptedJobs.find((job) => job.assignment_status === "accepted") || null;

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">

                <div className="bg-blue-600 text-white rounded-2xl p-5 shadow">
                    <h1 className="text-2xl font-bold">Worker Dashboard</h1>
                    <p className="text-blue-100 mt-1">
                        Welcome back, {worker.name || "HelpNova Worker"}
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-500">Availability</p>
                        <h2 className="text-lg font-bold text-green-600">Online</h2>
                    </div>
                    <ToggleRight size={42} className="text-green-600" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow">
                        <Briefcase className="text-blue-600" />
                        <p className="text-sm text-slate-500 mt-2">Active Jobs</p>
                        <h2 className="text-2xl font-bold">{jobs.active || 0}</h2>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow">
                        <Wallet className="text-green-600" />
                        <p className="text-sm text-slate-500 mt-2">Wallet Balance</p>
                        <h2 className="text-2xl font-bold">
                            NGN {wallet.available_balance || 0}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow">
                        <Star className="text-yellow-500" />
                        <p className="text-sm text-slate-500 mt-2">Rating</p>
                        <h2 className="text-2xl font-bold">
                            {ratings.average_rating || 0} ★
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow">
                        <Bell className="text-red-500" />
                        <p className="text-sm text-slate-500 mt-2">Notifications</p>
                        <h2 className="text-2xl font-bold">{jobs.total_assigned || 0}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow">
                    <h2 className="font-bold text-lg">Current Job</h2>

                    {currentJob ? (
                        <div className="mt-3 space-y-2">
                            <p className="font-semibold">{currentJob.title}</p>

                            <p className="text-slate-600">
                                Customer: {currentJob.customer_name}
                            </p>

                            <div className="flex items-center gap-2 text-slate-600">
                                <MapPin size={18} />
                                <span>{currentJob.location}</span>
                            </div>

                            <p className="text-orange-600 font-semibold">
                                Priority: {currentJob.priority}
                            </p>

                            <p className="text-green-600 font-semibold">
                                Status: {currentJob.status}
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-500 mt-3">No accepted job.</p>
                    )}

                    <button
                        onClick={() => navigate("/worker/current-job")}
                        disabled={!currentJob}
                        className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Open Job Details
                    </button>
                </div>

            </div>
        </div>
    );
}