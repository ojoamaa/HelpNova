import { useEffect, useState } from "react";
import { Briefcase, Wallet, Star, ToggleRight, MapPin, Bell } from "lucide-react";
import { getWorkerPerformance } from "../../api/workerApi";

export default function WorkerDashboard() {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWorkerData() {
            try {
                const data = await getWorkerPerformance();
                setPerformance(data);
            } catch (error) {
                console.error("Failed to load worker performance:", error);
            } finally {
                setLoading(false);
            }
        }

        loadWorkerData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
                <p className="text-slate-600">Loading worker dashboard...</p>
            </div>
        );
    }

    const worker = performance?.performance?.worker || performance?.worker || {};
    const jobs = performance?.performance?.jobs || performance?.jobs || {};
    const wallet = performance?.performance?.wallet || performance?.wallet || {};
    const ratings = performance?.performance?.ratings || performance?.ratings || {};
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="bg-blue-600 text-white rounded-2xl p-5 shadow">
          <h1 className="text-2xl font-bold">Worker Dashboard</h1>
          <p className="text-blue-100 mt-1">
        Welcome back, {worker.name || "HelpNova Worker"}
          </p>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl p-4 shadow flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">
              Availability
            </p>
            <h2 className="text-lg font-bold text-green-600">
              Online
            </h2>
          </div>

          <ToggleRight
            size={42}
            className="text-green-600"
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">

          <div className="bg-white rounded-2xl p-4 shadow">
            <Briefcase className="text-blue-600" />
            <p className="text-sm text-slate-500 mt-2">
              Active Jobs
            </p>
            <h2 className="text-2xl font-bold">
             {jobs.active || 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <Wallet className="text-green-600" />
            <p className="text-sm text-slate-500 mt-2">
              Wallet Balance
            </p>
            <h2 className="text-2xl font-bold">
             NGN {wallet.available_balance || 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <Star className="text-yellow-500" />
            <p className="text-sm text-slate-500 mt-2">
              Rating
            </p>
            <h2 className="text-2xl font-bold">
             {ratings.average_rating || 0} ★
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <Bell className="text-red-500" />
            <p className="text-sm text-slate-500 mt-2">
              Notifications
            </p>
            <h2 className="text-2xl font-bold">
              {jobs.total_assigned || 0}
            </h2>
          </div>

        </div>

        {/* Current Job */}
        <div className="bg-white rounded-2xl p-4 shadow">

          <h2 className="font-bold text-lg">
            Current Job
          </h2>

          <div className="mt-3 space-y-2">

            <p className="font-semibold">
              Plumbing Repair
            </p>

            <p className="text-slate-600">
              Customer: Musa Ibrahim
            </p>

            <div className="flex items-center gap-2 text-slate-600">
              <MapPin size={18} />
              <span>Gwarinpa, Abuja</span>
            </div>

            <p className="text-green-600 font-semibold">
              Status: On My Way
            </p>

          </div>

          <button className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
            Open Job Details
          </button>

        </div>

        {/* Today's Earnings */}
        <div className="bg-white rounded-2xl p-4 shadow">

          <h2 className="font-bold">
            Today's Earnings
          </h2>

          <h1 className="text-3xl font-bold text-green-600 mt-2">
            NGN 15,500
          </h1>

          <p className="text-slate-500 mt-1">
            2 completed jobs today
          </p>

        </div>

      </div>
    </div>
  );
}
