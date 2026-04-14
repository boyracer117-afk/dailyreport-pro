import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";
import FatigueDeclaration from "@/components/FatigueDeclaration";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDayFromDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function calcTotalKm(startKm, finishKm) {
  const s = parseFloat(startKm);
  const f = parseFloat(finishKm);
  if (!isNaN(s) && !isNaN(f) && f >= s) return f - s;
  return null;
}

const defaultFatigue = {
  option: "",
  driver_type: "",
  rest_breaks: "",
  declared: false,
};

export default function ReportForm({ onSaved }) {
  const today = format(new Date(), "yyyy-MM-dd");

  const [form, setForm] = useState({
    date: today,
    day: getDayFromDate(today),
    truck_registration: "",
    trailer_1_registration: "",
    trailer_2_registration: "",
    start_km: "",
    start_time: "",
    finish_km: "",
    finish_time: "",
    notes: "",
  });

  const [fatigue, setFatigue] = useState(defaultFatigue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "date") updated.day = getDayFromDate(value);
      return updated;
    });
  };

  const totalKm = calcTotalKm(form.start_km, form.finish_km);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      start_km: form.start_km !== "" ? parseFloat(form.start_km) : undefined,
      finish_km: form.finish_km !== "" ? parseFloat(form.finish_km) : undefined,
      total_km: totalKm !== null ? totalKm : undefined,
      fatigue_option: fatigue.option || undefined,
      fatigue_driver_type: fatigue.driver_type || undefined,
      fatigue_rest_breaks: fatigue.rest_breaks || undefined,
      fatigue_declared: fatigue.declared,
    };
    await base44.entities.DailyReport.create(payload);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved();
    setForm((prev) => ({
      date: prev.date,
      day: prev.day,
      truck_registration: "",
      trailer_1_registration: "",
      trailer_2_registration: "",
      start_km: "",
      start_time: "",
      finish_km: "",
      finish_time: "",
      notes: "",
    }));
    setFatigue(defaultFatigue);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date & Day */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Day</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Day</label>
            <select
              value={form.day}
              onChange={(e) => set("day", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Registrations */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Registrations</h2>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Truck Registration</label>
          <input
            type="text"
            value={form.truck_registration}
            onChange={(e) => set("truck_registration", e.target.value.toUpperCase())}
            placeholder="e.g. ABC 123"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase placeholder:normal-case"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Trailer 1 Registration</label>
            <input
              type="text"
              value={form.trailer_1_registration}
              onChange={(e) => set("trailer_1_registration", e.target.value.toUpperCase())}
              placeholder="e.g. TR 001"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase placeholder:normal-case"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Trailer 2 Registration</label>
            <input
              type="text"
              value={form.trailer_2_registration}
              onChange={(e) => set("trailer_2_registration", e.target.value.toUpperCase())}
              placeholder="e.g. TR 002"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase placeholder:normal-case"
            />
          </div>
        </div>
      </div>

      {/* KM & Time */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kilometres & Time</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start KM</label>
            <input
              type="number"
              value={form.start_km}
              onChange={(e) => set("start_km", e.target.value)}
              placeholder="e.g. 125400"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => set("start_time", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Finish KM</label>
            <input
              type="number"
              value={form.finish_km}
              onChange={(e) => set("finish_km", e.target.value)}
              placeholder="e.g. 125680"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Finish Time</label>
            <input
              type="time"
              value={form.finish_time}
              onChange={(e) => set("finish_time", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${totalKm !== null ? "bg-blue-50 border border-blue-100" : "bg-slate-50 border border-slate-100"}`}>
          <span className="text-sm font-medium text-slate-600">Total KM Travelled</span>
          <span className={`text-lg font-bold ${totalKm !== null ? "text-blue-600" : "text-slate-300"}`}>
            {totalKm !== null ? `${totalKm.toLocaleString()} km` : "—"}
          </span>
        </div>
      </div>

      {/* Fatigue Declaration */}
      <FatigueDeclaration value={fatigue} onChange={setFatigue} />

      {/* Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Any additional notes..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
      >
        {saving ? "Saving..." : "Submit Report"}
      </button>

      {saved && (
        <div className="flex items-center gap-2 justify-center text-green-600 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Report saved successfully!
        </div>
      )}
    </form>
  );
}