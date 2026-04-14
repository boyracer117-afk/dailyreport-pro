import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ReportForm from "@/components/ReportForm";
import ReportHistory from "@/components/ReportHistory";

export default function DailyReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("form");
  const { user, logout } = useAuth();

  const fetchReports = async () => {
    const data = await base44.entities.DailyReport.list("-date", 50);
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header */}
      <div className="bg-foreground border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary tracking-wide" style={{fontFamily:"var(--font-rajdhani)"}}>Kiwik Cartage</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.full_name || "Driver"} · Daily Trip Report</p>
          </div>
          <button onClick={() => logout()} className="text-xs text-muted-foreground hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10">Log out</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border px-4">
        <div className="max-w-2xl mx-auto flex gap-0">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "form"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            New Report
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "form" ? (
          <ReportForm onSaved={fetchReports} />
        ) : (
          <ReportHistory reports={reports} loading={loading} onDeleted={fetchReports} />
        )}
      </div>
    </div>
  );
}