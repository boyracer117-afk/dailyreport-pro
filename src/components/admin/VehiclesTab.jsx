import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";

const EMPTY = { registration: "", type: "Truck", make: "", model: "", year: "", combination_group: "", status: "Active", notes: "" };

function VehicleModal({ vehicle, onSave, onClose }) {
  const [form, setForm] = useState(vehicle || EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const payload = { ...form, year: form.year !== "" ? parseInt(form.year) : undefined };
    if (vehicle?.id) {
      await base44.entities.Vehicle.update(vehicle.id, payload);
    } else {
      await base44.entities.Vehicle.create(payload);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{vehicle?.id ? "Edit Vehicle" : "Add Vehicle"}</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Registration *</label>
              <input value={form.registration} onChange={e => set("registration", e.target.value.toUpperCase())}
                placeholder="e.g. ABC 123"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Truck</option><option>Trailer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Make</label>
              <input value={form.make} onChange={e => set("make", e.target.value)} placeholder="e.g. Kenworth"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
              <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. T909"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => set("year", e.target.value)} placeholder="e.g. 2020"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Active</option><option>In Service</option><option>Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Combination Group</label>
              <input value={form.combination_group} onChange={e => set("combination_group", e.target.value)}
                placeholder="e.g. Combo A — groups truck + trailers"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Save Vehicle</button>
        </div>
      </div>
    </div>
  );
}

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetch = async () => {
    const data = await base44.entities.Vehicle.list("type");
    setVehicles(data); setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    await base44.entities.Vehicle.delete(id);
    setVehicles(p => p.filter(v => v.id !== id));
  };

  const trucks = vehicles.filter(v => v.type === "Truck");
  const trailers = vehicles.filter(v => v.type === "Trailer");

  // Group trailers by combination_group
  const combos = {};
  vehicles.forEach(v => {
    if (v.combination_group) {
      if (!combos[v.combination_group]) combos[v.combination_group] = [];
      combos[v.combination_group].push(v);
    }
  });

  const statusColor = { Active: "bg-green-50 text-green-700", "In Service": "bg-amber-50 text-amber-700", Inactive: "bg-slate-100 text-slate-500" };

  const VehicleCard = ({ v }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${v.type === "Truck" ? "bg-blue-100" : "bg-slate-100"}`}>
          <Truck className={`w-4 h-4 ${v.type === "Truck" ? "text-blue-600" : "text-slate-500"}`} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{v.registration}</p>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">{[v.year, v.make, v.model].filter(Boolean).join(" ")}</span>
            {v.combination_group && <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">{v.combination_group}</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[v.status] || "bg-slate-100 text-slate-500"}`}>{v.status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => setModal(v)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(v.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{trucks.length} truck{trucks.length !== 1 ? "s" : ""}, {trailers.length} trailer{trailers.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No vehicles added yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {trucks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trucks</h3>
              <div className="space-y-2">{trucks.map(v => <VehicleCard key={v.id} v={v} />)}</div>
            </div>
          )}
          {trailers.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trailers</h3>
              <div className="space-y-2">{trailers.map(v => <VehicleCard key={v.id} v={v} />)}</div>
            </div>
          )}
          {Object.keys(combos).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Combinations</h3>
              <div className="space-y-2">
                {Object.entries(combos).map(([group, items]) => (
                  <div key={group} className="bg-white rounded-xl border border-purple-100 p-3">
                    <p className="text-xs font-semibold text-purple-700 mb-2">{group}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map(v => (
                        <span key={v.id} className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${v.type === "Truck" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {v.registration} <span className="opacity-60">({v.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <VehicleModal
          vehicle={modal === "new" ? null : modal}
          onSave={() => { setModal(null); fetch(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}