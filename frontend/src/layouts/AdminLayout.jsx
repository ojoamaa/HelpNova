import { Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Activity,
  Users,
  UserRound,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Home,
} from "lucide-react";

const adminLinks = [
  {
    title: "Admin Home",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Executive",
    path: "/admin/command-center",
    icon: BarChart3,
  },
  {
    title: "Finance",
    path: "/admin/finance",
    icon: Wallet,
  },
  {
    title: "Live Operations",
    path: "/admin/live-operations",
    icon: Activity,
  },
  {
    title: "Workers",
    path: "/admin/workers",
    icon: Users,
  },
  {
    title: "Guarantors",
    path: "/admin/guarantors",
    icon: ShieldCheck,
  },
  {
    title: "Customers",
    path: "/admin/customers",
    icon: UserRound,
  },
  {
    title: "Fraud Watch",
    path: "/admin/fraud-watch",
    icon: ShieldAlert,
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="hidden md:flex md:w-72 min-h-screen bg-slate-950 text-white p-5 flex-col">
          <div>
            <h1 className="text-2xl font-bold">HelpNova</h1>
            <p className="text-slate-400 text-sm mt-1">Admin Control Center</p>
          </div>

          <nav className="mt-8 space-y-2">
            {adminLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Icon size={20} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <div className="md:hidden bg-slate-950 text-white p-4">
            <h1 className="text-xl font-bold">HelpNova Admin</h1>

            <div className="mt-3 overflow-x-auto flex gap-2 pb-1">
              {adminLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="shrink-0 bg-slate-800 px-3 py-2 rounded-lg text-sm"
                >
                  {item.title}
                </Link>
              ))}

              <Link
                to="/"
                className="shrink-0 bg-blue-700 px-3 py-2 rounded-lg text-sm"
              >
                Home
              </Link>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
