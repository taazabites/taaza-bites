
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  resolvePortalAccess,
  redirectToPortal,
  type PortalOption,
  type PortalResolution,
} from '../lib/portalRouter';
import { PORTAL_LINKS } from '../config';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let provider: GoogleAuthProvider | null = new GoogleAuthProvider();

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getAccessToken = async (): Promise<string | null> => {
    return cachedAccessToken;
};

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    rewards: {
        points: number;
        tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    };
    preferences: {
        diet: 'veg' | 'nonVeg' | 'none';
        goal: 'weight-loss' | 'hypertrophy' | 'maintenance';
        dislikes: string[];
        allergies: string[];
    };
    orders: Array<{
        id: string;
        date: string;
        status: 'SYNCING' | 'PREPARING' | 'IN_TRANSIT' | 'DEPLOYED';
        items: string[];
        total: number;
    }>;
}

interface AuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    login: (opts?: { routeAfterLogin?: boolean }) => Promise<void>;
    logout: () => void;
    updatePreferences: (prefs: UserProfile['preferences']) => void;
    isAuthModalOpen: boolean;
    openAuth: () => void;
    closeAuth: () => void;
    portalResolution: PortalResolution | null;
    isResolvingPortal: boolean;
    choosePortal: (option: PortalOption) => void;
    clearPortalResolution: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildFallbackProfile(firebaseUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): UserProfile {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        rewards: { points: 0, tier: 'Bronze' },
        preferences: { diet: 'nonVeg', goal: 'maintenance', dislikes: [], allergies: [] },
        orders: [],
    };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [portalResolution, setPortalResolution] = useState<PortalResolution | null>(null);
    const [isResolvingPortal, setIsResolvingPortal] = useState(false);

    const runPortalResolve = async (uid: string, email: string | null | undefined, autoRedirectAdmin = false) => {
        setIsResolvingPortal(true);
        try {
            const resolution = await resolvePortalAccess(uid, email);
            setPortalResolution(resolution);
            setIsAuthModalOpen(true);

            if (autoRedirectAdmin && resolution.primary === 'admin') {
                const admin = resolution.options.find((o) => o.kind === 'admin');
                if (admin) {
                    redirectToPortal(admin);
                    return;
                }
            }
        } catch (e) {
            console.error('Portal resolve failed:', e);
        } finally {
            setIsResolvingPortal(false);
        }
    };

    const openAuth = () => {
        if (auth?.currentUser) {
            void runPortalResolve(auth.currentUser.uid, auth.currentUser.email, false);
            return;
        }
        setPortalResolution(null);
        setIsAuthModalOpen(true);
    };

    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }
        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                if (!db) {
                    setUser(buildFallbackProfile(firebaseUser));
                    setIsLoading(false);
                    return;
                }

                const userDocRef = doc(db, 'users', firebaseUser.uid);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                            photoURL: firebaseUser.photoURL || undefined,
                            rewards: { 
                                points: data.rewardPoints ?? 0, 
                                tier: data.rewardTier ?? 'Bronze' 
                            },
                            preferences: { 
                                diet: data.diet ?? 'nonVeg', 
                                goal: data.goal ?? 'maintenance', 
                                dislikes: data.dislikes ?? [],
                                allergies: data.allergies ?? []
                            },
                            orders: [],
                        });
                    } else {
                        const initialProfile = buildFallbackProfile(firebaseUser);
                        setDoc(userDocRef, {
                            uid: initialProfile.uid,
                            email: initialProfile.email,
                            displayName: initialProfile.displayName,
                            role: 'customer',
                            diet: initialProfile.preferences.diet,
                            goal: initialProfile.preferences.goal,
                            dislikes: initialProfile.preferences.dislikes,
                            allergies: initialProfile.preferences.allergies,
                            rewardPoints: initialProfile.rewards.points,
                            rewardTier: initialProfile.rewards.tier
                        }).then(() => {
                            setUser(initialProfile);
                        }).catch(err => {
                            try {
                                handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
                            } catch (e) {
                                console.error("Logged write error gracefully:", e);
                            }
                            setUser(initialProfile);
                        });
                    }
                    setIsLoading(false);
                }).catch(err => {
                    try {
                        handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
                    } catch (e) {
                        console.error("Logged read error gracefully:", e);
                    }
                    setUser(buildFallbackProfile(firebaseUser));
                    setIsLoading(false);
                });
            } else {
                setUser(null);
                cachedAccessToken = null;
                setPortalResolution(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (opts?: { routeAfterLogin?: boolean }) => {
        const routeAfterLogin = opts?.routeAfterLogin !== false;
        setIsLoading(true);
        try {
            if (!auth || !provider) {
                setUser({
                    uid: 'mock_user',
                    email: 'demo@taazabites.in',
                    displayName: 'Demo User',
                    rewards: { points: 1250, tier: 'Silver' },
                    preferences: { diet: 'nonVeg', goal: 'maintenance', dislikes: [], allergies: [] },
                    orders: []
                });
                window.dispatchEvent(new CustomEvent('taaza:toast', {
                    detail: { message: `Demo mode: Authenticated successfully`, type: 'success' }
                }));
                if (routeAfterLogin) {
                    setPortalResolution({
                        uid: 'mock_user',
                        email: 'demo@taazabites.in',
                        primary: 'customer',
                        options: [
                            {
                                kind: 'customer',
                                label: 'Customer Panel',
                                description: 'Subscriptions, meals & account',
                                url: PORTAL_LINKS.customerHome,
                            },
                            {
                                kind: 'website',
                                label: 'Stay on Website',
                                description: 'Continue browsing',
                                url: window.location.origin,
                            },
                        ],
                    });
                    setIsAuthModalOpen(true);
                } else {
                    setIsAuthModalOpen(false);
                }
                return;
            }
            
            isSigningIn = true;
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                cachedAccessToken = credential.accessToken;
            }
            
            window.dispatchEvent(new CustomEvent('taaza:toast', {
                detail: { message: `Authenticated as ${result.user.displayName}`, type: 'success' }
            }));

            if (routeAfterLogin) {
                await runPortalResolve(result.user.uid, result.user.email, true);
            } else {
                setIsAuthModalOpen(false);
            }
        } catch (error) {
            console.error('Sign in error:', error);
            window.dispatchEvent(new CustomEvent('taaza:toast', {
                detail: { message: `Sign in failed`, type: 'error' }
            }));
        } finally {
            isSigningIn = false;
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (auth) {
                await signOut(auth);
            }
            cachedAccessToken = null;
            setUser(null);
            setPortalResolution(null);
            window.dispatchEvent(new CustomEvent('taaza:toast', {
                detail: { message: "System disconnected safely.", type: 'info' }
            }));
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const choosePortal = (option: PortalOption) => {
        if (option.kind === 'website') {
            setPortalResolution(null);
            setIsAuthModalOpen(false);
            return;
        }
        redirectToPortal(option);
    };

    const updatePreferences = async (prefs: UserProfile['preferences']) => {
        if (!user) return;
        const oldPrefs = user.preferences;
        const newUser = { ...user, preferences: prefs };
        setUser(newUser);
        
        try {
            if (db && auth?.currentUser) {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                await setDoc(userDocRef, {
                    uid: newUser.uid,
                    email: newUser.email,
                    displayName: newUser.displayName,
                    diet: prefs.diet,
                    goal: prefs.goal,
                    dislikes: prefs.dislikes,
                    allergies: prefs.allergies || [],
                    rewardPoints: newUser.rewards.points,
                    rewardTier: newUser.rewards.tier
                }, { merge: true });
            }
            
            let message = "Profile preferences successfully synchronized.";
            if (oldPrefs.diet !== prefs.diet) {
                message = `Dietary preference updated to ${prefs.diet === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}!`;
            } else if (oldPrefs.goal !== prefs.goal) {
                const goalNames: { [key: string]: string } = {
                    'weight-loss': 'Weight Loss',
                    'hypertrophy': 'Muscle Gain',
                    'maintenance': 'Clean Wellness/Maintenance'
                };
                message = `Health goal updated to ${goalNames[prefs.goal] || prefs.goal}!`;
            } else if (JSON.stringify(oldPrefs.dislikes) !== JSON.stringify(prefs.dislikes)) {
                message = "Ingredient dislikes updated successfully!";
            } else if (JSON.stringify(oldPrefs.allergies) !== JSON.stringify(prefs.allergies)) {
                message = "Allergies and food sensitivities updated!";
            }

            window.dispatchEvent(new CustomEvent('taaza:toast', {
                detail: { message, type: 'success' }
            }));
        } catch (error) {
            try {
                handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
            } catch (e) {
                console.error("Logged preference write error gracefully:", e);
                window.dispatchEvent(new CustomEvent('taaza:toast', {
                    detail: { message: "Failed to sync preferences.", type: 'error' }
                }));
            }
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, isLoading, login, logout, updatePreferences, 
            isAuthModalOpen,
            openAuth, 
            closeAuth: () => { setIsAuthModalOpen(false); setPortalResolution(null); },
            portalResolution,
            isResolvingPortal,
            choosePortal,
            clearPortalResolution: () => setPortalResolution(null),
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
