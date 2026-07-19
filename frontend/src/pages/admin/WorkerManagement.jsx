import { useEffect, useState } from "react";

import {
    Search,
    Eye,
    ShieldCheck,
    Ban,
    Star,
    X,
    Phone,
    Mail,
    MapPin,
    Wallet,
    Briefcase,
    FileCheck,
    UserCheck,
    Camera,
    Clock,
    ClipboardCheck,
    TrendingUp,
    AlertTriangle,
    Repeat,
    RefreshCcw,
} from "lucide-react";

import {
    getAdminWorkers,
    getAdminWorkerDetails,
    approveAdminWorker,
    suspendAdminWorker,
    reactivateAdminWorker,
    rejectAdminWorker,
    getAdminWorkerWallet,
} from "../../api/workerAdminApi";


const initialDocuments = [
    {
        title: "NIN Verification",
        status: "Verified",
        uploadedOn: "12 Jun 2026",
        verifiedBy: "Admin A001",
        fileType: "Government ID",
        fileSize: "2.1 MB",
    },
    {
        title: "Selfie Verification",
        status: "Matched",
        uploadedOn: "12 Jun 2026",
        verifiedBy: "System AI",
        fileType: "Selfie Image",
        fileSize: "1.4 MB",
    },
    {
        title: "Profile Photograph",
        status: "Uploaded",
        uploadedOn: "12 Jun 2026",
        verifiedBy: "Pending",
        fileType: "Profile Image",
        fileSize: "1.8 MB",
    },
    {
        title: "Address Verification",
        status: "Approved",
        uploadedOn: "13 Jun 2026",
        verifiedBy: "Admin A002",
        fileType: "Utility Bill",
        fileSize: "2.6 MB",
    },
    {
        title: "Guarantor Form",
        status: "Submitted",
        uploadedOn: "14 Jun 2026",
        verifiedBy: "HR Review",
        fileType: "PDF Form",
        fileSize: "3.2 MB",
    },
    {
        title: "Professional Certificate",
        status: "Pending Review",
        uploadedOn: "15 Jun 2026",
        verifiedBy: "Pending",
        fileType: "Certificate PDF",
        fileSize: "2.9 MB",
    },
];

