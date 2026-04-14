import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { User, Upload, CheckCircle, Clock, XCircle, FileText, Image, ChevronLeft } from "lucide-react";

const FIELD_LABELS = {
  phone: "Phone",
  email: "Email",
  licence_number: "Licence Number",
  licence_class: "Licence Class",
  fatigue_accreditation: "Fatigue Accreditation",
};

const DOC_TYPES = ["Licence", "Medical Certificate", "BFM Certificate", "AFM Certificate", "Other"];

const statusIcon = { Pending: Clock, Approved: CheckCircle, Rejected: XCircle };
const statusColor = {
  Pending: "text-amber-600 bg-amber-50 border-amber-100",
  Approved: "text-green-700 bg-green-50 border-green-100",
  Rejected: "text-red-600 bg-red-50 border-red-100",
};

export default function DriverProfile({ onBack }) {
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  // Details form
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [detailsSent, setDetailsSent] = useState(false);

  // Document upload
  const [docType, setDocType] = useState("Licence");
  const [docFile, setDocFile] = useState(null);
  const [docNotes, setDocNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSent, setUploadSent] = useState(false);

  const fetchData = async () => {
    // Find the driver record matching the current user email
    const drivers = await base44.entities.Driver.filter({ email: user.email });
    const d = drivers[0] || null;
    setDriver(d);
    if (d) {
      setForm({
        phone: d.phone || "",
        email: d.email || "",
        licence_number: d.licence_number || "",
        licence_class: d.licence_class || "",
        fatigue_accreditation: d.fatigue_accreditation || "",
      });
      const reqs = await base44.entities.DriverChangeRequest.filter({ driver_id: d.id }, "-created_date", 50);
      setRequests(reqs);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user.email]);

  const handleSubmitDetails = async () => {
    if (!driver) return;
    setSaving(true);
    await base44.entities.DriverChangeRequest.create({
      driver_id: driver.id,
      driver_name: driver.full_name,
      driver_email: driver.email,
      change_type: "personal_details",
      proposed_changes: form,
      status: "Pending",
    });
    setSaving(false);
    setDetailsSent(true);
    fetchData();
    setTimeout(() => setDetailsSent(false), 4000);
  };

  const handleUpload = async () => {
    if (!docFile || !driver) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: docFile });
    await base44.entities.DriverChangeRequest.create({
      driver_id: driver.id,
      driver_name: driver.full_name,
      driver_email: driver.email,
      change_type: "document_upload",
      document_type: docType,
      document_url: file_url,
      document_filename: docFile.name,
      notes: docNotes,
      status: "Pending",
    });
    setUploading(false);
    setUploadSent(true);
    setDocFile(null);
    setDocNotes("");
    fetchData();
    setTimeout(() => setUploadSent(false), 4000);
  };

  const inp = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary";

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!driver) return (
    <div className="text-center py-16 text-muted-foreground">
      <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Your driver profile hasn't been set up yet. Contact your administrator.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {[
            { id: "details", label: "Update Details" },
            { id: "documents", label: "Upload Documents" },
            { id: "history", label: `Requests (${requests.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Details Tab ── */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Changes will be sent to admin for approval before updating your profile.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(FIELD_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-foreground/70 mb-1">{label}</label>
                    {key === "fatigue_accreditation" ? (
                      <select value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className={inp}>
                        <option value="">Select...</option>
                        <option>Standard Hours</option>
                        <option>BFM (Basic Fatigue Management)</option>
                        <option>AFM (Advanced Fatigue Management)</option>
                      </select>
                    ) : (
                      <input value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className={inp} />
                    )}
                  </div>
                ))}
              </div>

              {detailsSent ? (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  <CheckCircle className="w-4 h-4" /> Request submitted — waiting for admin approval.
                </div>
              ) : (
                <button onClick={handleSubmitDetails} disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-sm font-medium py-2.5 rounded-lg">
                  {saving ? "Submitting..." : "Submit for Approval"}
                </button>
              )}
            </div>
          )}

          {/* ── Documents Tab ── */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Upload PDFs, images of your licence, medical certificates or accreditation documents. Admin will review and approve.</p>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">Document Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DOC_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setDocType(t)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left ${
                        docType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/20 text-foreground/70 hover:border-primary/50"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">File (PDF, JPG, PNG)</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  {docFile ? (
                    <span className="text-xs text-primary font-medium">{docFile.name}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Click to choose file</span>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={e => setDocFile(e.target.files[0] || null)} />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">Notes (optional)</label>
                <input value={docNotes} onChange={e => setDocNotes(e.target.value)}
                  placeholder="e.g. New licence expiry date, renewal etc." className={inp} />
              </div>

              {uploadSent ? (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  <CheckCircle className="w-4 h-4" /> Document uploaded — waiting for admin approval.
                </div>
              ) : (
                <button onClick={handleUpload} disabled={uploading || !docFile}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Document"}
                </button>
              )}
            </div>
          )}

          {/* ── History Tab ── */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {requests.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No requests submitted yet.</p>
                </div>
              ) : requests.map(r => {
                const Icon = statusIcon[r.status] || Clock;
                return (
                  <div key={r.id} className={`rounded-xl border p-4 ${statusColor[r.status]}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold">
                            {r.change_type === "document_upload" ? `${r.document_type} upload` : "Personal details update"}
                          </p>
                          {r.document_filename && <p className="text-xs opacity-70">{r.document_filename}</p>}
                          {r.change_type === "personal_details" && r.proposed_changes && (
                            <p className="text-xs opacity-70 mt-0.5">
                              Fields: {Object.keys(r.proposed_changes).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold flex-shrink-0">{r.status}</span>
                    </div>
                    {r.admin_notes && (
                      <p className="text-xs mt-2 pt-2 border-t border-current/20 opacity-80">Admin: {r.admin_notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}