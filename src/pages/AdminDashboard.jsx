import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Truck, BarChart2, ShieldCheck, Trash2, Download, Filter } from "lucide-react";

function StatCard({ label, value, sub, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTruck, setFilterTruck] = useState("");
  const [filterFatigue, setFilterFatigue] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchReports = async () => {
    const data = await base44.entities.DailyReport.list("-date", 200);
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    setDeletingId(id);
    await base44.entities.DailyReport.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  };

  // Unique trucks for filter
  const trucks = [...new Set(reports.map((r) => r.truck_registration).filter(Boolean))].sort();

  const filtered = reports.filter((r) => {
    if (filterTruck && r.truck_registration !== filterTruck) return false;
    if (filterFatigue && r.fatigue_option !== filterFatigue) return false;
    if (filterDate && r.date !== filterDate) return false;
    return true;
  });

  // Stats
  const totalKm = reports.reduce((s, r) => s + (r.total_km || 0), 0);
  const declared = reports.filter((r) => r.fatigue_declared).length;
  const bfm = reports.filter((r) => r.fatigue_option === "BFM (Basic Fatigue Management)").length;

  // CSV export
  const exportCSV = () => {
    const headers = ["Date", "Day", "Truck", "Trailer 1", "Trailer 2", "Start KM", "Start Time", "Finish KM", "Finish Time", "Total KM", "Fatigue Option", "Driver Type", "Rest Breaks", "Declaration", "Notes"];
    const rows = filtered.map((r) => [
      r.date, r.day, r.truck_registration, r.trailer_1_registration, r.trailer_2_registration,
      r.start_km, r.start_time, r.finish_km, r.finish_time, r.total_km,
      r.fatigue_option, r.fatigue_driver_type, r.fatigue_rest_breaks,
      r.fatigue_declared ? "Yes" : "No", r.notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trip-reports-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">All driver trip reports</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Reports" value={reports.length} color="blue" />
          <StatCard label="Total KM" value={totalKm.toLocaleString()} sub="all trips" color="green" />
          <StatCard label="Declarations Signed" value={declared} sub={`of ${reports.length}`} color="purple" />
          <StatCard label="BFM Reports" value={bfm} sub={`${reports.length - bfm} Standard`} color="amber" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Truck</label>
              <select
                value={filterTruck}
                onChange={(e) => setFilterTruck(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All trucks</option>
                {trucks.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fatigue Option</label>
              <select
                value={filterFatigue}
                onChange={(e) => setFilterFatigue(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All options</option>
                <option value="Standard Hours">Standard Hours</option>
                <option value="BFM (Basic Fatigue Management)">BFM</option>
              </select>
            </div>
          </div>
          {(filterDate || filterTruck || filterFatigue) && (
            <button
              onClick={() => { setFilterDate(""); setFilterTruck(""); setFilterFatigue(""); }}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Reports <span className="text-slate-400 font-normal">({filtered.length})</span>
            </span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reports found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">KM</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fatigue</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Declaration</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {r.date ? format(new Date(r.date + "T00:00:00"), "dd MMM yyyy") : "—"}
                        </p>
                        {r.day && <p className="text-xs text-slate-400">{r.day}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-700">{r.truck_registration || "—"}</span>
                        </div>
                        {(r.trailer_1_registration || r.trailer_2_registration) && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {[r.trailer_1_registration, r.trailer_2_registration].filter(Boolean).join(" + ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.total_km != null ? (
                          <span className="font-bold text-blue-600">{r.total_km.toLocaleString()} km</span>
                        ) : "—"}
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.start_km != null ? r.start_km.toLocaleString() : "—"} → {r.finish_km != null ? r.finish_km.toLocaleString() : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {r.start_time || "—"} – {r.finish_time || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.fatigue_option ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.fatigue_option === "BFM (Basic Fatigue Management)"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {r.fatigue_option === "BFM (Basic Fatigue Management)" ? "BFM" : "Standard"}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                        {r.fatigue_driver_type && (
                          <p className="text-xs text-slate-400 mt-0.5">{r.fatigue_driver_type}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.fatigue_declared ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> Signed
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500 font-medium">⚠ Missing</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}