import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthChange, logOut } from '../firebase/auth';
import { UserService, SessionService } from '../firebase/services';
import { User } from '../firebase/collections';
import { Analytics } from '../utils/analytics';
import { PORTAL_LINKS } from '../lib/portals';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  loginSimulated?: (phone: string) => Promise<void>;
  loginGoogleSimulated?: (email?: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Simulated auth only when explicitly enabled (dev demos). */
const ALLOW_SIMULATED =
  import.meta.env.VITE_ALLOW_SIMULATED_AUTH === 'true' ||
  import.meta.env.VITE_ALLOW_SIMULATED_AUTH === '1';

const DEFAULT_SIMULATED_USER = {
  uid: "sim_rahul_143bhosur",
  phoneNumber: "+919876543210",
  displayName: "Rahul Sharma",
  email: "customer@taazabites.in",
  photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
  isAnonymous: false
};

const DEFAULT_SIMULATED_DATA = {
  uid: "sim_rahul_143bhosur",
  name: "Rahul Sharma",
  firstName: "Rahul",
  lastName: "Sharma",
  email: "customer@taazabites.in",
  phone: "+919876543210",
  role: "customer" as const,
  dietaryPreference: "Healthy Core",
  createdAt: new Date().toISOString()
};

function readInitialSimulatedUser(): FirebaseUser | null {
  if (!ALLOW_SIMULATED) return null;
  const isExplicitLogout = localStorage.getItem('taaza_explicit_logout') === 'true';
  if (isExplicitLogout) return null;

  const saved = localStorage.getItem('taaza_simulated_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      /* ignore */
    }
  }
  return null;
}

