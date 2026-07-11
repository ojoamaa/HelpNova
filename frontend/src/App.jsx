import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import WorkerLayout from "./layouts/WorkerLayout";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerJobs from "./pages/worker/WorkerJobs";
import WorkerWallet from "./pages/worker/WorkerWallet";
import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerCurrentJob from "./pages/worker/WorkerCurrentJob";
import AdminFinanceDashboard from "./pages/admin/AdminFinanceDashboard";
import ExecutiveCommandCenter from "./pages/admin/ExecutiveCommandCenter";
import LiveOperationsCenter from "./pages/admin/LiveOperationsCenter";
import AdminLayout from "./layouts/AdminLayout";
import WorkerManagement from "./pages/admin/WorkerManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";

function Home() {
    return (
        <div className="min-h-screen bg-slate-100 p-5">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
                <h1 className="text-2xl font-bold text-slate-900">HelpNova</h1>
                <p className="text-slate-600 mt-2">
                    AI-powered service marketplace.
                </p>

                <div className="mt-6 space-y-3">
                    <Link
                        to="/worker"
                        className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold"
                    >
                        Worker App
                    </Link>

                    <Link
                        to="/customer"
                        className="block w-full text-center bg-green-600 text-white py-3 rounded-xl font-semibold"
                    >
                        Customer App
                    </Link>

                    <Link
                        to="/admin"
                        className="block w-full text-center bg-slate-900 text-white py-3 rounded-xl font-semibold"
                    >
                        Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

function WorkerApp() {
    return (
        <div className="min-h-screen p-5 bg-slate-100">
            <h1 className="text-xl font-bold">Worker Mobile App</h1>
            <p className="text-slate-600">Job offers, wallet, reliability score.</p>
        </div>
    );
}

function CustomerApp() {
    return (
        <div className="min-h-screen p-5 bg-slate-100">
            <h1 className="text-xl font-bold">Customer Mobile App</h1>
            <p className="text-slate-600">Request service, pricing, tracking.</p>
        </div>
    );
}

function AdminDashboard() {
    return (
        <div className="min-h-screen p-6 bg-slate-100">

            <Link
                to="/"
                className="inline-flex items-center gap-2 mb-4 text-blue-700 font-semibold hover:text-blue-900"
            >
                ← Back to Home
            </Link>

            <div className="bg-slate-900 rounded-3xl text-white p-8 shadow-xl">
                <h1 className="text-4xl font-bold">
                    HelpNova Admin Portal
                </h1>

                <p className="text-slate-300 mt-3">
                    Executive management, finance, operations, analytics and AI business intelligence.
                </p>
            </div>

            <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Link
                    to="/admin/command-center"
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition"
                >
                    <h2 className="text-2xl font-bold">
                        🚀 Executive Command Center
                    </h2>

                    <p className="mt-3 text-blue-100">
                        CEO dashboard with live operations, AI insights and business intelligence.
                    </p>
                </Link>

                <Link
                    to="/admin/live-operations"
                    className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition"
                >
                    <h2 className="text-2xl font-bold">
                        📡 Live Operations Center
                    </h2>

                    <p className="mt-3 text-orange-100">
                        Monitor live jobs, worker movement, dispatch status and emergency requests.
                    </p>
                </Link>

                <Link
                    to="/admin/finance"
                    className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition"
                >
                    <h2 className="text-2xl font-bold">
                        💰 Finance Dashboard
                    </h2>

                    <p className="mt-3 text-green-100">
                        Revenue, escrow, withdrawals, commissions and payments.
                    </p>
                </Link>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow">
                    <h2 className="text-xl font-bold">
                        📌 Coming Soon
                    </h2>

                    <ul className="mt-4 space-y-2 text-slate-600">
                        <li>• Live Operations Center</li>
                        <li>• Worker Management</li>
                        <li>• Customer Management</li>
                        <li>• AI Fraud Detection</li>
                        <li>• Reports & Analytics</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/worker" element={<WorkerLayout />}>
                    <Route index element={<WorkerDashboard />} />
                    <Route path="jobs" element={<WorkerJobs />} />
                    <Route path="wallet" element={<WorkerWallet />} />
                    <Route path="profile" element={<WorkerProfile />} />
                    <Route
                        path="/worker/current-job"
                        element={<WorkerCurrentJob />}
                    />
                </Route>

                <Route path="/customer" element={<CustomerApp />} />

                <Route path="/admin" element={<AdminLayout />}>

                    <Route index element={<AdminDashboard />} />

                    <Route
                        path="command-center"
                        element={<ExecutiveCommandCenter />}
                    />

                    <Route
                        path="finance"
                        element={<AdminFinanceDashboard />}
                    />

                    <Route
                        path="live-operations"
                        element={<LiveOperationsCenter />}
                    />

                    <Route path="workers" element={<WorkerManagement />} />

                   
                    <Route
                        path="/admin/customers"
                        element={<CustomerManagement />}
                    />

                    <Route
                        path="fraud-watch"
                        element={
                            <div className="p-6 bg-white rounded-2xl shadow">
                                <h1 className="text-2xl font-bold">Fraud Watch</h1>
                                <p className="text-slate-600 mt-2">
                                    Suspicious accounts, fake jobs, payment risk and abnormal behavior will be monitored here.
                                </p>
                            </div>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}