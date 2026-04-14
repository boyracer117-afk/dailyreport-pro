import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { Calculator, CheckCircle, DollarSign, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react";

function calcHours(startTime, finishTime) {
  if (!startTime || !finishTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [fh, fm] = finishTime.split(":").map(Number);
  let mins = (fh * 60 + fm) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60; // overnight
  return mins / 60;
}

function generatePayRun(reports, payRate, periodStart, periodEnd) {
  const filtered = reports.filter(r => r.date >= periodStart && r.date <= periodEnd);
  if (filtered.length === 0) return null;

  const daysWorked = filtered.length;
  const totalKm = filtered.reduce((s, r) => s + (r.total_km || 0), 0);
  const totalHoursRaw = filtered.reduce((s, r) => s + calcHours(r.start_time, r.finish_time), 0);

  let basePay = 0;
  let ordinaryHours = 0;
  let overtimeHours = 0;
  let overtimePay = 0;

  if (payRate.pay_type === "Per KM") {
    basePay = totalKm * (payRate.rate || 0);
  } else {
    const ordPerDay = payRate.ordinary_hours || 8;
    filtered.forEach(r => {
      const h = calcHours(r.start_time, r.finish_time);
      const ord = Math.min(h, ordPerDay);
      const ot = Math.max(0, h - ordPerDay);
      ordinaryHours += ord;
      overtimeHours += ot;
    });
    basePay = ordinaryHours * (payRate.rate || 0);
    overtimePay = overtimeHours * (payRate.overtime_rate || payRate.rate * 1.5 || 0);
  }

  const weeks = daysWorked / 5;
  const mealAllow = daysWorked * (payRate.meal_allowance_per_day || 0);
  const overnightAllow = 0; // would need overnight flag on report — set to 0 by default
  const toolAllow = weeks * (payRate.tool_allowance_per_week || 0);
  const otherAllow = daysWorked * (payRate.other_allowance_per_day || 0);

  const grossPay = basePay + overtimePay + mealAllow + overnightAllow + toolAllow + otherAllow;
  const superAmount = (basePay + overtimePay) * ((payRate.superannuation_rate || 11.5) / 100);

  return {
    driver_id: payRate.driver_id,
    driver_name: payRate.driver_name,
    period_start: periodStart,
    period_end: periodEnd,
    total_km: Math.round(totalKm),
    total_hours: Math.round(totalHoursRaw * 100) / 100,
    ordinary_hours: Math.round(ordinaryHours * 100) / 100,
    overtime_hours: Math.round(overtimeHours * 100) / 100,
    days_worked: daysWorked,
    base_pay: Math.round(basePay * 100) / 100,
    overtime_pay: Math.round(overtimePay * 100) / 100,
    meal_allowance: Math.round(mealAllow * 100) / 100,
    overnight_allowance: 0,
    tool_allowance: Math.round(toolAllow * 100) / 100,
    other_allowance: Math.round(otherAllow * 100) / 100,
    gross_pay: Math.round(grossPay * 100) / 100,
    superannuation: Math.round(superAmount * 100) / 100,
    status: "Draft",
  };
}

function fmt(n) { return n != null ? `$${Number(n).toFixed(2)}` : "—"; }

function PayRunCard({ run, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = { Draft: "bg-slate-100 text-slate-600", Approved: "bg-blue-50 text-blue-700", Paid: "bg-green-50 text-green-700" };
  const nextStatus = { Draft: "Approved", Approved: "Paid" };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-semibold text-slate-800 text-sm">{run.driver_name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[run.status]}`}>{run.status}</span>
            </div>
            <p className="text-xs text-slate-500">
              {run.period_start ? format(parseISO(run.period_start), "dd MMM") : ""} – {run.period_end ? format(parseISO(run.period_end), "dd MMM yyyy") : ""}
              {" · "}{run.days_worked} day{run.days_worked !== 1 ? "s" : ""}
              {run.total_km > 0 && ` · ${run.total_km?.toLocaleString()} km`}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-slate-800">{fmt(run.gross_pay)}</p>
            <p className="text-xs text-slate-400">+ {fmt(run.superannuation)} super</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <button onClick={() => setExpanded(x => !x)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Hide" : "Show"} breakdown
          </button>
          <div className="flex gap-2">
            {nextStatus[run.status] && (
              <button onClick={() => onStatusChange(run, nextStatus[run.status])}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium">
                Mark {nextStatus[run.status]}
              </button>
            )}
            <button onClick={() => onDelete(run.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 mb-0.5">Base Pay</p>
              <p className="font-semibold text-slate-700">{fmt(run.base_pay)}</p>
              {run.total_km > 0 && <p className="text-slate-400">{run.total_km?.toLocaleString()} km</p>}
              {run.ordinary_hours > 0 && <p className="text-slate-400">{run.ordinary_hours} ord. hrs</p>}
            </div>
            {run.overtime_pay > 0 && (
              <div>
                <p className="text-slate-400 mb-0.5">Overtime</p>
                <p className="font-semibold text-slate-700">{fmt(run.overtime_pay)}</p>
                <p className="text-slate-400">{run.overtime_hours} hrs</p>
              </div>
            )}
            {run.meal_allowance > 0 && (
              <div>
                <p className="text-slate-400 mb-0.5">Meal Allowance</p>
                <p className="font-semibold text-slate-700">{fmt(run.meal_allowance)}</p>
              </div>
            )}
            {run.overnight_allowance > 0 && (
              <div>
                <p className="text-slate-400 mb-0.5">Overnight Allow.</p>
                <p className="font-semibold text-slate-700">{fmt(run.overnight_allowance)}</p>
              </div>
            )}
            {run.tool_allowance > 0 && (
              <div>
                <p className="text-slate-400 mb-0.5">Tool/Uniform Allow.</p>
                <p className="font-semibold text-slate-700">{fmt(run.tool_allowance)}</p>
              </div>
            )}
            {run.other_allowance > 0 && (
              <div>
                <p className="text-slate-400 mb-0.5">Other Allowance</p>
                <p className="font-semibold text-slate-700">{fmt(run.other_allowance)}</p>
              </div>
            )}
            <div className="col-span-2 border-t border-slate-200 pt-2 mt-1 flex justify-between">
              <span className="font-semibold text-slate-700">Gross Pay</span>
              <span className="font-bold text-slate-800">{fmt(run.gross_pay)}</span>
            </div>
            <div className="col-span-2 flex justify-between text-slate-500">
              <span>Superannuation ({run.superannuation_rate || "11.5"}%)</span>
              <span>{fmt(run.superannuation)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PayrollTab() {
  const [payRuns, setPayRuns] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [payRates, setPayRates] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Generate form
  const [genDriverId, setGenDriverId] = useState("");
  const [genStart, setGenStart] = useState("");
  const [genEnd, setGenEnd] = useState("");
  const [genError, setGenError] = useState("");

  const fetchAll = async () => {
    const [pr, d, rates, rep] = await Promise.all([
      base44.entities.PayRun.list("-period_start", 100),
      base44.entities.Driver.list("full_name"),
      base44.entities.DriverPayRate.list("driver_name"),
      base44.entities.DailyReport.list("-date", 500),
    ]);
    setPayRuns(pr); setDrivers(d); setPayRates(rates); setReports(rep);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleGenerate = async () => {
    setGenError("");
    if (!genDriverId || !genStart || !genEnd) { setGenError("Please select a driver and date range."); return; }
    const rate = payRates.find(r => r.driver_id === genDriverId);
    if (!rate) { setGenError("No pay rate found for this driver. Please configure one in Pay Rates first."); return; }

    const driverReports = reports.filter(r => r.created_by && r.created_by === drivers.find(d => d.id === genDriverId)?.email);
    // fallback: match by truck assignment if email not matching
    const allReports = driverReports.length > 0 ? driverReports : reports;

    setGenerating(true);
    const run = generatePayRun(allReports, rate, genStart, genEnd);
    if (!run) { setGenError("No trip reports found for this driver in the selected period."); setGenerating(false); return; }

    await base44.entities.PayRun.create(run);
    await fetchAll();
    setGenerating(false);
    setGenDriverId(""); setGenStart(""); setGenEnd("");
  };

  const handleStatusChange = async (run, newStatus) => {
    await base44.entities.PayRun.update(run.id, { status: newStatus });
    setPayRuns(prev => prev.map(r => r.id === run.id ? { ...r, status: newStatus } : r));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pay run?")) return;
    await base44.entities.PayRun.delete(id);
    setPayRuns(prev => prev.filter(r => r.id !== id));
  };

  const totalGross = payRuns.filter(r => r.status !== "Draft").reduce((s, r) => s + (r.gross_pay || 0), 0);
  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Total Pay Runs</p>
          <p className="text-2xl font-bold text-blue-700">{payRuns.length}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Approved + Paid</p>
          <p className="text-2xl font-bold text-green-700">{fmt(totalGross)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium mb-1">Draft Runs</p>
          <p className="text-2xl font-bold text-amber-700">{payRuns.filter(r => r.status === "Draft").length}</p>
        </div>
      </div>

      {/* Generate pay run */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Generate Pay Run</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Driver</label>
            <select value={genDriverId} onChange={e => setGenDriverId(e.target.value)} className={inp}>
              <option value="">Select driver...</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Period Start</label>
            <input type="date" value={genStart} onChange={e => setGenStart(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Period End</label>
            <input type="date" value={genEnd} onChange={e => setGenEnd(e.target.value)} className={inp} />
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg">
              {generating ? "Calculating..." : "Generate"}
            </button>
          </div>
        </div>
        {genError && <p className="text-xs text-red-500 mt-2">{genError}</p>}
        {payRates.length === 0 && (
          <p className="text-xs text-amber-600 mt-2">⚠ No pay rates configured yet — go to the Pay Rates tab first.</p>
        )}
      </div>

      {/* Pay runs list */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : payRuns.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No pay runs yet. Generate one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pay Runs</p>
          {payRuns.map(run => (
            <PayRunCard key={run.id} run={run} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}