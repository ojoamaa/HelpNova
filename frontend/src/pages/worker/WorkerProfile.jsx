export default function WorkerProfile() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Worker Profile</h1>

      <div className="bg-white rounded-2xl p-4 shadow">
        <h2 className="text-xl font-bold">Abu Bukar</h2>
        <p className="text-slate-600">Profession: Plumber</p>
        <p className="text-slate-600">Location: Abuja</p>
        <p className="text-green-600 font-semibold">Verified Worker</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <p className="text-slate-500">Reliability Level</p>
        <h2 className="text-3xl font-bold text-blue-600">ELITE</h2>
        <p className="text-slate-600 mt-2">Top priority for job assignment.</p>
      </div>
    </div>
  );
}
