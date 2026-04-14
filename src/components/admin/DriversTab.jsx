import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, User, Truck, Mail, CheckCircle } from "lucide-react";

const EMPTY = {
  full_name: "", employee_id: "", phone: "", email: "",
  licence_number: "", licence_class: "", fatigue_accreditation: "",
  assigned_vehicle_id: "", status: "Active", notes: ""
};

function DriverModal({ driver, vehicles, onSave, onClose }) {
  const [form, setForm] = useState(driver || EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (driver?.id) {
      await base44.entities.Driver.update(driver.id, form);
    } else {
      await base44.entities.Driver.create(form);
    }
    onSave();
  };

  const trucks = vehicles.filter(v => v.type === "Truck");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{driver?.id ? "Edit Driver" : "Add Driver"}</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
              <input value={form.full_name} onChange={e => set("full_name", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee ID</label>
              <input value={form.employee_id} onChange={e => set("employee_id", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input value={form.email} onChange={e => set("email", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Licence Number</label>
              <input value={form.licence_number} onChange={e => set("licence_number", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Licence Class</label>
              <input value={form.licence_class} onChange={e => set("licence_class", e.target.value)} placeholder="e.g. HC, MC"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Fatigue Accreditation</label>
              <select value={form.fatigue_accreditation} onChange={e => set("fatigue_accreditation", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                <option>Standard Hours</option>
                <option>BFM (Basic Fatigue Management)</option>
                <option>AFM (Advanced Fatigue Management)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Assign to Truck</label>
              <select value={form.assigned_vehicle_id} onChange={e => set("assigned_vehicle_id", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Unassigned</option>
                {trucks.map(v => <option key={v.id} value={v.id}>{v.registration}{v.make ? ` — ${v.make}` : ""}{v.model ? ` ${v.model}` : ""}</option>)}
              </select>
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
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Save Driver</button>
        </div>
        {/* App access note */}
        {form.email && !driver?.id && (
          <div className="px-5 pb-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              <strong>App Access:</strong> After saving, use the "Invite" button on the driver card to send a login invite to <span className="font-semibold">{form.email}</span>. They will log in as a driver (role: user) and only see the trip report form.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DriversTab() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [inviting, setInviting] = useState(null);
  const [invitedIds, setInvitedIds] = useState([]);

  const fetch = async () => {
    const [d, v] = await Promise.all([
      base44.entities.Driver.list("full_name"),
      base44.entities.Vehicle.list("registration"),
    ]);
    setDrivers(d); setVehicles(v); setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this driver?")) return;
    await base44.entities.Driver.delete(id);
    setDrivers(p => p.filter(d => d.id !== id));
  };

  const handleInvite = async (driver) => {
    if (!driver.email) { alert("This driver has no email address. Edit the driver and add an email first."); return; }
    setInviting(driver.id);
    await base44.users.inviteUser(driver.email, "user");
    setInvitedIds(p => [...p, driver.id]);
    setInviting(null);
  };

  const getVehicle = (id) => vehicles.find(v => v.id === id);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-slate-500">{drivers.length} driver{drivers.length !== 1 ? "s" : ""} registered</p>
        <button onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
        <strong>How driver access works:</strong> Add each driver with their email address, then click <strong>Invite</strong> to send them a login link. Drivers log in with role <em>user</em> and only see the trip report form. Admins see this dashboard.
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No drivers added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drivers.map(d => {
            const truck = d.assigned_vehicle_id ? getVehicle(d.assigned_vehicle_id) : null;
            return (
              <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{d.full_name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {d.employee_id && <span className="text-xs text-slate-400">ID: {d.employee_id}</span>}
                      {d.licence_class && <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{d.licence_class}</span>}
                      {truck ? (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <Truck className="w-3 h-3" />{truck.registration}
                        </span>
                      ) : <span className="text-xs text-slate-300">Unassigned</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === "Active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 items-center">
                  {invitedIds.includes(d.id) ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium px-2"><CheckCircle className="w-3.5 h-3.5" /> Invited</span>
                  ) : (
                    <button onClick={() => handleInvite(d)} disabled={inviting === d.id}
                      title={d.email ? `Invite ${d.email}` : "Add email to invite"}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${d.email ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-slate-300 bg-slate-50 cursor-not-allowed"}`}>
                      <Mail className="w-3.5 h-3.5" />
                      {inviting === d.id ? "..." : "Invite"}
                    </button>
                  )}
                  <button onClick={() => setModal(d)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <DriverModal
          driver={modal === "new" ? null : modal}
          vehicles={vehicles}
          onSave={() => { setModal(null); fetch(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}