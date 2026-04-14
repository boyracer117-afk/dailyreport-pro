import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const STANDARD_HOURS_RULES = [
  { period: "5½ hours", maxWork: "5¼ hrs work", minRest: "15 min continuous rest" },
  { period: "8 hours", maxWork: "7½ hrs work", minRest: "30 min rest (15 min blocks)" },
  { period: "11 hours", maxWork: "10 hrs work", minRest: "60 min rest (15 min blocks)" },
  { period: "24 hours", maxWork: "12 hrs work", minRest: "7 continuous hrs stationary rest" },
  { period: "7 days", maxWork: "72 hrs work", minRest: "24 continuous hrs stationary rest" },
  { period: "14 days", maxWork: "144 hrs work", minRest: "2× night rest breaks + 2× consecutive night rest breaks" },
];

const BFM_RULES = [
  { period: "6¼ hours", maxWork: "6 hrs work", minRest: "15 min continuous rest" },
  { period: "9 hours", maxWork: "8½ hrs work", minRest: "30 min rest (15 min blocks)" },
  { period: "12 hours", maxWork: "11 hrs work", minRest: "60 min rest (15 min blocks)" },
  { period: "24 hours", maxWork: "14 hrs work", minRest: "7 continuous hrs stationary rest" },
  { period: "7 days", maxWork: "36 hrs long/night work", minRest: "No limit set" },
  { period: "14 days", maxWork: "144 hrs work", minRest: "24 continuous hrs stationary rest (after ≤84 hrs work) + 2× consecutive night rest breaks" },
];

function RulesTable({ rules }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left px-3 py-2 text-slate-500 font-medium rounded-tl-lg">Period</th>
            <th className="text-left px-3 py-2 text-slate-500 font-medium">Max Work</th>
            <th className="text-left px-3 py-2 text-slate-500 font-medium rounded-tr-lg">Min Rest</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="px-3 py-2 font-semibold text-slate-700">{r.period}</td>
              <td className="px-3 py-2 text-red-600 font-medium">{r.maxWork}</td>
              <td className="px-3 py-2 text-green-700">{r.minRest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FatigueDeclaration({ value, onChange }) {
  const [showStandardRules, setShowStandardRules] = useState(false);
  const [showBfmRules, setShowBfmRules] = useState(false);

  const set = (field, val) => onChange({ ...value, [field]: val });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Fatigue Management Declaration
        </h2>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        As required under the <strong>Heavy Vehicle National Law (HVNL)</strong> and administered by the{" "}
        <a
          href="https://www.nhvr.gov.au/safety-accreditation-compliance/fatigue-management/work-and-rest-requirements"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          NHVR
        </a>
        , select your fatigue management option and declare compliance below.
      </p>

      {/* Option selector */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Fatigue Management Option</label>
        <div className="grid grid-cols-2 gap-2">
          {["Standard Hours", "BFM (Basic Fatigue Management)"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => set("option", opt)}
              className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                value.option === opt
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Show rules reference */}
      {value.option === "Standard Hours" && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowStandardRules(!showStandardRules)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span>Standard Hours – Work & Rest Limits (NHVR)</span>
            {showStandardRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showStandardRules && (
            <div className="p-2">
              <RulesTable rules={STANDARD_HOURS_RULES} />
              <p className="text-xs text-slate-400 mt-2 px-1">
                * Stationary rest = time out of vehicle or in approved sleeper berth of stationary vehicle.
                Night rest break = 7 continuous hrs between 10pm–8am (driver's base timezone).
              </p>
            </div>
          )}
        </div>
      )}

      {value.option === "BFM (Basic Fatigue Management)" && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowBfmRules(!showBfmRules)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span>BFM – Work & Rest Limits (NHVR)</span>
            {showBfmRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showBfmRules && (
            <div className="p-2">
              <RulesTable rules={BFM_RULES} />
              <p className="text-xs text-slate-400 mt-2 px-1">
                * BFM accreditation required under the National Heavy Vehicle Accreditation Scheme (NHVAS).
                Long/night work = work outside 6am–10pm driver base timezone.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Driver type */}
      {value.option && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Driver Type</label>
          <div className="grid grid-cols-2 gap-2">
            {["Solo", "Two-up"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set("driver_type", type)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  value.driver_type === type
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                {type} Driver
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rest breaks taken */}
      {value.option && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Rest Breaks Taken Today</label>
          <input
            type="text"
            value={value.rest_breaks || ""}
            onChange={(e) => set("rest_breaks", e.target.value)}
            placeholder="e.g. 30 min @ 10:30, 15 min @ 14:00"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Declaration checkbox */}
      {value.option && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Driver Declaration</strong> — I declare that I have not exceeded the maximum work hours
              or minimum rest requirements for my selected fatigue management option under the{" "}
              <strong>Heavy Vehicle National Law (HVNL)</strong>. I was not impaired by fatigue during today's shift.
            </p>
          </div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={value.declared || false}
              onChange={(e) => set("declared", e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-xs font-medium text-amber-900">
              I confirm the above declaration is true and correct.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}