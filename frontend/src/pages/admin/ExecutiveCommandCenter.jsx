import { Link } from "react-router-dom";
import {
  Wallet,
  Banknote,
  Clock,
  Users,
  Briefcase,
  ShieldAlert,
  TrendingUp,
  Star,
  MapPin,
  Bot,
  ArrowLeft,
  Activity,
} from "lucide-react";

const kpis = [
  {
    title: "Revenue Today",
    value: "NGN 0",
    note: "Live payment revenue",
    icon: Banknote,
    style: "from-green-50 to-white border-green-200",
  },
  {
    title: "Monthly Revenue",
    value: "NGN 0",
    note: "Current month income",
    icon: TrendingUp,
    style: "from-blue-50 to-white border-blue-200",
  },
  {
    title: "Company Wallet",
    value: "NGN 0",
    note: "Available company balance",
    icon: Wallet,
    style: "from-emerald-50 to-white border-emerald-200",
  },
  {
    title: "Pending Withdrawals",
    value: "NGN 0",
    note: "Awaiting finance action",
    icon: Clock,
    style: "from-amber-50 to-white border-amber-200",
  },
  {
    title: "Active Workers",
    value: "0",
    note: "Workers online today",
    icon: Users,
    style: "from-indigo-50 to-white border-indigo-200",
  },
  {
    title: "Jobs In Progress",
    value: "0",
    note: "Currently active jobs",
    icon: Briefcase,
    style: "from-orange-50 to-white border-orange-200",
  },
  {
    title: "Emergency Requests",
    value: "0",
    note: "Requires attention",
    icon: ShieldAlert,
    style: "from-red-50 to-white border-red-200",
  },
  {
    title: "Customer Rating",
    value: "0.0 ★",
    note: "Average satisfaction",
    icon: Star,
    style: "from-purple-50 to-white border-purple-200",
  },
];

const activities = [
  "Customer payment received",
  "Worker accepted a service request",
  "Escrow funded for active job",
  "Withdrawal awaiting approval",
  "Job completed successfully",
];

const insights = [
  "AI insight engine will summarize revenue movement, worker performance, customer satisfaction and fraud signals here.",
  "Plumbing, electrical and cleaning categories will be monitored for demand trends.",
  "Regions with high requests and low worker coverage will be flagged for operations expansion.",
];

export default function ExecutiveCommandCenter() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-semibold"
          >
            <ArrowLeft size={18} />
            Back to Admin Dashboard
          </Link>

          <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-6">
            <p className="text-blue-200 font-semibold">
              HelpNova Executive Command Center
            </p>
            <h1 className="text-3xl font-bold mt-2">
              CEO Operations & Business Intelligence
            </h1>
            <p className="text-slate-300 mt-2 max-w-3xl">
              A single executive view for revenue, workers, jobs, escrow,
              withdrawals, operations alerts and AI-powered business insights.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`rounded-2xl bg-gradient-to-br ${item.style} border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">{item.title}</p>
                    <h2 className="text-2xl font-bold mt-2 text-slate-900">
                      {item.value}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{item.note}</p>
                  </div>
                  <Icon className="text-blue-600" size={38} strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-blue-600" />
              <h2 className="text-xl font-bold">Live Activity Feed</h2>
            </div>

            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">{activity}</p>
                    <p className="text-sm text-slate-500">
                      Placeholder event #{index + 1}
                    </p>
                  </div>

                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="text-purple-600" />
              <h2 className="text-xl font-bold">AI Business Insights</h2>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight}
                  className="bg-purple-50 border border-purple-100 text-purple-800 rounded-xl p-3 text-sm"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-green-600" />
            <h2 className="text-xl font-bold">Nigeria Operations Overview</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["FCT Abuja", "Lagos", "Kano", "Port Harcourt", "Kaduna", "Ibadan", "Enugu", "Jos"].map(
              (state) => (
                <div
                  key={state}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <p className="font-semibold">{state}</p>
                  <p className="text-sm text-slate-500">Jobs: 0</p>
                  <p className="text-sm text-slate-500">Workers: 0</p>
                  <p className="text-sm text-slate-500">Revenue: NGN 0</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
