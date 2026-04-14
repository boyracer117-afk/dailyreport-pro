import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ReportForm from "@/components/ReportForm";
import ReportHistory from "@/components/ReportHistory";

export default function DailyReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("form");

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
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-slate-800">Daily Trip Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Record your daily vehicle & km details</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4">
        <div className="max-w-2xl mx-auto flex gap-0">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "form"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            New Report
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
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