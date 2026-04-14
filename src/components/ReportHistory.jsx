import { Truck, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function ReportHistory({ reports, loading, onDeleted }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
            <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No reports submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                {r.day && <span className="text-blue-600">{r.day} · </span>}
                {r.date ? format(new Date(r.date + "T00:00:00"), "dd MMM yyyy") : "—"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Truck className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">{r.truck_registration || "—"}</span>
                {r.trailer_1_registration && (
                  <span className="text-xs text-slate-400">+ {r.trailer_1_registration}</span>
                )}
                {r.trailer_2_registration && (
                  <span className="text-xs text-slate-400">+ {r.trailer_2_registration}</span>
                )}
              </div>
            </div>
            {r.total_km != null && (
              <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2.5 py-1 rounded-lg">
                {r.total_km.toLocaleString()} km
              </span>
            )}
          </div>

          {/* KM & Time row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-slate-400 mb-0.5">Start</p>
              <p className="font-medium text-slate-700">
                {r.start_km != null ? r.start_km.toLocaleString() + " km" : "—"}
                {r.start_time && <span className="text-slate-400 ml-1">@ {r.start_time}</span>}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-slate-400 mb-0.5">Finish</p>
              <p className="font-medium text-slate-700">
                {r.finish_km != null ? r.finish_km.toLocaleString() + " km" : "—"}
                {r.finish_time && <span className="text-slate-400 ml-1">@ {r.finish_time}</span>}
              </p>
            </div>
          </div>

          {r.notes && (
            <p className="mt-2.5 text-xs text-slate-500 border-t border-slate-100 pt-2.5">{r.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}