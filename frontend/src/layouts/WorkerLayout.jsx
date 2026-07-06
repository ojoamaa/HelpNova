import { Link, Outlet } from "react-router-dom";
import { Home, Briefcase, Wallet, User } from "lucide-react";

export default function WorkerLayout() {
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <Outlet />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow">
        <div className="max-w-md mx-auto grid grid-cols-4 text-center py-2">
          <Link to="/worker" className="text-xs text-slate-700">
            <Home className="mx-auto" size={22} />
            Home
          </Link>

          <Link to="/worker/jobs" className="text-xs text-slate-700">
            <Briefcase className="mx-auto" size={22} />
            Jobs
          </Link>

          <Link to="/worker/wallet" className="text-xs text-slate-700">
            <Wallet className="mx-auto" size={22} />
            Wallet
          </Link>

          <Link to="/worker/profile" className="text-xs text-slate-700">
            <User className="mx-auto" size={22} />
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