function titleCase(value, fallback = "Not available") {
    if (!value) {
        return fallback;
    }

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function calculateAverageRating(reviews = [], fallback = 0) {
    const validRatings = reviews
        .map((review) => Number(review.rating))
        .filter((rating) => Number.isFinite(rating) && rating > 0);

    if (validRatings.length === 0) {
        return Number(fallback || 0);
    }

    const total = validRatings.reduce(
        (sum, rating) => sum + rating,
        0
    );

    return Number(
        (total / validRatings.length).toFixed(1)
    );
}

function calculatePaymentTotal(payments = [], acceptedStatuses = []) {
    return payments
        .filter((payment) =>
            acceptedStatuses.includes(
                String(payment.status || "").toLowerCase()
            )
        )
        .reduce(
            (sum, payment) =>
                sum + Number(payment.amount || 0),
            0
        );
}

function normalizeWorkerDetails(apiResponse, fallbackWorker = {}) {
    const workerData = apiResponse?.worker || {};
    const assignments = Array.isArray(apiResponse?.assignments)
        ? apiResponse.assignments
        : [];
    const reviews = Array.isArray(apiResponse?.reviews)
        ? apiResponse.reviews
        : [];
    const payments = Array.isArray(apiResponse?.payments)
        ? apiResponse.payments
        : [];

    const acceptedAssignments = assignments.filter((assignment) =>
        ["accepted", "in_progress", "completed"].includes(
            String(assignment.status || "").toLowerCase()
        )
    );

    const rejectedAssignments = assignments.filter(
        (assignment) =>
            String(assignment.status || "").toLowerCase() ===
            "rejected"
    );

    const completedAssignments = assignments.filter(
        (assignment) =>
            String(assignment.status || "").toLowerCase() ===
            "completed"
    );

    const completedJobs = Number(
        workerData.completed_jobs ??
        fallbackWorker.completedJobs ??
        completedAssignments.length ??
        0
    );

    const acceptanceBase =
        acceptedAssignments.length + rejectedAssignments.length;

    const acceptanceRate =
        acceptanceBase > 0
            ? `${Math.round(
                (acceptedAssignments.length / acceptanceBase) * 100
            )}%`
            : "0%";

    const completionRate =
        acceptedAssignments.length > 0
            ? `${Math.round(
                (completedAssignments.length /
                    acceptedAssignments.length) *
                100
            )}%`
            : completedJobs > 0
                ? "100%"
                : "0%";

    const totalEarnings = calculatePaymentTotal(
        payments,
        ["paid", "released", "completed", "successful"]
    );

    const pendingWithdrawal = calculatePaymentTotal(
        payments,
        ["pending", "processing"]
    );

    const locationParts = [
        workerData.area,
        workerData.city,
        workerData.state,
    ].filter(Boolean);

    const verificationStatus = String(
        workerData.verification_status ||
        fallbackWorker.verification_status ||
        fallbackWorker.status ||
        "pending"
    ).toLowerCase();

    const verificationLevel = String(
        workerData.verification_level ||
        fallbackWorker.verification_level ||
        fallbackWorker.verification ||
        "bronze"
    ).toLowerCase();

    const availabilityStatus = String(
        workerData.availability_status ||
        fallbackWorker.availability_status ||
        fallbackWorker.availability ||
        "offline"
    ).toLowerCase();

    return {
        ...fallbackWorker,

        id:
            workerData.worker_id ||
            workerData.id ||
            fallbackWorker.id,

        worker_id:
            workerData.worker_id ||
            workerData.id ||
            fallbackWorker.worker_id ||
            fallbackWorker.id,

        user_id:
            workerData.user_id ||
            fallbackWorker.user_id ||
            null,

        name:
            workerData.full_name ||
            fallbackWorker.name ||
            fallbackWorker.full_name ||
            "Unnamed worker",

        full_name:
            workerData.full_name ||
            fallbackWorker.full_name ||
            fallbackWorker.name ||
            "Unnamed worker",

        profession:
            workerData.profession ||
            fallbackWorker.profession ||
            "Not provided",

        phone:
            workerData.phone_number ||
            fallbackWorker.phone ||
            fallbackWorker.phone_number ||
            "Not provided",

        phone_number:
            workerData.phone_number ||
            fallbackWorker.phone_number ||
            fallbackWorker.phone ||
            "Not provided",

        email:
            workerData.email ||
            fallbackWorker.email ||
            "Not provided",

        location:
            locationParts.length > 0
                ? locationParts.join(", ")
                : fallbackWorker.location || "Not provided",

        address:
            locationParts.length > 0
                ? locationParts.join(", ")
                : fallbackWorker.address ||
                fallbackWorker.location ||
                "Not provided",

        verification:
            titleCase(verificationLevel, "Bronze"),

        verification_level: verificationLevel,

        status:
            titleCase(verificationStatus, "Pending"),

        verification_status: verificationStatus,

        availability:
            titleCase(availabilityStatus, "Offline"),

        availability_status: availabilityStatus,

        rating: calculateAverageRating(
            reviews,
            workerData.average_rating ??
            fallbackWorker.rating ??
            fallbackWorker.average_rating
        ),

        average_rating: calculateAverageRating(
            reviews,
            workerData.average_rating ??
            fallbackWorker.average_rating
        ),

        completedJobs,

        completed_jobs: completedJobs,

        jobsAccepted: acceptedAssignments.length,

        jobsDeclined: rejectedAssignments.length,

        completionRate,

        acceptanceRate,

        totalEarnings,

        walletBalance:
            Number(
                workerData.wallet_balance ??
                fallbackWorker.walletBalance ??
                0
            ),

        pendingWithdrawal,

        trustScore:
            Number(
                workerData.trust_score ??
                fallbackWorker.trustScore ??
                0
            ),

        profileCompletion:
            Number(
                workerData.profile_completion ??
                fallbackWorker.profileCompletion ??
                0
            ),

        onTimeArrival:
            workerData.on_time_arrival_rate
                ? `${workerData.on_time_arrival_rate}%`
                : fallbackWorker.onTimeArrival ||
                "Not available",

        responseTime:
            workerData.response_time ||
            fallbackWorker.responseTime ||
            "Not available",

        yearsExperience:
            Number(
                workerData.years_experience ??
                fallbackWorker.yearsExperience ??
                0
            ),

        repeatCustomers:
            Number(
                workerData.repeat_customers ??
                fallbackWorker.repeatCustomers ??
                0
            ),

        customerComplaints:
            Number(
                workerData.customer_complaints ??
                fallbackWorker.customerComplaints ??
                0
            ),

        ninStatus:
            titleCase(
                workerData.nin_status ||
                fallbackWorker.ninStatus ||
                "pending"
            ),

        documentsStatus:
            titleCase(
                workerData.documents_status ||
                fallbackWorker.documentsStatus ||
                "pending"
            ),

        bankStatus:
            titleCase(
                workerData.bank_status ||
                fallbackWorker.bankStatus ||
                "pending"
            ),

        backgroundCheck:
            titleCase(
                workerData.background_check ||
                fallbackWorker.backgroundCheck ||
                "pending"
            ),

        guarantorStatus:
            titleCase(
                workerData.guarantor_status ||
                fallbackWorker.guarantorStatus ||
                "not submitted"
            ),

        emergencyContactStatus:
            titleCase(
                workerData.emergency_contact_status ||
                fallbackWorker.emergencyContactStatus ||
                "not submitted"
            ),

        lastActive:
            workerData.last_active ||
            fallbackWorker.lastActive ||
            "Not available",

        skills: Array.isArray(workerData.skills)
            ? workerData.skills
            : Array.isArray(fallbackWorker.skills)
                ? fallbackWorker.skills
                : [],

        assignments,

        reviews,

        payments,
    };
}
export default function WorkerManagement() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [workerDetailsLoading, setWorkerDetailsLoading] = useState(false);

    const [selectedWorker, setSelectedWorker] = useState(null);
    const [showDocuments, setShowDocuments] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState(initialDocuments);
    const [documentAction, setDocumentAction] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [toast, setToast] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const [workerActionLoading, setWorkerActionLoading] = useState(false);
    const [workerActionType, setWorkerActionType] = useState("");

    function normalizeWorker(worker) {
        const verificationStatus = String(
            worker.verification_status ||
            worker.status ||
            "pending"
        ).toLowerCase();

        const availabilityStatus = String(
            worker.availability_status ||
            worker.availability ||
            "offline"
        ).toLowerCase();

        const verificationLevel = String(
            worker.verification_level ||
            worker.verification ||
            "bronze"
        ).toLowerCase();

        return {
            ...worker,

            id:
                worker.worker_id ||
                worker.id ||
                "",

            name:
                worker.full_name ||
                worker.name ||
                "Unnamed Worker",

            profession:
                worker.profession ||
                "Not provided",

            phone:
                worker.phone_number ||
                worker.phone ||
                "Not provided",

            email:
                worker.email ||
                "Not provided",

            location:
                worker.location ||
                [
                    worker.area,
                    worker.city,
                    worker.state,
                ]
                    .filter(Boolean)
                    .join(", ") ||
                "Not provided",

            address:
                worker.address ||
                [
                    worker.area,
                    worker.city,
                    worker.state,
                ]
                    .filter(Boolean)
                    .join(", ") ||
                "Not provided",

            verification:
                verificationLevel.charAt(0).toUpperCase() +
                verificationLevel.slice(1),

            availability:
                availabilityStatus === "on_job"
                    ? "On Job"
                    : availabilityStatus.charAt(0).toUpperCase() +
                    availabilityStatus.slice(1),

            status:
                verificationStatus.charAt(0).toUpperCase() +
                verificationStatus.slice(1),

            rating: Number(
                worker.average_rating ??
                worker.rating ??
                0
            ),

            completedJobs: Number(
                worker.completed_jobs ??
                worker.completedJobs ??
                0
            ),

            trustScore: Number(
                worker.trust_score ??
                worker.trustScore ??
                0
            ),

            profileCompletion: Number(
                worker.profile_completion ??
                worker.profileCompletion ??
                0
            ),

            acceptanceRate:
                worker.acceptance_rate ??
                worker.acceptanceRate ??
                "Not available",

            onTimeArrival:
                worker.on_time_arrival ??
                worker.onTimeArrival ??
                "Not available",

            responseTime:
                worker.response_time ??
                worker.responseTime ??
                "Not available",

            yearsExperience: Number(
                worker.years_experience ??
                worker.yearsExperience ??
                0
            ),

            walletBalance: Number(
                worker.wallet_balance ??
                worker.walletBalance ??
                0
            ),

            totalEarnings: Number(
                worker.total_earnings ??
                worker.totalEarnings ??
                0
            ),

            pendingWithdrawal: Number(
                worker.pending_withdrawal ??
                worker.pendingWithdrawal ??
                0
            ),

            guarantorStatus:
                worker.guarantor_status ??
                worker.guarantorStatus ??
                "Not submitted",

            emergencyContactStatus:
                worker.emergency_contact_status ??
                worker.emergencyContactStatus ??
                "Not submitted",

            documentsStatus:
                worker.documents_status ??
                worker.documentsStatus ??
                "Pending",

            ninStatus:
                worker.nin_status ??
                worker.ninStatus ??
                "Pending",

            bankStatus:
                worker.bank_status ??
                worker.bankStatus ??
                "Pending",

            backgroundCheck:
                worker.background_check ??
                worker.backgroundCheck ??
                "Pending",

            lastActive:
                worker.last_active ??
                worker.lastActive ??
                "Not available",

            skills: Array.isArray(worker.skills)
                ? worker.skills
                : [],

            jobsAccepted: Number(
                worker.jobs_accepted ??
                worker.jobsAccepted ??
                0
            ),

            jobsDeclined: Number(
                worker.jobs_declined ??
                worker.jobsDeclined ??
                0
            ),

            repeatCustomers: Number(
                worker.repeat_customers ??
                worker.repeatCustomers ??
                0
            ),

            completionRate:
                worker.completion_rate ??
                worker.completionRate ??
                "0%",

            customerComplaints: Number(
                worker.customer_complaints ??
                worker.customerComplaints ??
                0
            ),
        };
    }

    async function loadWorkers() {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminWorkers();

            const workerList = Array.isArray(data)
                ? data
                : Array.isArray(data?.workers)
                    ? data.workers
                    : [];

            setWorkers(
                workerList.map(normalizeWorker)
            );
        } catch (err) {
            console.error(
                "Unable to load workers:",
                err
            );

            setWorkers([]);
            setError(
                err?.message ||
                "Unable to load workers."
            );
        } finally {
            setLoading(false);
        }
    }

    const workerSummary = {
        total: workers.length,

        online: workers.filter(
            (worker) =>
                String(
                    worker.availability_status ??
                    worker.availability ??
                    ""
                ).toLowerCase() === "online"
        ).length,

        pending: workers.filter(
            (worker) =>
                String(
                    worker.verification_status ??
                    worker.status ??
                    ""
                ).toLowerCase() === "pending"
        ).length,

        suspended: workers.filter(
            (worker) =>
                String(
                    worker.verification_status ??
                    worker.status ??
                    ""
                ).toLowerCase() === "suspended"
        ).length,
    };

    async function handleViewWorker(worker) {
        const workerId =
            worker.worker_id ||
            worker.id;

        if (!workerId) {
            showToast("Unable to identify this worker.");
            return;
        }

        try {
            setWorkerDetailsLoading(true);

            const response =
                await getAdminWorkerDetails(workerId);

            const normalizedWorker =
                normalizeWorkerDetails(
                    response,
                    worker
                );

            setSelectedWorker(normalizedWorker);
            setError("");
        } catch (err) {
            console.error(
                "Unable to load worker details:",
                err
            );

            showToast(
                err?.message ||
                "Unable to load worker details."
            );
        } finally {
            setWorkerDetailsLoading(false);
        }
    }

    function updateWorkerLocally(updatedWorker) {
        if (!updatedWorker) {
            return;
        }

        const updatedWorkerId =
            updatedWorker.worker_id ||
            updatedWorker.id;

        setWorkers((currentWorkers) =>
            currentWorkers.map((worker) => {
                const currentWorkerId =
                    worker.worker_id ||
                    worker.id;

                if (currentWorkerId !== updatedWorkerId) {
                    return worker;
                }

                return {
                    ...worker,

                    verification_status:
                        updatedWorker.verification_status ??
                        worker.verification_status,

                    verification_level:
                        updatedWorker.verification_level ??
                        worker.verification_level,

                    availability_status:
                        updatedWorker.availability_status ??
                        worker.availability_status,
                };
            })
        );

        setSelectedWorker((currentWorker) => {
            if (!currentWorker) {
                return currentWorker;
            }

            const currentWorkerId =
                currentWorker.worker_id ||
                currentWorker.id;

            if (currentWorkerId !== updatedWorkerId) {
                return currentWorker;
            }

            return {
                ...currentWorker,

                verification_status:
                    updatedWorker.verification_status ??
                    currentWorker.verification_status,

                verification_level:
                    updatedWorker.verification_level ??
                    currentWorker.verification_level,

                availability_status:
                    updatedWorker.availability_status ??
                    currentWorker.availability_status,
            };
        });
    }

    async function handleSuspendWorker(worker) {
        const workerId =
            worker?.worker_id ||
            worker?.id;

        if (!workerId) {
            showToast("Worker ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Suspend ${worker.full_name || worker.name || "this worker"}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setWorkerActionLoading(true);
            setWorkerActionType("suspend");

            const response = await suspendAdminWorker(workerId);

            updateWorkerLocally(response.worker);

            showToast(
                response.message ||
                "Worker suspended successfully."
            );
        } catch (err) {
            console.error("Unable to suspend worker:", err);

            showToast(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to suspend worker."
            );
        } finally {
            setWorkerActionLoading(false);
            setWorkerActionType("");
        }
    }

    async function handleReactivateWorker(worker) {
        const workerId =
            worker?.worker_id ||
            worker?.id;

        if (!workerId) {
            showToast("Worker ID is missing.");
            return;
        }

        try {
            setWorkerActionLoading(true);
            setWorkerActionType("reactivate");

            const response = await reactivateAdminWorker(workerId);

            updateWorkerLocally(response.worker);

            showToast(
                response.message ||
                "Worker reactivated successfully."
            );
        } catch (err) {
            console.error("Unable to reactivate worker:", err);

            showToast(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to reactivate worker."
            );
        } finally {
            setWorkerActionLoading(false);
            setWorkerActionType("");
        }
    }

    async function handleRejectWorker(worker) {
        const workerId =
            worker?.worker_id ||
            worker?.id;

        if (!workerId) {
            showToast("Worker ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Reject the application for ${worker.full_name ||
            worker.name ||
            "this worker"
            }?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setWorkerActionLoading(true);
            setWorkerActionType("reject");

            const response = await rejectAdminWorker(workerId);

            updateWorkerLocally(response.worker);

            showToast(
                response.message ||
                "Worker application rejected successfully."
            );
        } catch (err) {
            console.error("Unable to reject worker:", err);

            showToast(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to reject worker."
            );
        } finally {
            setWorkerActionLoading(false);
            setWorkerActionType("");
        }
    }

    useEffect(() => {
        loadWorkers();
    }, []);

    const filters = [
        "All",
        "Pending",
        "Approved",
        "Online",
        "Offline",
        "Gold",
        "Silver",
        "Platinum",
        "Suspended",
    ];

    const filteredWorkers = workers.filter((worker) => {
        const matchesFilter =
            activeFilter === "All" ||
            worker.status?.toLowerCase() === activeFilter.toLowerCase() ||
            worker.availability?.toLowerCase() === activeFilter.toLowerCase() ||
            worker.verification?.toLowerCase() === activeFilter.toLowerCase();

        const searchValue = searchTerm.trim().toLowerCase();

        const matchesSearch =
            !searchValue ||
            worker.name?.toLowerCase().includes(searchValue) ||
            worker.id?.toLowerCase().includes(searchValue) ||
            worker.profession?.toLowerCase().includes(searchValue) ||
            worker.phone?.toLowerCase().includes(searchValue) ||
            worker.location?.toLowerCase().includes(searchValue);

        return matchesFilter && matchesSearch;
    });



    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const closeDocumentPreview = () => {
        setSelectedDocument(null);
        setDocumentAction(null);
        setRejectionReason("");
    };

    const confirmDocumentAction = () => {
        if (documentAction === "reject" && !rejectionReason.trim()) {
            showToast("Please enter a rejection reason before confirming.");
            return;
        }

        const newStatus = documentAction === "approve" ? "Verified" : "Rejected";
        const updatedDoc = {
            ...selectedDocument,
            status: newStatus,
            verifiedBy: "Current Admin",
            rejectionReason: documentAction === "reject" ? rejectionReason : "",
            adminComment:
                documentAction === "approve"
                    ? "Document reviewed and verified successfully."
                    : rejectionReason,
        };

        const workerSummary = {
            total: workers.length,

            online: workers.filter(
                (worker) =>
                    String(
                        worker.availability_status ||
                        worker.availability ||
                        ""
                    ).toLowerCase() === "online"
            ).length,

            pending: workers.filter(
                (worker) =>
                    String(
                        worker.verification_status ||
                        worker.status ||
                        ""
                    ).toLowerCase() === "pending"
            ).length,

            suspended: workers.filter(
                (worker) =>
                    String(
                        worker.verification_status ||
                        worker.status ||
                        ""
                    ).toLowerCase() === "suspended"
            ).length,
        };

        setSelectedDocument(updatedDoc);
        setDocuments((prev) =>
            prev.map((doc) => (doc.title === selectedDocument.title ? updatedDoc : doc))
        );

        showToast(`${selectedDocument.title} ${documentAction === "approve" ? "approved" : "rejected"} successfully.`);
        setDocumentAction(null);
        setRejectionReason("");
    };

    return (
        <>
            {toast && (
                <div className="fixed top-6 right-6 z-[9999] bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl font-bold">
                    {toast}
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow p-6">
                    <h1 className="text-3xl font-bold">Worker Management</h1>
                    <p className="text-slate-600 mt-2">Approve, verify, monitor and manage all HelpNova workers.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Total Workers"
                        value={workerSummary.total}
                    />

                    <SummaryCard
                        title="Online"
                        value={workerSummary.online}
                        color="text-green-600"
                    />

                    <SummaryCard
                        title="Pending Approval"
                        value={workerSummary.pending}
                        color="text-orange-500"
                    />

                    <SummaryCard
                        title="Suspended"
                        value={workerSummary.suspended}
                        color="text-red-600"
                    />
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
                        <Search className="text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name, ID, profession, phone or location..."
                            className="w-full outline-none"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${activeFilter === filter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="font-bold text-lg mb-4">Registered Workers</h2>
                    {loading && (
                        <div className="py-10 text-center text-slate-500">
                            Loading workers...
                        </div>
                    )}

                    {error && !loading && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="font-semibold text-red-700">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={loadWorkers}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                <RefreshCcw size={16} />
                                Retry
                            </button>
                        </div>
                    )}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-slate-500">
                                        <th className="py-3">Worker</th><th>Profession</th><th>Location</th><th>Verification</th>
                                        <th>Availability</th><th>Status</th><th>Rating</th><th>Jobs</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWorkers.map((worker) => (
                                        <tr key={worker.id} className="border-b hover:bg-slate-50">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <ProfilePlaceholder size="small" />
                                                    <div>
                                                        <p className="font-bold text-slate-900">{worker.name}</p>
                                                        <p className="text-xs text-slate-500">{worker.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{worker.profession}</td>
                                            <td>{worker.location}</td>
                                            <td><Badge className={verificationBadge(worker.verification)}>{worker.verification}</Badge></td>
                                            <td><Badge className={availabilityBadge(worker.availability)}>{worker.availability}</Badge></td>
                                            <td><Badge className={statusBadge(worker.status)}>{worker.status}</Badge></td>
                                            <td><div className="flex items-center gap-1"><Star size={14} className="text-yellow-500" />{worker.rating}</div></td>
                                            <td>{worker.completedJobs}</td>

                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        title="View worker"
                                                        onClick={() => setSelectedWorker(worker)}
                                                        className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {worker.verification_status === "suspended" ? (
                                                        <button
                                                            type="button"
                                                            title="Reactivate worker"
                                                            disabled={workerActionLoading}
                                                            onClick={() => handleReactivateWorker(worker)}
                                                            className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                                                        >
                                                            <RefreshCcw size={16} />
                                                        </button>
                                                    ) : worker.verification_status === "approved" ? (
                                                        <button
                                                            type="button"
                                                            title="Worker already approved"
                                                            disabled
                                                            className="p-2 rounded-lg bg-green-50 text-green-700 opacity-60"
                                                        >
                                                            <ShieldCheck size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            title="Approve worker"
                                                            disabled={workerActionLoading}
                                                            onClick={() => handleApproveWorker(worker)}
                                                            className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                                                        >
                                                            <ShieldCheck size={16} />
                                                        </button>
                                                    )}

                                                    {worker.verification_status === "suspended" ? (
                                                        <button
                                                            type="button"
                                                            title="Worker is suspended"
                                                            disabled
                                                            className="p-2 rounded-lg bg-red-50 text-red-700 opacity-60"
                                                        >
                                                            <Ban size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            title="Suspend worker"
                                                            disabled={workerActionLoading}
                                                            onClick={() => handleSuspendWorker(worker)}
                                                            className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                                                        >
                                                            <Ban size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedWorker && (
                <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
                    <div className="bg-slate-100 w-full max-w-5xl h-full overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b z-10 p-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">360° Worker Record</h2>
                                <p className="text-slate-500 text-sm">HR, operations, verification and finance overview.</p>
                            </div>
                            <button onClick={() => setSelectedWorker(null)} className="p-2 rounded-lg hover:bg-slate-100">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-6">
                                <ProfilePlaceholder size="large" />
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold">{selectedWorker.name}</h3>
                                    <p className="text-slate-500">{selectedWorker.id}</p>
                                    <p className="font-semibold mt-1">{selectedWorker.profession}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <Badge className={verificationBadge(selectedWorker.verification)}>{selectedWorker.verification} Worker</Badge>
                                        <Badge className={availabilityBadge(selectedWorker.availability)}>{selectedWorker.availability}</Badge>
                                        <Badge className={statusBadge(selectedWorker.status)}>{selectedWorker.status}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <SummaryCard title="Trust Score" value={`${selectedWorker.trustScore}%`} />
                                <SummaryCard title="Profile Completion" value={`${selectedWorker.profileCompletion}%`} />
                                <SummaryCard title="Rating" value={`${selectedWorker.rating} ★`} />
                                <SummaryCard title="Completed Jobs" value={selectedWorker.completedJobs} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <DetailSection title="Contact & Identity">
                                    <DetailLine icon={Phone} label="Phone" value={selectedWorker.phone} />
                                    <DetailLine icon={Mail} label="Email" value={selectedWorker.email} />
                                    <DetailLine icon={MapPin} label="Address" value={selectedWorker.address} />
                                    <DetailLine icon={Clock} label="Last Active" value={selectedWorker.lastActive} />
                                </DetailSection>

                                <DetailSection title="Verification & Compliance">
                                    <DetailLine icon={ShieldCheck} label="NIN" value={selectedWorker.ninStatus} success />
                                    <DetailLine icon={FileCheck} label="Documents" value={selectedWorker.documentsStatus} success />
                                    <DetailLine icon={Wallet} label="Bank" value={selectedWorker.bankStatus} success />
                                    <DetailLine icon={UserCheck} label="Background Check" value={selectedWorker.backgroundCheck} success />
                                </DetailSection>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <DetailSection title="Professional Skills">
                                    {Array.isArray(selectedWorker.skills) &&
                                        selectedWorker.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedWorker.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            No professional skills recorded yet.
                                        </p>
                                    )}
                                </DetailSection>

                                <DetailSection title="Performance">
                                    <DetailLine icon={Briefcase} label="Acceptance Rate" value={selectedWorker.acceptanceRate} />
                                    <DetailLine icon={Briefcase} label="On-Time Arrival" value={selectedWorker.onTimeArrival} />
                                    <DetailLine icon={Clock} label="Response Time" value={selectedWorker.responseTime} />
                                    <DetailLine icon={Briefcase} label="Experience" value={`${selectedWorker.yearsExperience} years`} />
                                </DetailSection>

                                <DetailSection title="Operations Statistics">
                                    <DetailLine icon={ClipboardCheck} label="Jobs Accepted" value={selectedWorker.jobsAccepted} />
                                    <DetailLine icon={Ban} label="Jobs Declined" value={selectedWorker.jobsDeclined} />
                                    <DetailLine icon={Repeat} label="Repeat Customers" value={selectedWorker.repeatCustomers} />
                                    <DetailLine icon={TrendingUp} label="Completion Rate" value={selectedWorker.completionRate} />
                                    <DetailLine icon={AlertTriangle} label="Customer Complaints" value={selectedWorker.customerComplaints} />
                                </DetailSection>

                                <DetailSection title="Wallet & Earnings">
                                    <DetailLine icon={Wallet} label="Wallet Balance" value={`NGN ${Number(selectedWorker.walletBalance).toLocaleString()}`} />
                                    <DetailLine icon={Wallet} label="Total Earnings" value={`NGN ${Number(selectedWorker.totalEarnings).toLocaleString()}`} />
                                    <DetailLine icon={Wallet} label="Pending Withdrawal" value={`NGN ${Number(selectedWorker.pendingWithdrawal).toLocaleString()}`} />
                                </DetailSection>
                            </div>

                            <DetailSection title="Restricted HR/Admin Records">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InfoCard title="Guarantor Information" value={selectedWorker.guarantorStatus} note="Full details available to authorized HR/Admin officers only." />
                                    <InfoCard title="Emergency Contact" value={selectedWorker.emergencyContactStatus} note="Restricted for worker safety and emergency response only." />
                                </div>
                            </DetailSection>

                            {["pending", "rejected"].includes(
                                String(
                                    selectedWorker.verification_status || ""
                                ).toLowerCase()
                            ) && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            disabled={
                                                workerActionLoading ||
                                                selectedWorker.verification_status ===
                                                "rejected"
                                            }
                                            onClick={() =>
                                                handleRejectWorker(selectedWorker)
                                            }
                                            className="rounded-xl border border-red-300 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {selectedWorker.verification_status ===
                                                "rejected"
                                                ? "Application Rejected"
                                                : workerActionLoading &&
                                                    workerActionType === "reject"
                                                    ? "Rejecting..."
                                                    : "Reject Application"}
                                        </button>
                                    </div>
                                )}

                            <div className="grid md:grid-cols-4 gap-4 pb-10">
                                {selectedWorker.verification_status === "suspended" ? (
                                    <button
                                        type="button"
                                        disabled={workerActionLoading}
                                        onClick={() =>
                                            handleReactivateWorker(selectedWorker)
                                        }
                                        className="bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                                    >
                                        {workerActionLoading &&
                                            workerActionType === "reactivate"
                                            ? "Reactivating..."
                                            : "Reactivate"}
                                    </button>
                                ) : selectedWorker.verification_status === "approved" ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="bg-green-100 text-green-700 rounded-xl py-3 font-semibold cursor-not-allowed"
                                    >
                                        Approved
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={workerActionLoading}
                                        onClick={() =>
                                            handleApproveWorker(selectedWorker)
                                        }
                                        className="bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                                    >
                                        {workerActionLoading &&
                                            workerActionType === "approve"
                                            ? "Approving..."
                                            : "Approve"}
                                    </button>
                                )}

                                {selectedWorker.verification_status === "suspended" ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="bg-red-100 text-red-700 rounded-xl py-3 font-semibold cursor-not-allowed"
                                    >
                                        Suspended
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={workerActionLoading}
                                        onClick={() =>
                                            handleSuspendWorker(selectedWorker)
                                        }
                                        className="bg-red-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                                    >
                                        {workerActionLoading &&
                                            workerActionType === "suspend"
                                            ? "Suspending..."
                                            : "Suspend"}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="bg-blue-600 text-white rounded-xl py-3 font-semibold"
                                >
                                    View Wallet
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowDocuments(true)}
                                    className="bg-slate-900 text-white rounded-xl py-3 font-semibold"
                                >
                                    View Documents
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDocuments && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold">Worker Documents Center</h2>
                                <p className="text-slate-500">Verification and compliance records.</p>
                            </div>
                            <button onClick={() => setShowDocuments(false)} className="p-2 rounded-lg hover:bg-slate-100">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {documents.map((doc) => (
                                <DocumentRow key={doc.title} document={doc} onView={setSelectedDocument} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedDocument && (
                <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between z-20">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedDocument.title}</h2>
                                <p className="text-slate-500 text-sm">
                                    {selectedDocument.status} • Uploaded {selectedDocument.uploadedOn}
                                </p>
                            </div>
                            <button onClick={closeDocumentPreview} className="p-2 rounded-lg hover:bg-slate-100">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="rounded-2xl border-2 border-dashed bg-slate-50 h-72 flex flex-col items-center justify-center text-slate-500">
                                <FileCheck size={56} className="mb-4 text-blue-600" />
                                <h3 className="font-bold text-lg">{selectedDocument.title}</h3>
                                <p className="text-sm mt-2">No document preview available yet.</p>
                                <p className="text-xs mt-1">Uploaded image/PDF will render here after backend storage integration.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <InfoCard title="Status" value={selectedDocument.status} />
                                <InfoCard title="Verified By" value={selectedDocument.verifiedBy} />
                                <InfoCard title="Uploaded On" value={selectedDocument.uploadedOn} />
                                <InfoCard title="Access Level" value="HR/Admin Only" />
                                <InfoCard title="File Type" value={selectedDocument.fileType || "Document"} />
                                <InfoCard title="File Size" value={selectedDocument.fileSize || "Pending"} />
                            </div>

                            {(selectedDocument.rejectionReason || selectedDocument.adminComment) && (
                                <div className={`mt-4 border rounded-xl p-4 ${selectedDocument.status === "Rejected"
                                        ? "bg-red-50 border-red-200"
                                        : "bg-green-50 border-green-200"
                                    }`}>
                                    <p className={`text-sm font-semibold ${selectedDocument.status === "Rejected" ? "text-red-600" : "text-green-700"
                                        }`}>
                                        HR/Admin Comment
                                    </p>
                                    <p className="text-slate-800 mt-1">
                                        {selectedDocument.rejectionReason || selectedDocument.adminComment}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 bg-slate-50 rounded-xl p-4">
                                <h3 className="font-bold mb-3">Verification History</h3>
                                <div className="space-y-3 text-sm">
                                    <HistoryLine title="Document uploaded" date={selectedDocument.uploadedOn} />
                                    <HistoryLine title={`Current status: ${selectedDocument.status}`} date="Latest action" />
                                    <HistoryLine title={`Reviewed by: ${selectedDocument.verifiedBy}`} date="HR/Admin action" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pb-2">
                                <button className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold">Download</button>

                                {selectedDocument.status !== "Verified" ? (
                                    <button onClick={() => setDocumentAction("approve")} className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold">
                                        Approve
                                    </button>
                                ) : (
                                    <button disabled className="bg-green-100 text-green-700 px-5 py-3 rounded-xl font-semibold cursor-not-allowed">
                                        Already Verified
                                    </button>
                                )}

                                {selectedDocument.status !== "Rejected" ? (
                                    <button onClick={() => setDocumentAction("reject")} className="bg-red-600 text-white px-5 py-3 rounded-xl font-semibold">
                                        Reject
                                    </button>
                                ) : (
                                    <button disabled className="bg-red-100 text-red-700 px-5 py-3 rounded-xl font-semibold cursor-not-allowed">
                                        Already Rejected
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {documentAction && selectedDocument && (
                <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold">
                            Confirm {documentAction === "approve" ? "Approval" : "Rejection"}
                        </h2>

                        <p className="text-slate-600 mt-3">
                            Are you sure you want to {documentAction} <span className="font-bold">{selectedDocument.title}</span>?
                        </p>

                        {documentAction === "reject" && (
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for rejection</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Example: Blurry document, expired ID, name mismatch..."
                                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-400"
                                    rows="3"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setDocumentAction(null)} className="px-5 py-3 rounded-xl bg-slate-100 font-semibold">
                                Cancel
                            </button>
                            <button
                                onClick={confirmDocumentAction}
                                className={`px-5 py-3 rounded-xl text-white font-semibold ${documentAction === "approve" ? "bg-green-600" : "bg-red-600"
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function ProfilePlaceholder({ size }) {
    const box = size === "large" ? "w-28 h-28" : "w-11 h-11";
    const icon = size === "large" ? 38 : 20;
    const shield = size === "large" ? "w-8 h-8" : "w-5 h-5";
    const shieldIcon = size === "large" ? 16 : 11;

    return (
        <div className={`relative ${box} rounded-full bg-slate-100 border flex items-center justify-center shadow`}>
            <Camera className="text-slate-400" size={icon} />
            <span className={`absolute -bottom-1 -right-1 ${shield} rounded-full bg-green-600 border-2 border-white flex items-center justify-center`}>
                <ShieldCheck size={shieldIcon} className="text-white" />
            </span>
        </div>
    );
}

function SummaryCard({ title, value, color = "text-slate-900" }) {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-slate-500">{title}</p>
            <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
        </div>
    );
}

function DetailSection({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            {children}
        </div>
    );
}

function DetailLine({ icon: Icon, label, value, success }) {
    return (
        <div className="flex items-center justify-between border-b last:border-b-0 py-3 gap-4">
            <div className="flex items-center gap-3">
                <Icon size={18} className={success ? "text-green-600" : "text-blue-600"} />
                <span className="text-slate-500">{label}</span>
            </div>
            <span className="font-semibold text-right">{value}</span>
        </div>
    );
}

function InfoCard({ title, value, note }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">{title}</p>
            <h4 className="font-bold">{value}</h4>
            {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
        </div>
    );
}

function DocumentRow({ document, onView }) {
    return (
        <div className="flex items-center justify-between border rounded-xl p-4 hover:bg-slate-50">
            <div>
                <h4 className="font-semibold flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${documentStatusColor(document.status)}`}></span>
                    {document.title}
                </h4>
                <p className="text-sm text-slate-500 mt-1">Status: {document.status}</p>
                <p className="text-xs text-slate-400">
                    Uploaded: {document.uploadedOn} • Verified by: {document.verifiedBy}
                </p>
                {document.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {document.rejectionReason}</p>
                )}
            </div>

            <div className="flex gap-2">
                <button onClick={() => onView(document)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    View
                </button>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    Download
                </button>
            </div>
        </div>
    );
}

function Badge({ children, className }) {
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${className}`}>{children}</span>;
}

function HistoryLine({ title, date }) {
    return (
        <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-slate-500">{date}</p>
            </div>
        </div>
    );
}

function verificationBadge(level) {
    if (level === "Platinum") return "bg-purple-100 text-purple-700";
    if (level === "Gold") return "bg-yellow-100 text-yellow-700";
    if (level === "Silver") return "bg-slate-200 text-slate-700";
    return "bg-slate-100 text-slate-600";
}

function availabilityBadge(status) {
    if (status === "Online") return "bg-green-100 text-green-700";
    if (status === "On Job") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
}

function statusBadge(status) {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Suspended") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
}

function documentStatusColor(status) {
    if (["Verified", "Approved", "Matched"].includes(status)) return "bg-green-600";
    if (["Pending Review", "Submitted"].includes(status)) return "bg-yellow-500";
    if (status === "Uploaded") return "bg-blue-600";
    if (status === "Rejected") return "bg-red-600";
    return "bg-slate-500";
}