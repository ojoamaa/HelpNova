import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/api";
import { loginUser } from "../../api/authApi";

export default function WorkerLogin() {
    const navigate = useNavigate();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const loginData = await loginUser({
                phone: phone.trim(),
                password,
            });

            const accessToken =
                loginData?.access_token ||
                loginData?.token ||
                loginData?.accessToken;

            const loggedInUser = loginData?.user;

            if (!accessToken) {
                throw new Error(
                    "Login succeeded, but no access token was returned."
                );
            }

            localStorage.setItem(
                "helpnova_worker_token",
                accessToken
            );

            if (!loggedInUser?.id) {
                throw new Error(
                    "Login succeeded, but no user ID was returned."
                );
            }

            if (loggedInUser.role !== "worker") {
                throw new Error(
                    "This account is not registered as a worker."
                );
            }

            const workerResponse = await api.get(
                `/workers/user/${encodeURIComponent(loggedInUser.id)}`
            );

            const worker = workerResponse.data;

            console.log("LOGIN USER:", loggedInUser);
            console.log("WORKER LOOKUP:", worker);

            if (!worker?.id) {
                throw new Error(
                    "Your user account exists, but no worker profile is linked to it."
                );
            }

            localStorage.setItem(
                "helpnova_worker_user_id",
                loggedInUser.id
            );

            localStorage.setItem(
                "helpnova_worker_id",
                worker.id
            );

            localStorage.setItem(
                "helpnova_worker_phone",
                loggedInUser.phone || ""
            );

            localStorage.setItem(
                "helpnova_worker_email",
                loggedInUser.email || ""
            );

            localStorage.setItem(
                "helpnova_worker_name",
                loggedInUser.full_name || worker.full_name || ""
            );

            navigate("/worker", {
                replace: true,
            });
        } catch (err) {
            localStorage.removeItem("helpnova_worker_token");

            const detail = err?.response?.data?.detail;

            setError(
                typeof detail === "string"
                    ? detail
                    : err?.message ||
                    "Invalid phone number or password."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">
                        HelpNova Worker Login
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in with the phone number and password used during
                        registration.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label
                            htmlFor="worker-phone"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Phone Number
                        </label>

                        <input
                            id="worker-phone"
                            name="worker_phone"
                            type="tel"
                            value={phone}
                            autoComplete="tel"
                            onChange={(event) => setPhone(event.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder="08012345678"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="worker-password"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Password
                        </label>

                        <input
                            id="worker-password"
                            name="worker_password"
                            type="password"
                            value={password}
                            autoComplete="current-password"
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}