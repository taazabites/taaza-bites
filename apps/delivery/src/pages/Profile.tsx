import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Phone, Mail, ShieldAlert, Truck, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export default function Profile() {
  const { user, profile, updateProfileData, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    emergencyContact: "",
    vehicleNumber: "",
    upiId: "",
  });

  const handleSave = async () => {
    try {
      await updateProfileData(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h2 className="text-2xl font-bold tracking-tight">Partner Profile</h2>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col items-center border-b bg-muted/20">
          <div className="size-24 rounded-full bg-primary/10 overflow-hidden border-4 border-white shadow-sm mb-4">
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="Profile" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-4xl font-bold text-primary">
                {profile?.name?.charAt(0) || "P"}
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold">{profile?.name || "New Partner"}</h3>
          <p className="text-sm text-muted-foreground">ID: {user?.uid}</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold uppercase tracking-wider text-xs text-muted-foreground">Personal Details</h4>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User className="size-4" /> Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="size-4" /> Phone Number</Label>
                <Input 
                  value={profile?.phone || ""} 
                  disabled 
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><ShieldAlert className="size-4" /> Emergency Contact</Label>
              <Input 
                value={formData.emergencyContact} 
                onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                disabled={!isEditing}
                placeholder="Relative/Friend's Phone"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Truck className="size-4" /> Vehicle Number</Label>
                <Input 
                  value={formData.vehicleNumber} 
                  onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                  disabled={!isEditing}
                  placeholder="e.g. MH 12 AB 1234"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CreditCard className="size-4" /> UPI ID</Label>
                <Input 
                  value={formData.upiId} 
                  onChange={e => setFormData({...formData, upiId: e.target.value})}
                  disabled={!isEditing}
                  placeholder="yourname@bank"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 md:hidden">
        <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-100 justify-start" onClick={signOut}>
          <LogOut className="size-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
