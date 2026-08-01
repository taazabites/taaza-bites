import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { auth, db } from '../lib/firebase';
import { User, Role } from '../types';
import { dbSeedService } from '../services/db-seed';
import { systemMonitoringService } from '../services/system-monitoring';
import { AutoLogoutWarningModal } from '../components/auth/AutoLogoutWarningModal';
import { buildSuperAdminProfile, isSuperAdminEmail } from '../lib/super-admin';
import { resolveOrClaimAdminProfile } from '../lib/resolve-admin-profile';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: (useRedirect?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  extendSession: () => Promise<void>;
  triggerSessionWarning: () => void;
  sessionRemainingSeconds: number | null;
  isSessionWarningOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Session Expiration & Auto-Logout Warning States
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionRemaining, setSessionRemaining] = useState<number | null>(null);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [isExtendingSession, setIsExtendingSession] = useState<boolean>(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const profile = await resolveOrClaimAdminProfile(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName
          );

          if (profile) {
            if (isSuperAdminEmail(firebaseUser.email) && profile.role === 'Super Admin') {
              // quiet — already toasted on first bootstrap inside resolve when created
            }
            setUser(profile);
            if (import.meta.env.DEV) {
              dbSeedService.ensureSeeded().catch(console.error);
            }

            try {
              const tokenResult = await firebaseUser.getIdTokenResult();
              if (tokenResult?.expirationTime) {
                setSessionExpiresAt(new Date(tokenResult.expirationTime).getTime());
              } else {
                setSessionExpiresAt(Date.now() + 30 * 60 * 1000);
              }
            } catch {
              setSessionExpiresAt(Date.now() + 30 * 60 * 1000);
            }
          } else {
             setUser(null);
             setSessionExpiresAt(null);
          }
        } catch (error) {
          console.error('Error fetching admin profile:', error);
          setUser(null);
          setSessionExpiresAt(null);
        }
      } else {
        setUser(null);
        setSessionExpiresAt(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Timer interval hook to monitor session expiration and warn 60 seconds before
  useEffect(() => {
    if (!user || !sessionExpiresAt) {
      setShowWarningModal(false);
      setSessionRemaining(null);
      return;
    }

    const checkTimer = () => {
      const now = Date.now();
      const remainingMs = sessionExpiresAt - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setSessionRemaining(remainingSec);

      if (remainingSec <= 60 && remainingSec > 0) {
        setShowWarningModal(true);
      } else if (remainingSec <= 0) {
        setShowWarningModal(false);
        setSessionExpiresAt(null);
        toast.error("Your authentication session expired. Automatically logged out.", { duration: 5000 });
        logout();
      } else {
        setShowWarningModal(false);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [user, sessionExpiresAt]);

  const extendSession = async () => {
    setIsExtendingSession(true);
    try {
      if (auth.currentUser) {
        // Force refresh ID token to get a fresh expiration time
        const tokenResult = await auth.currentUser.getIdTokenResult(true);
        if (tokenResult?.expirationTime) {
          setSessionExpiresAt(new Date(tokenResult.expirationTime).getTime());
        } else {
          setSessionExpiresAt(Date.now() + 30 * 60 * 1000);
        }
      } else {
        setSessionExpiresAt(Date.now() + 30 * 60 * 1000);
      }
      setShowWarningModal(false);
      toast.success("Authentication session extended successfully.");
    } catch (error) {
      console.error("Failed to extend session:", error);
      setSessionExpiresAt(Date.now() + 30 * 60 * 1000);
      setShowWarningModal(false);
      toast.success("Session extended.");
    } finally {
      setIsExtendingSession(false);
    }
  };

  const triggerSessionWarning = () => {
    // Force session timer to 60 seconds left to immediately display modal
    setSessionExpiresAt(Date.now() + 60 * 1000);
    setShowWarningModal(true);
    toast.info("Session auto-logout warning modal active (60s countdown).");
  };

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password required");
    
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Log failed login
      try {
        await systemMonitoringService.logAction({
          adminId: 'unknown',
          adminName: 'Guest',
          role: 'Guest',
          module: 'Authentication',
          action: 'Failed Login',
          recordId: email,
          status: 'Failed'
        });

        // Track failed attempts for multiple failed logins / security event
        const attempts = Number(sessionStorage.getItem('failed_attempts_' + email) || 0) + 1;
        sessionStorage.setItem('failed_attempts_' + email, String(attempts));
        if (attempts >= 3) {
          await systemMonitoringService.logSecurityEvent({
            type: 'Multiple Failed Logins',
            severity: 'High',
            adminName: 'Guest',
            email,
            details: `Multiple failed login attempts (${attempts} tries) detected for target account: ${email}.`
          });
        }
      } catch (logErr) {
        console.error("Failed to log auth fail:", logErr);
      }

      // If user doesn't exist, we don't auto-create them.
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
         throw new Error("Invalid credentials.");
      } else {
        throw error;
      }
    }

    // Reset failed attempts upon successful login
    sessionStorage.removeItem('failed_attempts_' + email);

    let currentUserProfile: User;
    
    const claimed = await resolveOrClaimAdminProfile(
      userCredential.user.uid,
      userCredential.user.email || email,
      userCredential.user.displayName
    );

    if (claimed) {
      currentUserProfile = claimed;
      setUser(currentUserProfile);
      if (claimed.role === 'Super Admin' && isSuperAdminEmail(userCredential.user.email)) {
        toast.success('Welcome, Super Admin.');
      }
      if (import.meta.env.DEV) {
        dbSeedService.ensureSeeded().catch(console.error);
      }
    } else {
      await signOut(auth);
      throw new Error("Unauthorized. Admin profile not found. Ask Super Admin to invite your email.");
    }

    // Create session tracking record
    try {
      const sessionId = await systemMonitoringService.startSession({
        adminId: currentUserProfile.id,
        adminName: currentUserProfile.name,
        email: currentUserProfile.email,
        role: currentUserProfile.role
      });
      localStorage.setItem('admin_session_id', sessionId);
    } catch (sessionErr) {
      console.error("Failed to start tracking session:", sessionErr);
    }
  };

  const logout = async () => {
    try {
      const sessId = localStorage.getItem('admin_session_id');
      if (sessId && user) {
        await systemMonitoringService.endSession(sessId, {
          adminId: user.id,
          adminName: user.name,
          role: user.role
        });
        localStorage.removeItem('admin_session_id');
      }
    } catch (logoutLogErr) {
      console.error("Failed to log logout session:", logoutLogErr);
    }
    await signOut(auth);
  };

  const loginWithGoogle = async (useRedirect = false) => {
    const provider = new GoogleAuthProvider();
    try {
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      // Log successful reset request
      await systemMonitoringService.logAction({
        adminId: user?.id || 'unknown',
        adminName: user?.name || 'Guest',
        role: user?.role || 'Guest',
        module: 'Authentication',
        action: 'Password Reset',
        recordId: email,
        status: 'Success'
      });
    } catch (error) {
      await systemMonitoringService.logAction({
        adminId: user?.id || 'unknown',
        adminName: user?.name || 'Guest',
        role: user?.role || 'Guest',
        module: 'Authentication',
        action: 'Password Reset',
        recordId: email,
        status: 'Failed'
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithGoogle, 
      logout, 
      resetPassword,
      extendSession,
      triggerSessionWarning,
      sessionRemainingSeconds: sessionRemaining,
      isSessionWarningOpen: showWarningModal
    }}>
      {children}
      {user && (
        <AutoLogoutWarningModal
          isOpen={showWarningModal}
          secondsRemaining={sessionRemaining ?? 60}
          onExtendSession={extendSession}
          onLogout={logout}
          isExtending={isExtendingSession}
          userEmail={user.email}
          userName={user.name}
          userRole={user.role}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
