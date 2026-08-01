import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import toast from "react-hot-toast";

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

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  accessDeniedReason: string | null;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAccessDeniedReason(null);

      if (currentUser) {
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
            // Phase 3 harden: do NOT auto-create partners — admin must invite/register first
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
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAccessDeniedReason(null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const ref = doc(db, "deliveryPartners", user.uid);
    await setDoc(ref, data, { merge: true });
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, accessDeniedReason, signOut, updateProfileData }}
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
