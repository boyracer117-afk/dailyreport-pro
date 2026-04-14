import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) {
    return Response.json({ error: 'email is required' }, { status: 400 });
  }

  // Fetch all entity data in parallel
  const [reports, drivers, vehicles, payRuns, payRates, payPeriods] = await Promise.all([
    base44.asServiceRole.entities.DailyReport.list('-date', 5000),
    base44.asServiceRole.entities.Driver.list('full_name', 1000),
    base44.asServiceRole.entities.Vehicle.list('type', 1000),
    base44.asServiceRole.entities.PayRun.list('-period_start', 1000),
    base44.asServiceRole.entities.DriverPayRate.list('driver_name', 1000),
    base44.asServiceRole.entities.PayPeriod.list('name', 100),
  ]);

  const backup = {
    exported_at: new Date().toISOString(),
    exported_by: user.email,
    data: {
      daily_reports: reports,
      drivers,
      vehicles,
      pay_runs: payRuns,
      pay_rates: payRates,
      pay_periods: payPeriods,
    },
    counts: {
      daily_reports: reports.length,
      drivers: drivers.length,
      vehicles: vehicles.length,
      pay_runs: payRuns.length,
      pay_rates: payRates.length,
      pay_periods: payPeriods.length,
    },
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];

  // Build a readable summary for the email body
  const summary = Object.entries(backup.counts)
    .map(([k, v]) => `  • ${k.replace(/_/g, ' ')}: ${v} records`)
    .join('\n');

  const body = `Hi,

Your full database backup from Daily Trip Report is attached below as a JSON file.

Export Date: ${dateStr}
Exported By: ${user.email}

Record Counts:
${summary}

To restore or review this data, open the JSON file in any text editor or import it into your system.

This backup was generated on demand from the Admin Dashboard.

— Daily Trip Report System`;

  // Send email with backup as inline attachment (base64)
  const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: email,
    subject: `Database Backup — ${dateStr}`,
    body: body + `\n\n--- BACKUP DATA (JSON) ---\n\nFilename: backup-${dateStr}.json\n\nNote: The full JSON data is large. Copy everything between the markers below and save as backup-${dateStr}.json\n\n===BEGIN BACKUP===\n${jsonStr}\n===END BACKUP===`,
  });

  return Response.json({
    success: true,
    email,
    counts: backup.counts,
    exported_at: backup.exported_at,
  });
});