function readInitialSimulatedData(): User | null {
  if (!ALLOW_SIMULATED) return null;
  const isExplicitLogout = localStorage.getItem('taaza_explicit_logout') === 'true';
  if (isExplicitLogout) return null;

  const saved = localStorage.getItem('taaza_simulated_user_data');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      /* ignore */
    }
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => readInitialSimulatedUser());
  const [userData, setUserData] = useState<User | null>(() => readInitialSimulatedData());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    localStorage.setItem('taaza_explicit_logout', 'true');
    localStorage.removeItem('taaza_simulated_user');
    localStorage.removeItem('taaza_simulated_user_data');
    setCurrentUser(null);
    setUserData(null);
    await logOut();
  }, []);

  const loginSimulated = useCallback(async (phone: string) => {
    if (!ALLOW_SIMULATED) {
      throw new Error('Simulated auth is disabled. Use real phone/Google login.');
    }
    setLoading(true);
    try {
      localStorage.removeItem('taaza_explicit_logout');
      const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
      const simulatedUser = {
        uid: `sim_${cleanPhone}`,
        phoneNumber: `+91${cleanPhone}`,
        displayName: "Rahul Sharma",
        email: "customer@taazabites.in",
        photoURL: "",
        isAnonymous: false
      };

      let data = await UserService.getUser(simulatedUser.uid);
      if (!data) {
        await UserService.createUser(simulatedUser.uid, {
          uid: simulatedUser.uid,
          name: "Rahul Sharma",
          email: simulatedUser.email,
          phone: simulatedUser.phoneNumber,
          role: 'customer'
        });
        data = await UserService.getUser(simulatedUser.uid);
      }

      localStorage.setItem('taaza_simulated_user', JSON.stringify(simulatedUser));
      localStorage.setItem('taaza_simulated_user_data', JSON.stringify(data || DEFAULT_SIMULATED_DATA));

      setCurrentUser(simulatedUser as any);
      setUserData(data || (DEFAULT_SIMULATED_DATA as any));
      setLoading(false);
    } catch (err) {
      console.error("Error in simulated login:", err);
      setLoading(false);
      throw err;
    }
  }, []);

  const loginGoogleSimulated = useCallback(async (email?: string, name?: string) => {
    if (!ALLOW_SIMULATED) {
      throw new Error('Simulated auth is disabled. Use real phone/Google login.');
    }
    setLoading(true);
    try {
      localStorage.removeItem('taaza_explicit_logout');
      const gEmail = email || "customer@taazabites.in";
      const gName = name || "Rahul Sharma";
      const simulatedUser = {
        uid: `sim_google_10823`,
        phoneNumber: "+919876543210",
        displayName: gName,
        email: gEmail,
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        isAnonymous: false
      };

      let data = await UserService.getUser(simulatedUser.uid);
      if (!data) {
        await UserService.createUser(simulatedUser.uid, {
          uid: simulatedUser.uid,
          name: gName,
          email: gEmail,
          phone: "+919876543210",
          photoURL: simulatedUser.photoURL,
          role: 'customer'
        }).catch(() => null);
        data = await UserService.getUser(simulatedUser.uid).catch(() => null);
      }

      localStorage.setItem('taaza_simulated_user', JSON.stringify(simulatedUser));
      localStorage.setItem('taaza_simulated_user_data', JSON.stringify(data || DEFAULT_SIMULATED_DATA));

      setCurrentUser(simulatedUser as any);
      setUserData(data || (DEFAULT_SIMULATED_DATA as any));
      setLoading(false);
    } catch (err) {
      console.error("Error in simulated Google login:", err);
      setLoading(false);
      throw err;
    }
  }, []);


  useEffect(() => {
    if (!ALLOW_SIMULATED) {
      localStorage.removeItem('taaza_simulated_user');
      localStorage.removeItem('taaza_simulated_user_data');
    }

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const savedSimulated = ALLOW_SIMULATED ? localStorage.getItem('taaza_simulated_user') : null;
    if (savedSimulated) {
      setLoading(false);
    }

    const unsubscribe = onAuthChange(async (user) => {
      clearTimeout(safetyTimer);
      if (ALLOW_SIMULATED && localStorage.getItem('taaza_simulated_user') && !user) {
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      
      if (user) {
        localStorage.removeItem('taaza_simulated_user');
        localStorage.removeItem('taaza_simulated_user_data');

        UserService.updateLastLogin(user.uid).catch(() => null);
        SessionService.recordSession(user.uid).catch(() => null);

        try {
          let data = await UserService.getUser(user.uid);
          const isBrandNew = !data;

          if (isBrandNew) {
            await UserService.createUser(user.uid, {
              uid: user.uid,
              name: user.displayName || 'Customer',
              email: user.email || '',
              phone: user.phoneNumber || '',
              photoURL: user.photoURL || '',
              role: 'customer'
            }).catch(() => null);

            data = await UserService.getUser(user.uid).catch(() => null);
            Analytics.trackSignUp(user.uid, user.email || '', user.displayName || '');

            fetch("/api/communication/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.uid,
                type: "welcome",
                title: "Welcome to Taaza Bites! 🥗",
                message: `Welcome to Taaza Bites, ${user.displayName || 'Customer'}! We are thrilled to help fuel your healthy lifestyle with our fresh, chef-crafted, nutritionist-designed meals. Check out our customizable plans to get started.`,
                channel: ["app", "email", "whatsapp", "push"],
                recipientDetails: {
                  email: user.email || '',
                  phone: user.phoneNumber || '',
                  name: user.displayName || 'Customer'
                }
              })
            }).catch(err => console.error("Welcome email trigger failed:", err));
          }

          // Phase 3: staff with customer.role === 'admin' should use Admin panel
          if (data?.role === 'admin' || data?.role === 'delivery') {
            const redirectTo =
              data.role === 'delivery' ? PORTAL_LINKS.deliveryHome : PORTAL_LINKS.adminHome;
            console.warn(`[auth] User role=${data.role} — redirecting to ${redirectTo}`);
            window.location.assign(redirectTo);
            return;
          }

          Analytics.trackLogin(user.uid, user.email || '');

          if (data) {
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    currentUser,
    user: currentUser,
    userData,
    loading,
    isAdmin: userData?.role === 'admin',
    logout,
    ...(ALLOW_SIMULATED
      ? { loginSimulated, loginGoogleSimulated }
      : {}),
  }), [currentUser, userData, loading, logout, loginSimulated, loginGoogleSimulated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
