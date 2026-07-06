import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import WorkerLayout from "./layouts/WorkerLayout";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerJobs from "./pages/worker/WorkerJobs";
import WorkerWallet from "./pages/worker/WorkerWallet";
import WorkerProfile from "./pages/worker/WorkerProfile";

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
        <div className="min-h-screen p-5 bg-slate-100">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-600">AI insights, finance, fraud, operations.</p>
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
                </Route>

                <Route path="/customer" element={<CustomerApp />} />

                <Route path="/admin" element={<AdminDashboard />} />

            </Routes>
        </BrowserRouter>
    );
}