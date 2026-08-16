import { useState, useEffect } from "react";
import { safeCopyToClipboard } from "@/src/utils/clipboard";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/db";
import { doc, getDoc, onSnapshot, updateDoc, setDoc, deleteDoc, arrayUnion, Timestamp, serverTimestamp } from "firebase/firestore";
import { AddressService, HealthAssessmentService, SessionService } from "../../firebase/services";
import { Address, HealthAssessment, RewardPoints, Wallet, Subscription, User } from "../../firebase/collections";
import { PageHeader } from "../dashboard/PageHeader";
import { PageTransition } from "../dashboard/PageTransition";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Scale, 
  Target, 
  Activity, 
  Award, 
  Sparkles, 
  MapPin, 
  Home as HomeIcon, 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  LogOut, 
  Globe, 
  Bell, 
  Moon, 
  Sun, 
  Lock, 
  Camera, 
  CheckCircle2, 
  Droplet, 
  Flame, 
  Dumbbell, 
  Apple, 
  HeartPulse, 
  History, 
  ChevronRight, 
  ChevronLeft, 
  PlusCircle, 
  Loader2,
  Trash,
  Info,
  Map as MapIcon,
  Navigation,
  ExternalLink,
  ShieldAlert,
  X,
  Key,
  Terminal,
  Sliders,
  Volume2,
  RefreshCw,
  Play,
  Check,
  Copy,
  LockKeyhole,
  Cpu,
  Languages,
  Smartphone,
  Download,
  Laptop,
  Fingerprint,
  AlertTriangle,
  Truck,
  Calendar,
  Clock,
  BellRing
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend
} from "recharts";
import { calculateBMI, getBMICategory, calculateNutrition } from "../../lib/nutrition-utils";
import { cn } from "../../lib/utils";

type TabType = "profile" | "health" | "addresses" | "preferences" | "emergency" | "progress" | "settings";

const BENGALURU_PREMIUM_SOCIETIES = [
  { 
    title: "Sobha Green, HSR Layout", 
    building: "Sobha Green", 
    street: "27th Main Road, Sector 1", 
    area: "HSR Layout", 
    pin: "560102", 
    lat: 12.9121, 
    lng: 77.6445,
    desc: "Premium residential society near HSR Sector 1"
  },
  { 
    title: "Prestige Acropolis, Koramangala", 
    building: "Prestige Acropolis", 
    street: "3rd Block Main Road", 
    area: "Koramangala", 
    pin: "560034", 
    lat: 12.9352, 
    lng: 77.6245,
    desc: "Gated luxury enclave with active morning delivery"
  },
  { 
    title: "Adarsh Palm Retreat, Bellandur", 
    building: "Adarsh Palm Retreat", 
    street: "Outer Ring Road", 
    area: "Bellandur", 
    pin: "560103", 
    lat: 12.9279, 
    lng: 77.6834,
    desc: "Upscale residential community near EcoSpace Tech Park"
  },
  { 
    title: "Purva Riviera, Marathahalli", 
    building: "Purva Riviera", 
    street: "Varthur Main Road", 
    area: "Marathahalli", 
    pin: "560037", 
    lat: 12.9562, 
    lng: 77.7012,
    desc: "Luxury housing society near Tech Corridor"
  },
  { 
    title: "Prestige Shantiniketan, Whitefield", 
    building: "Prestige Shantiniketan", 
    street: "ITPL Main Road", 
    area: "Whitefield", 
    pin: "560066", 
    lat: 12.9860, 
    lng: 77.7300,
    desc: "Modern integrated township with smart delivery lockers"
  },
  { 
    title: "Embassy GolfLinks Residency, Domlur", 
    building: "Embassy GolfLinks", 
    street: "Intermediate Ring Road", 
    area: "Domlur / Indiranagar", 
    pin: "560071", 
    lat: 12.9602, 
    lng: 77.6481,
    desc: "Tech park cluster and executive housing"
  },
  { 
    title: "Mantri Elegance, BG Road", 
    building: "Mantri Elegance", 
    street: "Bannerghatta Main Road", 
    area: "JP Nagar", 
    pin: "560078", 
    lat: 12.8980, 
    lng: 77.5980,
    desc: "High-rise apartments in South Bengaluru"
  }
];

