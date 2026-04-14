import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Calendar, Star } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EMPTY = { name: "", frequency: "Fortnightly", start_day: "Monday", period_start_date: "", monthly_start_day: 1, is_default: false };

function PayPeriodModal({ period, onSave, onClose }) {
  const [form, setForm] = useState(period || EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const payload = { ...form, monthly_start_day: form.monthly_start_day ? parseInt(form.monthly_start_day) : undefined };
    if (period?.id) {
      await base44.entities.PayPeriod.update(period.id, payload);
    } else {
      await base44.entities.PayPeriod.create(payload);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{period?.id ? "Edit Pay Period" : "Add Pay Period"}</h3>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Label / Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Fortnight A"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Frequency *</label>
            <div className="grid grid-cols-3 gap-2">
              {["Weekly", "Fortnightly", "Monthly"].map(f => (
                <button key={f} type="button" onClick={() => set("frequency", f)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${form.frequency === f ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {(form.frequency === "Weekly" || form.frequency === "Fortnightly") && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Start Day of Week</label>
                <select value={form.start_day} onChange={e => set("start_day", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Anchor Start Date</label>
                <input type="date" value={form.period_start_date} onChange={e => set("period_start_date", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1">Used to calculate upcoming period boundaries</p>
              </div>
            </>
          )}

          {form.frequency === "Monthly" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Day of Month</label>
              <input type="number" min={1} max={28} value={form.monthly_start_day} onChange={e => set("monthly_start_day", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-slate-400 mt-1">Day 1–28 (use 1 for first of month, 15 for mid-month)</p>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={form.is_default} onChange={e => set("is_default", e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-xs font-medium text-slate-700">Set as default pay period</span>
          </label>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

function getNextPeriodDates(p) {
  if (!p.period_start_date && p.frequency !== "Monthly") return null;
  const today = new Date();
  if (p.frequency === "Monthly") {
    const day = p.monthly_start_day || 1;
    let start = new Date(today.getFullYear(), today.getMonth(), day);
    if (start > today) start = new Date(today.getFullYear(), today.getMonth() - 1, day);
    const end = addDays(addMonths(start, 1), -1);
    return { start, end };
  }
  const anchor = new Date(p.period_start_date + "T00:00:00");
  const weeks = p.frequency === "Fortnightly" ? 2 : 1;
  let current = anchor;
  while (current <= today) current = addWeeks(current, weeks);
  current = addWeeks(current, -weeks);
  if (addWeeks(current, weeks) <= today) current = addWeeks(current, weeks);
  return { start: current, end: addDays(addWeeks(current, weeks), -1) };
}

export default function PayPeriodsTab() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetch = async () => {
    const data = await base44.entities.PayPeriod.list("name");
    setPeriods(data); setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pay period?")) return;
    await base44.entities.PayPeriod.delete(id);
    setPeriods(p => p.filter(x => x.id !== id));
  };

  const freqColor = { Weekly: "bg-green-50 text-green-700", Fortnightly: "bg-blue-50 text-blue-700", Monthly: "bg-purple-50 text-purple-700" };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{periods.length} pay period{periods.length !== 1 ? "s" : ""} configured</p>
        <button onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Add Pay Period
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : periods.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No pay periods configured yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {periods.map(p => {
            const next = getNextPeriodDates(p);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                        {p.is_default && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${freqColor[p.frequency] || "bg-slate-100 text-slate-500"}`}>{p.frequency}</span>
                        {p.frequency !== "Monthly" && p.start_day && (
                          <span className="text-xs text-slate-500">Starts {p.start_day}</span>
                        )}
                        {p.frequency === "Monthly" && p.monthly_start_day && (
                          <span className="text-xs text-slate-500">Day {p.monthly_start_day} of month</span>
                        )}
                      </div>
                      {next && (
                        <p className="text-xs text-slate-400 mt-1">
                          Current period: <span className="font-medium text-slate-600">{format(next.start, "dd MMM")} – {format(next.end, "dd MMM yyyy")}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setModal(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <PayPeriodModal
          period={modal === "new" ? null : modal}
          onSave={() => { setModal(null); fetch(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}