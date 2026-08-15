import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EVENTS = [
  { event: "Order confirmation", channels: "WhatsApp, SMS, Email, Push" },
  { event: "Delivery updates", channels: "WhatsApp, SMS, Push" },
  { event: "Subscription reminders", channels: "WhatsApp, Email" },
  { event: "Renewal reminders", channels: "WhatsApp, SMS, Email" },
  { event: "Payment failures", channels: "SMS, Email, Push" },
  { event: "Support updates", channels: "WhatsApp, Email" },
];

export default function NotificationArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Notification architecture</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Transactional templates only. Indian DLT/consent rules apply. This screen does not send bulk promotional traffic.
        </p>
      </div>
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader><CardTitle className="text-white text-base">Approved event map</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {EVENTS.map((row) => (
            <div key={row.event} className="flex flex-col sm:flex-row sm:justify-between border-b border-zinc-900 py-3">
              <span className="text-zinc-200">{row.event}</span>
              <span className="text-zinc-500 text-sm">{row.channels}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-xs text-zinc-500">
        Providers (Gupshup / SMS / email) must use registered templates. Queue records go to <code>communicationLogs</code> with status queued_pending_consent unless a dedicated transactional API is configured.
      </p>
    </div>
  );
}
