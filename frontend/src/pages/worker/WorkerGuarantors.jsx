import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    Copy,
    Mail,
    MessageCircle,
    Plus,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import {
    createGuarantorInvitation,
    getWorkerGuarantors,
} from "../../api/guarantorApi";

const initialForm = {
    full_name: "",
    phone: "",
    email: "",
    relationship: "",
    is_primary: true,
};

function getStatusBadge(status) {
    const badges = {
        approved: "bg-green-100 text-green-700",
        submitted: "bg-blue-100 text-blue-700",
        invitation_sent: "bg-amber-100 text-amber-700",
        correction_requested: "bg-orange-100 text-orange-700",
        rejected: "bg-red-100 text-red-700",
    };

    return badges[status] || "bg-slate-100 text-slate-700";
}

function formatStatus(status) {
    return String(status || "unknown").replaceAll("_", " ");
}

function formatWhatsAppPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (digits.startsWith("0")) {
        return `234${digits.slice(1)}`;
    }

    return digits;
}

export default function WorkerGuarantors() {
    const navigate = useNavigate();

    const workerId = localStorage.getItem("helpnova_worker_id");

    const [rows, setRows] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [busy, setBusy] = useState(false);
    const [loadingRows, setLoadingRows] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadGuarantors = useCallback(async () => {
        if (!workerId) {
            setLoadingRows(false);
            setError("Worker session not found. Please log in again.");
            return;
        }

        setLoadingRows(true);
        setError("");

        try {
            const records = await getWorkerGuarantors(workerId);

            setRows(Array.isArray(records) ? records : []);
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to load guarantor records."
            );
        } finally {
            setLoadingRows(false);
        }
    }, [workerId]);

    useEffect(() => {
        if (!workerId) {
            navigate("/worker/login", {
                replace: true,
            });

            return;
        }

        loadGuarantors();
    }, [loadGuarantors, navigate, workerId]);

    const primaryGuarantor = useMemo(
        () => rows.find((record) => record.is_primary),
        [rows]
    );

    const approvedPrimary = useMemo(
        () =>
            rows.find(
                (record) =>
                    record.is_primary && record.status === "approved"
            ),
        [rows]
    );

    function publicLink(record) {
        return `${window.location.origin}/guarantor/${record.token}`;
    }

    function updateForm(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!workerId) {
            setError("Worker session not found. Please log in again.");
            return;
        }

        setBusy(true);
        setMessage("");
        setError("");

        try {
            const createdRecord = await createGuarantorInvitation({
                ...form,
                full_name: form.full_name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim() || null,
                relationship: form.relationship.trim(),
                worker_id: workerId,
            });

            setRows((current) => [createdRecord, ...current]);

            setForm({
                ...initialForm,
                is_primary: !primaryGuarantor,
            });

            setMessage(
                "Secure invitation created. Copy or share the generated link below."
            );
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to create the guarantor invitation."
            );
        } finally {
            setBusy(false);
        }
    }

    async function copyInvitationLink(record) {
        try {
            await navigator.clipboard.writeText(publicLink(record));
            setMessage("Invitation link copied.");
            setError("");
        } catch {
            setError("Unable to copy the invitation link.");
        }
    }

    if (!workerId) {
        return null;
    }

    return (
        <div className="space-y-5">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <h1 className="text-2xl font-bold">
                    Guarantor Verification
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                    Invite a guarantor to complete the secure form personally.
                    One verified primary guarantor is required for stronger job
                    access.
                </p>

                {approvedPrimary && (
                    <div className="mt-4 rounded-xl border border-green-400/40 bg-green-500/10 p-3 text-sm text-green-200">
                        Primary guarantor approved:{" "}
                        <strong>{approvedPrimary.full_name}</strong>
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                    {message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-3 rounded-2xl bg-white p-5 shadow"
            >
                <h2 className="flex items-center gap-2 font-bold">
                    <Plus size={18} />
                    Invite Guarantor
                </h2>

                <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(event) =>
                        updateForm("full_name", event.target.value)
                    }
                    placeholder="Full legal name"
                    className="w-full rounded-xl border p-3"
                />

                <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(event) =>
                        updateForm("phone", event.target.value)
                    }
                    placeholder="Phone number"
                    className="w-full rounded-xl border p-3"
                />

                <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                        updateForm("email", event.target.value)
                    }
                    placeholder="Email address"
                    className="w-full rounded-xl border p-3"
                />

                <input
                    type="text"
                    required
                    value={form.relationship}
                    onChange={(event) =>
                        updateForm("relationship", event.target.value)
                    }
                    placeholder="Relationship to worker"
                    className="w-full rounded-xl border p-3"
                />

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.is_primary}
                        onChange={(event) =>
                            updateForm("is_primary", event.target.checked)
                        }
                    />

                    Primary guarantor
                </label>

                <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                    {busy ? "Creating..." : "Create Secure Invitation"}
                </button>
            </form>

            <div className="rounded-2xl bg-white p-5 shadow">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold">
                        Invitations & Submissions
                    </h2>

                    <button
                        type="button"
                        onClick={loadGuarantors}
                        disabled={loadingRows}
                        className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
                        aria-label="Refresh guarantor records"
                    >
                        <RefreshCw
                            size={18}
                            className={loadingRows ? "animate-spin" : ""}
                        />
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {loadingRows ? (
                        <p className="text-sm text-slate-500">
                            Loading guarantor records...
                        </p>
                    ) : rows.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            No guarantor invited yet.
                        </p>
                    ) : (
                        rows.map((record) => (
                            <div
                                key={record.id}
                                className="rounded-xl border p-4"
                            >
                                <div className="flex justify-between gap-3">
                                    <div>
                                        <p className="font-semibold">
                                            {record.full_name}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {record.relationship} • {record.phone}
                                        </p>

                                        {record.is_primary && (
                                            <p className="mt-1 text-xs font-medium text-blue-600">
                                                Primary guarantor
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`h-fit rounded-full px-2 py-1 text-xs font-bold capitalize ${getStatusBadge(
                                            record.status
                                        )}`}
                                    >
                                        {formatStatus(record.status)}
                                    </span>
                                </div>

                                {record.review_note && (
                                    <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                        Review note: {record.review_note}
                                    </div>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => copyInvitationLink(record)}
                                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs"
                                    >
                                        <Copy size={14} />
                                        Copy Link
                                    </button>

                                    {record.email && (
                                        <a
                                            href={`mailto:${record.email}?subject=${encodeURIComponent(
                                                "HelpNova guarantor verification"
                                            )}&body=${encodeURIComponent(
                                                `Please complete my HelpNova guarantor verification: ${publicLink(
                                                    record
                                                )}`
                                            )}`}
                                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs"
                                        >
                                            <Mail size={14} />
                                            Email
                                        </a>
                                    )}

                                    <a
                                        href={`https://wa.me/${formatWhatsAppPhone(
                                            record.phone
                                        )}?text=${encodeURIComponent(
                                            `Please complete my HelpNova guarantor verification: ${publicLink(
                                                record
                                            )}`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-xs"
                                    >
                                        <MessageCircle size={14} />
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <ShieldCheck className="shrink-0" />

                <p>
                    The guarantor must consent and submit their own information.
                    Approval improves trust and matching priority but does not
                    automatically create financial liability.
                </p>
            </div>
        </div>
    );
}