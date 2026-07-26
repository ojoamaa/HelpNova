import { useEffect, useState } from "react";
import { Phone, MapPin, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    getAcceptedJobs,
    markWorkerOnMyWay,
    markWorkerArrived,
    startWorkerJob,
    completeWorkerJob,
} from "../../api/workerApi";

export default function WorkerCurrentJob() {
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadCurrentJob() {
            try {
                const jobs = await getAcceptedJobs();

                const activeJob =
                    jobs.find((item) =>
                        ["accepted", "on_my_way", "arrived", "started", "in_progress"].includes(
                            String(item.assignment_status || item.status || "").toLowerCase()
                        )
                    ) || null;

                setJob(activeJob);
            } catch (error) {
                console.error("Failed to load current job:", error);
                setJob(null);
            } finally {
                setLoading(false);
            }
        }

        loadCurrentJob();
    }, []);

    async function handleAction(actionName) {
        if (!job) return;

        try {
            setActionLoading(actionName);
            setMessage("");

            if (actionName === "on_my_way") {
                await markWorkerOnMyWay(job.job_id || job.id, job.worker_id);
                setMessage("Status updated: On My Way");
                setJob({ ...job, status: "on_my_way" });
            }

            if (actionName === "arrived") {
                await markWorkerArrived(job.job_id || job.id, job.worker_id);
                setMessage("Status updated: Arrived");
                setJob({ ...job, status: "arrived" });
            }

            if (actionName === "start") {
                await startWorkerJob(job.job_id || job.id, job.worker_id);
                setMessage("Job started successfully");
                setJob({ ...job, status: "started" });
            }

            if (actionName === "complete") {
                await completeWorkerJob(job.job_id || job.id, job.worker_id);
                setMessage("Job completed successfully");
                setJob({ ...job, status: "completed" });
            }
        } catch (error) {
            console.error("Failed to update job status:", error);
            setMessage("Unable to update job status.");
        } finally {
            setActionLoading("");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
                <p className="text-slate-600">Loading current job...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-100 p-4">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-5">
                    <button
                        onClick={() => navigate("/worker")}
                        className="flex items-center gap-2 text-blue-600 font-semibold mb-4"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <h1 className="text-xl font-bold">Current Job</h1>
                    <p className="text-slate-600 mt-3">No accepted job available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                <button
                    onClick={() => navigate("/worker")}
                    className="flex items-center gap-2 text-blue-600 font-semibold"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div className="bg-blue-600 text-white rounded-2xl shadow p-5">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <p className="text-blue-100 mt-1">{job.description}</p>
                </div>

                <div className="bg-white rounded-2xl shadow p-4 space-y-3">
                    <h2 className="font-bold text-lg">Customer Details</h2>

                    <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {job.customer_name}
                    </p>

                    <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {job.customer_phone || "Not available"}
                    </p>

                    {job.customer_phone && (
                        <a
                            href={`tel:${job.customer_phone}`}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold"
                        >
                            <Phone size={18} />
                            Call Customer
                        </a>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow p-4 space-y-3">
                    <h2 className="font-bold text-lg">Job Location</h2>

                    <div className="flex items-start gap-2">
                        <MapPin size={20} className="mt-1" />
                        <p>{job.location}</p>
                    </div>

                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            job.location
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center bg-slate-800 text-white py-3 rounded-xl font-semibold"
                    >
                        Open in Google Maps
                    </a>
                </div>

                <div className="bg-white rounded-2xl shadow p-4 space-y-2">
                    <h2 className="font-bold text-lg">Job Summary</h2>
                    <p><span className="font-semibold">Priority:</span> {job.priority}</p>
                    <p><span className="font-semibold">Status:</span> {job.status}</p>
                    <p>
                        <span className="font-semibold">Price:</span> NGN{" "}
                        {Number(job.price || 0).toLocaleString()}
                    </p>
                </div>

                {message && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-3 text-sm">
                        {message}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow p-4 space-y-3">
                    <h2 className="font-bold text-lg">Job Actions</h2>

                    <button
                        onClick={() => handleAction("on_my_way")}
                        disabled={actionLoading !== ""}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-400"
                    >
                        {actionLoading === "on_my_way" ? "Updating..." : "On My Way"}
                    </button>

                    <button
                        onClick={() => handleAction("arrived")}
                        disabled={actionLoading !== ""}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-400"
                    >
                        {actionLoading === "arrived" ? "Updating..." : "Arrived"}
                    </button>

                    <button
                        onClick={() => handleAction("start")}
                        disabled={actionLoading !== ""}
                        className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-400"
                    >
                        {actionLoading === "start" ? "Updating..." : "Start Job"}
                    </button>

                    <button
                        onClick={() => handleAction("complete")}
                        disabled={actionLoading !== ""}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} />
                        {actionLoading === "complete" ? "Updating..." : "Complete Job"}
                    </button>
                </div>
            </div>
        </div>
    );
}