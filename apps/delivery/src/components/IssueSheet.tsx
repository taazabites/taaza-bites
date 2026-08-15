import { ISSUE_REASONS, IssueReason } from "@/types";
import { Button } from "@/components/ui/button";

export function IssueSheet({
  open,
  onClose,
  busy,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  busy?: boolean;
  onSubmit: (input: { reason: IssueReason; notes: string; action: "NONE" | "RESCHEDULE" | "RETURN_TO_KITCHEN" }) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-end md:items-center justify-center p-3">
      <form
        className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const reason = String(fd.get("reason") || "") as IssueReason;
          const notes = String(fd.get("notes") || "");
                    const action = String(fd.get("action") || "NONE") as "NONE" | "RESCHEDULE" | "RETURN_TO_KITCHEN";
          onSubmit({ reason, notes, action });
        }}
      >
        <h3 className="text-xl font-bold">Report Delivery Issue</h3>
        <p className="text-sm text-muted-foreground">This will not mark the order delivered.</p>
        <label className="block text-xs font-bold uppercase text-muted-foreground">Reason</label>
        <select name="reason" className="w-full h-12 border rounded-xl px-3 text-base" required>
          {ISSUE_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <label className="block text-xs font-bold uppercase text-muted-foreground">Notes</label>
        <textarea name="notes" rows={3} className="w-full border rounded-xl p-3 text-base" placeholder="Required for Other" />
        <label className="block text-xs font-bold uppercase text-muted-foreground">If customer unavailable</label>
        <select name="action" className="w-full h-12 border rounded-xl px-3 text-base">
          <option value="NONE">Report only</option>
          <option value="RESCHEDULE">Request reschedule (ops confirms)</option>
          <option value="RETURN_TO_KITCHEN">Return to kitchen</option>
        </select>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1 h-12" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 h-12 bg-red-600 hover:bg-red-700" disabled={busy}>
            {busy ? "Sending…" : "Report issue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
