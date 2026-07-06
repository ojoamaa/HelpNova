import { useEffect, useState } from "react";
import {
    acceptWorkerJob,
    getWorkerJobRequests,
    rejectWorkerJob,
} from "../../api/workerApi";

export default function WorkerJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const loadJobs = async () => {
        try {
            setError("");
            setLoading(true);

            const data = await getWorkerJobRequests();

            if (Array.isArray(data)) {
                setJobs(data);
            } else if (Array.isArray(data?.jobs)) {
                setJobs(data.jobs);
            } else if (Array.isArray(data?.job_requests)) {
                setJobs(data.job_requests);
            } else {
                setJobs([]);
            }
        } catch (err) {
            console.error("Failed to load worker jobs:", err);
            setError("Unable to load job requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleAccept = async (jobId) => {
        try {
            setActionLoading(jobId);
            await acceptWorkerJob(jobId);
            await loadJobs();
        } catch (err) {
            console.error("Failed to accept job:", err);
            setError("Unable to accept job.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (jobId) => {
        try {
            setActionLoading(jobId);
            await rejectWorkerJob(jobId);
            await loadJobs();
        } catch (err) {
            console.error("Failed to reject job:", err);
            setError("Unable to reject job.");
        } finally {
            setActionLoading(null);
        }
    };

    const formatAmount = (amount) => {
        const value = Number(amount || 0);
        return `NGN ${value.toLocaleString()}`;
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
            <h1 className="text-2xl font-bold">Job Requests</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                    {error}
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-2xl shadow p-4 text-slate-600">
                    Loading job requests...
                </div>
            )}

            {!loading && jobs.length === 0 && (
                <div className="bg-white rounded-2xl shadow p-4 text-slate-600">
                    No job requests available.
                </div>
            )}

            {!loading &&
                jobs.map((job) => {
                    const jobId = job.id || job.job_id;
                    const title =
                        job.title ||
                        job.service_name ||
                        job.category_name ||
                        job.job_title ||
                        "Service Request";

                    const location =
                        job.location ||
                        job.address ||
                        job.customer_location ||
                        "Location not provided";

                    const price =
                        job.price ||
                        job.amount ||
                        job.estimated_price ||
                        job.total_amount ||
                        0;

                    const isUrgent = job.is_urgent || job.urgent || job.priority === "urgent";

                    return (
                        <div key={jobId} className="bg-white rounded-2xl shadow p-4">
                            <h2 className="font-bold">{title}</h2>

                            <p className="text-slate-600">Location: {location}</p>
                            <p className="text-slate-600">Price: {formatAmount(price)}</p>

                            {isUrgent && (
                                <p className="text-orange-600 font-semibold">Urgent</p>
                            )}

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button
                                    onClick={() => handleAccept(jobId)}
                                    disabled={actionLoading === jobId}
                                    className="bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-green-300"
                                >
                                    {actionLoading === jobId ? "Processing..." : "Accept"}
                                </button>

                                <button
                                    onClick={() => handleReject(jobId)}
                                    disabled={actionLoading === jobId}
                                    className="bg-red-600 text-white py-3 rounded-xl font-semibold disabled:bg-red-300"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}