import { useEffect, useMemo, useState } from "react";
import {
    getAdminCustomers,
    getAdminCustomerDetails,
    verifyCustomer,
    suspendAdminCustomer,
    reactivateAdminCustomer,
} from "../../api/customerAdminApi";
import {
    Search,
    Eye,
    ShieldCheck,
    Ban,
    Star,
    Camera,
    MapPin,
    Phone,  
    Mail,
    CalendarDays,
    Crown,
    AlertTriangle,
    UserCheck,
    Users,
    X,
    Wallet,
    Briefcase,
    Clock,
    CreditCard,
    RefreshCcw,
} from "lucide-react";

const initialCustomers = [
    {
        id: "HN-CUS-000201",
        name: "Aisha Bello",
        photoUrl: "",
        phone: "08031234567",
        email: "aisha.bello@example.com",
        location: "Maitama, Abuja",
        verification: "Verified",
        status: "Active",
        customerType: "VIP",
        rating: 4.9,
        totalJobs: 32,
        totalSpent: 486000,
        joined: "12 Jan 2026",
        lastActivity: "10 minutes ago",
        fraudFlag: false,
        trustScore: 96,
        riskLevel: "Low Risk",
        walletBalance: 25000,
        escrowPayments: 18000,
        completedPayments: 468000,
        pendingRefunds: 0,
        cancelledJobs: 1,
        favouriteCategory: "Electrical Services",
        repeatWorkers: 5,
        averageCompletionTime: "2 hrs 18 mins",
        emergencyContact: {
            name: "Hauwa Bello",
            relationship: "Sister",
            phone: "08031112222",
        },
        deviceHistory: {
            lastLogin: "10 minutes ago",
            device: "Samsung Android",
            browser: "Chrome",
            location: "Maitama, Abuja",
        },
        notes: [
            "High-value customer.",
            "Prefers verified Gold or Platinum workers.",
            "No payment disputes recorded.",
        ],
        complaints: {
            open: 0,
            resolved: 2,
            escalated: 0,
        },
    },
    {
        id: "HN-CUS-000202",
        name: "David Musa",
        photoUrl: "",
        phone: "08045556677",
        email: "david.musa@example.com",
        location: "Wuse 2, Abuja",
        verification: "Pending",
        status: "Active",
        customerType: "Regular",
        rating: 4.5,
        totalJobs: 11,
        totalSpent: 128500,
        joined: "03 Mar 2026",
        lastActivity: "1 hour ago",
        fraudFlag: false,
        trustScore: 78,
        riskLevel: "Moderate Risk",
        walletBalance: 5000,
        escrowPayments: 12500,
        completedPayments: 116000,
        pendingRefunds: 0,
        cancelledJobs: 2,
        favouriteCategory: "Home Cleaning",
        repeatWorkers: 2,
        averageCompletionTime: "3 hrs 05 mins",
        emergencyContact: {
            name: "Musa David",
            relationship: "Brother",
            phone: "08045550000",
        },
        deviceHistory: {
            lastLogin: "1 hour ago",
            device: "Windows Laptop",
            browser: "Edge",
            location: "Wuse 2, Abuja",
        },
        notes: [
            "Verification documents still pending.",
            "Payments are currently in good standing.",
        ],
        complaints: {
            open: 1,
            resolved: 1,
            escalated: 0,
        },
    },
    {
        id: "HN-CUS-000203",
        name: "Fatima Abdullahi",
        photoUrl: "",
        phone: "08067778899",
        email: "fatima.abdullahi@example.com",
        location: "Gwarinpa, Abuja",
        verification: "Verified",
        status: "Suspended",
        customerType: "Fraud Watch",
        rating: 3.8,
        totalJobs: 6,
        totalSpent: 64200,
        joined: "20 Apr 2026",
        lastActivity: "2 days ago",
        fraudFlag: true,
        trustScore: 42,
        riskLevel: "High Risk",
        walletBalance: 0,
        escrowPayments: 0,
        completedPayments: 64200,
        pendingRefunds: 8500,
        cancelledJobs: 4,
        favouriteCategory: "Plumbing",
        repeatWorkers: 1,
        averageCompletionTime: "4 hrs 40 mins",
        emergencyContact: {
            name: "Abdullahi Fatima",
            relationship: "Spouse",
            phone: "08067770000",
        },
        deviceHistory: {
            lastLogin: "2 days ago",
            device: "Unknown Android",
            browser: "Chrome",
            location: "Gwarinpa, Abuja",
        },
        notes: [
            "Account suspended for fraud review.",
            "Multiple failed payment attempts recorded.",
            "Manual clearance required before reactivation.",
        ],
        complaints: {
            open: 2,
            resolved: 1,
            escalated: 1,
        },
    },
    {
        id: "HN-CUS-000204",
        name: "Chinedu Okafor",
        photoUrl: "",
        phone: "08089990011",
        email: "chinedu.okafor@example.com",
        location: "Jabi, Abuja",
        verification: "Verified",
        status: "Active",
        customerType: "Regular",
        rating: 4.7,
        totalJobs: 19,
        totalSpent: 274000,
        joined: "07 May 2026",
        lastActivity: "25 minutes ago",
        fraudFlag: false,
        trustScore: 91,
        riskLevel: "Low Risk",
        walletBalance: 18000,
        escrowPayments: 22000,
        completedPayments: 252000,
        pendingRefunds: 0,
        cancelledJobs: 0,
        favouriteCategory: "Appliance Repair",
        repeatWorkers: 4,
        averageCompletionTime: "2 hrs 42 mins",
        emergencyContact: {
            name: "Ada Okafor",
            relationship: "Wife",
            phone: "08089991111",
        },
        deviceHistory: {
            lastLogin: "25 minutes ago",
            device: "iPhone",
            browser: "Safari",
            location: "Jabi, Abuja",
        },
        notes: [
            "Consistent repeat customer.",
            "Prefers same-day service where available.",
        ],
        complaints: {
            open: 0,
            resolved: 1,
            escalated: 0,
        },
    },
];

const filters = [
    "All",
    "Verified",
    "Pending",
    "VIP",
    "Active",
    "Suspended",
    "Fraud Watch",
];

