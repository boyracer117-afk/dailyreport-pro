import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";

const EMPTY = {
  driver_id: "", driver_name: "", pay_type: "Per KM", rate: "",
  overtime_rate: "", ordinary_hours: 8,
  meal_allowance_per_day: 33.15,
  overnight_allowance_per_night: 98.95,
  tool_allowance_per_week: "",
  other_allowance_label: "", other_allowance_per_day: "",
  superannuation_rate: 11.5, notes: ""
};

// ATA / RTBU industry standard allowances (ATO 2024-25 reasonable amounts)
const INDUSTRY_DEFAULTS = {
  meal_allowance_per_day: 33.15,
  overnight_allowance_per_night: 98.95,
};

function PayRateModal({ rate, drivers, onSave, onClose }) {
  const [form, setForm] = useState(rate || EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleDriverChange = (id) => {
    const d = drivers.find(x => x.id === id);
    set("driver_id", id);
    set("driver_name", d ? d.full_name : "");
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      rate: parseFloat(form.rate) || 0,
      overtime_rate: form.overtime_rate !== "" ? parseFloat(form.overtime_rate) : undefined,
      ordinary_hours: parseFloat(form.ordinary_hours) || 8,
      meal_allowance_per_day: parseFloat(form.meal_allowance_per_day) || 0,
      overnight_allowance_per_night: parseFloat(form.overnight_allowance_per_night) || 0,
      tool_allowance_per_week: form.tool_allowance_per_week !== "" ? parseFloat(form.tool_allowance_per_week) : undefined,
      other_allowance_per_day: form.other_allowance_per_day !== "" ? parseFloat(form.other_allowance_per_day) : undefined,
      superannuation_rate: parseFloat(form.superannuation_rate) || 11.5,
    };
    if (rate?.id) {
      await base44.entities.DriverPayRate.update(rate.id, payload);
    } else {
      await base44.entities.DriverPayRate.create(payload);
    }
    onSave();
  };

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{rate?.id ? "Edit Pay Rate" : "Set Driver Pay Rate"}</h3>
        </div>
        <div className="p-5 space-y-4">

          {/* Driver */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Driver *</label>
            <select value={form.driver_id} onChange={e => handleDriverChange(e.target.value)} className={inp}>
              <option value="">Select driver...</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>

          {/* Pay type */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Pay Basis *</label>
            <div className="grid grid-cols-2 gap-2">
              {["Per KM", "Hourly"].map(t => (
                <button key={t} type="button" onClick={() => set("pay_type", t)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${form.pay_type === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"}`}>
                  {t === "Per KM" ? "$ Per KM" : "$ Per Hour"}
                </button>
              ))}
            </div>
          </div>

          {/* Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {form.pay_type === "Per KM" ? "Rate ($/km) *" : "Ordinary Rate ($/hr) *"}
              </label>
              <input type="number" step="0.01" value={form.rate} onChange={e => set("rate", e.target.value)} placeholder="e.g. 0.85" className={inp} />
            </div>
            {form.pay_type === "Hourly" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Overtime Rate ($/hr)</label>
                <input type="number" step="0.01" value={form.overtime_rate} onChange={e => set("overtime_rate", e.target.value)} placeholder="e.g. 45.00" className={inp} />
              </div>
            )}
            {form.pay_type === "Hourly" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ordinary Hours/Day</label>
                <input type="number" step="0.5" value={form.ordinary_hours} onChange={e => set("ordinary_hours", e.target.value)} className={inp} />
              </div>
            )}
          </div>

          {/* Allowances */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Allowances</p>
              <button type="button" onClick={() => { set("meal_allowance_per_day", INDUSTRY_DEFAULTS.meal_allowance_per_day); set("overnight_allowance_per_night", INDUSTRY_DEFAULTS.overnight_allowance_per_night); }}
                className="text-xs text-amber-700 underline">Use ATO 2024-25 rates</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Meal Allowance ($/day)</label>
                <input type="number" step="0.01" value={form.meal_allowance_per_day} onChange={e => set("meal_allowance_per_day", e.target.value)} placeholder="33.15" className={inp} />
                <p className="text-xs text-slate-400 mt-0.5">ATO std: $33.15</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Overnight Allowance ($/night)</label>
                <input type="number" step="0.01" value={form.overnight_allowance_per_night} onChange={e => set("overnight_allowance_per_night", e.target.value)} placeholder="98.95" className={inp} />
                <p className="text-xs text-slate-400 mt-0.5">ATO std: $98.95</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tool/Uniform Allow. ($/week)</label>
                <input type="number" step="0.01" value={form.tool_allowance_per_week} onChange={e => set("tool_allowance_per_week", e.target.value)} placeholder="Optional" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Other Allow. Label</label>
                <input value={form.other_allowance_label} onChange={e => set("other_allowance_label", e.target.value)} placeholder="e.g. Dirt Loading" className={inp} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Other Allowance ($/day)</label>
                <input type="number" step="0.01" value={form.other_allowance_per_day} onChange={e => set("other_allowance_per_day", e.target.value)} placeholder="Optional" className={inp} />
              </div>
            </div>
          </div>

          {/* Super */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Superannuation Rate (%)</label>
            <input type="number" step="0.1" value={form.superannuation_rate} onChange={e => set("superannuation_rate", e.target.value)} className={inp} />
            <p className="text-xs text-slate-400 mt-0.5">Current statutory rate: 11.5% (2024-25)</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} className={`${inp} resize-none`} />
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Save Rate</button>
        </div>
      </div>
    </div>
  );
}

export default function PayRatesTab() {
  const [rates, setRates] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetch = async () => {
    const [r, d] = await Promise.all([
      base44.entities.DriverPayRate.list("driver_name"),
      base44.entities.Driver.list("full_name"),
    ]);
    setRates(r); setDrivers(d); setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pay rate?")) return;
    await base44.entities.DriverPayRate.delete(id);
    setRates(p => p.filter(r => r.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{rates.length} rate{rates.length !== 1 ? "s" : ""} configured</p>
        <button onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Set Pay Rate
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : rates.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No pay rates configured. Add a rate for each driver.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rates.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800 text-sm">{r.driver_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.pay_type === "Per KM" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                      {r.pay_type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {r.pay_type === "Per KM" ? `$${r.rate?.toFixed(3)}/km` : `$${r.rate?.toFixed(2)}/hr`}
                    </span>
                    {r.pay_type === "Hourly" && r.overtime_rate && (
                      <span>OT: ${r.overtime_rate?.toFixed(2)}/hr</span>
                    )}
                    {r.meal_allowance_per_day > 0 && <span>Meal: ${r.meal_allowance_per_day}/day</span>}
                    {r.overnight_allowance_per_night > 0 && <span>Overnight: ${r.overnight_allowance_per_night}/night</span>}
                    {r.tool_allowance_per_week > 0 && <span>Tools: ${r.tool_allowance_per_week}/wk</span>}
                    {r.superannuation_rate && <span className="text-slate-400">Super: {r.superannuation_rate}%</span>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setModal(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <PayRateModal
          rate={modal === "new" ? null : modal}
          drivers={drivers}
          onSave={() => { setModal(null); fetch(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}