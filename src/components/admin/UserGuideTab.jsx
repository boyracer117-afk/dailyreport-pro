import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronUp, Truck, User, DollarSign,
  Calendar, FileText, HardDrive, ShieldCheck, BarChart2, Mail, LogIn
} from "lucide-react";

const sections = [
  {
    id: "overview",
    icon: BookOpen,
    title: "Overview",
    color: "blue",
    content: [
      {
        heading: "What is Daily Trip Report?",
        body: `Daily Trip Report is a fleet management and payroll system for transport businesses. It has two separate areas:

• Driver View — where drivers submit their daily trip details, KM readings, and fatigue declarations.
• Admin Dashboard — where administrators manage drivers, vehicles, pay periods, pay rates, payroll, and view all submitted reports.`
      },
      {
        heading: "Who uses what?",
        body: `Admins (role: admin) are redirected to the Admin Dashboard automatically on login.

Drivers (role: user) are redirected to the Driver trip report form automatically on login.

Neither role can access the other's area.`
      }
    ]
  },
  {
    id: "drivers",
    icon: User,
    title: "Managing Drivers",
    color: "indigo",
    content: [
      {
        heading: "Adding a new driver",
        body: `1. Go to Admin Dashboard → Drivers tab.
2. Click "Add Driver".
3. Fill in the driver's details — name, employee ID, phone, email, licence number, licence class, and fatigue accreditation.
4. Assign them to a truck if applicable.
5. Click "Save Driver".`
      },
      {
        heading: "Inviting a driver to log in",
        body: `After saving a driver with their email address:
1. Click the "Invite" button on their driver card.
2. They will receive an email with a login link.
3. Once they log in, they will see only the trip report form — not the admin area.

Note: If a driver has no email saved, the Invite button will be greyed out. Edit the driver first and add their email.`
      },
      {
        heading: "Editing or removing a driver",
        body: `Click the pencil icon on any driver card to edit their details.
Click the trash icon to permanently delete a driver record.`
      }
    ]
  },
  {
    id: "vehicles",
    icon: Truck,
    title: "Managing Vehicles",
    color: "slate",
    content: [
      {
        heading: "Adding trucks and trailers",
        body: `1. Go to Admin Dashboard → Vehicles tab.
2. Click "Add Vehicle".
3. Select the type: Truck or Trailer.
4. Enter registration, make, model, year, and status.
5. Optionally assign a Combination Group label (e.g. "Combo A") to link a truck and its trailers together visually.
6. Click "Save Vehicle".`
      },
      {
        heading: "Combination Groups",
        body: `If a truck and one or more trailers operate together, give them all the same Combination Group name (e.g. "Combo A"). They will appear grouped together under the Combinations section for easy reference.`
      },
      {
        heading: "Vehicle status",
        body: `• Active — vehicle is in regular service.
• In Service — vehicle is being serviced or maintained.
• Inactive — vehicle is not in use.`
      }
    ]
  },
  {
    id: "reports",
    icon: BarChart2,
    title: "Trip Reports",
    color: "green",
    content: [
      {
        heading: "How drivers submit reports",
        body: `Drivers log in and are taken directly to the New Report form. They fill in:
• Date and day of week
• Truck and trailer registrations
• Start and finish KM readings (total KM is calculated automatically)
• Start and finish times
• Fatigue management declaration (Standard Hours or BFM)
• Any additional notes

After submitting, the report appears in their History tab and in the Admin Dashboard.`
      },
      {
        heading: "Viewing reports as admin",
        body: `Go to Admin Dashboard → Trip Reports tab. You can:
• Filter by date, truck registration, or fatigue option.
• See totals for KM, declarations, and BFM reports.
• Export all filtered reports to a CSV file using the "Export CSV" button.
• Delete individual reports using the trash icon.`
      },
      {
        heading: "Fatigue options explained",
        body: `• Standard Hours — the default HVNL work/rest rules for most drivers.
• BFM (Basic Fatigue Management) — an accredited scheme with different limits, used by drivers with BFM accreditation.

Drivers must tick a declaration confirming they are not impaired by fatigue when submitting each report.`
      }
    ]
  },
  {
    id: "payperiods",
    icon: Calendar,
    title: "Pay Periods",
    color: "purple",
    content: [
      {
        heading: "Setting up a pay period",
        body: `1. Go to Admin Dashboard → Pay Periods tab.
2. Click "Add Pay Period".
3. Give it a name (e.g. "Fortnight A").
4. Select the frequency: Weekly, Fortnightly, or Monthly.
5. For Weekly/Fortnightly — choose the start day and an anchor start date.
6. For Monthly — enter the day of the month the period begins (e.g. 1 or 15).
7. Optionally mark it as the default.
8. Click "Save".

The system will display the current period dates based on your configuration.`
      },
      {
        heading: "Default pay period",
        body: `Mark one pay period as the default (star icon) to use it as the pre-selected option when generating payroll.`
      }
    ]
  },
  {
    id: "payrates",
    icon: DollarSign,
    title: "Pay Rates",
    color: "amber",
    content: [
      {
        heading: "Setting a driver's pay rate",
        body: `1. Go to Admin Dashboard → Pay Rates tab.
2. Click "Set Pay Rate".
3. Select the driver.
4. Choose the pay basis: Per KM or Hourly.
5. Enter the rate ($/km or $/hr).
6. For Hourly — optionally set an overtime rate and the ordinary hours per day threshold.
7. Set allowances as applicable.
8. Set the superannuation rate (default: 11.5%).
9. Click "Save Rate".`
      },
      {
        heading: "Allowances",
        body: `You can configure the following allowances per driver:
• Meal Allowance ($/day) — ATO standard is $33.15/day.
• Overnight Allowance ($/night) — ATO standard is $98.95/night.
• Tool/Uniform Allowance ($/week).
• Other Allowance (custom label, $/day).

Click "Use ATO 2024-25 rates" to auto-fill the ATO standard meal and overnight amounts.`
      }
    ]
  },
  {
    id: "payroll",
    icon: FileText,
    title: "Payroll",
    color: "rose",
    content: [
      {
        heading: "Generating a pay run",
        body: `1. Go to Admin Dashboard → Payroll tab.
2. In the "Generate Pay Run" section, select the driver.
3. Enter the period start and end dates.
4. Click "Generate".

The system pulls trip reports in that date range and calculates:
• Base pay (KM × rate, or hours × rate)
• Overtime pay (hours beyond the ordinary hours threshold)
• All configured allowances
• Superannuation (on base + overtime only)
• Gross pay total`
      },
      {
        heading: "Pay run statuses",
        body: `• Draft — newly generated, not yet reviewed.
• Approved — reviewed and approved for payment.
• Paid — payment has been processed.

Use the "Mark Approved" and "Mark Paid" buttons to advance the status.`
      },
      {
        heading: "Viewing the breakdown",
        body: `Click "Show breakdown" on any pay run card to see the detailed line items including base pay, overtime, each allowance, and superannuation.`
      }
    ]
  },
  {
    id: "backup",
    icon: HardDrive,
    title: "Backup",
    color: "teal",
    content: [
      {
        heading: "Sending a full database backup",
        body: `1. Go to Admin Dashboard → Backup tab.
2. Enter an email address to receive the backup.
3. Click "Send Backup Now".

The system will export all data (trip reports, drivers, vehicles, pay runs, pay rates, pay periods) and email it as a JSON file.`
      },
      {
        heading: "Saving to an external drive",
        body: `1. Open the backup email.
2. Copy the JSON content from the email body (between ===BEGIN BACKUP=== and ===END BACKUP===).
3. Paste into a text editor (e.g. Notepad, TextEdit).
4. Save the file as backup-YYYY-MM-DD.json.
5. Move or copy the file to your external hard drive or USB.`
      },
      {
        heading: "Restoring data",
        body: `The backup file is a standard JSON format. Contact your system administrator or developer to restore data from a backup file if needed.`
      }
    ]
  }
];