function formatCustomerLabel(value) {
    if (!value) return "Not available";

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CustomerManagement() {
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerAction, setCustomerAction] = useState(null);
    const [actionMessage, setActionMessage] = useState("");
    const [customerRecords, setCustomerRecords] = useState([]);

    const [customersLoading, setCustomersLoading] = useState(true);
    const [customersError, setCustomersError] = useState("");

    const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
    const [customerDetailsError, setCustomerDetailsError] = useState("");
    

    useEffect(() => {
        let isMounted = true;

        const loadCustomers = async () => {
            try {
                setCustomersLoading(true);
                setCustomersError("");

                const data = await getAdminCustomers();

                console.log("Raw backend customers:", data);

                if (!Array.isArray(data)) {
                    throw new Error(
                        "The customer endpoint did not return an array."
                    );
                }

                const normalizedCustomers = data.map((customer) => ({
                    id: customer.customer_id,
                    name: customer.full_name || "Unnamed Customer",
                    photoUrl: customer.profile_photo_url || "",
                    phone: customer.phone || "",
                    email: customer.email || "",
                    verification:
                        customer.verification_status === "verified"
                            ? "Verified"
                            : "Pending",
                    status: customer.is_active ? "Active" : "Suspended",
                    customerType:
                        customer.customer_type === "vip"
                            ? "VIP"
                            : "Regular",
                    role: customer.role || "customer",

                    location: customer.location || "Not provided",
                    rating: 0,
                    totalJobs: customer.total_jobs || 0,
                    totalSpent: customer.total_spent || 0,
                    joined: customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : "Not available",
                    lastActivity: customer.last_activity
                        ? new Date(customer.last_activity).toLocaleString()
                        : "Not available",
                    fraudFlag: customer.fraud_flag || false,
                    trustScore: 0,
                    riskLevel: "Not assessed",
                    walletBalance: 0,
                    escrowPayments: 0,
                    completedPayments: 0,
                    pendingRefunds: 0,
                    cancelledJobs: 0,
                    favouriteCategory: "Not available",
                    repeatWorkers: 0,
                    averageCompletionTime: "Not available",

                    emergencyContact: {
                        name: "Not provided",
                        relationship: "Not provided",
                        phone: "Not provided",
                    },

                    deviceHistory: {
                        lastLogin: "Not available",
                        device: "Not available",
                        browser: "Not available",
                        location: "Not available",
                    },

                    notes: [],
                    complaints: {
                        open: 0,
                        resolved: 0,
                        escalated: 0,
                    },
                }));

                console.log("Normalized customers:", normalizedCustomers);

                if (isMounted) {
                    setCustomerRecords(normalizedCustomers);
                }
            } catch (error) {
                console.error("Unable to load customers:", error);

                if (isMounted) {
                    setCustomersError(
                        error.message ||
                        "Unable to load customer records from the backend."
                    );
                }
            } finally {
                if (isMounted) {
                    setCustomersLoading(false);
                }
            }
        };

        loadCustomers();

        return () => {
            isMounted = false;
        };
    }, []);

    
    const updateCustomerRecord = (customerId, updates) => {
        setCustomerRecords((previousRecords) =>
            previousRecords.map((customer) =>
                customer.id === customerId
                    ? { ...customer, ...updates }
                    : customer
            )
        );

        setSelectedCustomer((previousCustomer) => {
            if (!previousCustomer || previousCustomer.id !== customerId) {
                return previousCustomer;
            }

            return {
                ...previousCustomer,
                ...updates,
            };
        });
    };

    const handleVerifyCustomer = async (customerId) => {
        try {
            setCustomersError("");

            const response = await verifyCustomer(customerId);
            const updatedCustomer = response?.customer || {};

            updateCustomerRecord(customerId, {
                verification: "Verified",
                verification_status: "verified",
                is_active: updatedCustomer.is_active ?? true,
            });

            setActionMessage("Customer verified successfully.");

            setTimeout(() => {
                setActionMessage("");
            }, 4000);
        } catch (error) {
            console.error("Unable to verify customer:", error);

            setCustomersError(
                error.message || "Unable to verify customer."
            );
        }
    };

    const handleSuspendCustomer = async (customerId) => {
        try {
            setCustomersError("");

            const response = await suspendAdminCustomer(customerId);
            const updatedCustomer = response?.customer || {};

            updateCustomerRecord(customerId, {
                status: "Suspended",
                is_active: updatedCustomer.is_active ?? false,
            });

            setActionMessage("Customer suspended successfully.");

            setTimeout(() => {
                setActionMessage("");
            }, 4000);
        } catch (error) {
            console.error("Unable to suspend customer:", error);

            setCustomersError(
                error.message || "Unable to suspend customer."
            );
        }
    };

    const handleReactivateCustomer = async (customerId) => {
        try {
            setCustomersError("");

            const response = await reactivateAdminCustomer(customerId);
            const updatedCustomer = response?.customer || {};

            updateCustomerRecord(customerId, {
                status: "Active",
                is_active: updatedCustomer.is_active ?? true,
            });

            setActionMessage("Customer reactivated successfully.");

            setTimeout(() => {
                setActionMessage("");
            }, 4000);
        } catch (error) {
            console.error("Unable to reactivate customer:", error);

            setCustomersError(
                error.message || "Unable to reactivate customer."
            );
        }
    };

      
    const applyCustomerAdministrativeAction = (actionName) => {
        if (!selectedCustomer) return;

        switch (actionName) {
            case "verify":
                updateCustomerRecord(selectedCustomer.id, {
                    verification: "Verified",
                    trustScore: Math.max(selectedCustomer.trustScore, 85),
                    riskLevel: selectedCustomer.fraudFlag
                        ? selectedCustomer.riskLevel
                        : "Low Risk",
                });
                break;

            case "flag-fraud":
                updateCustomerRecord(selectedCustomer.id, {
                    fraudFlag: true,
                    customerType: "Fraud Watch",
                    riskLevel: "High Risk",
                    trustScore: Math.min(selectedCustomer.trustScore, 45),
                });
                break;

            case "remove-fraud":
                updateCustomerRecord(selectedCustomer.id, {
                    fraudFlag: false,
                    customerType: "Regular",
                    riskLevel: "Moderate Risk",
                    trustScore: Math.max(selectedCustomer.trustScore, 65),
                });
                break;

            case "suspend":
                updateCustomerRecord(selectedCustomer.id, {
                    status: "Suspended",
                });
                break;

            case "reactivate":
                updateCustomerRecord(selectedCustomer.id, {
                    status: "Active",
                });
                break;

            case "blacklist":
                updateCustomerRecord(selectedCustomer.id, {
                    status: "Blacklisted",
                    fraudFlag: true,
                    customerType: "Fraud Watch",
                    riskLevel: "Critical Risk",
                    trustScore: Math.min(selectedCustomer.trustScore, 15),
                });
                break;

            default:
                break;
        }
    };

    const openCustomerRecord = async (customer) => {
        try {
            setCustomerDetailsLoading(true);
            setCustomerDetailsError("");

            // Open immediately using the information already loaded in the table.
            setSelectedCustomer(customer);

            const data = await getAdminCustomerDetails(customer.id);
            console.log("Customer Details Response:", data);
            console.log("Summary:", data.summary);

            const backendCustomer = data?.customer || {};
            const summary = data?.summary || {};
            const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
            const payments = Array.isArray(data?.payments) ? data.payments : [];
            const workerInteractions = Array.isArray(
                data?.worker_interactions
            )
                ? data.worker_interactions
                : [];

            console.log("Worker interactions:", workerInteractions);

            const completedJobs =
                Number(summary.completed_jobs) ||
                jobs.filter((job) => job.status === "completed").length;

            const cancelledJobs =
                Number(summary.cancelled_jobs) ||
                jobs.filter((job) =>
                    ["cancelled", "canceled"].includes(
                        String(job.status || "").toLowerCase()
                    )
                ).length;

            const totalJobs =
                Number(summary.total_jobs) ||
                jobs.length ||
                Number(customer.totalJobs) ||
                0;

            const totalSpent =
                Number(summary.total_spent) ||
                Number(customer.totalSpent) ||
                0;

            const completedPayments =
                Number(summary.completed_payments) ||
                payments
                    .filter((payment) => payment.status === "released")
                    .reduce(
                        (total, payment) => total + Number(payment.amount || 0),
                        0
                    );

            const pendingRefunds =
                Number(summary.pending_refunds) ||
                payments
                    .filter((payment) => payment.status === "refunded")
                    .reduce(
                        (total, payment) => total + Number(payment.amount || 0),
                        0
                    );

            const firstJobDate =
                jobs.length > 0 && jobs[jobs.length - 1]?.created_at
                    ? new Date(jobs[jobs.length - 1].created_at).toLocaleDateString()
                    : customer.joined || "Not available";

            const latestJobDate =
                jobs.length > 0 && jobs[0]?.created_at
                    ? new Date(jobs[0].created_at).toLocaleString()
                    : customer.lastActivity || "Not available";

            const updatedCustomer = {
                ...customer,

                id: backendCustomer.customer_id || customer.id,
                name:
                    backendCustomer.full_name ||
                    customer.name ||
                    "Unnamed Customer",

                photoUrl:
                    backendCustomer.profile_photo_url ||
                    customer.photoUrl ||
                    "",

                phone:
                    backendCustomer.phone ||
                    customer.phone ||
                    "Not provided",

                email:
                    backendCustomer.email ||
                    customer.email ||
                    "Not provided",

                role:
                    backendCustomer.role ||
                    customer.role ||
                    "customer",

                status:
                    backendCustomer.is_active === false
                        ? "Suspended"
                        : customer.status || "Active",

                location:
                    summary.location ||
                    customer.location ||
                    "Not provided",

                verification:
                    formatCustomerLabel(
                        summary.verification_status ||
                        customer.verification ||
                        "Pending"
                    ),

                customerType:
                    formatCustomerLabel(
                        summary.customer_type ||
                        customer.customerType ||
                        "Regular"
                    ),

                fraudFlag:
                    Boolean(
                        summary.fraud_flag ??
                        customer.fraudFlag ??
                        false
                    ),

                rating:
                    Number(
                        summary.average_rating ??
                        customer.rating ??
                        0
                    ),

                averageRating:
                    Number(
                        summary.average_rating ??
                        customer.rating ??
                        0
                    ),

                totalJobs,
                completedJobs,

                pendingJobs: Number(summary.pending_jobs || 0),
                assignedJobs: Number(summary.assigned_jobs || 0),
                inProgressJobs: Number(summary.in_progress_jobs || 0),

                totalSpent,
                completedPayments,
                pendingRefunds,

                walletBalance: Number(
                    summary.wallet_balance ??
                    customer.walletBalance ??
                    0
                ),

                escrowPayments: Number(summary.escrow_balance || 0),

                escrowBalance: Number(summary.escrow_balance || 0),

                cancelledJobs,

                repeatWorkers: Number(
                    summary.repeat_workers ??
                    customer.repeatWorkers ??
                    0
                ),

                averageCompletionTime:
                    summary.average_completion_time ||
                    customer.averageCompletionTime ||
                    "Not available",

                favouriteCategory:
                    summary.favourite_category ||
                    customer.favouriteCategory ||
                    "Not available",

                trustScore: Number(
                    summary.trust_score ??
                    customer.trustScore ??
                    0
                ),

                riskLevel:
                    summary.risk_level ||
                    customer.riskLevel ||
                    "Not assessed",

                joined:
                    backendCustomer.created_at
                        ? new Date(
                            backendCustomer.created_at
                        ).toLocaleDateString()
                        : firstJobDate,

                lastActivity:
                    summary.last_activity
                        ? new Date(
                            summary.last_activity
                        ).toLocaleString()
                        : latestJobDate,

                jobs,
                payments,
                workerInteractions,

                emergencyContact:
                    summary.emergency_contact ||
                    customer.emergencyContact || {
                        name: "Not provided",
                        relationship: "Not provided",
                        phone: "Not provided",
                    },

                deviceHistory:
                    summary.device_history ||
                    customer.deviceHistory || {
                        lastLogin: "Not available",
                        device: "Not available",
                        browser: "Not available",
                        location: "Not available",
                    },

                notes:
                    summary.notes ||
                    customer.notes ||
                    [],

                complaints:
                    summary.complaints ||
                    customer.complaints || {
                        open: 0,
                        resolved: 0,
                        escalated: 0,
                    },
            };

            setSelectedCustomer(updatedCustomer);

            setCustomerRecords((previousRecords) =>
                previousRecords.map((record) =>
                    record.id === updatedCustomer.id
                        ? {
                            ...record,
                            ...updatedCustomer,
                        }
                        : record
                )
            );
        } catch (error) {
            console.error(
                "Unable to load customer details:",
                error
            );

            setCustomerDetailsError(
                error?.response?.data?.detail ||
                "Unable to load the complete customer record."
            );
        } finally {
            setCustomerDetailsLoading(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return customerRecords.filter((customer) => {
            const matchesFilter =
                activeFilter === "All" ||
                customer.verification === activeFilter ||
                customer.status === activeFilter ||
                customer.customerType === activeFilter;

            const matchesSearch =
                !normalizedSearch ||
                customer.name?.toLowerCase().includes(normalizedSearch) ||
                customer.id?.toLowerCase().includes(normalizedSearch) ||
                customer.phone?.toLowerCase().includes(normalizedSearch) ||
                customer.email?.toLowerCase().includes(normalizedSearch) ||
                customer.location?.toLowerCase().includes(normalizedSearch);

            return matchesFilter && matchesSearch;
        });
    }, [activeFilter, searchTerm, customerRecords]);

    const customerSummary = useMemo(() => {
        return {
            total: customerRecords.length,

            active: customerRecords.filter(
                (customer) => customer.status === "Active"
            ).length,

            pending: customerRecords.filter(
                (customer) => customer.verification === "Pending"
            ).length,

            suspended: customerRecords.filter(
                (customer) => customer.status === "Suspended"
            ).length,

            vip: customerRecords.filter(
                (customer) => customer.customerType === "VIP"
            ).length,

            fraudAlerts: customerRecords.filter(
                (customer) => customer.fraudFlag
            ).length,
        };
    }, [customerRecords]);

    return (
        <>
            <div className="space-y-6">
                {actionMessage && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                        <p className="text-sm font-semibold text-green-700">
                            {actionMessage}
                        </p>
                    </div>
                )}
                {customerDetailsLoading && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                        <p className="text-sm font-semibold text-blue-800">
                            Loading complete customer information...
                        </p>
                    </div>
                )}

                {customerDetailsError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-semibold text-red-700">
                            {customerDetailsError}
                        </p>
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Customer Management
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Manage, verify, monitor and support all HelpNova customers.
                    </p>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
                    <SummaryCard
                        title="Total Customers"
                        value={customerSummary.total.toLocaleString()}
                        icon={Users}
                    />

                    <SummaryCard
                        title="Active Customers"
                        value={customerSummary.active.toLocaleString()}
                        color="text-green-600"
                        icon={UserCheck}
                    />

                    <SummaryCard
                        title="Pending Verification"
                        value={customerSummary.pending.toLocaleString()}
                        color="text-orange-500"
                        icon={ShieldCheck}
                    />

                    <SummaryCard
                        title="Suspended"
                        value={customerSummary.suspended.toLocaleString()}
                        color="text-red-600"
                        icon={Ban}
                    />

                    <SummaryCard
                        title="VIP Customers"
                        value={customerSummary.vip.toLocaleString()}
                        color="text-purple-600"
                        icon={Crown}
                    />

                    <SummaryCard
                        title="Fraud Alerts"
                        value={customerSummary.fraudAlerts.toLocaleString()}
                        color="text-red-600"
                        icon={AlertTriangle}
                    />
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
                        <Search className="text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name, customer ID, phone, email or location..."
                            className="w-full outline-none text-slate-700"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeFilter === filter
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="font-bold text-lg text-slate-900">
                                Registered Customers
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Showing {filteredCustomers.length} customer record
                                {filteredCustomers.length === 1 ? "" : "s"}.
                            </p>
                        </div>
                    </div>

                    {customersLoading && (
                        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                            <p className="text-sm font-semibold text-blue-800">
                                Loading customer records from the HelpNova backend...
                            </p>
                        </div>
                    )}

                    {customersError && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="font-semibold text-red-800">
                                Unable to load customers
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                {customersError}
                            </p>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-slate-500">
                                    <th className="py-3">Customer</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Verification</th>
                                    <th>Status</th>
                                    <th>Type</th>
                                    <th>Rating</th>
                                    <th>Jobs</th>
                                    <th>Total Spent</th>
                                    <th>Last Activity</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-b last:border-b-0 hover:bg-slate-50"
                                    >
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-11 h-11 rounded-full bg-slate-100 border flex items-center justify-center shadow-sm overflow-visible shrink-0">
                                                    {customer.photoUrl ? (
                                                        <img
                                                            src={customer.photoUrl}
                                                            alt={`${customer.name} profile`}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="w-full h-full rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                                                                {getCustomerInitials(customer.name)}
                                                        </span>
                                                    )}

                                                    {customer.verification === "Verified" && (
                                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-600 border-2 border-white flex items-center justify-center">
                                                            <ShieldCheck size={11} className="text-white" />
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        {customer.name}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {customer.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="space-y-1">
                                                <p className="flex items-center gap-2 text-slate-700">
                                                    <Phone size={14} className="text-blue-600" />
                                                    {customer.phone}
                                                </p>

                                                <p className="flex items-center gap-2 text-slate-500">
                                                    <Mail size={14} className="text-blue-600" />
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={15} className="text-blue-600" />
                                                <span>{customer.location}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${verificationBadge(
                                                    customer.verification
                                                )}`}
                                            >
                                                {customer.verification}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(
                                                    customer.status
                                                )}`}
                                            >
                                                {customer.status}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${typeBadge(
                                                    customer.customerType
                                                )}`}
                                            >
                                                {customer.customerType}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="text-yellow-500" />
                                                <span>{customer.rating}</span>
                                            </div>
                                        </td>

                                        <td>{customer.totalJobs}</td>

                                        <td className="font-semibold text-slate-800">
                                            NGN {customer.totalSpent.toLocaleString()}
                                        </td>

                                        <td>{customer.lastActivity}</td>

                                        <td>
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={15} className="text-blue-600" />
                                                {customer.joined}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openCustomerRecord(customer)}
                                                    title="View customer"
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleVerifyCustomer(customer.id)}
                                                    title={
                                                        customer.verification === "Verified"
                                                            ? "Customer already verified"
                                                            : "Verify customer"
                                                    }
                                                    disabled={customer.verification === "Verified"}
                                                    className={`p-2 rounded-lg transition ${customer.verification === "Verified"
                                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                            : "bg-green-50 text-green-700 hover:bg-green-100"
                                                        }`}
                                                >
                                                    <ShieldCheck size={16} />
                                                </button>

                                                {customer.status === "Active" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSuspendCustomer(customer.id)}
                                                        title="Suspend customer"
                                                        className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReactivateCustomer(customer.id)}
                                                        title="Reactivate customer"
                                                        className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                                                    >
                                                        <RefreshCcw size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan="12" className="py-12 text-center text-slate-500">
                                            No customer records match the selected filter or search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
                       
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
                    <div className="bg-slate-100 w-full max-w-5xl h-full overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b z-10 p-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">360° Customer Record</h2>
                                <p className="text-slate-500 text-sm">
                                    Identity, services, finance, safety and activity overview.
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="p-2 rounded-lg hover:bg-slate-100"
                                aria-label="Close customer record"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="relative w-28 h-28 rounded-full bg-slate-100 border flex items-center justify-center shadow overflow-visible shrink-0">
                                        {selectedCustomer.photoUrl ? (
                                            <img
                                                src={selectedCustomer.photoUrl}
                                                alt={`${selectedCustomer.name} profile`}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="w-full h-full rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold">
                                                    {getCustomerInitials(selectedCustomer.name)}
                                            </span>
                                        )}

                                        {selectedCustomer.verification === "Verified" && (
                                            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-600 border-2 border-white flex items-center justify-center">
                                                <ShieldCheck size={16} className="text-white" />
                                            </span>
                                        )}
                                    </div>

                                    {customerAction && selectedCustomer && (
                                        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-5">
                                            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                                            Customer Administration
                                                        </p>

                                                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                                            {customerAction.title}
                                                        </h2>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setCustomerAction(null)}
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                                        aria-label="Close action confirmation"
                                                    >
                                                        <X size={22} />
                                                    </button>
                                                </div>

                                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {selectedCustomer.name}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {selectedCustomer.id}
                                                    </p>
                                                </div>

                                                <p className="mt-5 text-slate-600">
                                                    {customerAction.description}
                                                </p>

                                                <p className="mt-3 text-xs text-slate-500">
                                                    This Sprint 8 interface currently simulates the administrative
                                                    workflow. The confirmed operation will be connected to the
                                                    HelpNova backend API during integration.
                                                </p>

                                                <div className="mt-6 flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCustomerAction(null)}
                                                        className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const customerName = selectedCustomer.name;
                                                            const actionLabel = customerAction.confirmLabel;

                                                            setActionMessage(
                                                                `${actionLabel} action prepared successfully for ${customerName}.`
                                                            );

                                                            setCustomerAction(null);

                                                            setTimeout(() => {
                                                                setActionMessage("");
                                                            }, 4000);
                                                        }}
                                                        className={`px-5 py-3 rounded-xl font-semibold text-white shadow-md transition ${["suspend", "blacklist", "flag-fraud", "remove-fraud"].includes(
                                                            customerAction.type
                                                        )
                                                                ? "bg-red-600 hover:bg-red-700"
                                                                : "bg-slate-900 hover:bg-slate-800"
                                                            }`}
                                                    >
                                                        {customerAction.confirmLabel}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h3 className="text-3xl font-bold">{selectedCustomer.name}</h3>
                                        <p className="text-slate-500">{selectedCustomer.id}</p>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${verificationBadge(selectedCustomer.verification)}`}>
                                                {selectedCustomer.verification}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(selectedCustomer.status)}`}>
                                                {selectedCustomer.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeBadge(selectedCustomer.customerType)}`}>
                                                {selectedCustomer.customerType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <CustomerMetric title="Customer Rating" value={`${selectedCustomer.rating} ★`} />
                                <CustomerMetric title="Total Jobs" value={selectedCustomer.totalJobs} />
                                <CustomerLifetimeValue customer={selectedCustomer} />
                                <CustomerMetric title="Account Status" value={selectedCustomer.status} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CustomerSection title="Contact & Identity">
                                    <CustomerLine icon={Phone} label="Phone" value={selectedCustomer.phone} />
                                    <CustomerLine icon={Mail} label="Email" value={selectedCustomer.email} />
                                    <CustomerLine icon={MapPin} label="Location" value={selectedCustomer.location} />
                                    <CustomerLine icon={CalendarDays} label="Joined" value={selectedCustomer.joined} />
                                </CustomerSection>

                                <CustomerSection title="Verification & Account">
                                    <CustomerLine icon={ShieldCheck} label="Verification" value={selectedCustomer.verification} success />
                                    <CustomerLine icon={UserCheck} label="Customer Type" value={selectedCustomer.customerType} />
                                    <CustomerLine icon={Clock} label="Last Activity" value={selectedCustomer.lastActivity} />
                                    <CustomerLine icon={AlertTriangle} label="Fraud Flag" value={selectedCustomer.fraudFlag ? "Flagged" : "Clear"} />
                                </CustomerSection>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CustomerSection title="Service History">
                                    <CustomerLine icon={Briefcase} label="Total Jobs" value={selectedCustomer.totalJobs} />
                                    <CustomerLine icon={Star} label="Average Rating" value={selectedCustomer.rating} />
                                    <CustomerLine icon={MapPin} label="Primary Location" value={selectedCustomer.location} />
                                </CustomerSection>

                                <FinancialIntelligence customer={selectedCustomer} />
                            </div>

                            <CustomerSection title="Safety & Risk Monitoring">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500">Fraud Monitoring</p>
                                        <h4 className={`font-bold mt-1 ${selectedCustomer.fraudFlag ? "text-red-600" : "text-green-600"}`}>
                                            {selectedCustomer.fraudFlag ? "Account Flagged" : "No Active Alert"}
                                        </h4>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500">Support Cases</p>
                                        <h4 className="font-bold mt-1">0 Open Cases</h4>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-500">Payment Risk</p>
                                        <h4 className="font-bold mt-1 text-green-600">Low Risk</h4>
                                    </div>
                                </div>
                            </CustomerSection>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CustomerSection title="Trust & Risk Intelligence">
                                    <div className="border-b pb-4 mb-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck
                                                    size={18}
                                                    className={trustScoreColor(selectedCustomer.trustScore)}
                                                />

                                                <span className="text-slate-500">
                                                    Trust Score
                                                </span>
                                            </div>

                                            <span
                                                className={`font-bold ${trustScoreColor(
                                                    selectedCustomer.trustScore
                                                )}`}
                                            >
                                                {selectedCustomer.trustScore}%
                                            </span>
                                        </div>

                                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-4">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${trustScoreBackground(
                                                    selectedCustomer.trustScore
                                                )}`}
                                                style={{
                                                    width: `${Math.min(
                                                        Math.max(selectedCustomer.trustScore, 0),
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-500">
                                                Risk assessment
                                            </span>

                                            <span
                                                className={`text-sm font-bold ${riskLevelColor(
                                                    selectedCustomer.riskLevel
                                                )}`}
                                            >
                                                {selectedCustomer.riskLevel}
                                            </span>
                                        </div>
                                    </div>
                                    <CustomerLine
                                        icon={AlertTriangle}
                                        label="Risk Level"
                                        value={selectedCustomer.riskLevel}
                                    />
                                    <CustomerLine
                                        icon={RefreshCcw}
                                        label="Average Completion Time"
                                        value={selectedCustomer.averageCompletionTime}
                                    />
                                    <CustomerLine
                                        icon={Users}
                                        label="Repeat Workers"
                                        value={selectedCustomer.repeatWorkers}
                                    />
                                </CustomerSection>

                                <CustomerSection title="Booking Statistics">
                                    <CustomerLine
                                        icon={Briefcase}
                                        label="Jobs Requested"
                                        value={selectedCustomer.totalJobs + selectedCustomer.cancelledJobs}
                                    />
                                    <CustomerLine
                                        icon={ShieldCheck}
                                        label="Jobs Completed"
                                        value={selectedCustomer.totalJobs}
                                        success
                                    />
                                    <CustomerLine
                                        icon={Ban}
                                        label="Cancelled"
                                        value={selectedCustomer.cancelledJobs}
                                    />
                                    <CustomerLine
                                        icon={Star}
                                        label="Favourite Category"
                                        value={selectedCustomer.favouriteCategory}
                                    />
                                </CustomerSection>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CustomerSection title="Wallet & Escrow Summary">
                                    <CustomerLine
                                        icon={Wallet}
                                        label="Wallet Balance"
                                        value={`NGN ${selectedCustomer.walletBalance.toLocaleString()}`}
                                    />
                                    <CustomerLine
                                        icon={CreditCard}
                                        label="Escrow Payments"
                                        value={`NGN ${Number(
                                            selectedCustomer.escrowBalance ??
                                            selectedCustomer.escrowPayments ??
                                            0
                                        ).toLocaleString()}`}
                                    />
                                    <CustomerLine
                                        icon={ShieldCheck}
                                        label="Completed Payments"
                                        value={`NGN ${selectedCustomer.completedPayments.toLocaleString()}`}
                                        success
                                    />
                                    <CustomerLine
                                        icon={RefreshCcw}
                                        label="Pending Refunds"
                                        value={`NGN ${selectedCustomer.pendingRefunds.toLocaleString()}`}
                                    />
                                </CustomerSection>

                                <CustomerSection title="Customer Journey">
                                    <div className="relative">
                                        <div className="absolute left-[5px] top-4 bottom-4 w-px bg-slate-200" />

                                        <div className="relative">
                                            <VerificationStep
                                                label="Account Created"
                                                date={selectedCustomer.joined}
                                                complete
                                            />

                                            <VerificationStep
                                                label="Phone and Email Verified"
                                                date={selectedCustomer.joined}
                                                complete
                                            />

                                            <VerificationStep
                                                label="Identity Verification"
                                                date={
                                                    selectedCustomer.verification === "Verified"
                                                        ? "Verification completed"
                                                        : "Verification pending"
                                                }
                                                complete={selectedCustomer.verification === "Verified"}
                                            />

                                            <VerificationStep
                                                label="First Service Booking"
                                                date={
                                                    selectedCustomer.totalJobs > 0
                                                        ? "First booking completed"
                                                        : "No booking recorded"
                                                }
                                                complete={selectedCustomer.totalJobs > 0}
                                            />

                                            <VerificationStep
                                                label="First Payment"
                                                date={
                                                    selectedCustomer.totalSpent > 0
                                                        ? `NGN ${selectedCustomer.totalSpent.toLocaleString()} lifetime spending`
                                                        : "No payment recorded"
                                                }
                                                complete={selectedCustomer.totalSpent > 0}
                                            />

                                            <VerificationStep
                                                label="VIP Status Achieved"
                                                date={
                                                    selectedCustomer.customerType === "VIP"
                                                        ? "VIP customer"
                                                        : "Standard customer level"
                                                }
                                                complete={selectedCustomer.customerType === "VIP"}
                                            />

                                            <VerificationStep
                                                label="Risk Screening"
                                                date={
                                                    selectedCustomer.fraudFlag
                                                        ? "Manual compliance review required"
                                                        : "Risk screening passed"
                                                }
                                                complete={!selectedCustomer.fraudFlag}
                                            />
                                        </div>
                                    </div>
                                </CustomerSection>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CustomerSection title="Emergency Contact">
                                    <CustomerLine
                                        icon={UserCheck}
                                        label="Name"
                                        value={selectedCustomer.emergencyContact.name}
                                    />
                                    <CustomerLine
                                        icon={Users}
                                        label="Relationship"
                                        value={selectedCustomer.emergencyContact.relationship}
                                    />
                                    <CustomerLine
                                        icon={Phone}
                                        label="Phone"
                                        value={selectedCustomer.emergencyContact.phone}
                                    />
                                </CustomerSection>

                                <CustomerSection title="Device & Login History">
                                    <CustomerLine
                                        icon={Clock}
                                        label="Last Login"
                                        value={selectedCustomer.deviceHistory.lastLogin}
                                    />
                                    <CustomerLine
                                        icon={CreditCard}
                                        label="Device"
                                        value={selectedCustomer.deviceHistory.device}
                                    />
                                    <CustomerLine
                                        icon={RefreshCcw}
                                        label="Browser"
                                        value={selectedCustomer.deviceHistory.browser}
                                    />
                                    <CustomerLine
                                        icon={MapPin}
                                        label="Login Location"
                                        value={selectedCustomer.deviceHistory.location}
                                    />
                                </CustomerSection>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CustomerSection title="Complaints & Support">
                                    <CustomerLine
                                        icon={AlertTriangle}
                                        label="Open"
                                        value={selectedCustomer.complaints.open}
                                    />
                                    <CustomerLine
                                        icon={ShieldCheck}
                                        label="Resolved"
                                        value={selectedCustomer.complaints.resolved}
                                        success
                                    />
                                    <CustomerLine
                                        icon={Ban}
                                        label="Escalated"
                                        value={selectedCustomer.complaints.escalated}
                                    />
                                </CustomerSection>

                                <CustomerSection title="Internal Admin Notes">
                                    <div className="space-y-3">
                                        {selectedCustomer.notes.map((note) => (
                                            <div
                                                key={note}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                                            >
                                                {note}
                                            </div>
                                        ))}
                                    </div>
                                </CustomerSection>
                            </div>

                            <CustomerSection title="AI Recommendation">
                                <CustomerHealthRecommendation
                                    customer={selectedCustomer}
                                />
                            </CustomerSection>

                            <CustomerSection title="Customer Job History">
                                {Array.isArray(selectedCustomer.jobs) &&
                                    selectedCustomer.jobs.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[850px] text-sm">
                                            <thead>
                                                <tr className="border-b text-left text-slate-500">
                                                    <th className="px-3 py-3">Date</th>
                                                    <th className="px-3 py-3">Service</th>
                                                    <th className="px-3 py-3">Description</th>
                                                    <th className="px-3 py-3">Location</th>
                                                    <th className="px-3 py-3">Status</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {selectedCustomer.jobs.map((job) => {
                                                    const location = [
                                                        job.area,
                                                        job.city,
                                                        job.state,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ");

                                                    return (
                                                        <tr
                                                            key={job.job_id}
                                                            className="border-b last:border-b-0 hover:bg-slate-50"
                                                        >
                                                            <td className="px-3 py-4 text-slate-600 whitespace-nowrap">
                                                                {job.created_at
                                                                    ? new Date(
                                                                        job.created_at
                                                                    ).toLocaleString()
                                                                    : "Not available"}
                                                            </td>

                                                            <td className="px-3 py-4">
                                                                <p className="font-semibold text-slate-900">
                                                                    {job.title || "Untitled Service"}
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {job.job_id}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-4 text-slate-600">
                                                                {job.description ||
                                                                    "No description provided"}
                                                            </td>

                                                            <td className="px-3 py-4 text-slate-600">
                                                                {location || "Not provided"}
                                                            </td>

                                                            <td className="px-3 py-4">
                                                                <span
                                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${jobStatusBadge(
                                                                        job.status
                                                                    )}`}
                                                                >
                                                                    {formatCustomerLabel(
                                                                        job.status || "unknown"
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                                        <Briefcase
                                            size={28}
                                            className="mx-auto text-slate-400"
                                        />

                                        <p className="mt-3 font-semibold text-slate-700">
                                            No jobs recorded
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            This customer has not created any service request.
                                        </p>
                                    </div>
                                )}

                                <CustomerSection title="Payment History">
                                    {Array.isArray(selectedCustomer.payments) &&
                                        selectedCustomer.payments.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[1000px] text-sm">
                                                <thead>
                                                    <tr className="border-b text-left text-slate-500">
                                                        <th className="px-3 py-3">Payment Reference</th>
                                                        <th className="px-3 py-3">Job ID</th>
                                                        <th className="px-3 py-3">Amount</th>
                                                        <th className="px-3 py-3">Platform Fee</th>
                                                        <th className="px-3 py-3">Worker Amount</th>
                                                        <th className="px-3 py-3">Status</th>
                                                        <th className="px-3 py-3">Payment Date</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {selectedCustomer.payments.map((payment) => {
                                                        const status = String(
                                                            payment.status || "pending"
                                                        ).toLowerCase();

                                                        return (
                                                            <tr
                                                                key={payment.payment_id || payment.id}
                                                                className="border-b last:border-b-0 hover:bg-slate-50"
                                                            >
                                                                <td className="px-3 py-4">
                                                                    <p className="font-semibold text-slate-900">
                                                                        {payment.payment_reference ||
                                                                            "Not available"}
                                                                    </p>
                                                                </td>

                                                                <td className="px-3 py-4 text-slate-600">
                                                                    {payment.job_id || "Not available"}
                                                                </td>

                                                                <td className="px-3 py-4 font-semibold text-slate-900">
                                                                    NGN{" "}
                                                                    {Number(
                                                                        payment.amount || 0
                                                                    ).toLocaleString()}
                                                                </td>

                                                                <td className="px-3 py-4">
                                                                    NGN{" "}
                                                                    {Number(
                                                                        payment.platform_fee || 0
                                                                    ).toLocaleString()}
                                                                </td>

                                                                <td className="px-3 py-4">
                                                                    NGN{" "}
                                                                    {Number(
                                                                        payment.worker_amount || 0
                                                                    ).toLocaleString()}
                                                                </td>

                                                                <td className="px-3 py-4">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentStatusBadge(
                                                                            status
                                                                        )}`}
                                                                    >
                                                                        {formatCustomerLabel(status)}
                                                                    </span>
                                                                </td>

                                                                <td className="px-3 py-4 text-slate-600">
                                                                    {payment.paid_at
                                                                        ? new Date(
                                                                            payment.paid_at
                                                                        ).toLocaleString()
                                                                        : payment.released_at
                                                                            ? new Date(
                                                                                payment.released_at
                                                                            ).toLocaleString()
                                                                            : payment.created_at
                                                                                ? new Date(
                                                                                    payment.created_at
                                                                                ).toLocaleString()
                                                                                : "Not available"}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center">
                                            <CreditCard
                                                size={32}
                                                className="mx-auto text-slate-400"
                                            />

                                            <p className="mt-3 font-semibold text-slate-700">
                                                No payment records found
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Payments made by this customer will appear here.
                                            </p>
                                        </div>
                                    )}
                                </CustomerSection>

                                <CustomerSection title="Worker Interaction History">

                                    {selectedCustomer.workerInteractions?.length ? (

                                        <div className="overflow-x-auto">

                                            <table className="w-full text-sm">

                                                <thead>

                                                    <tr className="border-b">

                                                        <th className="py-3 text-left">Worker</th>

                                                        <th>Profession</th>

                                                        <th>Assignments</th>

                                                        <th>Completed</th>

                                                        <th>Your Rating</th>

                                                        <th>Verification</th>

                                                        <th>Last Job</th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {selectedCustomer.workerInteractions.map((worker) => (

                                                        <tr
                                                            key={worker.worker_id}
                                                            className="border-b"
                                                        >

                                                            <td className="py-4">

                                                                <div className="font-semibold">

                                                                    {worker.full_name}

                                                                </div>

                                                                <div className="text-xs text-slate-500">

                                                                    {worker.phone_number}

                                                                </div>

                                                            </td>

                                                            <td>

                                                                {worker.profession}

                                                            </td>

                                                            <td>

                                                                {worker.total_assignments}

                                                            </td>

                                                            <td>

                                                                {worker.completed_jobs}

                                                            </td>

                                                            <td>

                                                                ⭐ {worker.customer_average_rating}

                                                            </td>

                                                            <td>

                                                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">

                                                                    {worker.verification_level}

                                                                </span>

                                                            </td>

                                                            <td>

                                                                <div>

                                                                    {worker.last_job_title}

                                                                </div>

                                                                <div className="text-xs text-slate-500">

                                                                    {worker.last_job_status}

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    ))}

                                                </tbody>

                                            </table>

                                        </div>

                                    ) : (

                                        <div className="text-slate-500">

                                            No worker interaction history available.

                                        </div>

                                    )}

                                </CustomerSection>

                            </CustomerSection>

                            <CustomerSection title="Recent Activity">
                                <div className="space-y-4">
                                    <CustomerActivity
                                        date="Today"
                                        title="Customer account accessed"
                                        description={`Account activity recorded from ${selectedCustomer.location}.`}
                                        status="Account"
                                    />
                                    <CustomerActivity
                                        date="2 days ago"
                                        title="Service request completed"
                                        description="A HelpNova service request was completed successfully."
                                        status="Completed"
                                    />
                                    <CustomerActivity
                                        date={selectedCustomer.joined}
                                        title="Customer registered"
                                        description="Customer account was created on HelpNova."
                                        status="Registration"
                                    />
                                </div>
                            </CustomerSection>

                            <CustomerSection title="Customer Actions Center">
                                {actionMessage && (
                                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                                        <p className="text-sm font-semibold text-green-800">
                                            {actionMessage}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                            Service Operations
                                        </h4>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            <CustomerActionButton
                                                label="View Jobs"
                                                styleClass="bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "view-jobs",
                                                        title: "View Customer Jobs",
                                                        description: `Open all service requests and completed jobs belonging to ${selectedCustomer.name}.`,
                                                        confirmLabel: "Open Jobs",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label="View Payments"
                                                styleClass="bg-slate-900 hover:bg-slate-800 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "view-payments",
                                                        title: "View Payment History",
                                                        description: `Open wallet, escrow, payment and refund records for ${selectedCustomer.name}.`,
                                                        confirmLabel: "Open Payments",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label="Support Tickets"
                                                styleClass="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "support",
                                                        title: "Open Support Records",
                                                        description: `View complaints, support requests and escalated cases for ${selectedCustomer.name}.`,
                                                        confirmLabel: "Open Support",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label="Customer Documents"
                                                styleClass="bg-cyan-700 hover:bg-cyan-800 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "documents",
                                                        title: "View Customer Documents",
                                                        description: `Open identity, verification and compliance documents belonging to ${selectedCustomer.name}.`,
                                                        confirmLabel: "Open Documents",
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                            Communication
                                        </h4>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            <CustomerActionButton
                                                label="Call Customer"
                                                styleClass="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "call",
                                                        title: "Call Customer",
                                                        description: `Start a call to ${selectedCustomer.name} on ${selectedCustomer.phone}.`,
                                                        confirmLabel: "Start Call",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label="Send SMS"
                                                styleClass="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "sms",
                                                        title: "Send SMS",
                                                        description: `Prepare an SMS notification for ${selectedCustomer.name}.`,
                                                        confirmLabel: "Prepare SMS",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label="Send Email"
                                                styleClass="bg-sky-600 hover:bg-sky-700 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "email",
                                                        title: "Send Email",
                                                        description: `Prepare an email for ${selectedCustomer.email}.`,
                                                        confirmLabel: "Prepare Email",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label="Send Notification"
                                                styleClass="bg-violet-600 hover:bg-violet-700 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "notification",
                                                        title: "Send Push Notification",
                                                        description: `Prepare an in-app notification for ${selectedCustomer.name}.`,
                                                        confirmLabel: "Prepare Notification",
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                            Account and Compliance
                                        </h4>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            <CustomerActionButton
                                                label="Verify Customer"
                                                styleClass="bg-green-700 hover:bg-green-800 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "verify",
                                                        title: "Verify Customer",
                                                        description: `Confirm the identity verification of ${selectedCustomer.name}.`,
                                                        confirmLabel: "Confirm Verification",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label={
                                                    selectedCustomer.fraudFlag
                                                        ? "Remove Fraud Flag"
                                                        : "Flag Fraud"
                                                }
                                                styleClass="bg-orange-600 hover:bg-orange-700 text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: selectedCustomer.fraudFlag
                                                            ? "remove-fraud"
                                                            : "flag-fraud",
                                                        title: selectedCustomer.fraudFlag
                                                            ? "Remove Fraud Flag"
                                                            : "Flag Customer for Fraud Review",
                                                        description: selectedCustomer.fraudFlag
                                                            ? `Remove the active fraud flag from ${selectedCustomer.name}.`
                                                            : `Place ${selectedCustomer.name} under fraud and compliance review.`,
                                                        confirmLabel: selectedCustomer.fraudFlag
                                                            ? "Remove Flag"
                                                            : "Flag Customer",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label={
                                                    selectedCustomer.status === "Suspended"
                                                        ? "Reactivate Customer"
                                                        : "Suspend Customer"
                                                }
                                                styleClass={
                                                    selectedCustomer.status === "Suspended"
                                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                                        : "bg-red-600 hover:bg-red-700 text-white"
                                                }
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type:
                                                            selectedCustomer.status === "Suspended"
                                                                ? "reactivate"
                                                                : "suspend",
                                                        title:
                                                            selectedCustomer.status === "Suspended"
                                                                ? "Reactivate Customer"
                                                                : "Suspend Customer",
                                                        description:
                                                            selectedCustomer.status === "Suspended"
                                                                ? `Restore access for ${selectedCustomer.name}.`
                                                                : `Temporarily disable bookings and account access for ${selectedCustomer.name}.`,
                                                        confirmLabel:
                                                            selectedCustomer.status === "Suspended"
                                                                ? "Reactivate"
                                                                : "Suspend",
                                                    })
                                                }
                                            />

                                            <CustomerActionButton
                                                label="Blacklist Customer"
                                                styleClass="bg-red-950 hover:bg-black text-white"
                                                onClick={() =>
                                                    setCustomerAction({
                                                        type: "blacklist",
                                                        title: "Blacklist Customer",
                                                        description: `Open all service requests and completed jobs belonging to ${selectedCustomer.name}.`,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CustomerSection>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function CustomerActionButton({
    label,
    onClick,
    styleClass,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-h-12 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition ${styleClass}`}
        >
            {label}
        </button>
    );
}

function SummaryCard({ title, value, color = "text-slate-900", icon: Icon }) {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
                </div>

                {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Icon size={20} className="text-slate-700" />
                    </div>
                )}
            </div>
        </div>
    );
}

function CustomerMetric({ title, value }) {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
    );
}

function CustomerLifetimeValue({ customer }) {
    const lifetimeValue = customer.totalSpent || 0;

    const valueProfile = getCustomerValueProfile(
        lifetimeValue,
        customer.customerType
    );

    return (
        <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-slate-500">
                Customer Lifetime Value
            </p>

            <h3 className="text-2xl font-bold mt-2 text-slate-900">
                NGN {lifetimeValue.toLocaleString()}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${valueProfile.badgeClass}`}
                >
                    {valueProfile.segment}
                </span>

                <span className="text-xs font-semibold text-slate-500">
                    {valueProfile.percentile}
                </span>
            </div>
        </div>
    );
}

function CustomerHealthRecommendation({ customer }) {
    const recommendation = getCustomerHealthRecommendation(customer);

    return (
        <div
            className={`rounded-xl border p-5 ${recommendation.container}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-lg">
                        {recommendation.title}
                    </h4>

                    <p className="text-sm mt-2">
                        {recommendation.description}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs uppercase tracking-wide">
                        Customer Health
                    </p>

                    <h3 className="text-2xl font-bold">
                        {recommendation.score}
                    </h3>
                </div>
            </div>
        </div>
    );
}
function CustomerSection({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            {children}
        </div>
    );
}

function FinancialIntelligence({ customer }) {
    const averageJobValue =
        customer.totalJobs > 0
            ? Math.round(customer.totalSpent / customer.totalJobs)
            : 0;

    const paymentReliability = getPaymentReliability(customer);
    const spendingTrend = getSpendingTrend(customer);

    return (
        <CustomerSection title="Financial Intelligence">
            <CustomerLine
                icon={Wallet}
                label="Lifetime Spending"
                value={`NGN ${customer.totalSpent.toLocaleString()}`}
            />

            <CustomerLine
                icon={Wallet}
                label="Wallet Balance"
                value={`NGN ${customer.walletBalance.toLocaleString()}`}
            />

            <CustomerLine
                icon={CreditCard}
                label="Escrow Balance"
                value={`NGN ${customer.escrowPayments.toLocaleString()}`}
            />

            <CustomerLine
                icon={RefreshCcw}
                label="Refund Exposure"
                value={`NGN ${customer.pendingRefunds.toLocaleString()}`}
            />

            <CustomerLine
                icon={Briefcase}
                label="Average Job Value"
                value={`NGN ${averageJobValue.toLocaleString()}`}
            />

            <div className="flex items-center justify-between border-b py-3 gap-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck
                        size={18}
                        className={paymentReliability.iconColor}
                    />

                    <span className="text-slate-500">
                        Payment Reliability
                    </span>
                </div>

                <span
                    className={`font-bold text-right ${paymentReliability.textColor}`}
                >
                    {paymentReliability.label}
                </span>
            </div>

            <div className="flex items-center justify-between py-3 gap-4">
                <div className="flex items-center gap-3">
                    <RefreshCcw
                        size={18}
                        className={spendingTrend.iconColor}
                    />

                    <span className="text-slate-500">
                        Spending Trend
                    </span>
                </div>

                <span
                    className={`font-bold text-right ${spendingTrend.textColor}`}
                >
                    {spendingTrend.symbol} {spendingTrend.label}
                </span>
            </div>
        </CustomerSection>
    );
}
function CustomerLine({ icon: Icon, label, value, success = false }) {
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

function CustomerActivity({ date, title, description, status }) {
    return (
        <div className="flex gap-4 border-b last:border-b-0 pb-4">
            <div className="w-3 h-3 rounded-full bg-blue-600 mt-2 shrink-0" />

            <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                        <p className="text-xs text-slate-500">{date}</p>
                        <h4 className="font-bold">{title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{description}</p>
                    </div>

                    <div>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


function VerificationStep({ label, date, complete }) {
    return (
        <div className="flex items-start gap-3 border-b last:border-b-0 py-3">
            <div
                className={`mt-1 w-3 h-3 rounded-full shrink-0 ${complete ? "bg-green-600" : "bg-yellow-500"
                    }`}
            />
            <div>
                <p className="font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-1">{date}</p>
            </div>
        </div>
    );
}

function getCustomerHealthRecommendation(customer) {
    if (customer.fraudFlag) {
        return {
            score: "28%",
            title: "High Risk Customer",
            description:
                "Account should remain under manual compliance review before new bookings are permitted.",
            container:
                "bg-red-50 border-red-200 text-red-800",
        };
    }

    if (customer.customerType === "VIP") {
        return {
            score: "98%",
            title: "Excellent Customer",
            description:
                "Prioritize premium workers, loyalty rewards and same-day dispatch.",
            container:
                "bg-purple-50 border-purple-200 text-purple-800",
        };
    }

    if (customer.verification === "Pending") {
        return {
            score: "72%",
            title: "Verification Pending",
            description:
                "Encourage identity verification to unlock higher trust services.",
            container:
                "bg-yellow-50 border-yellow-200 text-yellow-800",
        };
    }

    return {
        score: "91%",
        title: "Healthy Customer",
        description:
            "Eligible for standard automated matching, escrow protection and priority support.",
        container:
            "bg-green-50 border-green-200 text-green-800",
    };
}

function getCustomerValueProfile(totalSpent = 0, customerType = "Regular") {
    if (customerType === "VIP" || totalSpent >= 400000) {
        return {
            segment: "Premium Customer",
            percentile: "Top 8% of customers",
            badgeClass: "bg-purple-100 text-purple-700",
        };
    }

    if (totalSpent >= 250000) {
        return {
            segment: "High-Value Customer",
            percentile: "Top 20% of customers",
            badgeClass: "bg-blue-100 text-blue-700",
        };
    }

    if (totalSpent >= 100000) {
        return {
            segment: "Established Customer",
            percentile: "Top 45% of customers",
            badgeClass: "bg-green-100 text-green-700",
        };
    }

    return {
        segment: "Developing Customer",
        percentile: "Standard customer tier",
        badgeClass: "bg-slate-100 text-slate-700",
    };
}

function getCustomerInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function trustScoreColor(score) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
}

function trustScoreBackground(score) {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-600";
}

function riskLevelColor(riskLevel) {
    if (riskLevel === "Low Risk") return "text-green-600";
    if (riskLevel === "Moderate Risk") return "text-yellow-600";
    if (riskLevel === "High Risk") return "text-red-600";
    return "text-slate-600";
}

function getPaymentReliability(customer) {
    if (
        customer.fraudFlag ||
        customer.riskLevel === "High Risk"
    ) {
        return {
            label: "High Risk",
            textColor: "text-red-600",
            iconColor: "text-red-600",
        };
    }

    if (
        customer.verification === "Pending" ||
        customer.pendingRefunds > 0
    ) {
        return {
            label: "Average",
            textColor: "text-yellow-600",
            iconColor: "text-yellow-600",
        };
    }

    if (
        customer.trustScore >= 90 &&
        customer.pendingRefunds === 0
    ) {
        return {
            label: "Excellent",
            textColor: "text-green-600",
            iconColor: "text-green-600",
        };
    }

    return {
        label: "Good",
        textColor: "text-blue-600",
        iconColor: "text-blue-600",
    };
}

function getSpendingTrend(customer) {
    if (
        customer.fraudFlag ||
        customer.status === "Suspended"
    ) {
        return {
            label: "Declining",
            symbol: "▼",
            textColor: "text-red-600",
            iconColor: "text-red-600",
        };
    }

    if (
        customer.customerType === "VIP" ||
        customer.totalSpent >= 250000
    ) {
        return {
            label: "Increasing",
            symbol: "▲",
            textColor: "text-green-600",
            iconColor: "text-green-600",
        };
    }

    return {
        label: "Stable",
        symbol: "►",
        textColor: "text-blue-600",
        iconColor: "text-blue-600",
    };
}
function verificationBadge(status) {
    if (status === "Verified") return "bg-green-100 text-green-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-600";
}

function statusBadge(status) {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Suspended") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
}

function typeBadge(type) {
    if (type === "VIP") return "bg-purple-100 text-purple-700";
    if (type === "Fraud Watch") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
}

function jobStatusBadge(status) {
    const normalizedStatus = String(status || "")
        .trim()
        .toLowerCase();

    switch (normalizedStatus) {
        case "completed":
            return "bg-green-100 text-green-700";

        case "in_progress":
        case "in progress":
            return "bg-blue-100 text-blue-700";

        case "assigned":
        case "accepted":
            return "bg-purple-100 text-purple-700";

        case "pending":
        case "open":
            return "bg-orange-100 text-orange-700";

        case "cancelled":
        case "canceled":
        case "rejected":
            return "bg-red-100 text-red-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}


function paymentStatusBadge(status) {
    switch (String(status || "").toLowerCase()) {
        case "paid":
            return "bg-blue-100 text-blue-700";

        case "released":
            return "bg-green-100 text-green-700";

        case "refunded":
            return "bg-purple-100 text-purple-700";

        case "failed":
            return "bg-red-100 text-red-700";

        case "pending":
        default:
            return "bg-orange-100 text-orange-700";
    }
}