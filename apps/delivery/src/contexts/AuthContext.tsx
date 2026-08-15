import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { PartnerProfile, PartnerLiveStatus } from "@/types";
import { partnerApi } from "@/lib/api";
import { flushOutbox } from "@/lib/outbox";

interface AuthContextType {
  user: User | null;
  profile: PartnerProfile | null;
  loading: boolean;
  accessDeniedReason: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapProfile(uid: string, data: Record<string, unknown>): PartnerProfile {
  const statusRaw = String(data.currentStatus || data.status || "OFFLINE").toUpperCase();
  let currentStatus: PartnerLiveStatus = "OFFLINE";
  if (["ONLINE", "OFFLINE", "ON_DELIVERY", "SUSPENDED"].includes(statusRaw)) {
    currentStatus = statusRaw as PartnerLiveStatus;
  } else if (data.isBlocked || data.active === false || statusRaw === "BLOCKED" || statusRaw === "INACTIVE") {
    currentStatus = "SUSPENDED";
  } else if (data.isOnline) {
    currentStatus = "ONLINE";
  }

  const areas = Array.isArray(data.serviceAreas)
    ? (data.serviceAreas as string[])
    : String(data.serviceAreas || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  return {
    uid,
    partnerId: String(data.partnerId || uid),
    name: String(data.name || data.fullName || "Partner"),
    phone: String(data.phone || ""),
    photo: String(data.photo || data.photoUrl || data.profilePhoto || ""),
    photoUrl: String(data.photoUrl || data.photo || data.profilePhoto || ""),
    active: data.active !== false && !data.isBlocked,
    vehicleType: String(data.vehicleType || data.vehicle || ""),
    vehicleNumber: String(data.vehicleNumber || ""),
    serviceAreas: areas,
    currentStatus,
    joiningDate: data.joiningDate ? String(data.joiningDate) : undefined,
    emergencyContact: data.emergencyContact ? String(data.emergencyContact) : undefined,
    upiId: data.upiId ? String(data.upiId) : undefined,
    isBlocked: Boolean(data.isBlocked),
    role: "deliveryPartner",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      unsubProfile?.();
      setAccessDeniedReason(null);
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      try {
        await partnerApi("/claim", {});
      } catch (err) {
        console.warn("Partner claim skipped", err);
      }

      unsubProfile = onSnapshot(
        doc(db, "deliveryPartners", currentUser.uid),
        (snap) => {
          if (!snap.exists()) {
            setProfile(null);
            setAccessDeniedReason("No delivery partner profile found. Ask Admin to register your phone first.");
            firebaseSignOut(auth);
            toast.error("Not registered as a delivery partner");
            setLoading(false);
            return;
          }
          const mapped = mapProfile(currentUser.uid, snap.data() as Record<string, unknown>);
          if (mapped.currentStatus === "SUSPENDED" || mapped.isBlocked || mapped.active === false) {
            setProfile(null);
            setAccessDeniedReason("Your partner account is suspended. Contact operations.");
            firebaseSignOut(auth);
            toast.error("Partner account suspended");
            setLoading(false);
            return;
          }
          setProfile(mapped);
          setLoading(false);
        },
        (error) => {
          console.error(error);
          setAccessDeniedReason("Could not verify partner profile.");
          setLoading(false);
        }
      );
    });

    return () => {
      unsubProfile?.();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onOnline = () => {
      flushOutbox().catch(() => undefined);
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, accessDeniedReason, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
