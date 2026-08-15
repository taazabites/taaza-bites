import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import toast from "react-hot-toast";
import {
  ALLOW_SIMULATED_AUTH,
  DEMO_PARTNER,
  DEMO_STORAGE_KEY,
} from "@/lib/demo-credentials";

export type Role = "admin" | "kitchen" | "deliveryPartner" | "crm" | "customer";

export interface UserProfile {
  uid: string;
  phone: string;
  role: Role;
  name?: string;
  isBlocked?: boolean;
  status?: string;
  photoUrl?: string;
}

type AuthUser = User | { uid: string; phoneNumber?: string };

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  accessDeniedReason: string | null;
  allowDemoLogin: boolean;
  loginDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readDemoSession(): { user: AuthUser; profile: UserProfile } | null {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user: AuthUser; profile: UserProfile };
    if (!parsed?.user?.uid || !parsed?.profile?.uid) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);

  useEffect(() => {
    if (ALLOW_SIMULATED_AUTH) {
      const demo = readDemoSession();
      if (demo) {
        setUser(demo.user);
        setProfile(demo.profile);
        setLoading(false);
      }
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAccessDeniedReason(null);

      if (currentUser) {
        localStorage.removeItem(DEMO_STORAGE_KEY);
        setUser(currentUser);
        try {
          const partnerDocRef = doc(db, "deliveryPartners", currentUser.uid);
          const partnerDoc = await getDoc(partnerDocRef);

          if (partnerDoc.exists()) {
            const data = partnerDoc.data() as UserProfile;
            if (data.isBlocked || data.status === "Blocked" || data.status === "Inactive") {
              setProfile(null);
              setAccessDeniedReason("Your delivery partner account is blocked. Contact operations.");
              await firebaseSignOut(auth);
              toast.error("Partner account blocked");
            } else {
              setProfile({ ...data, role: "deliveryPartner" });
            }
          } else {
            setProfile(null);
            setAccessDeniedReason(
              "No delivery partner profile found. Ask Admin to register your phone/UID first."
            );
            await firebaseSignOut(auth);
            toast.error("Not registered as a delivery partner");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
          setAccessDeniedReason("Could not verify partner profile.");
        }
      } else if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginDemo = async () => {
    if (!ALLOW_SIMULATED_AUTH) {
      throw new Error("Demo login is disabled. Set VITE_ALLOW_SIMULATED_AUTH=true");
    }

    const demoUser = {
      uid: DEMO_PARTNER.uid,
      phoneNumber: `+91${DEMO_PARTNER.phone}`,
    };
    const demoProfile: UserProfile = {
      uid: DEMO_PARTNER.uid,
      phone: `+91${DEMO_PARTNER.phone}`,
      name: DEMO_PARTNER.name,
      role: "deliveryPartner",
      status: "Active",
      isBlocked: false,
      photoUrl: "",
    };

    try {
      await setDoc(doc(db, "deliveryPartners", DEMO_PARTNER.uid), demoProfile, { merge: true });
    } catch (err) {
      console.warn("Could not write demo partner to Firestore (using local session):", err);
    }

    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
    setUser(demoUser);
    setProfile(demoProfile);
    setAccessDeniedReason(null);
    toast.success("Demo partner session ready");
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setUser(null);
    setProfile(null);
    setAccessDeniedReason(null);
    try {
      await firebaseSignOut(auth);
    } catch {
      /* demo-only session */
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    if (String(user.uid).startsWith("sim_")) {
      const next = { ...profile, ...data };
      setProfile(next);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user, profile: next }));
      return;
    }
    const ref = doc(db, "deliveryPartners", user.uid);
    await setDoc(ref, data, { merge: true });
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        accessDeniedReason,
        allowDemoLogin: ALLOW_SIMULATED_AUTH,
        loginDemo,
        signOut,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