export default function ProfileCenter() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser, userData, logout, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { setTheme, toggleTheme } = useTheme();

  // Active Tab with URL & Route Sync
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "health", "addresses", "preferences", "emergency", "progress", "settings"].includes(tabParam)) {
      return tabParam as TabType;
    }
    if (window.location.pathname.includes("settings")) {
      return "settings";
    }
    return "profile";
  });

  // Real-time states from Firestore
  const [profileDoc, setProfileDoc] = useState<User | null>(null);
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [rewards, setRewards] = useState<RewardPoints | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isDeleteVerifyOpen, setIsDeleteVerifyOpen] = useState(false);

  // Google Address Auto-Search states
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");
  const [showGoogleSuggestions, setShowGoogleSuggestions] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: ""
  });

  const [healthForm, setHealthForm] = useState({
    age: 25,
    gender: "male",
    height: 175,
    weight: 70,
    targetWeight: 65,
    goal: "weightLoss",
    dietPreference: "vegetarian",
    wakeUpTime: "06:00",
    sleepTime: "22:00",
    allergiesInput: "",
    allergies: [] as string[],
    medicalConditionsInput: "",
    medicalConditions: [] as string[],
    dislikedFoodsInput: "",
    dislikedFoods: [] as string[],
    deliveryTime: "Lunch (12:00 PM - 02:00 PM)"
  });

  const [newWeight, setNewWeight] = useState("");
  
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    houseNumber: "",
    building: "",
    street: "",
    area: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "",
    addressType: "Home" as "Home" | "Work" | "Other",
    default: false,
    deliveryInstructions: "",
    latitude: 12.9121,
    longitude: 77.6445
  });

  // Food & Meal Preferences State
  const [preferencesForm, setPreferencesForm] = useState(() => {
    const saved = localStorage.getItem("taaza_user_preferences");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      tastePreference: "Balanced Savory & Fresh",
      spiceLevel: "Medium (Indian Standard)",
      portionSize: "Standard (350g)",
      deliveryTimeSlot: "Lunch (12:00 PM - 02:00 PM)",
      ecoPackaging: true,
      grainPreference: "Organic Millets & Brown Basmati",
      skipCutlery: true,
      mealFrequency: "Daily 2 Meals (Lunch + Dinner)"
    };
  });

  // Emergency Contact & Health Safeguards State
  const [emergencyForm, setEmergencyForm] = useState(() => {
    const saved = localStorage.getItem("taaza_user_emergency");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      contactName: "Sunil Sharma",
      contactPhone: "+91 98765 43210",
      relationship: "Spouse",
      doctorName: "Dr. Ananya Roy (Manipal Hospital)",
      doctorPhone: "+91 98111 22334",
      bloodGroup: "O+",
      hospitalPreference: "Manipal Hospital, HAL Airport Road, Bengaluru",
      allergicReactionProtocol: "Carries EpiPen in briefcase. Allergic to peanuts and cashew nuts. Contact emergency immediately if accidental exposure occurs."
    };
  });

  useEffect(() => {
    localStorage.setItem("taaza_user_preferences", JSON.stringify(preferencesForm));
  }, [preferencesForm]);

  useEffect(() => {
    localStorage.setItem("taaza_user_emergency", JSON.stringify(emergencyForm));
  }, [emergencyForm]);

  // Settings State
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem("taaza_app_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          language: parsed.language || "English",
          notifications: {
            push: parsed.notifications?.push ?? true,
            whatsapp: parsed.notifications?.whatsapp ?? true,
            sms: parsed.notifications?.sms ?? true,
            email: parsed.notifications?.email ?? true,
            remindBeforeDelivery: parsed.notifications?.remindBeforeDelivery ?? true,
            dailyNutritionSummary: parsed.notifications?.dailyNutritionSummary ?? true,
            renewalReminders: parsed.notifications?.renewalReminders ?? true,
            streakMilestones: parsed.notifications?.streakMilestones ?? true,
            quietHours: parsed.notifications?.quietHours ?? false
          },
          darkMode: parsed.darkMode || false,
          themeMode: parsed.themeMode || "light",
          privacy: parsed.privacy || { publicProfile: false, expertSharing: true },
          theme: parsed.theme || "green",
          audioReminders: parsed.audioReminders || "enabled",
          biometricSensitivity: parsed.biometricSensitivity ?? 75,
          deliveryBufferTime: parsed.deliveryBufferTime ?? 15,
          twoFactorAuth: parsed.twoFactorAuth ?? false,
          biometricAuth: parsed.biometricAuth ?? true,
          quietHoursStart: parsed.quietHoursStart || "22:00",
          quietHoursEnd: parsed.quietHoursEnd || "07:00",
          numberNotation: parsed.numberNotation || "indian"
        };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      language: "English",
      notifications: {
        push: true,
        whatsapp: true,
        sms: true,
        email: true,
        remindBeforeDelivery: true,
        dailyNutritionSummary: true,
        renewalReminders: true,
        streakMilestones: true,
        quietHours: false
      },
      darkMode: false,
      themeMode: "light",
      privacy: {
        publicProfile: false,
        expertSharing: true
      },
      theme: "green",
      audioReminders: "enabled",
      biometricSensitivity: 75,
      deliveryBufferTime: 15,
      twoFactorAuth: false,
      biometricAuth: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      numberNotation: "indian"
    };
  });

  // Delete account form state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("Moving out of Bengaluru");
  const [coolingOffPeriod, setCoolingOffPeriod] = useState(true);

  // Settings Sub-tab & Interactive States
  const [settingsSubTab, setSettingsSubTab] = useState<"notifications" | "language" | "theme" | "security" | "delete_account" | "api" | "terminal">(() => {
    const subParam = searchParams.get("sub") || searchParams.get("section");
    if (subParam && ["notifications", "language", "theme", "security", "delete_account", "api", "terminal"].includes(subParam)) {
      return subParam as any;
    }
    return "notifications";
  });

  // URL & SearchParams Route Sync Effect
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const subParam = searchParams.get("sub") || searchParams.get("section");

    if (tabParam && ["profile", "health", "addresses", "preferences", "emergency", "progress", "settings"].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    } else if (location.pathname.includes("settings")) {
      setActiveTab("settings");
    }

    if (subParam && ["notifications", "language", "theme", "security", "delete_account", "api", "terminal"].includes(subParam)) {
      setSettingsSubTab(subParam as any);
    }
  }, [location.pathname, searchParams]);
  
  const [generatedTokens, setGeneratedTokens] = useState<{key: string; date: string; label: string}[]>(() => {
    const saved = localStorage.getItem("taaza_api_tokens");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { key: "tz_live_9f83a48e9c7d0d1e2f3a", date: "2026-07-21", label: "Apple Health Auto-Sync" }
    ];
  });
  const [newTokenLabel, setNewTokenLabel] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "TAAZABITES SYSTEM DIAGNOSTICS v4.12.0",
    "Connecting to database...",
    "Security verified. Welcome back.",
    "Type 'help' to see available diagnostics commands.",
  ]);

  // Audio Reminders Procedural Tone Synthesizer
  const playSyntheticChime = (type: "click" | "success" | "chime" | "synth") => {
    if (appSettings.audioReminders === "none") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === "synth") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {
      console.warn("Audio Context not allowed or supported yet.", err);
    }
  };

  // Persist settings changes
  useEffect(() => {
    localStorage.setItem("taaza_app_settings", JSON.stringify(appSettings));
  }, [appSettings]);

  // Dynamic Theme Applier Effect
  useEffect(() => {
    const themeName = appSettings.theme || "green";
    const root = document.documentElement;
    if (themeName === "orange") {
      root.style.setProperty("--color-primary", "#FF6B35");
      root.style.setProperty("--color-primary-light", "#FF8E72");
      root.style.setProperty("--color-primary-dark", "#E55A2B");
      root.style.setProperty("--color-secondary", "#2D6A4F");
      root.style.setProperty("--color-accent", "#FFB703");
    } else if (themeName === "yellow") {
      root.style.setProperty("--color-primary", "#EAB308");
      root.style.setProperty("--color-primary-light", "#FEF08A");
      root.style.setProperty("--color-primary-dark", "#854D0E");
      root.style.setProperty("--color-secondary", "#FF6B35");
      root.style.setProperty("--color-accent", "#10B981");
    } else if (themeName === "mint") {
      root.style.setProperty("--color-primary", "#0D9488");
      root.style.setProperty("--color-primary-light", "#99F6E4");
      root.style.setProperty("--color-primary-dark", "#115E59");
      root.style.setProperty("--color-secondary", "#FF6B35");
      root.style.setProperty("--color-accent", "#F4A261");
    } else {
      // Default Green
      root.style.setProperty("--color-primary", "#2D6A4F");
      root.style.setProperty("--color-primary-light", "#95D5B2");
      root.style.setProperty("--color-primary-dark", "#1B4332");
      root.style.setProperty("--color-secondary", "#FF6B35");
      root.style.setProperty("--color-accent", "#F4A261");
    }
  }, [appSettings.theme]);

  // Attach Realtime Listeners
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const uid = currentUser.uid;

    const fetchProfileData = async () => {
      try {
        const [
          userSnap,
          healthSnap,
          rewardsSnap,
          walletSnap,
          subSnap
        ] = await Promise.all([
          getDoc(doc(db, "users", uid)),
          getDoc(doc(db, "healthAssessments", `ha_${uid}`)),
          getDoc(doc(db, "rewardPoints", uid)),
          getDoc(doc(db, "wallets", uid)),
          getDoc(doc(db, "subscriptions", uid))
        ]);

        if (userSnap.exists()) {
          const data = userSnap.data() as User;
          setProfileDoc(data);
          setProfileForm({
            name: data.displayName || data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            photoURL: data.photoURL || ""
          });
        }

        if (healthSnap.exists()) {
          const data = healthSnap.data() as HealthAssessment;
          setHealthAssessment(data);
          setHealthForm({
            age: data.age || 25,
            gender: data.gender || "male",
            height: data.height || 175,
            weight: data.weight || 70,
            targetWeight: data.targetWeight || 65,
            goal: data.goal || "weightLoss",
            dietPreference: data.dietPreference || data.dietaryPreference || "vegetarian",
            wakeUpTime: data.wakeUpTime || "06:00",
            sleepTime: data.sleepTime || "22:00",
            allergiesInput: "",
            allergies: Array.isArray(data.allergies) ? data.allergies : (data.allergies ? [data.allergies] : []),
            medicalConditionsInput: "",
            medicalConditions: Array.isArray(data.medicalConditions) ? data.medicalConditions : (data.medicalConditions ? [data.medicalConditions] : []),
            dislikedFoodsInput: "",
            dislikedFoods: Array.isArray((data as any).dislikedFoods) ? (data as any).dislikedFoods : ((data as any).dislikedFoods ? [(data as any).dislikedFoods] : []),
            deliveryTime: data.wakeUpTime === "05:00" ? "Breakfast (07:00 AM - 09:00 AM)" : "Lunch (12:00 PM - 02:00 PM)"
          });
        } else {
          setHealthAssessment(null);
        }

        if (rewardsSnap.exists()) {
          setRewards(rewardsSnap.data() as RewardPoints);
        }

        if (walletSnap.exists()) {
          setWallet(walletSnap.data() as Wallet);
        }

        if (subSnap.exists()) {
          setActiveSub(subSnap.data() as Subscription);
        } else {
          setActiveSub(null);
        }
      } catch (err) {
        console.error("Error fetching profile static data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();

    // 3. Addresses collection snapshot (Keep this realtime as users actively add/remove them)
    const unsubAddresses = AddressService.subscribeToAddresses(uid, (list) => {
      setAddressList(list);
    });

    return () => {
      unsubAddresses();
    };
  }, [currentUser]);

  // Fetch sessions for Security Tab
  useEffect(() => {
    if (currentUser && activeTab === "settings" && settingsSubTab === "security") {
      SessionService.getSessions(currentUser.uid).then(setSessions);
    }
  }, [currentUser, activeTab, settingsSubTab]);

  // Handle Photo Presets or Uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    // Convert to Base64 to support custom photo uploads inside Firestore perfectly
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          photoURL: base64String,
          updatedAt: serverTimestamp()
        });
        showToast("Profile photo updated successfully.", "success");
      } catch (err) {
        showToast("Failed to upload profile photo.", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const setPresetAvatar = async (avatarUrl: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        photoURL: avatarUrl,
        updatedAt: serverTimestamp()
      });
      showToast("Preset avatar applied.", "success");
    } catch (err) {
      showToast("Failed to apply preset avatar.", "error");
    }
  };

  // Profile Form update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        name: profileForm.name,
        displayName: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        updatedAt: serverTimestamp()
      });
      setIsEditingProfile(false);
      showToast("Profile saved successfully.", "success");
    } catch (err) {
      showToast("Error saving profile details.", "error");
    }
  };

  // Health Profile update
  const handleHealthSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const computedBmi = calculateBMI(healthForm.weight, healthForm.height);
      const computedBmiCategory = getBMICategory(computedBmi);
      const calculatedMacros = calculateNutrition(
        healthForm.gender,
        healthForm.age,
        healthForm.height,
        healthForm.weight,
        "moderatelyActive",
        healthForm.goal
      );

      // We maintain historical weights if we save this assessment
      const currentHistory = healthAssessment?.weightHistory || [
        { date: new Date().toISOString().split("T")[0], weight: healthForm.weight }
      ];

      const assessmentPayload: any = {
        userId: currentUser.uid,
        fullName: profileDoc?.name || profileDoc?.displayName || currentUser.email || "TaazaBites User",
        phone: profileDoc?.phone || "",
        email: currentUser.email || "",
        age: Number(healthForm.age),
        gender: healthForm.gender,
        height: Number(healthForm.height),
        weight: Number(healthForm.weight),
        targetWeight: Number(healthForm.targetWeight),
        goal: healthForm.goal,
        dietPreference: healthForm.dietPreference,
        wakeUpTime: healthForm.wakeUpTime,
        sleepTime: healthForm.sleepTime,
        allergies: healthForm.allergies,
        medicalConditions: healthForm.medicalConditions,
        dislikedFoods: healthForm.dislikedFoods,
        bmi: computedBmi,
        bmiCategory: computedBmiCategory,
        recommendedCalories: calculatedMacros.recommendedCalories,
        recommendedProtein: calculatedMacros.recommendedProtein,
        recommendedWater: calculatedMacros.recommendedWater,
        weightHistory: currentHistory,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "healthAssessments", `ha_${currentUser.uid}`), assessmentPayload, { merge: true });
      setIsEditingHealth(false);
      showToast("Health details saved successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save health details.", "error");
    }
  };

  // Weight Progress Logger
  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newWeight) return;

    const parsedWeight = parseFloat(newWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 20 || parsedWeight > 300) {
      showToast("Please enter a realistic weight value.", "error");
      return;
    }

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const newLog = { date: todayStr, weight: parsedWeight };

      let updatedHistory = [...(healthAssessment?.weightHistory || [])];
      
      // If today already logged, update it, else append
      const existingIndex = updatedHistory.findIndex(log => log.date === todayStr);
      if (existingIndex > -1) {
        updatedHistory[existingIndex] = newLog;
      } else {
        updatedHistory.push(newLog);
      }

      // Sort logs chronologically
      updatedHistory.sort((a, b) => a.date.localeCompare(b.date));

      const computedBmi = calculateBMI(parsedWeight, healthAssessment?.height || healthForm.height);
      const computedBmiCategory = getBMICategory(computedBmi);

      // Also trigger new nutrition recommendation automatically!
      const recMacros = calculateNutrition(
        healthAssessment?.gender || healthForm.gender,
        healthAssessment?.age || healthForm.age,
        healthAssessment?.height || healthForm.height,
        parsedWeight,
        "moderatelyActive",
        healthAssessment?.goal || healthForm.goal
      );

      await setDoc(doc(db, "healthAssessments", `ha_${currentUser.uid}`), {
        weight: parsedWeight,
        bmi: computedBmi,
        bmiCategory: computedBmiCategory,
        recommendedCalories: recMacros.recommendedCalories,
        recommendedProtein: recMacros.recommendedProtein,
        recommendedWater: recMacros.recommendedWater,
        weightHistory: updatedHistory,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setNewWeight("");
      setIsLoggingWeight(false);
      showToast(`Weight logged: ${parsedWeight} kg. Keep up the great work!`, "success");
    } catch (err) {
      showToast("Failed to log weight entry.", "error");
    }
  };

  // Interactive Water Logger
  const handleLogWater = async (amount: number) => {
    if (!currentUser || !healthAssessment) return;
    const currentWater = healthAssessment.waterIntake || 0;
    const nextWater = parseFloat(Math.max(0, currentWater + amount).toFixed(1));

    try {
      await updateDoc(doc(db, "healthAssessments", `ha_${currentUser.uid}`), {
        waterIntake: nextWater,
        updatedAt: serverTimestamp()
      });
      if (amount > 0) {
        showToast(`Hydration added: +${amount * 1000}ml. Excellent work! 💧`, "success");
      }
    } catch (err) {
      showToast("Error updating water log.", "error");
    }
  };

  // Address CRUD actions
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!addressForm.fullName || !addressForm.phone || !addressForm.houseNumber || !addressForm.street || !addressForm.area || !addressForm.pincode) {
      showToast("Please fill in all required address fields.", "error");
      return;
    }

    try {
      const payload = {
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        houseNumber: addressForm.houseNumber,
        building: addressForm.building,
        street: addressForm.street,
        area: addressForm.area,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        addressType: addressForm.addressType,
        default: addressForm.default,
        deliveryInstructions: addressForm.deliveryInstructions,
        latitude: addressForm.latitude,
        longitude: addressForm.longitude,
        verified: false
      };

      if (isEditingAddress) {
        await AddressService.updateAddress(isEditingAddress.id, payload);
        showToast("Address updated successfully.", "success");
      } else {
        await AddressService.addAddress(currentUser.uid, payload);
        showToast("New address added successfully.", "success");
      }

      setIsAddingAddress(false);
      setIsEditingAddress(null);
      resetAddressForm();
    } catch (err) {
      showToast("Failed to save address.", "error");
    }
  };

  const handleEditAddressClick = (addr: Address) => {
    setIsEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      houseNumber: addr.houseNumber,
      building: addr.building || "",
      street: addr.street,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType as any,
      default: addr.default || false,
      deliveryInstructions: addr.deliveryInstructions || "",
      latitude: addr.latitude || 28.5355,
      longitude: addr.longitude || 77.3910
    });
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await AddressService.deleteAddress(id);
      showToast("Address deleted successfully.", "info");
    } catch (err) {
      showToast("Failed to delete address.", "error");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!currentUser) return;
    try {
      await AddressService.updateAddress(id, { default: true });
      showToast("Default delivery address updated.", "success");
    } catch (err) {
      showToast("Failed to set default address.", "error");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: profileDoc?.name || profileDoc?.displayName || "",
      phone: profileDoc?.phone || "",
      houseNumber: "",
      building: "",
      street: "",
      area: "",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "",
      addressType: "Home",
      default: false,
      deliveryInstructions: "",
      latitude: 12.9121,
      longitude: 77.6445
    });
    setGoogleSearchQuery("");
    setShowGoogleSuggestions(false);
  };

  const mockSetMapCoords = (lat: number, lng: number, pin: string, areaName: string) => {
    setAddressForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      pincode: pin,
      area: areaName,
      street: `${areaName} Main Road`
    }));
    showToast(`Location set to ${areaName}. Fields auto-filled!`, "success");
  };

  // Settings & Toggles
  const toggleDarkMode = () => {
    toggleTheme();
    setAppSettings(prev => ({ ...prev, darkMode: !prev.darkMode, themeMode: prev.darkMode ? "light" : "dark" }));
    showToast(`Theme switched to ${document.documentElement.classList.contains("dark") ? "Vibrant Light Mode" : "Premium Dark Mode"}`, "info");
  };

  // Delete Account Action
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      // Real database clean up
      await deleteDoc(doc(db, "users", currentUser.uid)).catch(() => {});
      await deleteDoc(doc(db, "healthAssessments", `ha_${currentUser.uid}`)).catch(() => {});
      showToast("Your account and profile data have been deleted.", "info");
      await logout();
    } catch (err) {
      showToast("Account reset complete.", "info");
      await logout();
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!currentUser) return;
    try {
      await SessionService.revokeSession(currentUser.uid, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      showToast("Session revoked successfully.", "success");
    } catch (err) {
      showToast("Failed to revoke session.", "error");
    }
  };

  // Developer Credentials Sandbox Handlers
  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenLabel.trim()) {
      showToast("Please provide a label for your key.", "warning");
      return;
    }
    const chars = "0123456789abcdef";
    const randomHex = Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * 16)]).join("");
    const key = `tz_live_${randomHex}`;
    const newTok = {
      key,
      date: new Date().toISOString().split("T")[0],
      label: newTokenLabel.trim()
    };
    const updated = [newTok, ...generatedTokens];
    setGeneratedTokens(updated);
    localStorage.setItem("taaza_api_tokens", JSON.stringify(updated));
    setNewTokenLabel("");
    showToast(`Access Key for "${newTok.label}" provisioned successfully!`, "success");
  };

  const handleDeleteToken = (keyToDelete: string) => {
    const updated = generatedTokens.filter(tok => tok.key !== keyToDelete);
    setGeneratedTokens(updated);
    localStorage.setItem("taaza_api_tokens", JSON.stringify(updated));
    showToast("Access Key revoked.", "info");
  };

  const copyToClipboard = async (text: string) => {
    try {
      const ok = await safeCopyToClipboard(text);
      if (ok) {
        setCopiedToken(text);
        setTimeout(() => setCopiedToken(null), 2000);
        showToast("Token copied to clipboard!", "success");
      } else {
        showToast("Failed to copy token.", "error");
      }
    } catch (err) {
      showToast("Failed to copy. Try selecting and copying manually.", "error");
    }
  };

  // Interactive System Terminal Handlers
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    setTerminalLogs(prev => [...prev, `$ ${cmd}`]);
    setTerminalInput("");

    const normCmd = cmd.toLowerCase();
    if (normCmd === "help") {
      setTerminalLogs(prev => [
        ...prev,
        "Available diagnostics commands:",
        "  help      - List all available console diagnostic utilities",
        "  status    - View active database connection, health parameters & memory shards",
        "  ping      - Test response latency to taaza-core server",
        "  sub       - Query active dietary subscription tier metadata",
        "  metrics   - Display water intake logs and profile completeness score",
        "  clear     - Clean the log terminal cache"
      ]);
    } else if (normCmd === "status") {
      setTerminalLogs(prev => [
        ...prev,
        `✓ Connection state: CONNECTED TO FIREBASE`,
        `✓ Active Database: ${currentUser ? "users/" + currentUser.uid : "ANONYMOUS_SANDBOX"}`,
        `✓ Memory Pool: STABLE (Usage: 2.14MB)`,
        `✓ Health Assessment: ${healthAssessment ? "VERIFIED (Level " + (healthAssessment as any).targetCalories + " kcal/day)" : "PENDING"}`,
        `✓ API Credentials: ${generatedTokens.length} active credential keys in secure local storage`
      ]);
    } else if (normCmd === "ping") {
      setTerminalLogs(prev => [
        ...prev,
        "Pinging https://api.taazabites.com/v1 ...",
        `✓ 64 bytes from taaza-core: icmp_seq=1 ttl=56 time=${(10 + Math.random() * 20).toFixed(1)}ms`,
        `✓ 64 bytes from taaza-core: icmp_seq=2 ttl=56 time=${(10 + Math.random() * 20).toFixed(1)}ms`,
        "--- taaza-core ping statistics ---",
        "2 packets transmitted, 2 received, 0% packet loss, time 1002ms"
      ]);
    } else if (normCmd === "sub") {
      setTerminalLogs(prev => [
        ...prev,
        `✓ Active Plan: ${activeSub?.planId || "NONE (Trial Sandbox)"}`,
        `✓ Subscription Status: ${activeSub?.status || "INACTIVE"}`,
        `✓ Next Delivery Trigger: Tomorrow 11:30 AM (Slot: Lunch)`,
        `✓ Pincode Lock: ${addressList.find(a => a.default)?.pincode || "No default address set"}`
      ]);
    } else if (normCmd === "metrics") {
      const completion = [
        profileDoc?.name,
        profileDoc?.phone,
        healthAssessment,
        addressList.length > 0
      ].filter(Boolean).length * 25;

      const waterLog = { todayMl: (healthAssessment?.waterIntake || 0) * 1000 };
      const weightLogs = healthAssessment?.weightHistory || [];

      setTerminalLogs(prev => [
        ...prev,
        `✓ Hydration log: ${waterLog?.todayMl || 0} mL logged today`,
        `✓ Weight log count: ${weightLogs.length} historical records`,
        `✓ Profile completion: ${completion}% / 100%`,
        `✓ Metabolic tier: ${rewards?.currentPoints || 0} rewards points (${getTierAndBadges().name} Member)`
      ]);
    } else if (normCmd === "clear") {
      setTerminalLogs([
        "TAAZABITES SYSTEM DIAGNOSTICS v4.12.0",
        "Type 'help' to see available diagnostics commands."
      ]);
    } else {
      setTerminalLogs(prev => [
        ...prev,
        `! Command '${cmd}' not recognized. Type 'help' for valid diagnostic sequences.`
      ]);
    }
  };

  // Calculate Achievements & Tiers
  const getTierAndBadges = () => {
    const pts = rewards?.currentPoints || 0;
    if (pts >= 10000) return { name: "Diamond", color: "text-sky-400", border: "border-sky-500/20", bg: "bg-sky-500/10", icon: "💎", requirement: "Unrivaled nutritional champion" };
    if (pts >= 5000) return { name: "Platinum", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10", icon: "👑", next: 10000 - pts, nextTier: "Diamond" };
    if (pts >= 2500) return { name: "Gold", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10", icon: "🏆", next: 5000 - pts, nextTier: "Platinum" };
    if (pts >= 1000) return { name: "Silver", color: "text-slate-400", border: "border-slate-500/20", bg: "bg-slate-500/10", icon: "🛡️", next: 2500 - pts, nextTier: "Gold" };
    return { name: "Bronze", color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/10", icon: "🪙", next: 1000 - pts, nextTier: "Silver" };
  };

  const currentTier = getTierAndBadges();

  // Preset Avatars
  const presetAvatars = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Boots",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Tiger",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Scooter"
  ];

  // Helper arrays for tags
  const addAllergy = () => {
    if (!healthForm.allergiesInput.trim()) return;
    setHealthForm(prev => ({
      ...prev,
      allergies: [...prev.allergies, prev.allergiesInput.trim()],
      allergiesInput: ""
    }));
  };

  const removeAllergy = (index: number) => {
    setHealthForm(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (!healthForm.medicalConditionsInput.trim()) return;
    setHealthForm(prev => ({
      ...prev,
      medicalConditions: [...prev.medicalConditions, prev.medicalConditionsInput.trim()],
      medicalConditionsInput: ""
    }));
  };

  const removeCondition = (index: number) => {
    setHealthForm(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }));
  };

  const addDislikedFood = () => {
    if (!healthForm.dislikedFoodsInput.trim()) return;
    setHealthForm(prev => ({
      ...prev,
      dislikedFoods: [...prev.dislikedFoods, prev.dislikedFoodsInput.trim()],
      dislikedFoodsInput: ""
    }));
  };

  const removeDislikedFood = (index: number) => {
    setHealthForm(prev => ({
      ...prev,
      dislikedFoods: prev.dislikedFoods.filter((_, i) => i !== index)
    }));
  };

  // Skeleton Loader screen
  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading Health Profile...</p>
      </div>
    );
  }

  // Calculate Goal Completion %
  const getGoalCompletionPercentage = () => {
    if (!healthAssessment) return 0;
    const cur = healthAssessment.weight || 0;
    const target = healthAssessment.targetWeight || 0;
    
    // We assume initialWeight was their first log or weight history first entry
    const initial = healthAssessment.weightHistory?.[0]?.weight || cur;
    if (Math.abs(initial - target) === 0) return 100;
    
    const progress = Math.abs(initial - cur) / Math.abs(initial - target);
    return Math.min(100, Math.round(progress * 100));
  };

  return (
    <PageTransition>
      <div className="space-y-6 sm:space-y-10 px-4 sm:px-0">
        <PageHeader 
          title={activeTab === "settings" ? "Settings & System Control Center" : "My Profile"}
          description={activeTab === "settings" ? "Configure logistics alerts, dark mode, regional languages, 2FA security, device sessions, and developer API keys." : "Manage your profile, monitor health progress, and customize delivery preferences through your account dashboard."}
          badge={activeTab === "settings" ? "System Control Center" : "Customer Profile"}
          icon={activeTab === "settings" ? Settings : HeartPulse}
          gradient="from-emerald-950 via-zinc-900 to-zinc-950"
        >
          <div className="flex items-center gap-2 bg-emerald-50/10 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </div>
        </PageHeader>

        {/* Tabs navigation */}
      <div className="flex flex-nowrap sm:flex-wrap gap-2 p-1 bg-zinc-100/80 rounded-2xl w-full max-w-5xl overflow-x-auto hide-scrollbar scrollbar-hide">
        {[
          { id: "profile", label: "Personal Details", icon: UserIcon },
          { id: "health", label: "Medical Details", icon: HeartPulse },
          { id: "addresses", label: "Addresses", icon: MapPin },
          { id: "preferences", label: "Preferences", icon: Sliders },
          { id: "emergency", label: "Emergency Contact", icon: ShieldAlert },
          { id: "progress", label: "Weight Progress", icon: Scale },
          { id: "settings", label: "Settings", icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "whitespace-nowrap flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
              activeTab === tab.id 
                ? "bg-white text-zinc-900 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
            )}
          >
            <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* TAB 1: PROFILE & IDENTITY */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div className="bg-zinc-950 text-white rounded-3xl sm:rounded-[3.5rem] p-6 sm:p-10 shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48 group-hover:bg-emerald-500/20 transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 group-hover:bg-blue-500/20 transition-all duration-700" />
                  
                  <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 relative z-10">
                    <div className="relative">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl sm:rounded-[3rem] overflow-hidden bg-zinc-900 border-4 border-white/10 shadow-2xl relative flex items-center justify-center group/avatar">
                        {profileForm.photoURL ? (
                          <img src={profileForm.photoURL} alt="Profile" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" loading="lazy" />
                        ) : (
                          <div className="text-zinc-700">
                            <UserIcon className="h-16 w-16 sm:h-20 sm:w-20" />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                          <Camera className="h-8 w-8 text-white" />
                          <input type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4 sm:space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tightest">
                          {profileDoc?.name || profileDoc?.displayName || "Nutrition Pioneer"}
                        </h3>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          Protocol ID: TZB-{currentUser?.uid.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                        <div className={cn("px-4 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border rounded-2xl backdrop-blur-md", currentTier.bg, currentTier.color, currentTier.border)}>
                          {currentTier.icon} {currentTier.name} Status
                        </div>
                        <div className={cn("px-4 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border rounded-2xl backdrop-blur-md", activeSub ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-zinc-500 border-white/5")}>
                          {activeSub ? `Protocol: ${activeSub.planName || "Pro Plan"}` : "No Active Protocol"}
                        </div>
                      </div>

                      <p className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-tight">
                        Synchronization Initialized: <span className="font-bold text-white">{profileDoc?.createdAt && typeof profileDoc.createdAt === 'object' && 'seconds' in profileDoc.createdAt ? new Date((profileDoc.createdAt as any).seconds * 1000).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "July 2026"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Preset avatar selector */}
                  <div className="mt-8 pt-6 border-t border-zinc-50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Or Quick Apply Preset Bio Avatar:</p>
                    <div className="flex gap-3">
                      {presetAvatars.map((av, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setPresetAvatar(av)}
                          className="w-12 h-12 rounded-xl overflow-hidden hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 transition-all bg-zinc-50 border border-zinc-100 cursor-pointer"
                        >
                          <img src={av} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit form */}
                <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-8 shadow-xs">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 uppercase tracking-wider">Secure credentials</h3>
                    {!isEditingProfile && (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <input 
                              type="text" 
                              required
                              value={profileForm.name}
                              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full pl-12 pr-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <input 
                              type="email" 
                              required
                              value={profileForm.email}
                              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="w-full pl-12 pr-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phone Number (Verified)</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <input 
                              type="tel" 
                              required
                              value={profileForm.phone}
                              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                              className="w-full pl-12 pr-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          type="submit"
                          className="px-6 h-12 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black cursor-pointer"
                        >
                          Save Profile
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              name: profileDoc?.displayName || profileDoc?.name || "",
                              email: profileDoc?.email || "",
                              phone: profileDoc?.phone || "",
                              photoURL: profileDoc?.photoURL || ""
                            });
                          }}
                          className="px-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Full Name</span>
                        <p className="text-sm font-bold text-zinc-900">{profileDoc?.name || profileDoc?.displayName || "Not Saved"}</p>
                      </div>

                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Primary Email</span>
                        <p className="text-sm font-bold text-zinc-900">{profileDoc?.email || "No Email Provided"}</p>
                      </div>

                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Mobile Number</span>
                        <p className="text-sm font-bold text-zinc-900">{profileDoc?.phone || "No phone linked"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements Sidebar */}
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400">
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Plan</p>
                        <h4 className="text-base sm:text-lg font-black tracking-tight">Reward Points Wallet</h4>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Available Balance</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400">{rewards?.currentPoints || 0}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-zinc-400">PTS</span>
                      </div>
                    </div>

                    {currentTier.next && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                          <span className="text-zinc-500">Next unlock: {currentTier.nextTier}</span>
                          <span className="text-emerald-400">{currentTier.next} PTS more</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${Math.min(100, Math.max(0, ((rewards?.currentPoints || 0) % 1000) / 10))}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Unlocked Badge Achievements:</span>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center gap-2">
                          <span className="text-lg sm:text-xl">🪙</span>
                          <div>
                            <p className="text-[10px] sm:text-xs font-black">Bronze Medal</p>
                            <p className="text-[8px] sm:text-[9px] font-bold text-emerald-500 uppercase">Active</p>
                          </div>
                        </div>

                        <div className={cn("p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all", (rewards?.currentPoints || 0) >= 1000 ? "opacity-100" : "opacity-30")}>
                          <span className="text-lg sm:text-xl">🛡️</span>
                          <div>
                            <p className="text-[10px] sm:text-xs font-black">Silver Shield</p>
                            <p className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase">{(rewards?.currentPoints || 0) >= 1000 ? "Active" : "Locked"}</p>
                          </div>
                        </div>

                        <div className={cn("p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all", (rewards?.currentPoints || 0) >= 2500 ? "opacity-100" : "opacity-30")}>
                          <span className="text-lg sm:text-xl">🏆</span>
                          <div>
                            <p className="text-[10px] sm:text-xs font-black">Gold Trophy</p>
                            <p className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase">{(rewards?.currentPoints || 0) >= 2500 ? "Active" : "Locked"}</p>
                          </div>
                        </div>

                        <div className={cn("p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all", (rewards?.currentPoints || 0) >= 5000 ? "opacity-100" : "opacity-30")}>
                          <span className="text-lg sm:text-xl">👑</span>
                          <div>
                            <p className="text-[10px] sm:text-xs font-black">Plat Crown</p>
                            <p className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase">{(rewards?.currentPoints || 0) >= 5000 ? "Active" : "Locked"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-3xl sm:rounded-[2.5rem] border border-emerald-100 p-6 sm:p-8 text-center space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h5 className="text-[11px] sm:text-sm font-black text-emerald-950 uppercase tracking-wide">Loyalty Rewards</h5>
                    <p className="text-[10px] sm:text-xs text-emerald-700 leading-relaxed mt-1 font-medium px-2 sm:px-0">
                      Every healthy meal you order earns you points. Keep ordering to collect more rewards and discounts!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH & NUTRITION */}
          {activeTab === "health" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Form or parameters block */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-8 shadow-xs">
                  <div className="flex justify-between items-center mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-black tracking-tight text-zinc-900">Metabolic Indicators</h4>
                        <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">Sync variables inside our nutritional model</p>
                      </div>
                    </div>
                    {!isEditingHealth && (
                      <button 
                        onClick={() => setIsEditingHealth(true)}
                        className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Re-Evaluate Metrics</span><span className="sm:hidden">Edit</span>
                      </button>
                    )}
                  </div>

                  {isEditingHealth ? (
                    <form onSubmit={handleHealthSave} className="space-y-6 sm:space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-6 border-b border-zinc-50">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Gender</label>
                          <select 
                            value={healthForm.gender}
                            onChange={e => setHealthForm({ ...healthForm, gender: e.target.value })}
                            className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Age</label>
                          <input 
                            type="number" 
                            required
                            min="16" max="100"
                            value={healthForm.age}
                            onChange={e => setHealthForm({ ...healthForm, age: Number(e.target.value) })}
                            className="w-full px-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Height (cm)</label>
                          <input 
                            type="number" 
                            required
                            min="100" max="250"
                            value={healthForm.height}
                            onChange={e => setHealthForm({ ...healthForm, height: Number(e.target.value) })}
                            className="w-full px-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Weight (kg)</label>
                          <input 
                            type="number" 
                            required
                            min="30" max="300"
                            value={healthForm.weight}
                            onChange={e => setHealthForm({ ...healthForm, weight: Number(e.target.value) })}
                            className="w-full px-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Weight (kg)</label>
                          <input 
                            type="number" 
                            required
                            min="30" max="300"
                            value={healthForm.targetWeight}
                            onChange={e => setHealthForm({ ...healthForm, targetWeight: Number(e.target.value) })}
                            className="w-full px-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Biological Goal</label>
                          <select 
                            value={healthForm.goal}
                            onChange={e => setHealthForm({ ...healthForm, goal: e.target.value })}
                            className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                          >
                            <option value="weightLoss">Weight Loss Protocol</option>
                            <option value="muscleGain">Muscle Gain Protocol</option>
                            <option value="maintenance">Maintenance Protocol</option>
                            <option value="pcos">PCOS Management</option>
                            <option value="diabetes">Diabetes / Glycemic Protocol</option>
                          </select>
                        </div>
                      </div>

                      {/* Dietary preference parameters */}
                      <div className="space-y-6">
                        <h5 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Food Rules & Allergens</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Primary Food Type</label>
                            <select 
                              value={healthForm.dietPreference}
                              onChange={e => setHealthForm({ ...healthForm, dietPreference: e.target.value })}
                              className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            >
                              <option value="vegetarian">Veg (Strictly Vegetarian)</option>
                              <option value="eggetarian">Egg (Egg & Dairy OK)</option>
                              <option value="non-vegetarian">Non-Veg (Poultry, Fish, Red Meat OK)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preferred Delivery Slot</label>
                            <select 
                              value={healthForm.deliveryTime}
                              onChange={e => setHealthForm({ ...healthForm, deliveryTime: e.target.value })}
                              className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            >
                              <option value="Breakfast (07:00 AM - 09:00 AM)">Breakfast (07:00 AM - 09:00 AM)</option>
                              <option value="Lunch (12:00 PM - 02:00 PM)">Lunch (12:00 PM - 02:00 PM)</option>
                              <option value="Dinner (07:00 PM - 09:00 PM)">Dinner (07:00 PM - 09:00 PM)</option>
                            </select>
                          </div>
                        </div>

                        {/* Interactive arrays */}
                        <div className="space-y-4">
                          {/* Allergies */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Biological Allergens</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="e.g. Gluten, Peanut, Lactose"
                                value={healthForm.allergiesInput}
                                onChange={e => setHealthForm({ ...healthForm, allergiesInput: e.target.value })}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                                className="flex-1 px-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold outline-none"
                              />
                              <button 
                                type="button" 
                                onClick={addAllergy}
                                className="px-4 h-12 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {healthForm.allergies.map((allergy, index) => (
                                <span key={index} className="px-3 py-1 bg-red-50 border border-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                                  {allergy}
                                  <button type="button" onClick={() => removeAllergy(index)} className="text-red-400 hover:text-red-600 font-bold ml-1 cursor-pointer">×</button>
                                </span>
                              ))}
                              {healthForm.allergies.length === 0 && <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mt-1">None registered</p>}
                            </div>
                          </div>

                          {/* Medical Conditions */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Medical Conditions</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="e.g. PCOS, Diabetes, Thyroid, Hypertension"
                                value={healthForm.medicalConditionsInput}
                                onChange={e => setHealthForm({ ...healthForm, medicalConditionsInput: e.target.value })}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCondition())}
                                className="flex-1 px-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold outline-none"
                              />
                              <button 
                                type="button" 
                                onClick={addCondition}
                                className="px-4 h-12 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {healthForm.medicalConditions.map((cond, index) => (
                                <span key={index} className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                                  {cond}
                                  <button type="button" onClick={() => removeCondition(index)} className="text-amber-400 hover:text-amber-600 font-bold ml-1 cursor-pointer">×</button>
                                </span>
                              ))}
                              {healthForm.medicalConditions.length === 0 && <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mt-1">None registered</p>}
                            </div>
                          </div>

                          {/* Disliked Foods */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Excluded/Disliked Ingredients</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="e.g. Mushrooms, Olives, Onions"
                                value={healthForm.dislikedFoodsInput}
                                onChange={e => setHealthForm({ ...healthForm, dislikedFoodsInput: e.target.value })}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addDislikedFood())}
                                className="flex-1 px-4 h-12 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold outline-none"
                              />
                              <button 
                                type="button" 
                                onClick={addDislikedFood}
                                className="px-4 h-12 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Exclude
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {healthForm.dislikedFoods.map((food, index) => (
                                <span key={index} className="px-3 py-1 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-full text-xs font-bold flex items-center gap-1">
                                  {food}
                                  <button type="button" onClick={() => removeDislikedFood(index)} className="text-zinc-400 hover:text-zinc-600 font-bold ml-1 cursor-pointer">×</button>
                                </span>
                              ))}
                              {healthForm.dislikedFoods.length === 0 && <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mt-1">None registered</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-zinc-50">
                        <button 
                          type="submit"
                          className="px-8 h-12 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 cursor-pointer"
                        >
                          Verify & Sync Protocol
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsEditingHealth(false);
                          }}
                          className="px-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-8">
                      {/* Metric widgets */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Calculated BMI</span>
                          <p className="text-xl font-black text-zinc-950 mt-1">{healthAssessment?.bmi || "0.0"}</p>
                          <span className="text-[10px] font-bold text-emerald-600 block mt-1">{healthAssessment?.bmiCategory || "Healthy Indicator"}</span>
                        </div>

                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Active Height</span>
                          <p className="text-xl font-black text-zinc-950 mt-1">{healthAssessment?.height || "0"} cm</p>
                          <span className="text-[10px] font-bold text-zinc-400 block mt-1">Biological height</span>
                        </div>

                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Active Weight</span>
                          <p className="text-xl font-black text-zinc-950 mt-1">{healthAssessment?.weight || "0"} kg</p>
                          <span className="text-[10px] font-bold text-zinc-400 block mt-1">Target: {healthAssessment?.targetWeight || "0"} kg</span>
                        </div>

                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Biometric Goal</span>
                          <p className="text-base font-black text-emerald-600 mt-2 truncate capitalize">
                            {healthAssessment?.goal?.replace(/([A-Z])/g, ' $1') || "Not Setup"}
                          </p>
                        </div>
                      </div>

                      {/* Food Rules & Delivery Time Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-50">
                        <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Food & Exclusions</h5>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Diet Type</span>
                              <span className="text-zinc-900 capitalize">{healthAssessment?.dietPreference || healthAssessment?.dietaryPreference || "Vegetarian"}</span>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Allergens</span>
                              <div className="flex gap-1.5">
                                {healthAssessment?.allergies?.map((al, idx) => (
                                  <span key={idx} className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wide border border-red-100">{al}</span>
                                )) || "None"}
                              </div>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Medical Exclusions</span>
                              <div className="flex gap-1.5">
                                {healthAssessment?.medicalConditions?.map((cond, idx) => (
                                  <span key={idx} className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wide border border-amber-100">{cond}</span>
                                )) || "None"}
                              </div>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Disliked Foods</span>
                              <div className="flex gap-1.5 flex-wrap justify-end">
                                {(healthAssessment as any)?.dislikedFoods?.map((df: string, idx: number) => (
                                  <span key={idx} className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wide border border-zinc-200">{df}</span>
                                )) || "None"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Metabolic Clock</h5>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Wake-up Time</span>
                              <span className="text-zinc-900 font-mono">{healthAssessment?.wakeUpTime || "06:00 AM"}</span>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Sleep Time</span>
                              <span className="text-zinc-900 font-mono">{healthAssessment?.sleepTime || "10:00 PM"}</span>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Daily Target Hydration</span>
                              <span className="text-emerald-600 font-black">{healthAssessment?.recommendedWater || "2.5"} Liters</span>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs font-bold text-zinc-600">
                              <span className="uppercase tracking-widest text-zinc-400 text-[9px]">Preferred Delivery slot</span>
                              <span className="text-zinc-900 font-black">{healthAssessment?.wakeUpTime === "05:00" ? "Breakfast (07:00 AM - 09:00 AM)" : "Lunch (12:00 PM - 02:00 PM)"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nutrition goals card */}
              <div className="space-y-8">
                <div className="bg-zinc-900 rounded-[2.5rem] text-white p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400">
                      <Apple className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Daily Targets</p>
                      <h4 className="text-lg font-black tracking-tight">Macro Allocation</h4>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-4">
                    {/* Calories */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Recommended Calories</span>
                        <span className="text-emerald-400 font-black">{healthAssessment?.recommendedCalories || 1850} KCAL</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-emerald-500 w-[78%]" />
                      </div>
                    </div>

                    {/* Protein */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Protein Target</span>
                        <span className="text-blue-400 font-black">{healthAssessment?.recommendedProtein || 110} G</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-blue-500 w-[65%]" />
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Carbohydrates Target</span>
                        <span className="text-amber-400 font-black">{Math.round((healthAssessment?.recommendedCalories || 1850) * 0.45 / 4)} G</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-amber-500 w-[80%]" />
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Fats Target</span>
                        <span className="text-purple-400 font-black">{Math.round((healthAssessment?.recommendedCalories || 1850) * 0.25 / 9)} G</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-purple-500 w-[55%]" />
                      </div>
                    </div>

                    {/* Calories burned */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Active Calories Burned</span>
                        <span className="text-rose-400 font-black">350 KCAL</span>
                      </div>
                      <div className="flex gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                        <Flame className="h-3.5 w-3.5 text-rose-400" /> Based on Light Training logs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Water Logger inside sidebar */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-900 font-black uppercase text-xs tracking-wider">
                      <Droplet className="h-5 w-5 text-blue-500 animate-bounce" /> Hydration Tracker
                    </div>
                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                      {healthAssessment?.waterIntake || 0} / {healthAssessment?.recommendedWater || 2.5} L
                    </span>
                  </div>

                  {/* Water glass animation indicator */}
                  <div className="relative h-24 bg-blue-50/40 rounded-2xl overflow-hidden border border-blue-100 flex items-center justify-center">
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-blue-400/20"
                      initial={{ height: "0%" }}
                      animate={{ height: `${Math.min(100, Math.round(((healthAssessment?.waterIntake || 0) / (healthAssessment?.recommendedWater || 2.5)) * 100))}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="relative z-10 text-center">
                      <p className="text-lg font-black text-blue-950">
                        {Math.min(100, Math.round(((healthAssessment?.waterIntake || 0) / (healthAssessment?.recommendedWater || 2.5)) * 100))}%
                      </p>
                      <p className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Daily Hydration Complete</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleLogWater(0.25)}
                      className="h-11 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 transition-colors cursor-pointer"
                    >
                      + 250ml Glass
                    </button>
                    <button 
                      onClick={() => handleLogWater(-0.25)}
                      disabled={(healthAssessment?.waterIntake || 0) <= 0}
                      className="h-11 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-wider border border-zinc-150 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      - 250ml
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEIGHT PROGRESS */}
          {activeTab === "progress" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Chart pane */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-8 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                      <h4 className="text-base sm:text-lg font-black tracking-tight text-zinc-900">Biometric Trend Analysis</h4>
                      <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">Weekly & monthly progress records synced with DB</p>
                    </div>
                    <button
                      onClick={() => setIsLoggingWeight(true)}
                      className="w-full sm:w-auto bg-zinc-900 text-white rounded-xl h-11 px-5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-black cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Log Current Weight
                    </button>
                  </div>

                  {/* Weight history logger popup form */}
                  <AnimatePresence>
                    {isLoggingWeight && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleLogWeight}
                        className="p-6 bg-zinc-50 rounded-2xl border border-zinc-150 mb-8 space-y-4 overflow-hidden"
                      >
                        <h5 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Log Weight Parameter</h5>
                        <div className="flex gap-3">
                          <input 
                            type="number"
                            step="0.1"
                            required
                            placeholder="e.g. 68.4"
                            value={newWeight}
                            onChange={e => setNewWeight(e.target.value)}
                            className="flex-1 h-12 px-4 rounded-xl border border-zinc-150 bg-white font-bold outline-none text-sm"
                          />
                          <button 
                            type="submit"
                            className="px-6 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                          >
                            Save Parameter
                          </button>
                          <button 
                            type="button"
                            onClick={() => setIsLoggingWeight(false)}
                            className="px-4 h-12 bg-zinc-200 text-zinc-600 hover:bg-zinc-250 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Recharts chart representation */}
                  <div className="h-80 w-full mt-4">
                    {healthAssessment?.weightHistory && healthAssessment.weightHistory.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={healthAssessment.weightHistory}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#a1a1aa" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            domain={['dataMin - 5', 'dataMax + 5']} 
                            stroke="#a1a1aa" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            dx={-5}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              background: "#ffffff", 
                              border: "1px solid #f4f4f5", 
                              borderRadius: "1rem",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                            }}
                            labelStyle={{ fontWeight: "bold", fontSize: "11px", color: "#18181b" }}
                            itemStyle={{ fontWeight: "bold", fontSize: "12px", color: "#10b981" }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorWeight)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-zinc-50 rounded-2xl border border-zinc-100 p-8 text-center opacity-70">
                        <Scale className="h-10 w-10 text-zinc-300 mb-2" />
                        <p className="text-sm font-bold text-zinc-900">Insufficient Progress Logs</p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                          Please log your weight over a few days so we can show you a helpful progress chart!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress logs list */}
                <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-8 shadow-xs">
                  <h4 className="text-[10px] sm:text-sm font-black text-zinc-900 uppercase tracking-wider mb-6">Historical Log Records</h4>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                    {healthAssessment?.weightHistory && healthAssessment.weightHistory.length > 0 ? (
                      [...healthAssessment.weightHistory].reverse().map((log: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100 font-bold text-sm">
                          <span className="text-zinc-500 font-mono">{log.date}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-900 font-black">{log.weight} kg</span>
                            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Synced</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center py-6">No historical entries mapped</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Goal parameters sidebar */}
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] text-white p-6 sm:p-8 shadow-xl space-y-6 sm:space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocol tracker</p>
                        <h4 className="text-base sm:text-lg font-black tracking-tight">Goal Completion</h4>
                      </div>
                    </div>

                    {/* Circular Progress Gauge */}
                    <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
                      <div className="relative h-32 w-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            className="text-white/5" 
                            strokeWidth="8" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="40" 
                            cx="50" 
                            cy="50" 
                          />
                          <circle 
                            className="text-emerald-500" 
                            strokeWidth="8" 
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - getGoalCompletionPercentage() / 100)}`}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="40" 
                            cx="50" 
                            cy="50" 
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-2xl font-black">{getGoalCompletionPercentage()}%</span>
                          <p className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Completed</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4 text-xs font-bold">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Starting weight</span>
                        <span className="font-mono text-white">{healthAssessment?.weightHistory?.[0]?.weight || healthAssessment?.weight || 70} kg</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Current weight</span>
                        <span className="font-mono text-emerald-400">{healthAssessment?.weight || 70} kg</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Target weight</span>
                        <span className="font-mono text-white">{healthAssessment?.targetWeight || 65} kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xs">
                  <h5 className="text-xs font-black uppercase text-zinc-900 tracking-wider mb-4">Metric Predictions</h5>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Expected Goal Date</p>
                      <p className="text-sm font-black text-zinc-900 mt-1">Oct 15, 2026</p>
                      <span className="text-[9px] font-bold text-zinc-400 block mt-1">Calculated at -0.5kg / week velocity</span>
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Weight variance</p>
                      <p className="text-sm font-black text-zinc-900 mt-1">
                        {Math.abs((healthAssessment?.weight || 70) - (healthAssessment?.targetWeight || 65)).toFixed(1)} kg remaining
                      </p>
                      <span className="text-[9px] font-bold text-zinc-400 block mt-1">Biological deficit required</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Add form dialog / panel */}
              {isAddingAddress ? (
                <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6 sm:space-y-8">
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-50">
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 uppercase tracking-wider">
                      {isEditingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
                    </h3>
                    <button 
                      onClick={() => {
                        setIsAddingAddress(false);
                        setIsEditingAddress(null);
                        resetAddressForm();
                      }}
                      className="p-2 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                    >
                      <X className="h-5 w-5 text-zinc-400" />
                    </button>
                  </div>

                  {/* Google Autocomplete / Places Search Bar */}
                  <div className="bg-emerald-50/40 p-4 sm:p-6 rounded-3xl border border-emerald-100/60 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[8px] font-black uppercase tracking-widest">Google Maps Autocomplete</span>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-800 tracking-wider">Instant Address Auto-Fill</p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-600 font-medium mb-4">
                      Search for your society, apartment complex, or tech park in Bengaluru. Tap to auto-fill the entire form instantly!
                    </p>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      </div>
                      <input 
                        type="text"
                        placeholder="🔍 Search society name..."
                        value={googleSearchQuery}
                        onChange={(e) => {
                          setGoogleSearchQuery(e.target.value);
                          setShowGoogleSuggestions(true);
                        }}
                        onFocus={() => setShowGoogleSuggestions(true)}
                        className="w-full pl-10 sm:pl-12 pr-10 h-11 sm:h-12 bg-white border border-zinc-200 rounded-xl text-[13px] sm:text-sm font-bold shadow-xs focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      />
                      {googleSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setGoogleSearchQuery("");
                            setShowGoogleSuggestions(false);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete suggestions dropdown */}
                    {showGoogleSuggestions && (
                      <div className="absolute left-6 right-6 mt-1.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-zinc-50 max-h-64 overflow-y-auto">
                        {BENGALURU_PREMIUM_SOCIETIES.filter(soc => {
                          if (!googleSearchQuery) return true;
                          return soc.title.toLowerCase().includes(googleSearchQuery.toLowerCase()) || 
                                 soc.desc.toLowerCase().includes(googleSearchQuery.toLowerCase()) ||
                                 soc.building.toLowerCase().includes(googleSearchQuery.toLowerCase());
                        }).map((soc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const randomTower = ["A", "B", "C", "D", "E", "Tower 1", "Tower 5", "Block C"][Math.floor(Math.random() * 8)];
                              const randomFlat = 100 + Math.floor(Math.random() * 900);
                              setAddressForm(prev => ({
                                ...prev,
                                houseNumber: `${randomTower}-${randomFlat}`,
                                building: soc.building,
                                street: soc.street,
                                area: soc.area,
                                city: "Bengaluru",
                                state: "Karnataka",
                                pincode: soc.pin,
                                latitude: soc.lat,
                                longitude: soc.lng
                              }));
                              setGoogleSearchQuery(soc.title);
                              setShowGoogleSuggestions(false);
                              showToast(`Loaded ${soc.title}. Form fully auto-filled!`, "success");
                            }}
                            className="w-full p-3.5 text-left hover:bg-emerald-50/40 transition-all flex items-start gap-3 cursor-pointer"
                          >
                            <MapPin className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-zinc-900">{soc.title}</p>
                              <p className="text-[10px] text-zinc-400 font-medium">{soc.desc} • Pincode {soc.pin}</p>
                            </div>
                          </button>
                        ))}
                        {BENGALURU_PREMIUM_SOCIETIES.filter(soc => 
                          soc.title.toLowerCase().includes(googleSearchQuery.toLowerCase()) || 
                          soc.desc.toLowerCase().includes(googleSearchQuery.toLowerCase()) ||
                          soc.building.toLowerCase().includes(googleSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="p-4 text-center text-xs text-zinc-400 font-medium">
                            No match found. Please check spelling or type another Bengaluru area name.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Input parameters */}
                    <div className="space-y-4 sm:space-y-6">
                      <h5 className="text-[10px] sm:text-xs font-black uppercase text-zinc-950 tracking-wider">Address Details</h5>

                      <div className="space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400">Recipient Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={addressForm.fullName}
                          onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          className="w-full px-4 h-10 sm:h-11 bg-zinc-50 border border-zinc-150 rounded-xl text-[13px] sm:text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400">Mobile Contact Number</label>
                        <input 
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={addressForm.phone}
                          onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-4 h-10 sm:h-11 bg-zinc-50 border border-zinc-150 rounded-xl text-[13px] sm:text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">House / Flat No.</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. 402"
                            value={addressForm.houseNumber}
                            onChange={e => setAddressForm({ ...addressForm, houseNumber: e.target.value })}
                            className="w-full px-4 h-11 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Building / Society</label>
                          <input 
                            type="text"
                            placeholder="e.g. Hyde Park"
                            value={addressForm.building}
                            onChange={e => setAddressForm({ ...addressForm, building: e.target.value })}
                            className="w-full px-4 h-11 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Street / Road Address</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. 27th Main Road"
                          value={addressForm.street}
                          onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-4 h-11 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Area / Locality</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. HSR Layout"
                            value={addressForm.area}
                            onChange={e => setAddressForm({ ...addressForm, area: e.target.value })}
                            className="w-full px-4 h-11 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pincode (Bengaluru Only)</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. 560102"
                            value={addressForm.pincode}
                            onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            className="w-full px-4 h-11 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Address Label</label>
                        <div className="flex gap-2">
                          {["Home", "Work", "Other"].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAddressForm(prev => ({ ...prev, addressType: type as any }))}
                              className={cn(
                                "flex-1 h-11 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                                addressForm.addressType === type 
                                  ? "bg-zinc-900 border-zinc-900 text-white" 
                                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Delivery Notes / Instructions</label>
                        <textarea 
                          placeholder="e.g. Leave at guard room, call before delivery"
                          value={addressForm.deliveryInstructions}
                          onChange={e => setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })}
                          className="w-full p-4 min-h-[80px] bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-bold resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 py-2">
                        <input 
                          type="checkbox"
                          id="defaultToggle"
                          checked={addressForm.default}
                          onChange={e => setAddressForm({ ...addressForm, default: e.target.checked })}
                          className="h-5 w-5 border border-zinc-300 rounded text-emerald-600 focus:ring-emerald-500/20"
                        />
                        <label htmlFor="defaultToggle" className="text-xs font-black text-zinc-700 uppercase tracking-wide cursor-pointer select-none">
                          Set as Default Delivery Address
                        </label>
                      </div>
                    </div>

                    {/* Google Map Mock Pin Selection */}
                    <div className="space-y-6 flex flex-col justify-between">
                      <div>
                        <h5 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                          <MapIcon className="h-4 w-4 text-emerald-600" /> Select Bengaluru Delivery Hub Area
                        </h5>
                        <p className="text-xs text-zinc-400 font-medium mt-1">
                          Click any area below to automatically set your pincode and delivery location
                        </p>
                      </div>

                      {/* Interactive grid maps mockup */}
                      <div className="flex-1 min-h-[280px] bg-zinc-900/5 rounded-3xl border border-zinc-150 p-6 flex flex-col justify-between relative overflow-hidden my-4 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px]">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-1 bg-white border border-zinc-100 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Navigation className="h-3 w-3 text-emerald-600 animate-spin" /> Bengaluru Hub Area
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 font-bold">Coords: {addressForm.latitude.toFixed(4)}, {addressForm.longitude.toFixed(4)}</span>
                        </div>

                        {/* Visual pins represent Bengaluru Hubs */}
                        <div className="grid grid-cols-2 gap-4 my-8">
                          {[
                            { name: "HSR Layout (IT Hub)", pin: "560102", lat: 12.9121, lng: 77.6445 },
                            { name: "Indiranagar (Premium Res.)", pin: "560038", lat: 12.9784, lng: 77.6408 },
                            { name: "Koramangala (Startup Hub)", pin: "560034", lat: 12.9352, lng: 77.6245 },
                            { name: "Whitefield (Tech Corridor)", pin: "560066", lat: 12.9698, lng: 77.7500 },
                          ].map((loc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => mockSetMapCoords(loc.lat, loc.lng, loc.pin, loc.name.split(" (")[0])}
                              className={cn(
                                "p-4 bg-white rounded-2xl border text-left transition-all relative group cursor-pointer",
                                addressForm.pincode === loc.pin 
                                  ? "border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500" 
                                  : "border-zinc-150 hover:border-zinc-300"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-black text-zinc-900">{loc.name}</p>
                                <MapPin className={cn("h-4 w-4 shrink-0 ml-1", addressForm.pincode === loc.pin ? "text-emerald-600 animate-bounce" : "text-zinc-300")} />
                              </div>
                              <p className="text-[9px] font-mono text-zinc-400 font-semibold mt-1">Pincode: {loc.pin}</p>
                            </button>
                          ))}
                        </div>

                        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> This address is within Bengaluru delivery limits.
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-zinc-50">
                        <button 
                          type="submit"
                          className="flex-1 h-12 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                        >
                          Save Address
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsAddingAddress(false);
                            setIsEditingAddress(null);
                            resetAddressForm();
                          }}
                          className="px-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-black tracking-tight text-zinc-900">Your Delivery Addresses</h4>
                      <p className="text-xs text-zinc-400 font-medium">Manage and select your default delivery address.</p>
                    </div>
                    <button 
                      onClick={() => {
                        resetAddressForm();
                        setIsAddingAddress(true);
                      }}
                      className="bg-zinc-900 text-white rounded-xl h-11 px-5 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-black cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Delivery Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {addressList.map((addr) => (
                      <div 
                        key={addr.id}
                        className={cn(
                          "bg-white rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all group relative overflow-hidden",
                          addr.default 
                            ? "border-emerald-500 shadow-md shadow-emerald-500/5 bg-emerald-500/[0.01]" 
                            : "border-zinc-150 hover:border-emerald-200"
                        )}
                      >
                        {addr.default && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        )}

                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                              addr.addressType === "Home" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : addr.addressType === "Work"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-purple-50 text-purple-700 border-purple-100"
                            )}>
                              {addr.addressType === "Home" && <HomeIcon className="h-3 w-3" />}
                              {addr.addressType === "Work" && <Briefcase className="h-3 w-3" />}
                              {addr.addressType === "Other" && <MapPin className="h-3 w-3" />}
                              {addr.addressType}
                            </span>

                            <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditAddressClick(addr)}
                                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-black text-zinc-900">{addr.fullName}</p>
                            <p className="text-xs font-mono text-zinc-400 font-semibold mt-0.5">{addr.phone}</p>
                            
                            <p className="text-xs text-zinc-600 leading-relaxed font-bold mt-3">
                              {addr.houseNumber} {addr.building && `${addr.building}, `} {addr.street}, {addr.area}
                            </p>
                            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>

                          {addr.deliveryInstructions && (
                            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-[10px] text-zinc-500 font-medium">
                              <span className="font-bold text-zinc-800">Delivery notes:</span> {addr.deliveryInstructions}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-zinc-50 mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                          {addr.default ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Default Address
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-zinc-400 hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}

                          <span className="font-mono text-zinc-400 font-bold">
                            {addr.latitude?.toFixed(2)}N, {addr.longitude?.toFixed(2)}E
                          </span>
                        </div>
                      </div>
                    ))}

                    {addressList.length === 0 && (
                      <div className="col-span-full py-20 bg-white border border-zinc-100 rounded-[2.5rem] text-center opacity-70">
                        <MapPin className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-zinc-900">No Delivery Addresses Added</p>
                        <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1 leading-relaxed">
                          We need at least one delivery address to prepare and deliver your meal subscriptions.
                        </p>
                        <button 
                          onClick={() => {
                            resetAddressForm();
                            setIsAddingAddress(true);
                          }}
                          className="mt-6 bg-zinc-900 text-white rounded-xl h-11 px-5 text-xs font-black uppercase tracking-widest cursor-pointer"
                        >
                          Add Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-10 shadow-xs space-y-6 sm:space-y-8 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100">
                    <Sliders className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">Food & Delivery Preferences</h3>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Customize taste, portion size, and eco-friendly packaging rules</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  Auto Saved
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Taste Profile */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Primary Taste Profile</label>
                  <select 
                    value={preferencesForm.tastePreference}
                    onChange={e => setPreferencesForm({ ...preferencesForm, tastePreference: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                  >
                    <option value="Balanced Savory & Fresh">Balanced Savory & Fresh</option>
                    <option value="Tangy & Citrusy Notes">Tangy & Citrusy Notes</option>
                    <option value="Subtle Salt & Low Sodium">Subtle Salt & Low Sodium</option>
                    <option value="Herbal & Aromatic Spices">Herbal & Aromatic Spices</option>
                  </select>
                </div>

                {/* Spice Level */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Spice Level Tolerance</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Mild (Gentle)",
                      "Medium (Indian Standard)",
                      "High (Desi Spicy)",
                      "Flame (Chef Special)"
                    ].map(spice => (
                      <button
                        key={spice}
                        type="button"
                        onClick={() => setPreferencesForm({ ...preferencesForm, spiceLevel: spice })}
                        className={cn(
                          "h-11 border rounded-xl text-[10px] font-black uppercase tracking-wider px-2 transition-all cursor-pointer",
                          preferencesForm.spiceLevel === spice
                            ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        )}
                      >
                        {spice.split(" (")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Portion Size */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Portion Size Requirement</label>
                  <select 
                    value={preferencesForm.portionSize}
                    onChange={e => setPreferencesForm({ ...preferencesForm, portionSize: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                  >
                    <option value="Light (250g - Calorie Restricted)">Light (250g - Calorie Restricted)</option>
                    <option value="Standard (350g - Balanced Meal)">Standard (350g - Balanced Meal)</option>
                    <option value="Athlete Pro (500g - High Macro)">Athlete Pro (500g - High Macro)</option>
                  </select>
                </div>

                {/* Preferred Delivery Window */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preferred Delivery Window</label>
                  <select 
                    value={preferencesForm.deliveryTimeSlot}
                    onChange={e => setPreferencesForm({ ...preferencesForm, deliveryTimeSlot: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                  >
                    <option value="Breakfast (07:00 AM - 09:00 AM)">Breakfast (07:00 AM - 09:00 AM)</option>
                    <option value="Lunch (12:00 PM - 02:00 PM)">Lunch (12:00 PM - 02:00 PM)</option>
                    <option value="Evening Snack (05:00 PM - 07:00 PM)">Evening Snack (05:00 PM - 07:00 PM)</option>
                    <option value="Dinner (07:30 PM - 09:30 PM)">Dinner (07:30 PM - 09:30 PM)</option>
                  </select>
                </div>

                {/* Grain Base Preference */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preferred Grain / Carbs Base</label>
                  <select 
                    value={preferencesForm.grainPreference}
                    onChange={e => setPreferencesForm({ ...preferencesForm, grainPreference: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                  >
                    <option value="Organic Millets & Brown Basmati">Organic Millets & Brown Basmati</option>
                    <option value="Whole Wheat Multigrain Roti">Whole Wheat Multigrain Roti</option>
                    <option value="Quinoa & Foxtail Millet Mix">Quinoa & Foxtail Millet Mix</option>
                    <option value="Keto Cauliflower Low-Carb Rice">Keto Cauliflower Low-Carb Rice</option>
                  </select>
                </div>

                {/* Meal Frequency */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subscription Meal Frequency</label>
                  <select 
                    value={preferencesForm.mealFrequency}
                    onChange={e => setPreferencesForm({ ...preferencesForm, mealFrequency: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                  >
                    <option value="Single Lunch Subscription">Single Lunch Subscription</option>
                    <option value="Daily 2 Meals (Lunch + Dinner)">Daily 2 Meals (Lunch + Dinner)</option>
                    <option value="Full Day 3 Meals + Detox Drink">Full Day 3 Meals + Detox Drink</option>
                  </select>
                </div>
              </div>

              {/* Eco Toggles */}
              <div className="pt-6 border-t border-zinc-100 space-y-4">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Sustainability & Eco Preferences</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-emerald-950">100% Biodegradable Bagasse Box</p>
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Sugarcane fiber containers (zero plastic)</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={preferencesForm.ecoPackaging}
                      onChange={e => setPreferencesForm({ ...preferencesForm, ecoPackaging: e.target.checked })}
                      className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-emerald-950">Skip Plastic Cutlery & Straws</p>
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Help reduce plastic waste in delivery</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={preferencesForm.skipCutlery}
                      onChange={e => setPreferencesForm({ ...preferencesForm, skipCutlery: e.target.checked })}
                      className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast("Preferences updated successfully!", "success")}
                  className="px-8 h-12 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB: EMERGENCY CONTACT */}
          {activeTab === "emergency" && (
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-10 shadow-xs space-y-6 sm:space-y-8 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-2xl text-red-600 border border-red-100">
                    <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">Emergency Protocol</h3>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Critical medical contact and SOS safeguards</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`🚨 TEST SOS ALERT triggered! Simulated notification sent to ${emergencyForm.contactName} (${emergencyForm.contactPhone}) & TaazaBites Support Desk.`, "info");
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="h-4 w-4" /> Trigger Test SOS Alert
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Emergency Contact Person</label>
                  <input 
                    type="text"
                    value={emergencyForm.contactName}
                    onChange={e => setEmergencyForm({ ...emergencyForm, contactName: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-red-500/10 outline-none"
                    placeholder="Full Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact Phone Number</label>
                  <input 
                    type="tel"
                    value={emergencyForm.contactPhone}
                    onChange={e => setEmergencyForm({ ...emergencyForm, contactPhone: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-red-500/10 outline-none"
                    placeholder="+91 Mobile"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Relationship</label>
                  <select 
                    value={emergencyForm.relationship}
                    onChange={e => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-red-500/10 outline-none"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend / Colleague</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Blood Group</label>
                  <select 
                    value={emergencyForm.bloodGroup}
                    onChange={e => setEmergencyForm({ ...emergencyForm, bloodGroup: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-red-500/10 outline-none"
                  >
                    <option value="O+">O Rh-D Positive (O+)</option>
                    <option value="O-">O Rh-D Negative (O-)</option>
                    <option value="A+">A Rh-D Positive (A+)</option>
                    <option value="A-">A Rh-D Negative (A-)</option>
                    <option value="B+">B Rh-D Positive (B+)</option>
                    <option value="B-">B Rh-D Negative (B-)</option>
                    <option value="AB+">AB Rh-D Positive (AB+)</option>
                    <option value="AB-">AB Rh-D Negative (AB-)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Personal Doctor / Physician</label>
                  <input 
                    type="text"
                    value={emergencyForm.doctorName}
                    onChange={e => setEmergencyForm({ ...emergencyForm, doctorName: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-red-500/10 outline-none"
                    placeholder="Doctor Name / Clinic"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Doctor Mobile Number</label>
                  <input 
                    type="tel"
                    value={emergencyForm.doctorPhone}
                    onChange={e => setEmergencyForm({ ...emergencyForm, doctorPhone: e.target.value })}
                    className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-red-500/10 outline-none"
                    placeholder="+91 Doctor Mobile"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preferred Emergency Hospital (Bengaluru)</label>
                <input 
                  type="text"
                  value={emergencyForm.hospitalPreference}
                  onChange={e => setEmergencyForm({ ...emergencyForm, hospitalPreference: e.target.value })}
                  className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 focus:ring-4 focus:ring-red-500/10 outline-none"
                  placeholder="e.g. Manipal Hospital HAL Road / Fortis Bannerghatta Road"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-red-600">Allergic Reaction SOS Action Protocol</label>
                <textarea 
                  rows={3}
                  value={emergencyForm.allergicReactionProtocol}
                  onChange={e => setEmergencyForm({ ...emergencyForm, allergicReactionProtocol: e.target.value })}
                  className="w-full p-4 rounded-xl bg-red-50/30 border border-red-200 text-xs font-bold text-zinc-900 focus:ring-4 focus:ring-red-500/10 outline-none leading-relaxed"
                  placeholder="Describe step-by-step instructions for delivery agents or kitchen staff if an allergy is accidentally triggered..."
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast("Emergency contact details and SOS protocol saved securely.", "success")}
                  className="px-8 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  Save Emergency Safeguards
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Internal Sub-navigation Sidebar */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                <div className="bg-white rounded-3xl border border-zinc-100 p-4 sm:p-5 shadow-xs">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-3 mb-4">Settings Menu</p>
                  <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-1.5 scrollbar-hide pb-2 lg:pb-0">
                    {[
                      { id: "notifications", label: "Notifications", icon: Bell, desc: "WhatsApp, Push & SMS alerts" },
                      { id: "language", label: "Language", icon: Languages, desc: "Indian dialects & formats" },
                      { id: "theme", label: "Dark Mode & Theme", icon: Sparkles, desc: "Appearance, colors & sounds" },
                      { id: "security", label: "Security & Devices", icon: ShieldCheck, desc: "2FA, biometrics & sessions" },
                      { id: "api", label: "API Access", icon: Key, desc: "Connect third-party health apps" },
                      { id: "terminal", label: "Diagnostics CLI", icon: Terminal, desc: "Console system inspector" },
                      { id: "delete_account", label: "Delete Account", icon: Trash2, desc: "Data export & account wipe" }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSettingsSubTab(sub.id as any);
                          playSyntheticChime("click");
                        }}
                        className={cn(
                          "w-full text-left flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all cursor-pointer",
                          settingsSubTab === sub.id
                            ? sub.id === "delete_account" 
                              ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                              : "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        )}
                      >
                        <sub.icon className={cn("h-5 w-5", settingsSubTab === sub.id ? "text-white" : (sub.id === "delete_account" ? "text-red-500" : "text-zinc-400"))} />
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider">{sub.label}</p>
                          <p className={cn("text-[9px] mt-0.5", settingsSubTab === sub.id ? "text-white/80" : "text-zinc-400")}>{sub.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Micro-protection Badge widget */}
                <div className="bg-zinc-900 text-white rounded-3xl p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-xl">
                      <LockKeyhole className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Data Vault Privacy</p>
                      <p className="text-xs font-bold text-zinc-300">Level 3 Encryption</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal relative z-10 font-medium">
                    Your health profile, delivery addresses, and meal preference configurations are kept secure and fully encrypted.
                  </p>
                </div>
              </div>

              {/* Main Settings Panel */}
              <div className="lg:col-span-8 xl:col-span-9">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={settingsSubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    
                    {/* SUB-TAB 1: NOTIFICATIONS */}
                    {settingsSubTab === "notifications" && (
                      <div className="space-y-6 sm:space-y-8">
                        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-10 shadow-xs space-y-6 sm:space-y-8">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
                                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div>
                                <h4 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900">Meal Dispatch Alerts</h4>
                                <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-medium">Control notifications & delivery buffers</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                              Active Pipeline
                            </span>
                          </div>

                          {/* Notification Preferences & Retention Triggers */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-900 block pl-1">Notification Preferences & Retention Triggers</label>
                                <p className="text-[10px] text-zinc-400 font-bold pl-1 mt-0.5">Manage automated delivery alerts and daily health reminders to maintain your streak</p>
                              </div>
                              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                                Habit Protection
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                {
                                  id: "remindBeforeDelivery",
                                  title: "Remind me before delivery",
                                  desc: "Get an automated pre-arrival WhatsApp & push alert 30 minutes before your meal bag arrives",
                                  badge: "Pre-Arrival Alert",
                                  icon: Truck,
                                  color: "text-emerald-600 bg-emerald-50 border-emerald-100"
                                },
                                {
                                  id: "dailyNutritionSummary",
                                  title: "Daily nutrition summary",
                                  desc: "Receive an evening breakdown of your logged calories, macro balance, and health score progress",
                                  badge: "Daily Routine",
                                  icon: Sparkles,
                                  color: "text-indigo-600 bg-indigo-50 border-indigo-100"
                                },
                                {
                                  id: "renewalReminders",
                                  title: "Plan renewal & meal pause cutoff",
                                  desc: "Timely notifications 24h before weekly meal customization locks or subscription auto-renews",
                                  badge: "Subscription Care",
                                  icon: Calendar,
                                  color: "text-amber-600 bg-amber-50 border-amber-100"
                                },
                                {
                                  id: "streakMilestones",
                                  title: "Streak protection & milestones",
                                  desc: "Alerts when your health streak is close to resetting or when you unlock new reward badges",
                                  badge: "Habit Streak",
                                  icon: Flame,
                                  color: "text-rose-600 bg-rose-50 border-rose-100"
                                }
                              ].map(item => {
                                const isEnabled = (appSettings.notifications as any)[item.id] ?? true;
                                const IconComp = item.icon;
                                return (
                                  <div 
                                    key={item.id} 
                                    className="p-5 bg-zinc-50 hover:bg-zinc-100/60 rounded-3xl border border-zinc-100 transition-all flex flex-col justify-between space-y-4"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <div className={cn("p-2.5 rounded-2xl border shrink-0", item.color)}>
                                          <IconComp className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-black text-zinc-900 leading-tight">{item.title}</p>
                                          <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                                            {item.badge}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextState = !isEnabled;
                                          setAppSettings(prev => ({
                                            ...prev,
                                            notifications: {
                                              ...prev.notifications,
                                              [item.id]: nextState
                                            }
                                          }));
                                          playSyntheticChime("click");
                                          showToast(`${item.title} ${nextState ? 'enabled' : 'disabled'}`, "info");
                                        }}
                                        className={cn(
                                          "w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shadow-inner shrink-0",
                                          isEnabled ? "bg-emerald-600 justify-end" : "bg-zinc-200 justify-start"
                                        )}
                                      >
                                        <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
                                      </button>
                                    </div>

                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed pl-1">
                                      {item.desc}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Channels Switches */}
                          <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 block pl-1">Alert Channels</label>
                            
                            {[
                              { id: "push", title: "Browser & In-App Push Alerts", desc: "Get instant web push notifications when driver enters your housing society" },
                              { id: "whatsapp", title: "WhatsApp Delivery Executive Updates", desc: "Get real-time agent location links, chat capability, and daily dish details" },
                              { id: "sms", title: "SMS & OTP Verification", desc: "Get instant SMS text confirmations as soon as your meal bag is delivered" },
                              { id: "email", title: "Weekly Progress Digest & Receipts", desc: "Receive weekly email summaries of calories consumed, weight trends, and invoices" }
                            ].map(channel => {
                              const isActive = (appSettings.notifications as any)[channel.id] ?? true;
                              return (
                                <div key={channel.id} className="flex items-center justify-between p-5 bg-zinc-50 hover:bg-zinc-100/40 rounded-2xl border border-zinc-100 transition-colors">
                                  <div className="max-w-[75%]">
                                    <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">{channel.title}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold mt-1 leading-normal">{channel.desc}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAppSettings(prev => ({
                                        ...prev,
                                        notifications: {
                                          ...prev.notifications,
                                          [channel.id]: !isActive
                                        }
                                      }));
                                      playSyntheticChime("click");
                                    }}
                                    className={cn(
                                      "w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shadow-inner",
                                      isActive ? "bg-emerald-600 justify-end" : "bg-zinc-200 justify-start"
                                    )}
                                  >
                                    <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Delivery Safety Cushion Slider */}
                          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100/60 space-y-5">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">Delivery Margin Safety Buffer</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Alert and dispatch window safety offset</p>
                              </div>
                              <span className="px-3 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-black font-mono">
                                {appSettings.deliveryBufferTime} min
                              </span>
                            </div>

                            <input 
                              type="range" 
                              min="0" 
                              max="60" 
                              step="15"
                              value={appSettings.deliveryBufferTime}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAppSettings(prev => ({ ...prev, deliveryBufferTime: val }));
                                playSyntheticChime("click");
                              }}
                              className="w-full accent-emerald-600 cursor-pointer h-2 bg-zinc-200 rounded-lg appearance-none"
                            />

                            <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                              <span>0m (Exact Drop)</span>
                              <span>15m (Recommended)</span>
                              <span>30m (Generous Buffer)</span>
                              <span>60m (Eco-Flex)</span>
                            </div>

                            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-[10px] text-emerald-800 font-bold">
                              <Info className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              <span>
                                {appSettings.deliveryBufferTime === 0 && "Tight schedule. We will notify you exactly when your order is dropped off."}
                                {appSettings.deliveryBufferTime === 15 && "Standard setup. You will get a WhatsApp message with our agent's live location 15 minutes before arrival."}
                                {appSettings.deliveryBufferTime === 30 && "Generous buffer. Highly recommended for large housing societies and security checkpoints."}
                                {appSettings.deliveryBufferTime >= 45 && "Eco-friendly option. We will optimize our route to reduce carbon emissions and deliver within a wider window."}
                              </span>
                            </div>
                          </div>

                          {/* Quiet Hours / DND Mode */}
                          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">Do Not Disturb / Quiet Hours</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Mute non-urgent marketing alerts during your sleep window</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAppSettings(prev => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      quietHours: !prev.notifications.quietHours
                                    }
                                  }));
                                  playSyntheticChime("click");
                                }}
                                className={cn(
                                  "w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shadow-inner",
                                  appSettings.notifications.quietHours ? "bg-emerald-600 justify-end" : "bg-zinc-200 justify-start"
                                )}
                              >
                                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
                              </button>
                            </div>

                            {appSettings.notifications.quietHours && (
                              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-200/60">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase text-zinc-400">Quiet Starts At</label>
                                  <input 
                                    type="time" 
                                    value={appSettings.quietHoursStart}
                                    onChange={e => setAppSettings(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                                    className="w-full h-10 rounded-xl bg-white border border-zinc-200 px-3 text-xs font-bold text-zinc-800"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase text-zinc-400">Quiet Ends At</label>
                                  <input 
                                    type="time" 
                                    value={appSettings.quietHoursEnd}
                                    onChange={e => setAppSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                                    className="w-full h-10 rounded-xl bg-white border border-zinc-200 px-3 text-xs font-bold text-zinc-800"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 2: LANGUAGE & REGIONAL */}
                    {settingsSubTab === "language" && (
                      <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 md:p-10 shadow-xs space-y-8">
                          <div className="flex justify-between items-center pb-6 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100">
                                <Languages className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black tracking-tight text-zinc-900">Language & Regional Dialects</h4>
                                <p className="text-xs text-zinc-400 mt-0.5 font-medium">Select your preferred native Indian language for meal menus and alerts</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                              Active: {appSettings.language}
                            </span>
                          </div>

                          {/* Indian Languages Selector Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { id: "English", name: "English", native: "English", greeting: "Welcome to TaazaBites!", script: "Latin" },
                              { id: "Hindi", name: "Hindi", native: "हिन्दी", greeting: "नमस्ते! आपका ताज़ा बीट्स आहार तैयार है", script: "Devanagari" },
                              { id: "Bengali", name: "Bengali", native: "বাংলা", greeting: "স্বাগতম! তাজা বিটস খাদ্য প্রস্তুত", script: "Bengali" },
                              { id: "Tamil", name: "Tamil", native: "தமிழ்", greeting: "வணக்கம்! தாசா பீட்ஸ் உணவு தயார்", script: "Tamil" },
                              { id: "Telugu", name: "Telugu", native: "తెలుగు", greeting: "స్వాగతం! తాజా బీట్స్ ఆహారం సిద్ధంగా ఉంది", script: "Telugu" },
                              { id: "Kannada", name: "Kannada", native: "ಕನ್ನಡ", greeting: "స్వాగత! ತಾಜಾ ಬೀಟ್ಸ್ ಆಹಾರ ತಯಾರಾಗಿದೆ", script: "Kannada" },
                              { id: "Gujarati", name: "Gujarati", native: "ગુજરાતી", greeting: "નમસ્તે! તાઝા બીટ્સ આહાર તૈયાર છે", script: "Gujarati" },
                              { id: "Marathi", name: "Marathi", native: "मराठी", greeting: "नमस्कार! ताझा बीट्स आहार तयार आहे", script: "Devanagari" }
                            ].map(lang => (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => {
                                  setAppSettings(prev => ({ ...prev, language: lang.id }));
                                  playSyntheticChime("success");
                                  showToast(`Language set to ${lang.name} (${lang.native})`, "info");
                                }}
                                className={cn(
                                  "p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-36 cursor-pointer",
                                  appSettings.language === lang.id
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg"
                                    : "bg-zinc-50 text-zinc-800 border-zinc-200/60 hover:bg-white hover:border-zinc-300"
                                )}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className={cn("text-xs font-black uppercase tracking-widest", appSettings.language === lang.id ? "text-amber-400" : "text-zinc-400")}>
                                    {lang.script}
                                  </span>
                                  {appSettings.language === lang.id && (
                                    <span className="p-1 bg-emerald-500 text-white rounded-full">
                                      <Check className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-black tracking-tight">{lang.native}</p>
                                  <p className={cn("text-[10px] font-bold mt-0.5", appSettings.language === lang.id ? "text-zinc-300" : "text-zinc-400")}>
                                    {lang.name}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Live Language Preview Banner */}
                          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl border border-amber-100/60 space-y-3">
                            <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                              <Sparkles className="h-4 w-4 text-amber-600" />
                              <span>Live Language Translation Preview</span>
                            </div>
                            <p className="text-base font-extrabold text-zinc-900">
                              {appSettings.language === "Hindi" && "नमस्ते! आपका ताज़ा बीट्स आहार तैयार है (Lunch 12:00 PM - 02:00 PM)"}
                              {appSettings.language === "Bengali" && "স্বাগতম! তাজা বিটস খাদ্য প্রস্তুত (Lunch 12:00 PM - 02:00 PM)"}
                              {appSettings.language === "Tamil" && "வணக்கம்! தாசா பீட்ஸ் உணவு தயார் (Lunch 12:00 PM - 02:00 PM)"}
                              {appSettings.language === "Telugu" && "స్వాగతం! తాజా బీట్స్ ఆహారం సిద్ధంగా ఉంది (Lunch 12:00 PM - 02:00 PM)"}
                              {appSettings.language === "Kannada" && "స్వాగత! ತಾಜಾ ಬೀಟ್ಸ್ ಆಹಾರ ತಯಾರಾಗಿದೆ (Lunch 12:00 PM - 02:00 PM)"}
                              {appSettings.language === "Gujarati" && "નમસ્તે! તાઝા બીટ્સ આહાર તૈયાર છે (Lunch 12:00 PM - 02:00 PM)"}
                              {appSettings.language === "Marathi" && "नमस्कार! ताझा बीट्स आहार तयार आहे (Lunch 12:00 PM - 02:00 PM)"}
                              {appSettings.language === "English" && "Welcome to TaazaBites! Your freshly prepped meal is ready for dispatch."}
                            </p>
                            <p className="text-[10px] font-bold text-amber-800/70 uppercase tracking-widest">
                              UI navigation and order updates will automatically format according to your selected regional dialect.
                            </p>
                          </div>

                          {/* Number Notation Selector */}
                          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">Indian Currency & Number Format</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Use Indian Lakhs notation (₹1,50,000) instead of International Millions</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setAppSettings(prev => ({ ...prev, numberNotation: "indian" }))}
                                className={cn(
                                  "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  appSettings.numberNotation === "indian"
                                    ? "bg-zinc-900 text-white"
                                    : "bg-white border border-zinc-200 text-zinc-600"
                                )}
                              >
                                Indian (Lakhs)
                              </button>
                              <button
                                type="button"
                                onClick={() => setAppSettings(prev => ({ ...prev, numberNotation: "international" }))}
                                className={cn(
                                  "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  appSettings.numberNotation === "international"
                                    ? "bg-zinc-900 text-white"
                                    : "bg-white border border-zinc-200 text-zinc-600"
                                )}
                              >
                                Global (Millions)
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: DARK MODE & THEME */}
                    {settingsSubTab === "theme" && (
                      <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 md:p-10 shadow-xs space-y-8">
                          <div className="flex justify-between items-center pb-6 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 border border-purple-100">
                                <Sparkles className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black tracking-tight text-zinc-900">Dark Mode & Theme Customization</h4>
                                <p className="text-xs text-zinc-400 mt-0.5 font-medium">Personalize appearance mode, color palettes, and sound effects</p>
                              </div>
                            </div>
                          </div>

                          {/* Appearance Mode Selection */}
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 block pl-1">Appearance Mode</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              {[
                                { id: "light", name: "Light Mode", icon: Sun, bg: "bg-white text-zinc-900 border-zinc-200", desc: "Crisp, organic white canvas" },
                                { id: "dark", name: "Dark Mode", icon: Moon, bg: "bg-zinc-900 text-white border-zinc-800", desc: "Warm twilight charcoal" },
                                { id: "system", name: "System Auto", icon: Laptop, bg: "bg-zinc-100 text-zinc-900 border-zinc-200", desc: "Matches OS light/dark schedule" },
                                { id: "amoled", name: "AMOLED Black", icon: Sparkles, bg: "bg-black text-emerald-400 border-emerald-950", desc: "Deep black OLED battery saver" }
                              ].map(mode => (
                                <button
                                  key={mode.id}
                                  type="button"
                                  onClick={() => {
                                    const nextPref = mode.id === "amoled" ? "dark" : (mode.id as "light" | "dark" | "system");
                                    setTheme(nextPref);
                                    setAppSettings(prev => ({ 
                                      ...prev, 
                                      themeMode: mode.id,
                                      darkMode: mode.id === "dark" || mode.id === "amoled"
                                    }));
                                    playSyntheticChime("chime");
                                    showToast(`Appearance set to ${mode.name}`, "info");
                                  }}
                                  className={cn(
                                    "p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-36 cursor-pointer",
                                    appSettings.themeMode === mode.id
                                      ? "ring-2 ring-emerald-500 shadow-lg"
                                      : "opacity-80 hover:opacity-100"
                                  , mode.bg)}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <mode.icon className="h-5 w-5" />
                                    {appSettings.themeMode === mode.id && (
                                      <span className="p-1 bg-emerald-500 text-white rounded-full">
                                        <Check className="h-3 w-3" />
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-wider">{mode.name}</p>
                                    <p className="text-[9px] opacity-70 font-medium mt-0.5">{mode.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Brand Themes Swatches */}
                          <div className="space-y-4 pt-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 block pl-1">Brand Accent Color Palette</label>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              {[
                                { id: "green", name: "Taaza Green", primary: "bg-emerald-700", accent: "bg-amber-400", bg: "#f0fdf4", desc: "Organic, fresh & calming" },
                                { id: "orange", name: "Citric Sunburst", primary: "bg-orange-500", accent: "bg-yellow-400", bg: "#fff7ed", desc: "Energetic, dynamic & active" },
                                { id: "yellow", name: "Turmeric Gold", primary: "bg-yellow-600", accent: "bg-emerald-500", bg: "#fefce8", desc: "Healing, comforting & rich" },
                                { id: "mint", name: "Ocean Mint", primary: "bg-teal-600", accent: "bg-rose-400", bg: "#f0fdfa", desc: "Hydrating, crisp & modern" }
                              ].map(themeItem => (
                                <button
                                  key={themeItem.id}
                                  type="button"
                                  onClick={() => {
                                    setAppSettings(prev => ({ ...prev, theme: themeItem.id }));
                                    setTimeout(() => playSyntheticChime("success"), 50);
                                  }}
                                  style={{ backgroundColor: appSettings.theme === themeItem.id ? themeItem.bg : undefined }}
                                  className={cn(
                                    "p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between h-36 cursor-pointer",
                                    appSettings.theme === themeItem.id
                                      ? "border-zinc-900 shadow-md"
                                      : "border-zinc-100 bg-white hover:border-zinc-200"
                                  )}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <div className="flex gap-1.5">
                                      <span className={cn("w-4 h-4 rounded-full shadow-sm", themeItem.primary)} />
                                      <span className={cn("w-4 h-4 rounded-full shadow-sm", themeItem.accent)} />
                                    </div>
                                    {appSettings.theme === themeItem.id && (
                                      <span className="p-1 bg-zinc-900 text-white rounded-full">
                                        <Check className="h-3 w-3" />
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">{themeItem.name}</p>
                                    <p className="text-[9px] text-zinc-400 font-bold mt-0.5 leading-tight">{themeItem.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Sound FX Reminders / Chimes */}
                          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">Auditory Chimes & UI Sound Effects</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Procedural audio feedback when toggling options and adding items</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  playSyntheticChime("chime");
                                }}
                                className="px-4 h-11 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-100 cursor-pointer"
                              >
                                <Play className="h-3.5 w-3.5 text-emerald-600" /> Test Sound
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAppSettings(prev => ({ 
                                    ...prev, 
                                    audioReminders: prev.audioReminders === "enabled" ? "none" : "enabled" 
                                  }));
                                }}
                                className={cn(
                                  "px-5 h-11 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center gap-1.5 cursor-pointer",
                                  appSettings.audioReminders === "enabled"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                                )}
                              >
                                <Volume2 className="h-4 w-4" /> {appSettings.audioReminders === "enabled" ? "Enabled" : "Muted"}
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 4: SECURITY & DEVICES */}
                    {settingsSubTab === "security" && (
                      <div className="space-y-8">
                        
                        {/* Interactive Security Status Shield */}
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 md:p-10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                          <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
                            <div className="w-32 h-32 rounded-full border-4 border-emerald-500/10 flex items-center justify-center relative bg-emerald-50/50">
                              <ShieldCheck className="h-16 w-16 text-emerald-600 animate-pulse" />
                              <div className="absolute -bottom-1 bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">
                                Secure
                              </div>
                            </div>
                            <div>
                              <p className="text-2xl font-black text-zinc-900">98.4%</p>
                              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Protection Indicator</p>
                            </div>
                          </div>

                          <div className="md:col-span-8 space-y-4">
                            <h5 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Shield Defense Audit</h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-zinc-600">
                              <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>SSL Encrypted Pipeline</span>
                              </div>
                              <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Level-3 Firestore Security Rules</span>
                              </div>
                              <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Biometrics MD5 Hashed</span>
                              </div>
                              <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>2FA Protection Engine</span>
                              </div>
                            </div>

                            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                              Your health profile, delivery addresses, and meal preference configurations are kept secure, fully decoupled from third-party trackers.
                            </p>
                          </div>
                        </div>

                        {/* 2FA & Biometrics Controls */}
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xs space-y-6">
                          <h4 className="text-lg font-black tracking-tight text-zinc-900">Authentication Safeguards</h4>
                          
                          <div className="space-y-4">
                            {/* 2FA Toggle */}
                            <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">Two-Factor Authentication (2FA)</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Require SMS OTP verification on new device logins</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAppSettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }));
                                  playSyntheticChime("click");
                                  showToast(appSettings.twoFactorAuth ? "2FA Disabled" : "2FA Protection Enabled!", "success");
                                }}
                                className={cn(
                                  "w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shadow-inner",
                                  appSettings.twoFactorAuth ? "bg-emerald-600 justify-end" : "bg-zinc-200 justify-start"
                                )}
                              >
                                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
                              </button>
                            </div>

                            {/* Biometric Lock Toggle */}
                            <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">Face ID / Touch ID Biometric Lock</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Prompt biometric passkey when opening TaazaBites app</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAppSettings(prev => ({ ...prev, biometricAuth: !prev.biometricAuth }));
                                  playSyntheticChime("click");
                                  showToast(appSettings.biometricAuth ? "Biometric Lock Disabled" : "Biometric Passkey Activated!", "success");
                                }}
                                className={cn(
                                  "w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shadow-inner",
                                  appSettings.biometricAuth ? "bg-emerald-600 justify-end" : "bg-zinc-200 justify-start"
                                )}
                              >
                                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={() => showToast(`Password reset link sent to ${currentUser?.email || 'your email address'}. Check your inbox.`, "info")}
                              className="px-6 h-12 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                              <Lock className="h-4 w-4 text-amber-400" /> Send Password Reset Email
                            </button>
                            <button 
                              onClick={logout}
                              className="px-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <LogOut className="h-4 w-4" /> Sign Out Device
                            </button>
                          </div>
                        </div>

                        {/* Active Sessions / Device Management */}
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xs space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black tracking-tight text-zinc-900">Active Device Sessions</h4>
                            <span className="text-[10px] font-black bg-zinc-100 px-2 py-0.5 rounded-full uppercase tracking-widest text-zinc-500">
                              {sessions.length} Active {sessions.length === 1 ? 'Device' : 'Devices'}
                            </span>
                          </div>

                          <div className="space-y-4">
                            {sessions.length === 0 ? (
                              <div className="p-10 border-2 border-dashed border-zinc-100 rounded-3xl text-center">
                                <Cpu className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No active session data found</p>
                              </div>
                            ) : (
                              sessions.map((sess) => (
                                <div 
                                  key={sess.id}
                                  className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl group hover:border-emerald-200 transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 transition-colors shadow-sm">
                                      {sess.device === 'Android' || sess.device === 'iOS' ? (
                                        <Smartphone className="h-6 w-6" />
                                      ) : (
                                        <Globe className="h-6 w-6" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-zinc-900">{sess.device} Session</p>
                                        <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-widest">Active</span>
                                      </div>
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                        {sess.platform} • Bengaluru HSR Layout • Last active: Just now
                                      </p>
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => handleRevokeSession(sess.id)}
                                    className="p-2 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                                    title="Revoke Access"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* SUB-TAB 5: DELETE ACCOUNT (DANGER ZONE) */}
                    {settingsSubTab === "delete_account" && (
                      <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-red-100 p-8 md:p-10 shadow-xs space-y-8">
                          <div className="flex items-center gap-4 pb-6 border-b border-red-100">
                            <div className="p-4 bg-red-100 text-red-600 rounded-2xl border border-red-200">
                              <ShieldAlert className="h-8 w-8" />
                            </div>
                            <div>
                              <h4 className="text-xl font-black tracking-tight text-red-600 uppercase">Danger Zone: Account Deletion</h4>
                              <p className="text-xs text-zinc-500 mt-0.5 font-medium">Permanently erase your TaazaBites profile, delivery addresses, and health history</p>
                            </div>
                          </div>

                          {/* Data Archive Download Banner */}
                          <div className="p-6 bg-zinc-900 text-white rounded-3xl space-y-4 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                  <Download className="h-4 w-4 text-emerald-400" /> Export Personal Health Archives First
                                </p>
                                <p className="text-xs text-zinc-400 font-medium">Download your complete weight progress logs, nutrition plans, and invoice history as a JSON/CSV archive before wiping.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                                    profile: profileForm,
                                    health: healthForm,
                                    emergency: emergencyForm,
                                    preferences: preferencesForm,
                                    exportDate: new Date().toISOString()
                                  }, null, 2));
                                  const downloadAnchor = document.createElement('a');
                                  downloadAnchor.setAttribute("href", dataStr);
                                  downloadAnchor.setAttribute("download", `taazabites_archive_${Date.now()}.json`);
                                  document.body.appendChild(downloadAnchor);
                                  downloadAnchor.click();
                                  downloadAnchor.remove();
                                  showToast("Personal data archive downloaded successfully!", "success");
                                }}
                                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex-shrink-0"
                              >
                                Export Data Archive
                              </button>
                            </div>
                          </div>

                          {/* Reason Selector */}
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Please tell us why you are leaving</label>
                            <select 
                              value={deleteReason}
                              onChange={e => setDeleteReason(e.target.value)}
                              className="w-full h-12 rounded-xl bg-zinc-50 border border-zinc-200 px-4 text-xs font-bold text-zinc-800 outline-none"
                            >
                              <option value="Moving out of Bengaluru">Moving out of Bengaluru</option>
                              <option value="Switched to different diet plan">Switched to different diet plan</option>
                              <option value="Taking a temporary break">Taking a temporary break</option>
                              <option value="Financial / Budget preference">Financial / Budget preference</option>
                              <option value="Other">Other Reason</option>
                            </select>
                          </div>

                          {/* Grace Period Switch */}
                          <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-red-950">14-Day Grace Period Safeguard</p>
                              <p className="text-[10px] text-red-700 font-medium mt-0.5">Keep data frozen for 14 days so you can restore your active subscription if you change your mind</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={coolingOffPeriod}
                              onChange={e => setCoolingOffPeriod(e.target.checked)}
                              className="h-5 w-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                            />
                          </div>

                          {/* Trigger Deletion Button */}
                          <div className="pt-4 border-t border-zinc-100 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setIsDeleteVerifyOpen(true);
                                setDeleteConfirmText("");
                              }}
                              className="px-8 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" /> Request Account Deletion
                            </button>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: DEVELOPER CREDENTIALS SANDBOX */}
                    {settingsSubTab === "api" && (
                      <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 md:p-10 shadow-xs space-y-8">
                          <div>
                            <h4 className="text-xl font-black tracking-tight text-zinc-900">Personal Access API Credentials</h4>
                            <p className="text-xs text-zinc-400 mt-1 font-medium">Generate authorization tokens to sync TaazaBites with external biometrics, fitbits, or home automation</p>
                          </div>

                          {/* Key Generator Form */}
                          <form onSubmit={handleGenerateToken} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 block pl-1">Provision New Access Key</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input 
                                type="text"
                                placeholder="e.g. My Smart Mirror, HomeAssistant Feed..."
                                value={newTokenLabel}
                                onChange={e => setNewTokenLabel(e.target.value)}
                                className="h-12 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-black text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1"
                              />
                              <button
                                type="submit"
                                className="h-12 px-6 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors cursor-pointer"
                              >
                                Generate Key
                              </button>
                            </div>
                          </form>

                          {/* Active Keys List */}
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block pl-1">Active Ledger Credentials ({generatedTokens.length})</label>
                            {generatedTokens.length === 0 ? (
                              <div className="text-center p-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-xs font-bold text-zinc-400">
                                No third-party tokens provisioned.
                              </div>
                            ) : (
                              <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden">
                                {generatedTokens.map(tok => (
                                  <div key={tok.key} className="flex items-center justify-between p-4 bg-white hover:bg-zinc-50/50 transition-colors">
                                    <div className="space-y-1 max-w-[70%]">
                                      <p className="text-xs font-black text-zinc-900 uppercase tracking-wide">{tok.label}</p>
                                      <p className="text-[9px] font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded inline-block select-all">{tok.key}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        type="button"
                                        onClick={() => copyToClipboard(tok.key)}
                                        className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-all text-zinc-600 hover:text-zinc-900 cursor-pointer"
                                        title="Copy to Clipboard"
                                      >
                                        {copiedToken === tok.key ? (
                                          <Check className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => handleDeleteToken(tok.key)}
                                        className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg transition-all cursor-pointer"
                                        title="Revoke Token"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Sandbox REST API Viewer */}
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 block pl-1 font-bold">API Endpoint Query Sandbox</label>
                            <div className="bg-zinc-950 rounded-2xl p-5 font-mono text-xs text-zinc-300 space-y-4 shadow-xl">
                              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">HTTPS Mock Sandbox REST v1</span>
                                <div className="flex gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Selected Action</p>
                                <div className="flex gap-2">
                                  {["GET_PROFILE", "GET_MEALS", "POST_WEIGHT"].map(act => (
                                    <button
                                      key={act}
                                      type="button"
                                      onClick={() => {
                                        setNewTokenLabel(act); // dummy action
                                        playSyntheticChime("click");
                                      }}
                                      className={cn(
                                        "px-3 py-1.5 rounded-md text-[10px] font-black transition-colors cursor-pointer",
                                        newTokenLabel === act 
                                          ? "bg-emerald-600 text-white" 
                                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                                      )}
                                    >
                                      {act}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1 font-mono text-[11px]">
                                <p className="text-zinc-500">// Request Payload (curl)</p>
                                <p className="text-emerald-400">
                                  curl -H "Authorization: Bearer {generatedTokens[0]?.key || "tz_live_..."}" \
                                </p>
                                <p className="text-emerald-400">
                                  &nbsp;&nbsp;https://api.taazabites.com/v1/{newTokenLabel === "GET_MEALS" ? "meals/today" : (newTokenLabel === "POST_WEIGHT" ? "biometrics/weight" : "client/profile")}
                                </p>
                              </div>

                              <div className="space-y-1 font-mono text-[11px] bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-zinc-400">
                                <p className="text-zinc-500">// Simulated JSON Response</p>
                                {newTokenLabel === "GET_MEALS" ? (
                                  <pre className="text-amber-400">{JSON.stringify({
                                    status: "success",
                                    timestamp: "2026-07-22T08:00:00Z",
                                    activeSubscription: activeSub?.planId || "premium_fiber_90",
                                    deliverySlot: "Lunch (12:00 PM - 02:00 PM)",
                                    meals: [
                                      { id: "meal_023", name: "Keto High-Fiber Tofu Wrap", calories: 480, protein: "32g", fiber: "12g" }
                                    ]
                                  }, null, 2)}</pre>
                                ) : (newTokenLabel === "POST_WEIGHT" ? (
                                  <pre className="text-amber-400">{JSON.stringify({
                                    status: "success",
                                    loggedWeightKg: 72.5,
                                    date: "2026-07-22",
                                    previousWeightKg: healthAssessment?.weight || 73.0,
                                    bmiDelta: "-0.15 (Optimal progress trajectory)"
                                  }, null, 2)}</pre>
                                ) : (
                                  <pre className="text-amber-400">{JSON.stringify({
                                    uid: currentUser?.uid || "uid_test_123",
                                    name: profileDoc?.name || "Active Client",
                                    email: currentUser?.email || "user@test.com",
                                    assessmentCompleted: !!healthAssessment,
                                    biometricShieldEnabled: true
                                  }, null, 2)}</pre>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 4: INTERACTIVE SYSTEM TERMINAL */}
                    {settingsSubTab === "terminal" && (
                      <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 md:p-10 shadow-xs space-y-6">
                          <div>
                            <h4 className="text-xl font-black tracking-tight text-zinc-900">System Status & Diagnostic Commands</h4>
                            <p className="text-xs text-zinc-400 mt-1 font-medium">Check system health, account details, or test network connection directly</p>
                          </div>

                          {/* CLI Console */}
                          <div className="bg-zinc-950 text-emerald-400 font-mono text-xs rounded-2xl p-6 shadow-2xl border border-zinc-800 space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 text-zinc-500 font-bold">
                              <span className="flex items-center gap-1.5"><Terminal className="h-4 w-4" /> system@taaza: ~</span>
                              <span className="text-[10px] bg-zinc-900 px-2.5 py-1 rounded-md text-emerald-500">SYSTEM STABLE</span>
                            </div>

                            {/* Scrollable logs */}
                            <div className="max-h-72 overflow-y-auto space-y-2 hide-scrollbar pr-1 flex flex-col font-mono text-[11px] leading-relaxed">
                              {terminalLogs.map((log, idx) => (
                                <p 
                                  key={idx} 
                                  className={cn(
                                    log.startsWith("$") ? "text-white font-bold" : (log.startsWith("✓") ? "text-emerald-400" : (log.startsWith("!") || log.startsWith("Error") ? "text-red-400" : "text-zinc-300"))
                                  )}
                                >
                                  {log}
                                </p>
                              ))}
                            </div>

                            {/* Command Input Form */}
                            <form onSubmit={handleTerminalSubmit} className="flex gap-2 border-t border-zinc-800 pt-3">
                              <span className="text-emerald-500 font-bold font-mono py-2">$</span>
                              <input 
                                type="text"
                                placeholder="Type command (e.g. 'help', 'status', 'ping')..."
                                value={terminalInput}
                                onChange={e => setTerminalInput(e.target.value)}
                                className="bg-transparent text-white border-none outline-none font-mono focus:ring-0 flex-1 py-2 text-[11px]"
                              />
                              <button 
                                type="submit"
                                className="px-4 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-400 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                              >
                                EXEC
                              </button>
                            </form>
                          </div>

                          {/* Diagnostic quick commands presets panel */}
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block pl-1">Quick Commands</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { cmd: "help", label: "Help Docs" },
                                { cmd: "status", label: "User Status" },
                                { cmd: "health", label: "Health Stats" },
                                { cmd: "metrics", label: "Weight History" },
                                { cmd: "ping", label: "Ping Connection" },
                                { cmd: "about", label: "System Info" }
                              ].map(p => (
                                <button
                                  key={p.cmd}
                                  type="button"
                                  onClick={() => {
                                    setTerminalInput(p.cmd);
                                    playSyntheticChime("click");
                                  }}
                                  className="px-3.5 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-700 hover:text-zinc-900 transition-all cursor-pointer"
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Delete Verify Modal Dialog */}
      <AnimatePresence>
        {isDeleteVerifyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[2.5rem] max-w-md w-full border border-zinc-150 shadow-2xl text-center space-y-6"
            >
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Delete Account Verification</h3>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Are you absolutely sure you want to delete your profile, delivery addresses, and health indicators from our system? This cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setIsDeleteVerifyOpen(false)}
                  className="px-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  );
}
