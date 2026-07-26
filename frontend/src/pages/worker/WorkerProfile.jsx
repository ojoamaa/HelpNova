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
    FileCheck,
    Edit,
    Upload,
    ToggleRight,
    X,
    LoaderCircle,
    Save,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    getWorkerProfile,
    updateWorkerProfile,
    uploadWorkerProfilePhoto,
    updateWorkerAvailability,
} from "../../api/workerApi";

const EMPTY_WORKER = {
    workerId: "",
    fullName: "Worker",
    profession: "Service Professional",
    verificationLevel: "Bronze",
    verificationStatus: "Pending",
    availabilityStatus: "Offline",
    rating: 0,
    completedJobs: 0,
    trustScore: 0,
    profileCompletion: 0,
    acceptanceRate: "0%",
    onTimeArrival: "0%",
    responseTime: "—",
    yearsExperience: 0,
    phone: "",
    email: "",
    city: "",
    area: "",
    memberSince: "—",
    lastActive: "—",
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    profilePhoto: "",
    guarantorStatus: "Pending",
    emergencyContactStatus: "Pending",
    skills: [],
    documents: [],
};

function first(source, keys, fallback = "") {
    for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return fallback;
}

function asNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function titleCase(value, fallback = "Pending") {
    const text = String(value ?? "").trim();
    if (!text) return fallback;
    return text.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeProfile(payload = {}) {
    const source = payload.worker || payload.profile || payload.data || payload;
    const saved = JSON.parse(localStorage.getItem("helpnova_worker_profile_cache") || "{}");
    const combined = { ...saved, ...source };
    const available = first(combined, ["is_available", "available", "availability"]);

    return {
        ...EMPTY_WORKER,
        workerId: first(combined, ["worker_code", "worker_id", "id"], localStorage.getItem("helpnova_worker_id") || ""),
        fullName: first(combined, ["full_name", "name"], EMPTY_WORKER.fullName),
        profession: first(combined, ["profession", "service_category", "category_name"], EMPTY_WORKER.profession),
        verificationLevel: titleCase(first(combined, ["verification_level", "worker_level", "tier"], "Bronze"), "Bronze"),
        verificationStatus: titleCase(first(combined, ["verification_status", "status"], "Pending")),
        availabilityStatus:
            typeof available === "boolean"
                ? available ? "Available Now" : "Offline"
                : titleCase(first(combined, ["availability_status"], "Offline"), "Offline"),
        rating: asNumber(first(combined, ["rating", "average_rating"])),
        completedJobs: asNumber(first(combined, ["completed_jobs", "jobs_completed"])),
        trustScore: asNumber(first(combined, ["trust_score", "trustScore"])),
        profileCompletion: asNumber(first(combined, ["profile_completion", "activation_percentage", "profileCompletion"])),
        acceptanceRate: first(combined, ["acceptance_rate"], "0%"),
        onTimeArrival: first(combined, ["on_time_arrival", "on_time_rate"], "0%"),
        responseTime: first(combined, ["response_time"], "—"),
        yearsExperience: asNumber(first(combined, ["years_experience", "experience_years"])),
        phone: first(combined, ["phone", "phone_number"]),
        email: first(combined, ["email"]),
        city: first(combined, ["city", "state"]),
        area: first(combined, ["area", "address", "location"]),
        memberSince: first(combined, ["member_since", "created_at"], "—"),
        lastActive: first(combined, ["last_active"], "—"),
        todayEarnings: asNumber(first(combined, ["today_earnings"])),
        weekEarnings: asNumber(first(combined, ["week_earnings", "weekly_earnings"])),
        monthEarnings: asNumber(first(combined, ["month_earnings", "monthly_earnings"])),
        profilePhoto: first(combined, ["profile_photo_url", "profile_photo", "photo_url", "photo", "avatar_url"], saved.profilePhoto || ""),
        guarantorStatus: titleCase(first(combined, ["guarantor_status", "guarantor_verification_status"], "Pending")),
        emergencyContactStatus: titleCase(first(combined, ["emergency_contact_status"], "Pending")),
        skills: Array.isArray(combined.skills) ? combined.skills.map((skill) => typeof skill === "string" ? skill : skill.name || skill.skill_name).filter(Boolean) : [],
        documents: Array.isArray(combined.documents) ? combined.documents : [],
    };
}

function toApiProfile(worker) {
    return {
        full_name: worker.fullName,
        profession: worker.profession,
        phone_number: worker.phone,
        email: worker.email,
        city: worker.city,
        area: worker.area,
        years_experience: asNumber(worker.yearsExperience),
    };
}

export default function WorkerProfile() {
    const [worker, setWorker] = useState(EMPTY_WORKER);
    const [draft, setDraft] = useState(EMPTY_WORKER);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [notice, setNotice] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const profile = normalizeProfile(await getWorkerProfile());
                if (active) setWorker(profile);
            } catch (error) {
                const cached = normalizeProfile({});
                if (active) {
                    setWorker(cached);
                    setNotice({ type: "warning", text: error?.response?.status === 404 ? "The profile API route is not available yet. Local editing remains enabled." : "Profile loaded from this device because the server could not be reached." });
                }
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const verificationText = useMemo(() => `${worker.verificationLevel} Worker`, [worker.verificationLevel]);

    function persistLocal(nextWorker) {
        localStorage.setItem("helpnova_worker_profile_cache", JSON.stringify({
            full_name: nextWorker.fullName,
            profession: nextWorker.profession,
            phone_number: nextWorker.phone,
            email: nextWorker.email,
            city: nextWorker.city,
            area: nextWorker.area,
            years_experience: nextWorker.yearsExperience,
            profilePhoto: nextWorker.profilePhoto,
        }));
    }

    function openEditor() {
        setDraft(worker);
        setEditing(true);
        setNotice(null);
    }

    async function saveProfile(event) {
        event.preventDefault();
        setSaving(true);
        setNotice(null);
        try {
            const response = await updateWorkerProfile(toApiProfile(draft));
            const next = { ...draft, ...normalizeProfile(response), profilePhoto: draft.profilePhoto || normalizeProfile(response).profilePhoto };
            setWorker(next);
            persistLocal(next);
            setEditing(false);
            setNotice({ type: "success", text: "Profile updated successfully." });
        } catch (error) {
            if ([404, 405, 501].includes(error?.response?.status) || !error?.response) {
                setWorker(draft);
                persistLocal(draft);
                setEditing(false);
                setNotice({ type: "warning", text: "Profile saved on this device. Add the backend PATCH /workers/profile route for permanent server storage." });
            } else {
                setNotice({ type: "error", text: error?.response?.data?.detail || "Profile update failed." });
            }
        } finally {
            setSaving(false);
        }
    }

    async function handlePhoto(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setNotice({ type: "error", text: "Please select a JPG, PNG, WEBP or another image file." });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setNotice({ type: "error", text: "The photo must not exceed 5 MB." });
            return;
        }

        const localPreview = URL.createObjectURL(file);
        const previousPhoto = worker.profilePhoto;
        setWorker((current) => ({ ...current, profilePhoto: localPreview }));
        setUploading(true);
        setNotice(null);

        try {
            const response = await uploadWorkerProfilePhoto(file);
            const normalized = normalizeProfile(response);
            const photoUrl = normalized.profilePhoto || localPreview;
            const next = { ...worker, profilePhoto: photoUrl };
            setWorker(next);
            persistLocal(next);
            setNotice({ type: "success", text: "Profile photo uploaded successfully." });
        } catch (error) {
            if ([404, 405, 501].includes(error?.response?.status) || !error?.response) {
                const reader = new FileReader();
                reader.onload = () => {
                    const next = { ...worker, profilePhoto: String(reader.result || "") };
                    setWorker(next);
                    persistLocal(next);
                };
                reader.readAsDataURL(file);
                setNotice({ type: "warning", text: "Photo saved on this device. Add the backend POST /workers/profile/photo route for permanent server upload." });
            } else {
                setWorker((current) => ({ ...current, profilePhoto: previousPhoto }));
                setNotice({ type: "error", text: error?.response?.data?.detail || "Photo upload failed." });
            }
        } finally {
            setUploading(false);
        }
    }

    async function toggleAvailability() {
        const nextAvailable = worker.availabilityStatus !== "Available Now";
        try {
            await updateWorkerAvailability(nextAvailable);
            setWorker((current) => ({ ...current, availabilityStatus: nextAvailable ? "Available Now" : "Offline" }));
            setNotice({ type: "success", text: `You are now ${nextAvailable ? "available" : "offline"}.` });
        } catch (error) {
            setNotice({ type: "error", text: error?.response?.data?.detail || "Availability update failed." });
        }
    }

    function money(value) {
        return `NGN ${Number(value || 0).toLocaleString("en-NG")}`;
    }

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><LoaderCircle className="animate-spin text-blue-600" size={34} /></div>;
    }

    return (
        <div className="space-y-5">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" capture="user" className="hidden" onChange={handlePhoto} />

            {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}

            <div className="bg-white rounded-2xl shadow p-5">
                <div className="flex flex-col items-center text-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="relative group rounded-full focus:outline-none focus:ring-4 focus:ring-blue-200" aria-label="Upload profile photo">
                        {worker.profilePhoto ? (
                            <img src={worker.profilePhoto} alt={worker.fullName} className="w-28 h-28 rounded-full object-cover border-4 border-blue-100" />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center border-4 border-blue-100"><Camera className="text-slate-500" size={34} /></div>
                        )}
                        <span className="absolute inset-0 rounded-full bg-slate-900/55 text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition flex items-center justify-center text-xs font-bold">{uploading ? "Uploading…" : "Change photo"}</span>
                        <span className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1.5 border-2 border-white"><Camera size={16} /></span>
                    </button>

                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50">{uploading ? "Uploading photo…" : worker.profilePhoto ? "Edit profile photo" : "Add profile photo"}</button>
                    <h1 className="text-2xl font-bold mt-3">{worker.fullName}</h1>
                    <p className="text-slate-500">{worker.profession}</p>
                    <p className="text-xs text-slate-400 mt-1">{worker.workerId}</p>
                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                        <Badge value={verificationText} tone="yellow" />
                        <Badge value={worker.verificationStatus} tone={worker.verificationStatus === "Verified" || worker.verificationStatus === "Approved" ? "green" : "slate"} />
                        <Badge value={worker.availabilityStatus} tone={worker.availabilityStatus === "Available Now" ? "green" : "slate"} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3"><MetricCard icon={Star} label="Rating" value={`${worker.rating} ★`} /><MetricCard icon={Briefcase} label="Completed Jobs" value={worker.completedJobs} /></div>

            <section className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Profile Strength</h2>
                <div className="space-y-4"><ProgressBar label="Trust Score" value={worker.trustScore} color="bg-green-600" textColor="text-green-700" /><ProgressBar label="Profile Completion" value={worker.profileCompletion} color="bg-blue-600" textColor="text-blue-700" /></div>
            </section>

            <div className="grid grid-cols-2 gap-3"><StatCard title="Acceptance Rate" value={worker.acceptanceRate} /><StatCard title="On-Time Arrival" value={worker.onTimeArrival} /><StatCard title="Response Time" value={worker.responseTime} /><StatCard title="Experience" value={`${worker.yearsExperience} yrs`} /></div>

            <section className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-bold mb-4">Earnings Summary</h2>
                <div className="space-y-3"><EarningRow label="Today's Earnings" value={money(worker.todayEarnings)} /><EarningRow label="This Week" value={money(worker.weekEarnings)} /><EarningRow label="This Month" value={money(worker.monthEarnings)} /></div>
            </section>

            <section className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Identity & Contact</h2><button type="button" onClick={openEditor} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700"><Edit size={16} /> Edit</button></div>
                <div className="space-y-3 text-sm"><InfoRow icon={Phone} value={worker.phone || "Phone not provided"} /><InfoRow icon={Mail} value={worker.email || "Email not provided"} /><InfoRow icon={MapPin} value={[worker.area, worker.city].filter(Boolean).join(", ") || "Location not provided"} /><InfoRow icon={Calendar} value={`Member Since: ${worker.memberSince}`} /><InfoRow icon={Clock} value={`Last Active: ${worker.lastActive}`} /></div>
            </section>

            <section className="bg-white rounded-2xl shadow p-5"><h2 className="text-lg font-bold mb-4">Professional Skills</h2><div className="flex flex-wrap gap-2">{worker.skills.length ? worker.skills.map((skill) => <span key={skill} className="px-3 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">✓ {skill}</span>) : <p className="text-sm text-slate-500">No skills added yet.</p>}</div></section>

            <section className="bg-white rounded-2xl shadow p-5"><h2 className="text-lg font-bold mb-4">Trust & Verification</h2><div className="space-y-3"><VerificationItem label="Profile Photo Captured" active={Boolean(worker.profilePhoto)} /><VerificationItem label="Phone Number Provided" active={Boolean(worker.phone)} /><VerificationItem label="Guarantor Verification" active={worker.guarantorStatus === "Approved" || worker.guarantorStatus === "Submitted"} /></div></section>

            {worker.documents.length > 0 && <section className="bg-white rounded-2xl shadow p-5"><h2 className="text-lg font-bold mb-4">Worker Documents</h2><div className="space-y-3">{worker.documents.map((doc, index) => <div key={`${doc.name || "document"}-${index}`} className="flex items-center justify-between bg-slate-50 rounded-xl p-3"><div className="flex items-center gap-3"><FileCheck className="text-green-600" size={20} /><span className="text-sm font-medium">{doc.name || doc.document_type}</span></div><span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">{titleCase(doc.status)}</span></div>)}</div></section>}

            <section className="bg-white rounded-2xl shadow p-5"><h2 className="text-lg font-bold mb-4">Guarantor & Emergency Contact</h2><div className="space-y-3"><VerificationItem label={`Guarantor Information: ${worker.guarantorStatus}`} active={worker.guarantorStatus === "Submitted" || worker.guarantorStatus === "Approved"} /><VerificationItem label={`Emergency Contact: ${worker.emergencyContactStatus}`} active={worker.emergencyContactStatus === "Submitted" || worker.emergencyContactStatus === "Approved"} /></div><Link to="/worker/guarantors" className="mt-4 flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Manage Guarantor Verification</Link></section>

            <div className="grid grid-cols-1 gap-3 pb-4"><button type="button" onClick={openEditor} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold"><Edit size={18} />Edit Profile</button><button type="button" onClick={toggleAvailability} className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-semibold"><ToggleRight size={18} />{worker.availabilityStatus === "Available Now" ? "Go Offline" : "Go Available"}</button><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60"><Upload size={18} />{uploading ? "Uploading…" : "Upload New Photo"}</button></div>

            {editing && <EditProfileModal draft={draft} setDraft={setDraft} saving={saving} onSubmit={saveProfile} onClose={() => !saving && setEditing(false)} />}
        </div>
    );
}

function EditProfileModal({ draft, setDraft, saving, onSubmit, onClose }) {
    const field = (key) => ({ value: draft[key] ?? "", onChange: (event) => setDraft((current) => ({ ...current, [key]: event.target.value })) });
    return <div className="fixed inset-0 z-50 bg-slate-900/60 p-4 flex items-center justify-center"><form onSubmit={onSubmit} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between"><div><h2 className="text-xl font-bold">Edit Profile</h2><p className="text-sm text-slate-500">Update your worker information.</p></div><button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={20} /></button></div><div className="p-4 grid gap-4 sm:grid-cols-2"><Field label="Full name" required {...field("fullName")} /><Field label="Profession" required {...field("profession")} /><Field label="Phone number" type="tel" {...field("phone")} /><Field label="Email" type="email" {...field("email")} /><Field label="Area / address" {...field("area")} /><Field label="City / state" {...field("city")} /><Field label="Years of experience" type="number" min="0" max="60" {...field("yearsExperience")} /></div><div className="sticky bottom-0 bg-white border-t p-4 flex gap-3"><button type="button" onClick={onClose} disabled={saving} className="flex-1 border border-slate-300 py-3 rounded-xl font-semibold">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}{saving ? "Saving…" : "Save Changes"}</button></div></form></div>;
}

function Field({ label, ...props }) { return <label className="text-sm font-medium text-slate-700">{label}<input {...props} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>; }
function Notice({ notice, onClose }) { const styles = notice.type === "success" ? "bg-green-50 border-green-200 text-green-800" : notice.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800"; return <div className={`rounded-xl border p-3 flex items-start justify-between gap-3 ${styles}`}><p className="text-sm font-medium">{notice.text}</p><button type="button" onClick={onClose}><X size={18} /></button></div>; }
function Badge({ value, tone }) { const styles = tone === "green" ? "bg-green-100 text-green-700" : tone === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"; return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles}`}>{value}</span>; }
function MetricCard({ icon: Icon, label, value }) { return <div className="bg-white rounded-2xl shadow p-4"><Icon className="text-blue-600" /><p className="text-sm text-slate-500 mt-2">{label}</p><h2 className="text-xl font-bold">{value}</h2></div>; }
function StatCard({ title, value }) { return <div className="bg-white rounded-2xl shadow p-4"><p className="text-sm text-slate-500">{title}</p><h2 className="text-xl font-bold mt-1">{value}</h2></div>; }
function ProgressBar({ label, value, color, textColor }) { const safeValue = Math.max(0, Math.min(100, asNumber(value))); return <div><div className="flex justify-between text-sm mb-1"><span className="font-medium">{label}</span><span className={`font-bold ${textColor}`}>{safeValue}%</span></div><div className="w-full bg-slate-200 rounded-full h-3"><div className={`${color} h-3 rounded-full`} style={{ width: `${safeValue}%` }} /></div></div>; }
function InfoRow({ icon: Icon, value }) { return <div className="flex items-center gap-3"><Icon className="text-blue-600 shrink-0" size={18} /><span className="break-all">{value}</span></div>; }
function EarningRow({ label, value }) { return <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3"><div className="flex items-center gap-3"><Wallet className="text-green-600" size={20} /><span className="text-sm font-medium">{label}</span></div><span className="font-bold text-green-700">{value}</span></div>; }
function VerificationItem({ label, active }) { return <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3"><div className="flex items-center gap-3"><ShieldCheck size={20} className={active ? "text-green-600" : "text-slate-400"} /><span className="text-sm font-medium">{label}</span></div>{active ? <BadgeCheck className="text-green-600" size={20} /> : <span className="text-xs text-slate-400">Pending</span>}</div>; }
