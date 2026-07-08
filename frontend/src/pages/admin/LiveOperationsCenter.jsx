import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Users,
  Briefcase,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
} from "lucide-react";

const operationCards = [
  { title: "Workers Online", value: 0, note: "Available for dispatch", icon: Users },
  { title: "New Job Requests", value: 0, note: "Waiting for assignment", icon: Briefcase },
  { title: "Jobs In Progress", value: 0, note: "Currently active", icon: Activity },
  { title: "Workers En Route", value: 0, note: "On the way to customers", icon: Navigation },
  { title: "Completed Today", value: 0, note: "Successful service delivery", icon: CheckCircle },
  { title: "Delayed Jobs", value: 0, note: "Needs operations review", icon: Clock },
  { title: "Emergency Requests", value: 0, note: "High priority jobs", icon: AlertTriangle },
  { title: "Active Locations", value: 0, note: "Cities with current activity", icon: MapPin },
];

export default function LiveOperationsCenter() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900"
        >
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </Link>

        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl">
          <p className="text-blue-200 font-semibold">HelpNova Live Operations</p>
          <h1 className="text-3xl font-bold mt-2">Dispatch & Field Monitoring Center</h1>
          <p className="text-slate-300 mt-2">
            Monitor live jobs, worker movement, emergency requests and operational performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {operationCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">{card.title}</p>
                    <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                    <p className="text-xs text-slate-500 mt-1">{card.note}</p>
                  </div>
                  <Icon className="text-blue-600" size={34} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl shadow p-5 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Live Job Queue</h2>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 bg-slate-50 text-slate-500 text-sm font-semibold p-3">
                <span>Job</span>
                <span>Worker</span>
                <span>Status</span>
                <span>Location</span>
                <span>Priority</span>
              </div>

              <div className="p-6 text-center text-slate-500">
                No live jobs yet.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-xl font-bold mb-4">Operations Alerts</h2>

            <div className="space-y-3">
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-700 text-sm">
                System is stable.
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-blue-700 text-sm">
                GPS tracking module will connect here later.
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-yellow-700 text-sm">
                Emergency dispatch monitoring is ready for integration.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-4">Nigeria Field Coverage</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["FCT Abuja", "Lagos", "Kano", "Kaduna", "Port Harcourt", "Ibadan", "Enugu", "Jos"].map(
              (city) => (
                <div
                  key={city}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <p className="font-semibold">{city}</p>
                  <p className="text-sm text-slate-500 mt-1">Live Jobs: 0</p>
                  <p className="text-sm text-slate-500">Online Workers: 0</p>
                  <p className="text-sm text-slate-500">Emergency: 0</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
