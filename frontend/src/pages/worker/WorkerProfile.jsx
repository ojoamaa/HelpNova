import {
    Camera,
    CheckCircle,
    ShieldCheck,
    Star,
    Briefcase,
    MapPin,
    Phone,
    Mail,
    BadgeCheck,
    Wallet,
    Clock,
    Calendar,
    UserCheck,
    FileCheck,
    Edit,
    Upload,
    ToggleRight,
} from "lucide-react";

export default function WorkerProfile() {
    const worker = {
        workerId: "HN-WRK-000127",
        fullName: "Abu Bukar",
        profession: "Plumber",
        verificationLevel: "Gold",
        verificationStatus: "Verified",
        availabilityStatus: "Available Now",
        rating: 5,
        completedJobs: 27,
        trustScore: 98,
        profileCompletion: 92,
        acceptanceRate: "94%",
        onTimeArrival: "91%",
        responseTime: "8 mins",
        yearsExperience: 6,
        phone: "08012345678",
        email: "worker@example.com",
        city: "Abuja",
        area: "Gwarinpa",
        memberSince: "January 2026",
        lastActive: "2 minutes ago",
        todayEarnings: 18500,
        weekEarnings: 62000,
        monthEarnings: 248000,
        profilePhoto: "",
        guarantorStatus: "Submitted",
        emergencyContactStatus: "Submitted",
        skills: [
            "Plumbing",
            "Water Pump Installation",
            "Borehole Repairs",
            "Pipe Installation",
            "Bathroom Fittings",
            "Leak Detection",
        ],
        documents: [
            { name: "Profile Photo", status: "Verified" },
            { name: "Phone Number", status: "Verified" },
            { name: "Government ID", status: "Verified" },
            { name: "NIN Verification", status: "Verified" },
            { name: "Address Proof", status: "Verified" },
            { name: "Bank Details", status: "Verified" },
            { name: "Background Clearance", status: "Verified" },
            { name: "Guarantor Form", status: "Submitted" },
        ],
    };

    function money(value) {
        return `NGN ${Number(value || 0).toLocaleString()}`;
    }

    function getVerificationBadge(level) {
        if (level === "Platinum") return "bg-purple-100 text-purple-700";
        if (level === "Gold") return "bg-yellow-100 text-yellow-700";
        if (level === "Silver") return "bg-slate-200 text-slate-700";
        return "bg-slate-100 text-slate-600";
    }

    function getAvailabilityBadge(status) {
        if (status === "Available Now") return "bg-green-100 text-green-700";
        if (status === "On Job") return "bg-blue-100 text-blue-700";
        if (status === "Busy") return "bg-yellow-100 text-yellow-700";
        if (status === "Offline") return "bg-slate-100 text-slate-600";
        if (status === "Suspended") return "bg-red-100 text-red-700";
        return "bg-slate-100 text-slate-600";
    }

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow p-5">
                <div className="flex flex-col items-center text-center">
                    <div className="relative">
                        {worker.profilePhoto ? (
                            <img
                                src={worker.profilePhoto}
                                alt={worker.fullName}
                                className="w-28 h-28 rounded-full object-cover border-4 border-blue-100"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center border-4 border-blue-100">
                                <Camera className="text-slate-500" size={34} />
                            </div>
                        )}

                        <span className="absolute bottom-1 right-1 bg-green-600 text-white rounded-full p-1">
                            <CheckCircle size={18} />
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold mt-4">{worker.fullName}</h1>
                    <p className="text-slate-500">{worker.profession}</p>
                    <p className="text-xs text-slate-400 mt-1">{worker.workerId}</p>

                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getVerificationBadge(
                                worker.verificationLevel
                            )}`}
                        >
                            {worker.verificationLevel} Worker
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            {worker.verificationStatus}
                        </span>

                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getAvailabilityBadge(
                                worker.availabilityStatus
                            )}`}
                        >
                            {worker.availabilityStatus}
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                        Gold Verified • Identity, Address, Bank and Background Verified
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={Star} label="Rating" value={`${worker.rating} ★`} />
                <MetricCard
                    icon={Briefcase}
                    label="Completed Jobs"
                    value={worker.completedJobs}
                />
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Profile Strength</h2>

                <div className="space-y-4">
                    <ProgressBar
                        label="Trust Score"
                        value={worker.trustScore}
                        color="bg-green-600"
                        textColor="text-green-700"
                    />

                    <ProgressBar
                        label="Profile Completion"
                        value={worker.profileCompletion}
                        color="bg-blue-600"
                        textColor="text-blue-700"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatCard title="Acceptance Rate" value={worker.acceptanceRate} />
                <StatCard title="On-Time Arrival" value={worker.onTimeArrival} />
                <StatCard title="Response Time" value={worker.responseTime} />
                <StatCard title="Experience" value={`${worker.yearsExperience} yrs`} />
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Earnings Summary</h2>

                <div className="grid grid-cols-1 gap-3">
                    <EarningRow label="Today's Earnings" value={money(worker.todayEarnings)} />
                    <EarningRow label="This Week" value={money(worker.weekEarnings)} />
                    <EarningRow label="This Month" value={money(worker.monthEarnings)} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Identity & Contact</h2>

                <div className="space-y-3 text-sm">
                    <InfoRow icon={Phone} value={worker.phone} />
                    <InfoRow icon={Mail} value={worker.email} />
                    <InfoRow icon={MapPin} value={`${worker.area}, ${worker.city}`} />
                    <InfoRow icon={Calendar} value={`Member Since: ${worker.memberSince}`} />
                    <InfoRow icon={Clock} value={`Last Active: ${worker.lastActive}`} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Professional Skills</h2>

                <div className="flex flex-wrap gap-2">
                    {worker.skills.map((skill) => (
                        <span
                            key={skill}
                            className="px-3 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"
                        >
                            ✓ {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Trust & Verification</h2>

                <div className="space-y-3">
                    <VerificationItem label="Profile Photo Captured" active />
                    <VerificationItem label="Phone Number Verified" active />
                    <VerificationItem label="Address Verification" active />
                    <VerificationItem label="Background Check" active />
                    <VerificationItem label="ID / NIN Verification" active />
                    <VerificationItem label="Bank Account Verified" active />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Worker Documents</h2>

                <div className="space-y-3">
                    {worker.documents.map((doc) => (
                        <div
                            key={doc.name}
                            className="flex items-center justify-between bg-slate-50 rounded-xl p-3"
                        >
                            <div className="flex items-center gap-3">
                                <FileCheck className="text-green-600" size={20} />
                                <span className="text-sm font-medium">{doc.name}</span>
                            </div>

                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                {doc.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Guarantor & Emergency Contact</h2>

                <div className="space-y-3">
                    <VerificationItem
                        label={`Guarantor Information: ${worker.guarantorStatus}`}
                        active={worker.guarantorStatus === "Submitted"}
                    />

                    <VerificationItem
                        label={`Emergency Contact: ${worker.emergencyContactStatus}`}
                        active={worker.emergencyContactStatus === "Submitted"}
                    />
                </div>

                <p className="text-xs text-slate-500 mt-4">
                    Full guarantor and emergency contact details are restricted to
                    authorized HR and admin officers only.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pb-4">
                <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold">
                    <Edit size={18} />
                    Edit Profile
                </button>

                <button className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-semibold">
                    <ToggleRight size={18} />
                    Update Availability
                </button>

                <button className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold">
                    <Upload size={18} />
                    Upload New Photo
                </button>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value }) {
    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <Icon className="text-blue-600" />
            <p className="text-sm text-slate-500 mt-2">{label}</p>
            <h2 className="text-xl font-bold">{value}</h2>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-slate-500">{title}</p>
            <h2 className="text-xl font-bold mt-1">{value}</h2>
        </div>
    );
}

function ProgressBar({ label, value, color, textColor }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{label}</span>
                <span className={`font-bold ${textColor}`}>{value}%</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                    className={`${color} h-3 rounded-full`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, value }) {
    return (
        <div className="flex items-center gap-3">
            <Icon className="text-blue-600" size={18} />
            <span>{value}</span>
        </div>
    );
}

function EarningRow({ label, value }) {
    return (
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-3">
                <Wallet className="text-green-600" size={20} />
                <span className="text-sm font-medium">{label}</span>
            </div>

            <span className="font-bold text-green-700">{value}</span>
        </div>
    );
}

function VerificationItem({ label, active }) {
    return (
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-3">
                <ShieldCheck
                    size={20}
                    className={active ? "text-green-600" : "text-slate-400"}
                />
                <span className="text-sm font-medium">{label}</span>
            </div>

            {active ? (
                <BadgeCheck className="text-green-600" size={20} />
            ) : (
                <span className="text-xs text-slate-400">Pending</span>
            )}
        </div>
    );
}