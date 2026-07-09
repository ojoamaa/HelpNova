import { useState } from "react";
import {
    Search, Eye, ShieldCheck, Ban, Star, X, Phone, Mail, MapPin,
    Wallet, Briefcase, FileCheck, UserCheck, Camera, Clock,
    ClipboardCheck, TrendingUp, AlertTriangle, Repeat
} from "lucide-react";

const workers = [
    {
        id: "HN-WRK-000127", name: "Abu Bukar", profession: "Plumber",
        location: "Gwarinpa, Abuja", verification: "Gold", availability: "Online",
        status: "Approved", rating: 5, completedJobs: 27,
        phone: "08012345678", email: "worker@example.com",
        address: "Gwarinpa, Abuja, FCT", trustScore: 98, profileCompletion: 92,
        acceptanceRate: "94%", onTimeArrival: "91%", responseTime: "8 mins",
        yearsExperience: 6, walletBalance: 24000, totalEarnings: 248000,
        pendingWithdrawal: 0, guarantorStatus: "Submitted",
        emergencyContactStatus: "Submitted", documentsStatus: "Complete",
        ninStatus: "Verified", bankStatus: "Verified",
        backgroundCheck: "Passed", lastActive: "2 minutes ago",
        skills: ["Plumbing", "Borehole Repairs", "Water Pump Installation", "Pipe Installation", "Leak Detection"],
        jobsAccepted: 124, jobsDeclined: 7, repeatCustomers: 38,
        completionRate: "98%", customerComplaints: 1,
    },
    {
        id: "HN-WRK-000128", name: "Faith Okoro", profession: "Cleaner",
        location: "Wuse 2, Abuja", verification: "Silver", availability: "Offline",
        status: "Pending", rating: 4.6, completedJobs: 12,
        phone: "08022223333", email: "faith@example.com",
        address: "Wuse 2, Abuja, FCT", trustScore: 72, profileCompletion: 80,
        acceptanceRate: "88%", onTimeArrival: "86%", responseTime: "12 mins",
        yearsExperience: 3, walletBalance: 12000, totalEarnings: 96000,
        pendingWithdrawal: 3000, guarantorStatus: "Submitted",
        emergencyContactStatus: "Submitted", documentsStatus: "Pending Review",
        ninStatus: "Pending", bankStatus: "Verified",
        backgroundCheck: "Pending", lastActive: "1 hour ago",
        skills: ["Cleaning", "Deep Cleaning", "Home Care", "Laundry Support"],
        jobsAccepted: 48, jobsDeclined: 5, repeatCustomers: 14,
        completionRate: "89%", customerComplaints: 2,
    },
    {
        id: "HN-WRK-000129", name: "Musa Ibrahim", profession: "Electrician",
        location: "Kubwa, Abuja", verification: "Platinum", availability: "On Job",
        status: "Approved", rating: 4.9, completedJobs: 41,
        phone: "08044445555", email: "musa@example.com",
        address: "Kubwa, Abuja, FCT", trustScore: 99, profileCompletion: 96,
        acceptanceRate: "97%", onTimeArrival: "94%", responseTime: "6 mins",
        yearsExperience: 8, walletBalance: 38000, totalEarnings: 420000,
        pendingWithdrawal: 0, guarantorStatus: "Submitted",
        emergencyContactStatus: "Submitted", documentsStatus: "Complete",
        ninStatus: "Verified", bankStatus: "Verified",
        backgroundCheck: "Passed", lastActive: "Online now",
        skills: ["Electrical Repairs", "Wiring", "Inverter Support", "Lighting Installation"],
        jobsAccepted: 156, jobsDeclined: 4, repeatCustomers: 52,
        completionRate: "99%", customerComplaints: 0,
    },
];

const initialDocuments = [
    { title: "NIN Verification", status: "Verified", uploadedOn: "12 Jun 2026", verifiedBy: "Admin A001", fileType: "Government ID", fileSize: "2.1 MB" },
    { title: "Selfie Verification", status: "Matched", uploadedOn: "12 Jun 2026", verifiedBy: "System AI", fileType: "Selfie Image", fileSize: "1.4 MB" },
    { title: "Profile Photograph", status: "Uploaded", uploadedOn: "12 Jun 2026", verifiedBy: "Pending", fileType: "Profile Image", fileSize: "1.8 MB" },
    { title: "Address Verification", status: "Approved", uploadedOn: "13 Jun 2026", verifiedBy: "Admin A002", fileType: "Utility Bill", fileSize: "2.6 MB" },
    { title: "Guarantor Form", status: "Submitted", uploadedOn: "14 Jun 2026", verifiedBy: "HR Review", fileType: "PDF Form", fileSize: "3.2 MB" },
    { title: "Professional Certificate", status: "Pending Review", uploadedOn: "15 Jun 2026", verifiedBy: "Pending", fileType: "Certificate PDF", fileSize: "2.9 MB" },
];

export default function WorkerManagement() {
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [showDocuments, setShowDocuments] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState(initialDocuments);
    const [documentAction, setDocumentAction] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [toast, setToast] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");

    const filters = ["All", "Pending", "Approved", "Online", "Offline", "Gold", "Silver", "Platinum", "Suspended"];

    const filteredWorkers = workers.filter((worker) => {
        if (activeFilter === "All") return true;
        return worker.status === activeFilter || worker.availability === activeFilter || worker.verification === activeFilter;
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
                    <SummaryCard title="Total Workers" value="245" />
                    <SummaryCard title="Online" value="74" color="text-green-600" />
                    <SummaryCard title="Pending Approval" value="18" color="text-orange-500" />
                    <SummaryCard title="Suspended" value="3" color="text-red-600" />
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
                        <Search className="text-slate-400" size={20} />
                        <input placeholder="Search by name, ID, profession, phone or location..." className="w-full outline-none" />
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
                                                <button onClick={() => setSelectedWorker(worker)} className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2 rounded-lg bg-green-50 text-green-700"><ShieldCheck size={16} /></button>
                                                <button className="p-2 rounded-lg bg-red-50 text-red-700"><Ban size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                    <div className="flex flex-wrap gap-2">
                                        {selectedWorker.skills.map((skill) => (
                                            <span key={skill} className="px-3 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
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

                            <div className="grid md:grid-cols-4 gap-4 pb-10">
                                <button className="bg-green-600 text-white rounded-xl py-3 font-semibold">Approve</button>
                                <button className="bg-red-600 text-white rounded-xl py-3 font-semibold">Suspend</button>
                                <button className="bg-blue-600 text-white rounded-xl py-3 font-semibold">View Wallet</button>
                                <button onClick={() => setShowDocuments(true)} className="bg-slate-900 text-white rounded-xl py-3 font-semibold">
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