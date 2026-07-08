import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Activity,
    Users,
    Briefcase,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Clock,
    Navigation,
} from "lucide-react";

import {
    getLiveOperationsSummary,
    getLiveJobQueue,
} from "../../api/adminOperationsApi";

export default function LiveOperationsCenter() {
    const [summary, setSummary] = useState(null);
    const [liveJobs, setLiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOperationsSummary();
    }, []);

    async function loadOperationsSummary() {
        try {
            const data = await getLiveOperationsSummary();
            const jobs = await getLiveJobQueue();

            setSummary(data);
            setLiveJobs(jobs || []);
        } catch (err) {
            console.error("Failed to load operations summary:", err);
        } finally {
            setLoading(false);
        }
    }

    const operationCards = [
        {
            title: "Workers Online",
            value: summary?.workers_online || 0,
            note: "Available for dispatch",
            icon: Users,
        },
        {
            title: "New Job Requests",
            value: summary?.new_job_requests || 0,
            note: "Waiting for assignment",
            icon: Briefcase,
        },
        {
            title: "Jobs In Progress",
            value: summary?.jobs_in_progress || 0,
            note: "Currently active",
            icon: Activity,
        },
        {
            title: "Workers En Route",
            value: summary?.workers_en_route || 0,
            note: "On the way to customers",
            icon: Navigation,
        },
        {
            title: "Completed Today",
            value: summary?.completed_today || 0,
            note: "Successful service delivery",
            icon: CheckCircle,
        },
        {
            title: "Delayed Jobs",
            value: summary?.delayed_jobs || 0,
            note: "Needs operations review",
            icon: Clock,
        },
        {
            title: "Emergency Requests",
            value: summary?.emergency_requests || 0,
            note: "High priority jobs",
            icon: AlertTriangle,
        },
        {
            title: "Active Locations",
            value: summary?.active_locations || 0,
            note: "Cities with current activity",
            icon: MapPin,
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
                <p className="text-slate-600">Loading live operations...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900"
                >
                    <ArrowLeft size={18} />
                    Back to Admin Dashboard
                </Link>

                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl">
                    <p className="text-blue-200 font-semibold">HelpNova Live Operations</p>
                    <h1 className="text-3xl font-bold mt-2">
                        Dispatch & Field Monitoring Center
                    </h1>
                    <p className="text-slate-300 mt-2">
                        Monitor live jobs, worker movement, emergency requests and operational performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {operationCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 hover:shadow-xl transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-500 text-sm">{card.title}</p>
                                        <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                                        <p className="text-xs text-slate-500 mt-1">{card.note}</p>
                                    </div>
                                    <Icon className="text-blue-600" size={34} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="bg-white rounded-2xl shadow p-5 lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Live Job Queue</h2>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-5 bg-slate-50 text-slate-500 text-sm font-semibold p-3">
                                <span>Job</span>
                                <span>Worker</span>
                                <span>Status</span>
                                <span>Location</span>
                                <span>Priority</span>
                            </div>

                            {liveJobs.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">
                                    No live jobs yet.
                                </div>
                            ) : (
                                liveJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="grid grid-cols-5 p-3 border-t text-sm items-center"
                                    >
                                        <span className="font-semibold">{job.title || "Untitled Job"}</span>
                                        <span>{job.worker_name || "Unassigned"}</span>
                                        <span className="capitalize">{job.status || "unknown"}</span>
                                        <span>{job.city || "-"} {job.area ? `- ${job.area}` : ""}</span>
                                        <span className="capitalize">{job.urgency || "normal"}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-5">
                        <h2 className="text-xl font-bold mb-4">Operations Alerts</h2>

                        <div className="space-y-3">
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-700 text-sm">
                                System is stable.
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-blue-700 text-sm">
                                GPS tracking module will connect here later.
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-yellow-700 text-sm">
                                Emergency dispatch monitoring is ready for integration.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-5">
                    <h2 className="text-xl font-bold mb-4">Nigeria Field Coverage</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            "FCT Abuja",
                            "Lagos",
                            "Kano",
                            "Kaduna",
                            "Port Harcourt",
                            "Ibadan",
                            "Enugu",
                            "Jos",
                        ].map((city) => (
                            <div
                                key={city}
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                            >
                                <p className="font-semibold">{city}</p>
                                <p className="text-sm text-slate-500 mt-1">Live Jobs: 0</p>
                                <p className="text-sm text-slate-500">Online Workers: 0</p>
                                <p className="text-sm text-slate-500">Emergency: 0</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}