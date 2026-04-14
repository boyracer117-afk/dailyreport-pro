import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, XCircle, Clock, FileText, User, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const statusColor = {
  Pending: "border-amber-200 bg-amber-50",
  Approved: "border-green-100 bg-green-50",
  Rejected: "border-red-100 bg-red-50",
};

function RequestCard({ req, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [acting, setActing] = useState(null);

  const handleAction = async (status) => {
    setActing(status);
    await onAction(req, status, adminNotes);
    setActing(null);
  };

  const isDoc = req.change_type === "document_upload";

  return (
    <div className={`rounded-xl border overflow-hidden ${statusColor[req.status]}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0">
              {isDoc ? <FileText className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-accent" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">{req.driver_name}</p>
              <p className="text-xs text-muted-foreground">
                {isDoc ? `${req.document_type} — ${req.document_filename || "file"}` : "Personal details update"}
              </p>
              {req.created_date && (
                <p className="text-xs text-muted-foreground opacity-70 mt-0.5">
                  {format(new Date(req.created_date), "dd MMM yyyy, h:mm a")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              req.status === "Pending" ? "bg-amber-100 text-amber-700" :
              req.status === "Approved" ? "bg-green-100 text-green-700" :
              "bg-red-100 text-red-600"
            }`}>{req.status}</span>
            <button onClick={() => setExpanded(x => !x)} className="p-1 text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Document link */}
        {isDoc && req.document_url && (
          <a href={req.document_url} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-xs text-primary font-medium hover:underline">
            <ExternalLink className="w-3.5 h-3.5" /> View / Download Document
          </a>
        )}
      </div>

      {expanded && (
        <div className="border-t border-current/10 bg-white/60 p-4 space-y-3">
          {/* Proposed changes for personal details */}
          {!isDoc && req.proposed_changes && (
            <div>
              <p className="text-xs font-semibold text-foreground/70 mb-2">Proposed Changes</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(req.proposed_changes).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="bg-white/80 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p>
                    <p className="text-xs font-semibold text-foreground">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {req.notes && (
            <div>
              <p className="text-xs font-semibold text-foreground/70 mb-1">Driver Notes</p>
              <p className="text-xs text-foreground/80 bg-white/80 rounded-lg px-3 py-2">{req.notes}</p>
            </div>
          )}

          {req.status === "Pending" && (
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">Admin Notes (optional)</label>
                <input value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Reason for approval or rejection..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction("Approved")} disabled={!!acting}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-semibold py-2.5 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {acting === "Approved" ? "Approving..." : "Approve"}
                </button>
                <button onClick={() => handleAction("Rejected")} disabled={!!acting}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-destructive hover:bg-destructive/90 disabled:opacity-60 text-destructive-foreground text-xs font-semibold py-2.5 rounded-lg">
                  <XCircle className="w-3.5 h-3.5" />
                  {acting === "Rejected" ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          )}

          {req.admin_notes && req.status !== "Pending" && (
            <div>
              <p className="text-xs font-semibold text-foreground/70 mb-1">Admin Notes</p>
              <p className="text-xs text-foreground/80 bg-white/80 rounded-lg px-3 py-2">{req.admin_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApprovalsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [drivers, setDrivers] = useState([]);

  const fetchAll = async () => {
    const [reqs, drvs] = await Promise.all([
      base44.entities.DriverChangeRequest.list("-created_date", 200),
      base44.entities.Driver.list("full_name"),
    ]);
    setRequests(reqs);
    setDrivers(drvs);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAction = async (req, status, adminNotes) => {
    await base44.entities.DriverChangeRequest.update(req.id, { status, admin_notes: adminNotes });

    // If approved and it's a personal details update — apply changes to the Driver record
    if (status === "Approved" && req.change_type === "personal_details" && req.proposed_changes) {
      await base44.entities.Driver.update(req.driver_id, req.proposed_changes);
    }

    fetchAll();
  };

  const filtered = requests.filter(r => filter === "All" || r.status === filter);
  const pendingCount = requests.filter(r => r.status === "Pending").length;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["Pending", "Approved", "Rejected", "All"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-primary/50"
            }`}>
            {f}
            {f === "Pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 bg-secondary/30 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {filter.toLowerCase()} requests.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <RequestCard key={r.id} req={r} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}