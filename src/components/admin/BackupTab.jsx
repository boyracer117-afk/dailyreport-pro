import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Mail, CheckCircle, Database, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function BackupTab() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleBackup = async () => {
    setError("");
    setResult(null);
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    const res = await base44.functions.invoke("sendBackup", { email });
    setSending(false);
    if (res.data?.success) {
      setResult(res.data);
    } else {
      setError(res.data?.error || "Backup failed. Please try again.");
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Full Database Backup</h2>
            <p className="text-xs text-slate-500">Exports all records and emails them as a JSON file</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-4 text-xs text-slate-600 space-y-1">
          <p className="font-medium text-slate-700 mb-1">What's included:</p>
          <p>• All daily trip reports</p>
          <p>• Drivers & vehicles</p>
          <p>• Pay runs, pay rates & pay periods</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Send backup to email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleBackup}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            {sending ? "Generating & Sending Backup..." : "Send Backup Now"}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                <CheckCircle className="w-4 h-4" />
                Backup sent to {result.email}
              </div>
              <p className="text-xs text-green-600">
                Exported at {format(new Date(result.exported_at), "dd MMM yyyy, h:mm a")}
              </p>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {Object.entries(result.counts).map(([k, v]) => (
                  <p key={k} className="text-xs text-green-700">
                    <span className="font-medium">{v}</span>{" "}
                    <span className="opacity-70">{k.replace(/_/g, " ")}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 space-y-1">
        <p className="font-semibold mb-1">How to save to your external drive</p>
        <p>1. Check your email for the backup message.</p>
        <p>2. Copy the JSON content from the email body.</p>
        <p>3. Paste it into a text editor and save as <strong>backup-date.json</strong>.</p>
        <p>4. Move the file to your external hard drive or USB.</p>
      </div>
    </div>
  );
}