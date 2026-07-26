import { useEffect, useMemo, useState } from "react";
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
    ArrowDownLeft,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Download,
    Filter,
    ReceiptText,
    RotateCcw,
} from "lucide-react";

import { getWorkerActivation } from "../../utils/workerActivation";

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
        title: "Professional Licences & Certifications",
        status: "Pending Review",
        uploadedOn: "15 Jun 2026",
        verifiedBy: "Pending",
        fileType: "Licence / Certificate PDF",
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
    const responseData = apiResponse?.data ?? apiResponse ?? {};

    // The admin details endpoint has existed in both wrapped and direct
    // response formats. Accept either so opening a worker never discards
    // fields already returned by the workers list.
    const workerData =
        responseData?.worker ??
        responseData?.worker_details ??
        responseData?.profile ??
        (responseData && typeof responseData === "object"
            ? responseData
            : {});

    const assignmentsSource =
        responseData?.assignments ??
        workerData?.assignments ??
        [];
    const reviewsSource =
        responseData?.reviews ??
        workerData?.reviews ??
        [];
    const paymentsSource =
        responseData?.payments ??
        workerData?.payments ??
        [];

    const assignments = Array.isArray(assignmentsSource)
        ? assignmentsSource
        : [];
    const reviews = Array.isArray(reviewsSource)
        ? reviewsSource
        : [];
    const payments = Array.isArray(paymentsSource)
        ? paymentsSource
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

    const downloadWorkerDocument = (document) => {
        if (!document) {
            showToast("No document selected.");
            return;
        }

        if (document.fileUrl) {
            const downloadLink = window.document.createElement("a");

            downloadLink.href = document.fileUrl;
            downloadLink.download =
                document.fileName || document.title || "worker-document";

            window.document.body.appendChild(downloadLink);
            downloadLink.click();
            window.document.body.removeChild(downloadLink);

            return;
        }

        showToast(
            `${document.title} is not connected to backend file storage yet.`
        );
    };

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

        // Preserve the backend field used by the activation utility.
        // Do not make guarantor completion depend on overall worker approval.
        guarantor_status: String(
            workerData.guarantor_status ??
            workerData.guarantor_verification_status ??
            workerData.guarantorStatus ??
            fallbackWorker.guarantor_status ??
            fallbackWorker.guarantor_verification_status ??
            fallbackWorker.guarantorStatus ??
            "not submitted"
        ).toLowerCase(),

        guarantorStatus:
            titleCase(
                workerData.guarantor_status ??
                workerData.guarantor_verification_status ??
                workerData.guarantorStatus ??
                fallbackWorker.guarantor_status ??
                fallbackWorker.guarantor_verification_status ??
                fallbackWorker.guarantorStatus ??
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
    const [documentWorkspaceMode, setDocumentWorkspaceMode] = useState("list");
    const [documentAction, setDocumentAction] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [toast, setToast] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const [workerActionLoading, setWorkerActionLoading] = useState(false);
    const [workerActionType, setWorkerActionType] = useState("");
    const [showWallet, setShowWallet] = useState(false);
    const [walletLoading, setWalletLoading] = useState(false);
    const [walletError, setWalletError] = useState("");
    const [walletData, setWalletData] = useState(null);
    const [walletTransactions, setWalletTransactions] = useState([]);
    

    const [walletSearch, setWalletSearch] = useState("");
    const [walletFilter, setWalletFilter] = useState("all");

    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [walletPage, setWalletPage] = useState(1);
    const walletPageSize = 10;
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

            // Keep both snake_case and camelCase so every frontend
            // consumer sees the approved guarantor state consistently.
            guarantor_status: String(
                worker.guarantor_status ??
                worker.guarantorStatus ??
                "not submitted"
            ).toLowerCase(),

            guarantorStatus: titleCase(
                worker.guarantor_status ??
                worker.guarantorStatus ??
                "not submitted"
            ),

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

    const normalizeWalletTransaction = (transaction, index) => {
        const rawType = String(
            transaction?.transaction_type ??
            transaction?.type ??
            transaction?.category ??
            "transaction"
        ).toLowerCase();

        const rawStatus = String(
            transaction?.status ??
            "completed"
        ).toLowerCase();

        const rawAmount = Number(
            transaction?.amount ??
            transaction?.value ??
            0
        );

        const direction =
            String(transaction?.direction ?? "").toLowerCase() ||
            (
                [
                    "withdrawal",
                    "debit",
                    "commission",
                    "platform_fee",
                    "refund_debit",
                ].includes(rawType)
                    ? "debit"
                    : "credit"
            );

        return {
            id:
                transaction?.transaction_id ??
                transaction?.id ??
                transaction?.reference ??
                `TXN-${index + 1}`,

            reference:
                transaction?.reference ??
                transaction?.payment_reference ??
                transaction?.transaction_reference ??
                "Not available",

            type: rawType,
            status: rawStatus,
            amount: rawAmount,
            direction,

            description:
                transaction?.description ??
                transaction?.narration ??
                transaction?.title ??
                formatTransactionType(rawType),

            createdAt:
                transaction?.created_at ??
                transaction?.transaction_date ??
                transaction?.date ??
                null,

            jobId:
                transaction?.job_id ??
                null,

            customerName:
                transaction?.customer_name ??
                transaction?.customer?.full_name ??
                null,

            paymentMethod:
                transaction?.payment_method ??
                transaction?.channel ??
                null,

            platformFee: Number(
                transaction?.platform_fee ??
                transaction?.commission ??
                0
            ),

            workerAmount: Number(
                transaction?.worker_amount ??
                transaction?.net_amount ??
                rawAmount
            ),

            raw: transaction,
        };
    };

    async function loadWorkerWallet(worker) {
        const workerId =
            worker?.worker_id ??
            worker?.id;

        if (!workerId) {
            showToast("Worker ID is missing.");
            return;
        }

        try {
            setWalletLoading(true);
            setWalletError("");
            setWalletPage(1);
            setWalletSearch("");
            setWalletFilter("all");
            setSelectedTransaction(null);

            setShowWallet(true);

            const walletResponse =
                await getAdminWorkerWallet(workerId);

            const wallet =
                walletResponse?.wallet ??
                {};

            const transactionPayload =
                walletResponse?.transactions ??
                [];

            const normalizedTransactions = Array.isArray(transactionPayload)
                ? transactionPayload.map(normalizeWalletTransaction)
                : [];

            setWalletData(wallet);
            setWalletTransactions(normalizedTransactions);
        } catch (err) {
            console.error("Unable to load worker wallet:", err);

            const message =
                err?.response?.data?.detail ??
                err?.response?.data?.message ??
                "Unable to load this worker wallet.";

            setWalletError(message);
            setWalletData(null);
            setWalletTransactions([]);
        } finally {
            setWalletLoading(false);
        }
    }

    function closeWorkerWallet() {
        setShowWallet(false);
        setWalletData(null);
        setWalletTransactions([]);
        setWalletError("");
        setWalletSearch("");
        setWalletFilter("all");
        setSelectedTransaction(null);
        setWalletPage(1);
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

    const filteredWalletTransactions = useMemo(() => {
        const normalizedSearch = walletSearch
            .trim()
            .toLowerCase();

        return walletTransactions.filter((transaction) => {
            const matchesFilter = (() => {
                if (walletFilter === "all") {
                    return true;
                }

                if (walletFilter === "credits") {
                    return transaction.direction === "credit";
                }

                if (walletFilter === "debits") {
                    return transaction.direction === "debit";
                }

                if (walletFilter === "pending") {
                    return transaction.status === "pending";
                }

                if (walletFilter === "completed") {
                    return [
                        "completed",
                        "successful",
                        "success",
                        "paid",
                        "released",
                    ].includes(transaction.status);
                }

                if (walletFilter === "withdrawals") {
                    return transaction.type.includes("withdraw");
                }

                if (walletFilter === "payments") {
                    return (
                        transaction.type.includes("payment") ||
                        transaction.type.includes("earning") ||
                        transaction.type.includes("job")
                    );
                }

                if (walletFilter === "commissions") {
                    return (
                        transaction.type.includes("commission") ||
                        transaction.type.includes("platform_fee")
                    );
                }

                if (walletFilter === "refunds") {
                    return transaction.type.includes("refund");
                }

                return true;
            })();

            if (!matchesFilter) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchableText = [
                transaction.id,
                transaction.reference,
                transaction.description,
                transaction.type,
                transaction.status,
                transaction.amount,
                transaction.customerName,
                transaction.jobId,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(normalizedSearch);
        });
    }, [
        walletTransactions,
        walletSearch,
        walletFilter,
    ]);

    const walletTransactionTotals = useMemo(() => {
        return walletTransactions.reduce(
            (totals, transaction) => {
                const amount = Number(transaction.amount || 0);

                if (transaction.direction === "credit") {
                    totals.totalCredits += amount;
                }

                if (transaction.direction === "debit") {
                    totals.totalDebits += amount;
                }

                if (
                    transaction.status === "pending" &&
                    transaction.type.includes("withdraw")
                ) {
                    totals.pendingWithdrawals += amount;
                }

                if (
                    transaction.type.includes("commission") ||
                    transaction.type.includes("platform_fee")
                ) {
                    totals.commissionPaid += amount;
                }

                return totals;
            },
            {
                totalCredits: 0,
                totalDebits: 0,
                pendingWithdrawals: 0,
                commissionPaid: 0,
            }
        );
    }, [walletTransactions]);

    const walletSummary = useMemo(() => {
        const availableBalance = Number(
            walletData?.balance ??
            walletData?.available_balance ??
            walletData?.wallet_balance ??
            (
                walletTransactionTotals.totalCredits -
                walletTransactionTotals.totalDebits
            )
        );

        const totalEarnings = Number(
            walletData?.total_earnings ??
            walletData?.lifetime_earnings ??
            walletTransactionTotals.totalCredits
        );

        const pendingWithdrawal = Number(
            walletData?.pending_withdrawal ??
            walletData?.pending_withdrawals ??
            walletTransactionTotals.pendingWithdrawals
        );

        return {
            availableBalance,
            totalEarnings,
            pendingWithdrawal,
            commissionPaid:
                walletTransactionTotals.commissionPaid,
        };
    }, [
        walletData,
        walletTransactionTotals,
    ]);

    const totalWalletPages = Math.max(
        1,
        Math.ceil(
            filteredWalletTransactions.length /
            walletPageSize
        )
    );

    const paginatedWalletTransactions =
        filteredWalletTransactions.slice(
            (walletPage - 1) * walletPageSize,
            walletPage * walletPageSize
        );

    useEffect(() => {
        if (walletPage > totalWalletPages) {
            setWalletPage(totalWalletPages);
        }
    }, [walletPage, totalWalletPages]);

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

    function WalletSummaryCard({
        title,
        amount,
        icon: Icon,
        valueClassName = "text-slate-900",
    }) {
        return (
            <div className="rounded-2xl bg-white p-5 shadow">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-500">
                            {title}
                        </p>

                        <h3
                            className={`mt-2 text-2xl font-bold ${valueClassName}`}
                        >
                            {formatCurrency(amount)}
                        </h3>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                        <Icon size={21} />
                    </div>
                </div>
            </div>
        );
    }

    function WalletInformationLine({ label, value }) {
        return (
            <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                </p>

                <p className="mt-2 break-all font-semibold text-slate-900">
                    {value}
                </p>
            </div>
        );
    }

    function WalletTransactionRow({
        transaction,
        onView,
    }) {
        const isCredit =
            transaction.direction === "credit";

        return (
            <tr className="border-b last:border-b-0 hover:bg-slate-50">
                <td className="px-3 py-4 text-slate-600">
                    {formatDateTime(transaction.createdAt)}
                </td>

                <td className="px-3 py-4">
                    <p className="font-semibold text-slate-900">
                        {transaction.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {transaction.reference}
                    </p>
                </td>

                <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-lg p-2 ${isCredit
                                    ? "bg-green-50 text-green-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                        >
                            {isCredit ? (
                                <ArrowDownLeft size={16} />
                            ) : (
                                <ArrowUpRight size={16} />
                            )}
                        </span>

                        <span className="font-medium">
                            {formatTransactionType(
                                transaction.type
                            )}
                        </span>
                    </div>
                </td>

                <td className="max-w-[260px] px-3 py-4">
                    <p className="truncate text-slate-700">
                        {transaction.description}
                    </p>
                </td>

                <td
                    className={`px-3 py-4 text-right font-bold ${isCredit
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                </td>

                <td className="px-3 py-4">
                    <TransactionStatusBadge
                        status={transaction.status}
                    />
                </td>

                <td className="px-3 py-4 text-center">
                    <button
                        type="button"
                        onClick={() => onView(transaction)}
                        className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                        title="View transaction"
                    >
                        <Eye size={17} />
                    </button>
                </td>
            </tr>
        );
    }

    function TransactionStatusBadge({ status }) {
        const normalizedStatus =
            String(status || "").toLowerCase();

        let className =
            "bg-slate-100 text-slate-700";

        if (
            [
                "completed",
                "successful",
                "success",
                "paid",
                "released",
            ].includes(normalizedStatus)
        ) {
            className =
                "bg-green-100 text-green-700";
        }

        if (
            [
                "pending",
                "processing",
                "initiated",
            ].includes(normalizedStatus)
        ) {
            className =
                "bg-yellow-100 text-yellow-700";
        }

        if (
            [
                "failed",
                "rejected",
                "cancelled",
                "canceled",
            ].includes(normalizedStatus)
        ) {
            className =
                "bg-red-100 text-red-700";
        }

        if (normalizedStatus === "refunded") {
            className =
                "bg-purple-100 text-purple-700";
        }

        return (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}
            >
                {capitalizeText(
                    normalizedStatus || "unknown"
                )}
            </span>
        );
    }

    function WalletPagination({
        page,
        totalPages,
        totalRecords,
        pageSize,
        onPageChange,
    }) {
        const firstRecord =
            totalRecords === 0
                ? 0
                : (page - 1) * pageSize + 1;

        const lastRecord = Math.min(
            page * pageSize,
            totalRecords
        );

        return (
            <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    Showing {firstRecord}–{lastRecord} of{" "}
                    {totalRecords} transactions
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                            onPageChange(page - 1)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>

                    <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                            onPageChange(page + 1)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    function WalletLoadingState() {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="animate-pulse rounded-2xl bg-white p-5 shadow"
                        >
                            <div className="h-4 w-28 rounded bg-slate-200" />
                            <div className="mt-4 h-8 w-40 rounded bg-slate-200" />
                        </div>
                    ))}
                </div>

                <div className="animate-pulse rounded-2xl bg-white p-6 shadow">
                    <div className="h-6 w-48 rounded bg-slate-200" />

                    <div className="mt-6 space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="h-14 rounded-xl bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    function WalletErrorState({
        message,
        onRetry,
    }) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow">
                <div className="rounded-full bg-red-100 p-5 text-red-600">
                    <AlertTriangle size={38} />
                </div>

                <h3 className="mt-5 text-xl font-bold">
                    Unable to load wallet
                </h3>

                <p className="mt-2 max-w-md text-slate-500">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
                >
                    <RotateCcw size={17} />
                    Retry
                </button>
            </div>
        );
    }

    function WalletEmptyState({ hasSearch }) {
        return (
            <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-slate-50 p-8 text-center">
                <div className="rounded-full bg-blue-100 p-5 text-blue-600">
                    <CreditCard size={38} />
                </div>

                <h3 className="mt-5 text-xl font-bold">
                    {hasSearch
                        ? "No matching transactions"
                        : "No transactions yet"}
                </h3>

                <p className="mt-2 max-w-md text-slate-500">
                    {hasSearch
                        ? "Change your search term or transaction filter."
                        : "Payments, withdrawals and wallet adjustments will appear here when this worker begins transacting."}
                </p>
            </div>
        );
    }

    function TransactionDetailCard({
        label,
        value,
    }) {
        return (
            <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                </p>

                <p className="mt-2 break-words font-semibold text-slate-900">
                    {value}
                </p>
            </div>
        );
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    }

    function formatDateTime(value) {
        if (!value) {
            return "Not available";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat("en-NG", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }

    function formatTransactionType(value) {
        return capitalizeText(
            String(value || "transaction")
                .replaceAll("_", " ")
                .replaceAll("-", " ")
        );
    }

    function capitalizeText(value) {
        return String(value || "")
            .split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
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

                    status: titleCase(
                        updatedWorker.verification_status ??
                        worker.verification_status ??
                        worker.status
                    ),

                    verification_level:
                        updatedWorker.verification_level ??
                        worker.verification_level,

                    availability_status:
                        updatedWorker.availability_status ??
                        worker.availability_status,

                    guarantor_status: String(
                        updatedWorker.guarantor_status ??
                        updatedWorker.guarantorStatus ??
                        worker.guarantor_status ??
                        worker.guarantorStatus ??
                        "not submitted"
                    ).toLowerCase(),

                    guarantorStatus: titleCase(
                        updatedWorker.guarantor_status ??
                        updatedWorker.guarantorStatus ??
                        worker.guarantor_status ??
                        worker.guarantorStatus ??
                        "not submitted"
                    ),
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

                status: titleCase(
                    updatedWorker.verification_status ??
                    currentWorker.verification_status ??
                    currentWorker.status
                ),

                verification_level:
                    updatedWorker.verification_level ??
                    currentWorker.verification_level,

                availability_status:
                    updatedWorker.availability_status ??
                    currentWorker.availability_status,

                guarantor_status: String(
                    updatedWorker.guarantor_status ??
                    updatedWorker.guarantorStatus ??
                    currentWorker.guarantor_status ??
                    currentWorker.guarantorStatus ??
                    "not submitted"
                ).toLowerCase(),

                guarantorStatus: titleCase(
                    updatedWorker.guarantor_status ??
                    updatedWorker.guarantorStatus ??
                    currentWorker.guarantor_status ??
                    currentWorker.guarantorStatus ??
                    "not submitted"
                ),
            };
        });
    }

    async function handleApproveWorker(worker = selectedWorker) {
        const workerId = worker?.worker_id || worker?.id;
        const currentStatus = String(
            worker?.verification_status || worker?.status || ""
        ).toLowerCase();

        if (!workerId) {
            showToast("Worker ID is unavailable.");
            return;
        }

        if (currentStatus === "approved") {
            showToast("Worker is already approved.");
            return;
        }

        try {
            setWorkerActionLoading(true);
            setWorkerActionType("approve");

            const response = await approveAdminWorker(workerId);
            const updatedWorker = response?.worker ?? {
                ...worker,
                worker_id: workerId,
                verification_status: "approved",
            };

            updateWorkerLocally(updatedWorker);
            await refreshSelectedWorker(workerId);
            await loadWorkers();

            showToast(
                response?.message || "Worker approved successfully."
            );
        } catch (err) {
            console.error("Unable to approve worker:", err);
            showToast(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Unable to approve worker."
            );
        } finally {
            setWorkerActionLoading(false);
            setWorkerActionType("");
        }
    }

    async function refreshSelectedWorker(workerId) {
        const details = await getAdminWorkerDetails(
            workerId
        );

        const refreshedWorker =
            details?.worker ??
            details;

        setSelectedWorker(
            normalizeWorkerDetails(
                details,
                refreshedWorker
            )
        );
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

    const activationWorker = selectedWorker
        ? (() => {
            const guarantorStatus = String(
                selectedWorker.guarantor_status ??
                selectedWorker.guarantorStatus ??
                "not submitted"
            ).toLowerCase();

            return {
                ...selectedWorker,
                guarantor_status: guarantorStatus,
                guarantorStatus,
            };
        })()
        : null;

    const selectedWorkerActivation = activationWorker
        ? getWorkerActivation(activationWorker)
        : null;

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

    const openDocumentsWorkspace = () => {
        setSelectedDocument(documents[0] || null);
        setDocumentWorkspaceMode("list");
        setShowDocuments(true);
    };

    const closeDocumentsWorkspace = () => {
        setShowDocuments(false);
        setSelectedDocument(null);
        setDocumentAction(null);
        setRejectionReason("");
        setDocumentWorkspaceMode("list");
    };

    const handleSelectDocument = (document) => {
        setSelectedDocument(document);
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
                                <SummaryCard
                                    title="Trust Score"
                                    value={`${selectedWorkerActivation?.trustScore ?? selectedWorker.trustScore ?? 0}%`}
                                />
                                <SummaryCard
                                    title="Profile Completion"
                                    value={`${selectedWorkerActivation?.profileCompletion ?? selectedWorker.profileCompletion ?? 0}%`}
                                />
                                <SummaryCard title="Rating" value={`${selectedWorker.rating} ★`} />
                                <SummaryCard title="Completed Jobs" value={selectedWorker.completedJobs} />
                            </div>

                            {selectedWorkerActivation && (
                                <DetailSection title="Worker Activation & Opportunity">
                                    <div className="space-y-5">
                                        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                                            <div
                                                className="grid h-28 w-28 place-items-center rounded-full"
                                                style={{ background: `conic-gradient(#2563eb ${selectedWorkerActivation.score}%, #e2e8f0 0)` }}
                                            >
                                                <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center shadow-sm">
                                                    <div>
                                                        <p className="text-2xl font-bold text-slate-900">{selectedWorkerActivation.score}%</p>
                                                        <p className="text-[10px] font-semibold uppercase text-slate-500">Activation</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className="bg-blue-100 text-blue-700">{selectedWorkerActivation.rewardTier}</Badge>
                                                    <span className="text-sm font-semibold text-slate-700">{selectedWorkerActivation.level}</span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600">{selectedWorkerActivation.opportunity}</p>
                                                <div className="mt-3 flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-slate-700">Matching Priority:</span>
                                                    <span className="tracking-widest text-amber-500">{"★".repeat(selectedWorkerActivation.priority.stars)}{"☆".repeat(5 - selectedWorkerActivation.priority.stars)}</span>
                                                    <span className="font-semibold text-slate-600">{selectedWorkerActivation.priority.label}</span>
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                                                <p className="font-semibold text-slate-800">Next activation step</p>
                                                <p className="text-slate-600">{selectedWorkerActivation.nextStep}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                                                <span>{selectedWorkerActivation.completed} of {selectedWorkerActivation.total} checks completed</span>
                                                <span>{selectedWorkerActivation.maxOpportunity}</span>
                                            </div>
                                            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full rounded-full bg-blue-600 transition-all"
                                                    style={{ width: `${selectedWorkerActivation.score}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2">
                                            {selectedWorkerActivation.checks.map((check) => (
                                                <div
                                                    key={check.key}
                                                    className={`rounded-xl border p-3 ${check.complete
                                                        ? "border-green-200 bg-green-50"
                                                        : "border-amber-200 bg-amber-50"
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{check.label}</p>
                                                            <p className="text-xs text-slate-500">Weight: {check.weight}%</p>
                                                        </div>
                                                        <StatusBadge value={check.complete ? "Complete" : "Pending"} />
                                                    </div>
                                                    {!check.complete && (
                                                        <div className="mt-3 rounded-lg border border-amber-200 bg-white/70 px-3 py-2">
                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Required action</p>
                                                            <p className="mt-1 text-xs text-slate-700">{check.action}</p>
                                                            {Array.isArray(check.unlocks) && check.unlocks.length > 0 && (
                                                                <div className="mt-2 border-t border-amber-100 pt-2">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">Unlocks</p>
                                                                    {check.unlocks.map((item) => (
                                                                        <p key={item} className="mt-1 text-xs text-slate-600">✓ {item}</p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {!selectedWorkerActivation.isFullyActivated && (
                                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                                                This worker is not automatically excluded. HelpNova may still match them to suitable lower-risk jobs, while workers with stronger activation records receive higher priority and broader opportunities.
                                            </div>
                                        )}

                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Admin Recommendation</p>
                                                    <h4 className="mt-1 text-lg font-bold text-slate-900">Activation-based operational guidance</h4>
                                                </div>
                                                <Badge className={selectedWorkerActivation.riskLevel === "LOW" ? "bg-green-100 text-green-700" : selectedWorkerActivation.riskLevel === "MODERATE" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
                                                    {selectedWorkerActivation.riskLevel} READINESS
                                                </Badge>
                                            </div>
                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <div className="rounded-xl bg-green-50 p-4">
                                                    <p className="font-semibold text-green-800">Recommended opportunities</p>
                                                    {selectedWorkerActivation.recommendedJobs.map((job) => (
                                                        <p key={job} className="mt-2 text-sm text-green-800">✓ {job}</p>
                                                    ))}
                                                </div>
                                                <div className="rounded-xl bg-amber-50 p-4">
                                                    <p className="font-semibold text-amber-800">Hold or review before assignment</p>
                                                    {selectedWorkerActivation.restrictedJobs.length > 0 ? selectedWorkerActivation.restrictedJobs.map((job) => (
                                                        <p key={job} className="mt-2 text-sm text-amber-800">• {job}</p>
                                                    )) : <p className="mt-2 text-sm text-green-700">No activation-based restrictions.</p>}
                                                    {selectedWorkerActivation.riskReasons.length > 0 && (
                                                        <p className="mt-3 text-xs text-slate-600">Outstanding checks: {selectedWorkerActivation.riskReasons.join(", ")}.</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-xs text-slate-500">This is rules-based activation guidance, not a final safety or employment decision. Authorized staff must review job context and verified records.</p>
                                        </div>
                                    </div>
                                </DetailSection>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <DetailSection title="Contact & Identity">
                                    <DetailLine icon={Phone} label="Phone" value={selectedWorker.phone} />
                                    <DetailLine icon={Mail} label="Email" value={selectedWorker.email} />
                                    <DetailLine icon={MapPin} label="Address" value={selectedWorker.address} />
                                    <DetailLine icon={Clock} label="Last Active" value={selectedWorker.lastActive} />
                                </DetailSection>

                                <DetailSection title="Verification & Compliance">
                                    <ComplianceLine icon={ShieldCheck} label="Identity / NIN" value={selectedWorker.ninStatus} action="Submit and verify a valid government-issued identity record." />
                                    <ComplianceLine icon={FileCheck} label="Supporting Documents" value={selectedWorker.documentsStatus} action="Upload the required supporting documents for HR review." />
                                    <ComplianceLine icon={Wallet} label="Bank & Payout Setup" value={selectedWorker.bankStatus} action="Add and verify the worker's payout account." />
                                    <ComplianceLine icon={UserCheck} label="Background Check" value={selectedWorker.backgroundCheck} action="Complete the required safety and background screening." />
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
                                    <InfoCard title="Guarantor Information" value={selectedWorker.guarantorStatus} note={statusNeedsAction(selectedWorker.guarantorStatus) ? "Required action: Invite a guarantor to complete the secure form and submit supporting attachments." : "Full details available to authorized HR/Admin officers only."} />
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

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-10">
                                {selectedWorker.status === "Suspended" ? (
                                    <button
                                        type="button"
                                        onClick={() => handleReactivateWorker(selectedWorker)}
                                        className="rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                                    >
                                        Reactivate
                                    </button>
                                ) : selectedWorker.status === "Approved" ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="cursor-not-allowed rounded-xl bg-green-100 py-3 font-semibold text-green-700"
                                    >
                                        Approved
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleApproveWorker(selectedWorker)}
                                        className="rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                )}

                                {selectedWorker.status === "Suspended" ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="cursor-not-allowed rounded-xl bg-red-100 py-3 font-semibold text-red-700"
                                    >
                                        Suspended
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleSuspendWorker(selectedWorker)}
                                        className="rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
                                    >
                                        Suspend
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => loadWorkerWallet(selectedWorker)}
                                    className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition"
                                >
                                    View Wallet
                                </button>

                                {showWallet && selectedWorker && (
                                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
                                        <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
                                            <div className="flex items-center justify-between border-b bg-white p-5">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-900">
                                                        Worker Wallet
                                                    </h2>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {selectedWorker.name ??
                                                            selectedWorker.full_name ??
                                                            "Worker"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={closeWorkerWallet}
                                                        className="rounded-lg p-2 hover:bg-slate-100"
                                                        aria-label="Close worker wallet"
                                                    >
                                                        <X size={24} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="overflow-y-auto p-6">
                                                {walletLoading ? (
                                                    <WalletLoadingState />
                                                ) : walletError ? (
                                                    <WalletErrorState
                                                        message={walletError}
                                                        onRetry={() =>
                                                            loadWorkerWallet(selectedWorker)
                                                        }
                                                    />
                                                ) : (
                                                    <div className="space-y-6">
                                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                                            <WalletSummaryCard
                                                                title="Available Balance"
                                                                amount={walletSummary.availableBalance}
                                                                icon={Wallet}
                                                            />

                                                            <WalletSummaryCard
                                                                title="Lifetime Earnings"
                                                                amount={walletSummary.totalEarnings}
                                                                icon={TrendingUp}
                                                                valueClassName="text-green-600"
                                                            />

                                                            <WalletSummaryCard
                                                                title="Pending Withdrawal"
                                                                amount={walletSummary.pendingWithdrawal}
                                                                icon={Clock}
                                                                valueClassName="text-orange-500"
                                                            />

                                                            <WalletSummaryCard
                                                                title="Commission Paid"
                                                                amount={walletSummary.commissionPaid}
                                                                icon={ReceiptText}
                                                                valueClassName="text-blue-600"
                                                            />
                                                        </div>

                                                        <div className="rounded-2xl bg-white p-5 shadow">
                                                            <div className="grid gap-4 md:grid-cols-2">
                                                                <WalletInformationLine
                                                                    label="Wallet ID"
                                                                    value={
                                                                        walletData?.wallet_id ??
                                                                        walletData?.id ??
                                                                        "Not available"
                                                                    }
                                                                />

                                                                <WalletInformationLine
                                                                    label="Worker ID"
                                                                    value={
                                                                        walletData?.worker_id ??
                                                                        selectedWorker.worker_id ??
                                                                        selectedWorker.id ??
                                                                        "Not available"
                                                                    }
                                                                />

                                                                <WalletInformationLine
                                                                    label="Wallet Status"
                                                                    value={
                                                                        walletData?.status ??
                                                                        "active"
                                                                    }
                                                                />

                                                                <WalletInformationLine
                                                                    label="Currency"
                                                                    value={
                                                                        walletData?.currency ??
                                                                        "NGN"
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="rounded-2xl bg-white p-5 shadow">
                                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                                                <div>
                                                                    <h3 className="text-xl font-bold text-slate-900">
                                                                        Recent Transactions
                                                                    </h3>

                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                        Live wallet credits, debits,
                                                                        payments and withdrawals.
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        loadWorkerWallet(
                                                                            selectedWorker
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                                                                >
                                                                    <RotateCcw size={16} />
                                                                    Refresh
                                                                </button>
                                                            </div>

                                                            <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                                                                <div className="flex flex-1 items-center gap-3 rounded-xl border px-4 py-3">
                                                                    <Search
                                                                        size={19}
                                                                        className="text-slate-400"
                                                                    />

                                                                    <input
                                                                        type="search"
                                                                        value={walletSearch}
                                                                        onChange={(event) => {
                                                                            setWalletSearch(
                                                                                event.target.value
                                                                            );
                                                                            setWalletPage(1);
                                                                        }}
                                                                        placeholder="Search by transaction ID, reference, description or amount..."
                                                                        className="w-full bg-transparent outline-none"
                                                                    />
                                                                </div>

                                                                <div className="flex items-center gap-2 rounded-xl border px-3">
                                                                    <Filter
                                                                        size={18}
                                                                        className="text-slate-400"
                                                                    />

                                                                    <select
                                                                        value={walletFilter}
                                                                        onChange={(event) => {
                                                                            setWalletFilter(
                                                                                event.target.value
                                                                            );
                                                                            setWalletPage(1);
                                                                        }}
                                                                        className="min-h-12 bg-transparent pr-4 text-sm font-semibold outline-none"
                                                                    >
                                                                        <option value="all">
                                                                            All Transactions
                                                                        </option>

                                                                        <option value="credits">
                                                                            Credits
                                                                        </option>

                                                                        <option value="debits">
                                                                            Debits
                                                                        </option>

                                                                        <option value="pending">
                                                                            Pending
                                                                        </option>

                                                                        <option value="completed">
                                                                            Completed
                                                                        </option>

                                                                        <option value="payments">
                                                                            Job Payments
                                                                        </option>

                                                                        <option value="withdrawals">
                                                                            Withdrawals
                                                                        </option>

                                                                        <option value="commissions">
                                                                            Commissions
                                                                        </option>

                                                                        <option value="refunds">
                                                                            Refunds
                                                                        </option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {paginatedWalletTransactions.length ===
                                                                0 ? (
                                                                <WalletEmptyState
                                                                    hasSearch={
                                                                        Boolean(
                                                                            walletSearch.trim()
                                                                        ) ||
                                                                        walletFilter !== "all"
                                                                    }
                                                                />
                                                            ) : (
                                                                <>
                                                                    <div className="mt-5 overflow-x-auto">
                                                                        <table className="w-full min-w-[900px] text-sm">
                                                                            <thead>
                                                                                <tr className="border-b text-left text-slate-500">
                                                                                    <th className="px-3 py-3">
                                                                                        Date
                                                                                    </th>

                                                                                    <th className="px-3 py-3">
                                                                                        Transaction
                                                                                    </th>

                                                                                    <th className="px-3 py-3">
                                                                                        Type
                                                                                    </th>

                                                                                    <th className="px-3 py-3">
                                                                                        Description
                                                                                    </th>

                                                                                    <th className="px-3 py-3 text-right">
                                                                                        Amount
                                                                                    </th>

                                                                                    <th className="px-3 py-3">
                                                                                        Status
                                                                                    </th>

                                                                                    <th className="px-3 py-3 text-center">
                                                                                        Action
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>

                                                                            <tbody>
                                                                                {paginatedWalletTransactions.map(
                                                                                    (transaction) => (
                                                                                        <WalletTransactionRow
                                                                                            key={
                                                                                                transaction.id
                                                                                            }
                                                                                            transaction={
                                                                                                transaction
                                                                                            }
                                                                                            onView={
                                                                                                setSelectedTransaction
                                                                                            }
                                                                                        />
                                                                                    )
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>

                                                                    <WalletPagination
                                                                        page={walletPage}
                                                                        totalPages={
                                                                            totalWalletPages
                                                                        }
                                                                        totalRecords={
                                                                            filteredWalletTransactions.length
                                                                        }
                                                                        pageSize={
                                                                            walletPageSize
                                                                        }
                                                                        onPageChange={
                                                                            setWalletPage
                                                                        }
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={openDocumentsWorkspace}
                                    className="rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800"
                                >
                                    View Documents
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {selectedTransaction && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Transaction Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedTransaction.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedTransaction(null)
                                }
                                className="rounded-lg p-2 hover:bg-slate-100"
                            >
                                <X size={23} />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="rounded-2xl bg-slate-900 p-6 text-white">
                                <p className="text-sm text-slate-300">
                                    Transaction Amount
                                </p>

                                <h3 className="mt-2 text-3xl font-bold">
                                    {selectedTransaction.direction ===
                                        "debit"
                                        ? "-"
                                        : "+"}
                                    {formatCurrency(
                                        selectedTransaction.amount
                                    )}
                                </h3>

                                <div className="mt-4">
                                    <TransactionStatusBadge
                                        status={
                                            selectedTransaction.status
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TransactionDetailCard
                                    label="Transaction ID"
                                    value={selectedTransaction.id}
                                />

                                <TransactionDetailCard
                                    label="Reference"
                                    value={
                                        selectedTransaction.reference
                                    }
                                />

                                <TransactionDetailCard
                                    label="Type"
                                    value={formatTransactionType(
                                        selectedTransaction.type
                                    )}
                                />

                                <TransactionDetailCard
                                    label="Direction"
                                    value={capitalizeText(
                                        selectedTransaction.direction
                                    )}
                                />

                                <TransactionDetailCard
                                    label="Description"
                                    value={
                                        selectedTransaction.description
                                    }
                                />

                                <TransactionDetailCard
                                    label="Date"
                                    value={formatDateTime(
                                        selectedTransaction.createdAt
                                    )}
                                />

                                <TransactionDetailCard
                                    label="Job ID"
                                    value={
                                        selectedTransaction.jobId ??
                                        "Not available"
                                    }
                                />

                                <TransactionDetailCard
                                    label="Customer"
                                    value={
                                        selectedTransaction.customerName ??
                                        "Not available"
                                    }
                                />

                                <TransactionDetailCard
                                    label="Payment Method"
                                    value={
                                        selectedTransaction.paymentMethod ??
                                        "Not available"
                                    }
                                />

                                <TransactionDetailCard
                                    label="Platform Fee"
                                    value={formatCurrency(
                                        selectedTransaction.platformFee
                                    )}
                                />

                                <TransactionDetailCard
                                    label="Worker Amount"
                                    value={formatCurrency(
                                        selectedTransaction.workerAmount
                                    )}
                                />

                                <TransactionDetailCard
                                    label="Status"
                                    value={capitalizeText(
                                        selectedTransaction.status
                                    )}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedTransaction(null)
                                    }
                                    className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDocuments && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-3 md:p-6">
                    <div className="bg-white rounded-2xl w-full max-w-7xl h-[92vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="border-b bg-white px-5 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Worker Documents Workspace
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedWorker?.name || "Worker"} · Verification and compliance records
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDocumentsWorkspace}
                                className="p-2 rounded-lg hover:bg-slate-100 transition"
                                aria-label="Close documents workspace"
                            >



                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr]">
                            <aside className="border-r bg-slate-50 overflow-y-auto">
                                <div className="sticky top-0 bg-slate-50 border-b p-4 z-10">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                Documents
                                            </h3>

                                            <p className="text-xs text-slate-500 mt-1">
                                                {documents.length} record{documents.length === 1 ? "" : "s"}
                                            </p>
                                        </div>

                                        <Badge className="bg-blue-100 text-blue-700">
                                            HR/Admin
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-3 space-y-2">
                                    {documents.length === 0 ? (
                                        <div className="rounded-xl border border-dashed bg-white p-6 text-center">
                                            <FileCheck
                                                size={36}
                                                className="mx-auto text-slate-400"
                                            />

                                            <p className="font-semibold text-slate-700 mt-3">
                                                No documents found
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                Uploaded worker documents will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        documents.map((document) => {
                                            const isSelected =
                                                selectedDocument?.title === document.title;

                                            return (
                                                <button
                                                    type="button"
                                                    key={document.title}
                                                    onClick={() =>
                                                        handleSelectDocument(document)
                                                    }
                                                    className={`w-full text-left rounded-xl border p-4 transition ${isSelected
                                                            ? "border-blue-500 bg-blue-50 shadow-sm"
                                                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span
                                                            className={`mt-1 w-3 h-3 shrink-0 rounded-full ${documentStatusColor(
                                                                document.status
                                                            )}`}
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-slate-900 truncate">
                                                                {document.title}
                                                            </p>

                                                            <p className="text-sm text-slate-600 mt-1">
                                                                {document.status}
                                                            </p>

                                                            <p className="text-xs text-slate-400 mt-1">
                                                                Uploaded {document.uploadedOn}
                                                            </p>

                                                            {document.rejectionReason && (
                                                                <p className="text-xs text-red-600 mt-2 line-clamp-2">
                                                                    {document.rejectionReason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </aside>

                            <main className="overflow-y-auto bg-white">
                                {!selectedDocument ? (
                                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
                                        <FileCheck
                                            size={64}
                                            className="text-slate-300"
                                        />

                                        <h3 className="text-xl font-bold text-slate-800 mt-5">
                                            Select a document
                                        </h3>

                                        <p className="text-slate-500 mt-2 max-w-md">
                                            Choose a worker document from the left panel to
                                            inspect its status, metadata and verification
                                            history.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-5 md:p-7 space-y-6">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-2xl font-bold text-slate-900">
                                                        {selectedDocument.title}
                                                    </h3>

                                                    <Badge
                                                        className={documentStatusBadge(
                                                            selectedDocument.status
                                                        )}
                                                    >
                                                        {selectedDocument.status}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-slate-500 mt-2">
                                                    Uploaded {selectedDocument.uploadedOn}
                                                    {" · "}
                                                    Reviewed by{" "}
                                                    {selectedDocument.verifiedBy ||
                                                        "Pending"}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    downloadWorkerDocument(
                                                        selectedDocument
                                                    )
                                                }
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                                            >
                                                Download
                                            </button>
                                        </div>

                                        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 min-h-[340px] flex flex-col items-center justify-center p-8 text-center">
                                            <FileCheck
                                                size={64}
                                                className="text-blue-600"
                                            />

                                            <h4 className="font-bold text-xl text-slate-900 mt-5">
                                                {selectedDocument.title}
                                            </h4>

                                            <p className="text-sm text-slate-500 mt-2">
                                                No document preview is available yet.
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1 max-w-lg">
                                                The uploaded image or PDF will render in this
                                                workspace after worker document storage is
                                                connected to the backend.
                                            </p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            <InfoCard
                                                title="Status"
                                                value={selectedDocument.status}
                                            />

                                            <InfoCard
                                                title="Verified By"
                                                value={
                                                    selectedDocument.verifiedBy ||
                                                    "Pending"
                                                }
                                            />

                                            <InfoCard
                                                title="Uploaded On"
                                                value={selectedDocument.uploadedOn}
                                            />

                                            <InfoCard
                                                title="File Type"
                                                value={
                                                    selectedDocument.fileType ||
                                                    "Document"
                                                }
                                            />

                                            <InfoCard
                                                title="File Size"
                                                value={
                                                    selectedDocument.fileSize ||
                                                    "Not available"
                                                }
                                            />

                                            <InfoCard
                                                title="Access Level"
                                                value="HR/Admin Only"
                                            />
                                        </div>

                                        {(selectedDocument.rejectionReason ||
                                            selectedDocument.adminComment) && (
                                                <div
                                                    className={`rounded-xl border p-4 ${selectedDocument.status === "Rejected"
                                                            ? "border-red-200 bg-red-50"
                                                            : "border-green-200 bg-green-50"
                                                        }`}
                                                >
                                                    <p
                                                        className={`text-sm font-semibold ${selectedDocument.status ===
                                                                "Rejected"
                                                                ? "text-red-700"
                                                                : "text-green-700"
                                                            }`}
                                                    >
                                                        HR/Admin Comment
                                                    </p>

                                                    <p className="text-slate-800 mt-2">
                                                        {selectedDocument.rejectionReason ||
                                                            selectedDocument.adminComment}
                                                    </p>
                                                </div>
                                            )}

                                        <div className="rounded-2xl bg-slate-50 border p-5">
                                            <h4 className="font-bold text-slate-900">
                                                Verification History
                                            </h4>

                                            <div className="space-y-4 mt-4 text-sm">
                                                <HistoryLine
                                                    title="Document uploaded"
                                                    date={selectedDocument.uploadedOn}
                                                />

                                                <HistoryLine
                                                    title={`Current status: ${selectedDocument.status}`}
                                                    date="Latest document state"
                                                />

                                                <HistoryLine
                                                    title={`Reviewed by: ${selectedDocument.verifiedBy ||
                                                        "Pending"
                                                        }`}
                                                    date="HR/Admin review"
                                                />
                                            </div>
                                        </div>

                                        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t pt-4 pb-2 flex flex-wrap justify-end gap-3">
                                            {selectedDocument.status !== "Verified" ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDocumentAction("approve")
                                                    }
                                                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 transition"
                                                >
                                                    Approve Document
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="rounded-xl bg-green-100 px-5 py-3 font-semibold text-green-700 cursor-not-allowed"
                                                >
                                                    Already Verified
                                                </button>
                                            )}

                                            {selectedDocument.status !== "Rejected" ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDocumentAction("reject")
                                                    }
                                                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 transition"
                                                >
                                                    Reject Document
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="rounded-xl bg-red-100 px-5 py-3 font-semibold text-red-700 cursor-not-allowed"
                                                >
                                                    Already Rejected
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                </div>
            )}

            {documentAction && selectedDocument && (
                <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold">
                            Confirm{" "}
                            {documentAction === "approve"
                                ? "Approval"
                                : "Rejection"}
                        </h2>

                        <p className="text-slate-600 mt-3">
                            Are you sure you want to {documentAction}{" "}
                            <span className="font-bold">
                                {selectedDocument.title}
                            </span>
                            ?
                        </p>

                        {documentAction === "reject" && (
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Reason for rejection
                                </label>

                                <textarea
                                    value={rejectionReason}
                                    onChange={(event) =>
                                        setRejectionReason(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Example: Blurry document, expired ID, name mismatch..."
                                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-400"
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() =>
                                    setDocumentAction(null)
                                }
                                className="px-5 py-3 rounded-xl bg-slate-100 font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDocumentAction}
                                className={`px-5 py-3 rounded-xl text-white font-semibold ${documentAction === "approve"
                                        ? "bg-green-600"
                                        : "bg-red-600"
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
    const box =
        size === "large"
            ? "w-28 h-28"
            : "w-11 h-11";

    const icon =
        size === "large"
            ? 38
            : 20;

    const shield =
        size === "large"
            ? "w-8 h-8"
            : "w-5 h-5";

    const shieldIcon =
        size === "large"
            ? 16
            : 11;

    return (
        <div
            className={`relative ${box} rounded-full bg-slate-100 border flex items-center justify-center shadow`}
        >
            <Camera
                className="text-slate-400"
                size={icon}
            />

            <span
                className={`absolute -bottom-1 -right-1 ${shield} rounded-full bg-green-600 border-2 border-white flex items-center justify-center`}
            >
                <ShieldCheck
                    size={shieldIcon}
                    className="text-white"
                />
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

function normalizedStatus(value) {
    return String(value || "not submitted").trim().toLowerCase();
}

function statusNeedsAction(value) {
    return !["approved", "verified", "complete", "completed", "active", "matched"].includes(normalizedStatus(value));
}

function StatusBadge({ value }) {
    const status = normalizedStatus(value);
    let classes = "bg-slate-100 text-slate-700";

    if (["approved", "verified", "complete", "completed", "active", "matched"].includes(status)) {
        classes = "bg-green-100 text-green-700";
    } else if (["submitted", "uploaded", "under review", "pending review", "in review"].includes(status)) {
        classes = "bg-blue-100 text-blue-700";
    } else if (["pending", "invited", "not submitted", "not provided"].includes(status)) {
        classes = "bg-amber-100 text-amber-700";
    } else if (["rejected", "failed", "expired", "suspended"].includes(status)) {
        classes = "bg-red-100 text-red-700";
    }

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>
            {titleCase(value || "Not submitted")}
        </span>
    );
}

function ComplianceLine({ icon: Icon, label, value, action }) {
    const needsAction = statusNeedsAction(value);

    return (
        <div className="border-b py-3 last:border-b-0">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Icon size={18} className={needsAction ? "text-amber-600" : "text-green-600"} />
                    <span className="text-slate-600">{label}</span>
                </div>
                <StatusBadge value={value} />
            </div>
            {needsAction && (
                <p className="mt-2 pl-8 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Required action:</span> {action}
                </p>
            )}
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

function WalletInfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
            <span className="text-slate-500">{label}</span>

            <span className="font-semibold text-right">
                {value}
            </span>
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

function documentStatusBadge(status) {
    if (["Verified", "Approved", "Matched"].includes(status)) {
        return "bg-green-100 text-green-700";
    }

    if (["Pending Review", "Submitted"].includes(status)) {
        return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Uploaded") {
        return "bg-blue-100 text-blue-700";
    }

    if (status === "Rejected") {
        return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
}