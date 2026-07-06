export default function WorkerWallet() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="bg-green-600 text-white rounded-2xl p-5 shadow">
        <p>Available Balance</p>
        <h2 className="text-3xl font-bold">NGN 20,000</h2>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <p className="text-slate-500">Pending Balance</p>
        <h2 className="text-2xl font-bold">NGN 9,000</h2>

        <button className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">
          Request Withdrawal
        </button>
      </div>
    </div>
  );
}
