import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { partnerApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact || "");
  const [upiId, setUpiId] = useState(profile?.upiId || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await partnerApi("/profile", { emergencyContact, upiId });
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto w-full space-y-5">
      <h1 className="text-2xl font-black">Profile</h1>
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-black text-primary overflow-hidden">
          {profile?.photoUrl ? <img src={profile.photoUrl} alt="" className="size-full object-cover" /> : profile?.name[0]}
        </div>
        <Row k="Name" v={profile?.name} />
        <Row k="Phone" v={profile?.phone} />
        <Row k="Partner ID" v={profile?.partnerId || user?.uid} />
        <Row k="Vehicle" v={profile?.vehicleType} />
        <Row k="Vehicle number" v={profile?.vehicleNumber} />
        <Row k="Assigned areas" v={profile?.serviceAreas.join(", ") || "—"} />
        <Row k="Joining date" v={profile?.joiningDate || "—"} />
        <Row k="Status" v={profile?.currentStatus} />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase text-muted-foreground">Permitted edits</p>
        <div className="space-y-1">
          <Label>Emergency contact</Label>
          <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className="h-12" />
        </div>
        <div className="space-y-1">
          <Label>UPI ID</Label>
          <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="h-12" />
        </div>
        <Button className="w-full h-12" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <Button variant="ghost" className="w-full text-red-600 h-12" onClick={signOut}>
        <LogOut className="size-4 mr-2" /> Sign out
      </Button>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm border-b border-muted py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold text-right">{v || "—"}</span>
    </div>
  );
}