const colorMap = {
  blue:   { icon: "bg-blue-100 text-blue-600",   header: "text-blue-700",   border: "border-blue-100" },
  indigo: { icon: "bg-indigo-100 text-indigo-600", header: "text-indigo-700", border: "border-indigo-100" },
  slate:  { icon: "bg-slate-100 text-slate-600",   header: "text-slate-700",  border: "border-slate-200" },
  green:  { icon: "bg-green-100 text-green-600",   header: "text-green-700",  border: "border-green-100" },
  purple: { icon: "bg-purple-100 text-purple-600", header: "text-purple-700", border: "border-purple-100" },
  amber:  { icon: "bg-amber-100 text-amber-600",   header: "text-amber-700",  border: "border-amber-100" },
  rose:   { icon: "bg-rose-100 text-rose-600",     header: "text-rose-700",   border: "border-rose-100" },
  teal:   { icon: "bg-teal-100 text-teal-600",     header: "text-teal-700",   border: "border-teal-100" },
};

function Section({ section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  const c = colorMap[section.color];

  return (
    <div className={`bg-white rounded-xl border ${c.border} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`font-semibold text-sm ${c.header}`}>{section.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {section.content.map((item, i) => (
            <div key={i} className="px-5 py-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">{item.heading}</p>
              <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserGuideTab() {
  return (
    <div className="space-y-3 max-w-2xl">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-2">
        <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">User Guide</p>
          <p className="text-xs text-blue-600 mt-0.5">Click any section below to expand it and read the instructions.</p>
        </div>
      </div>

      {sections.map(s => (
        <Section key={s.id} section={s} />
      ))}

      <div className="text-center pt-2 pb-4 text-xs text-slate-400">
        Daily Trip Report — Admin Guide · All times Australia/Sydney
      </div>
    </div>
  );
}