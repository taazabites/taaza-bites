import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { settingsService } from "../services/settings"
import { db } from "../lib/firebase"
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore"
import {
  Building2,
  ChefHat,
  Layers,
  Truck,
  CreditCard,
  Wallet,
  Tag,
  BellRing,
  Globe,
  Share2,
  Scale,
  ShieldCheck,
  User,
  Lock,
  History,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Settings,
  HelpCircle,
  ExternalLink,
  MapPin
} from "lucide-react"
import { PlaceAutocomplete } from '../components/PlaceAutocomplete';

import {
  defaultBusinessSettings,
  defaultKitchenSettings,
  defaultSubscriptionSettings,
  defaultDeliverySettings,
  defaultPaymentSettings,
  defaultWalletRewardsSettings,
  defaultCouponSettings,
  defaultNotificationSettings,
  defaultSEOSettings,
  defaultSocialSettings,
  defaultLegalSettings,
  defaultAdminSecuritySettings,
  BusinessSettings,
  KitchenSettings,
  SubscriptionSettings,
  DeliverySettings,
  PaymentSettings,
  WalletRewardsSettings,
  CouponSettings,
  NotificationSettings,
  SEOSettings,
  SocialSettings,
  LegalSettings,
  AdminSecuritySettings
} from "../types/settings"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { user, resetPassword, triggerSessionWarning } = useAuth()
  const navigate = useNavigate()

  // Real-time Firestore state sources
  const [businessDb, setBusinessDb] = useState<BusinessSettings>(defaultBusinessSettings)
  const [kitchenDb, setKitchenDb] = useState<KitchenSettings>(defaultKitchenSettings)
  const [subscriptionDb, setSubscriptionDb] = useState<SubscriptionSettings>(defaultSubscriptionSettings)
  const [deliveryDb, setDeliveryDb] = useState<DeliverySettings>(defaultDeliverySettings)
  const [paymentDb, setPaymentDb] = useState<PaymentSettings>(defaultPaymentSettings)
  const [walletDb, setWalletDb] = useState<WalletRewardsSettings>(defaultWalletRewardsSettings)
  const [couponDb, setCouponDb] = useState<CouponSettings>(defaultCouponSettings)
  const [notificationDb, setNotificationDb] = useState<NotificationSettings>(defaultNotificationSettings)
  const [seoDb, setSeoDb] = useState<SEOSettings>(defaultSEOSettings)
  const [socialDb, setSocialDb] = useState<SocialSettings>(defaultSocialSettings)
  const [legalDb, setLegalDb] = useState<LegalSettings>(defaultLegalSettings)
  const [securityDb, setSecurityDb] = useState<AdminSecuritySettings>(defaultAdminSecuritySettings)

  const [taxDb, setTaxDb] = useState<any>({
    gstPercentage: 5,
    cgstPercentage: 2.5,
    sgstPercentage: 2.5,
    hsnCode: "996331",
    invoicePrefix: "TB-INV-",
    autoGenerateInvoice: true,
    taxInclusivity: "exclusive"
  })
  const [brandingDb, setBrandingDb] = useState<any>({
    primaryColor: "#10b981",
    secondaryColor: "#f59e0b",
    fontFamily: "Inter",
    headerTagline: "Fresh & Healthy Meals Delivered Daily",
    appFavicon: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=32&h=32&fit=crop",
    accentColor: "#10b981",
    darkModeEnabled: true,
  })
  const [rolesDb, setRolesDb] = useState<any>({
    roles: [
      { name: "Super Admin", count: 2, description: "Full access to all modules, finance records, and system preferences.", permissions: ["all"] },
      { name: "Kitchen Manager", count: 3, description: "Manage menu items, recipes, kitchen operations, and meal prep metrics.", permissions: ["kitchen", "meals", "inventory"] },
      { name: "Delivery Lead", count: 4, description: "Assign drivers, manage delivery slots, optimize routes, and view service areas.", permissions: ["delivery", "service-areas"] },
      { name: "Customer Support", count: 5, description: "Access customer accounts, addresses, notes, and log support queries.", permissions: ["customers", "support"] }
    ]
  })
  const [systemDb, setSystemDb] = useState<any>({
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "en",
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    debugLogs: false
  })

  // Current active navigation section
  const [activeTab, setActiveTab] = useState<string>("business")

  // Form states mapping input fields
  const [businessForm, setBusinessForm] = useState<BusinessSettings>(defaultBusinessSettings)
  const [kitchenForm, setKitchenForm] = useState<KitchenSettings>(defaultKitchenSettings)
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionSettings>(defaultSubscriptionSettings)
  const [deliveryForm, setDeliveryForm] = useState<DeliverySettings>(defaultDeliverySettings)
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(defaultPaymentSettings)
  const [walletForm, setWalletForm] = useState<WalletRewardsSettings>(defaultWalletRewardsSettings)
  const [couponForm, setCouponForm] = useState<CouponSettings>(defaultCouponSettings)
  const [notificationForm, setNotificationForm] = useState<NotificationSettings>(defaultNotificationSettings)
  const [seoForm, setSeoForm] = useState<SEOSettings>(defaultSEOSettings)
  const [socialForm, setSocialForm] = useState<SocialSettings>(defaultSocialSettings)
  const [legalForm, setLegalForm] = useState<LegalSettings>(defaultLegalSettings)
  const [securityForm, setSecurityForm] = useState<AdminSecuritySettings>(defaultAdminSecuritySettings)

  const [taxForm, setTaxForm] = useState<any>({
    gstPercentage: 5,
    cgstPercentage: 2.5,
    sgstPercentage: 2.5,
    hsnCode: "996331",
    invoicePrefix: "TB-INV-",
    autoGenerateInvoice: true,
    taxInclusivity: "exclusive"
  })
  const [brandingForm, setBrandingForm] = useState<any>({
    primaryColor: "#10b981",
    secondaryColor: "#f59e0b",
    fontFamily: "Inter",
    headerTagline: "Fresh & Healthy Meals Delivered Daily",
    appFavicon: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=32&h=32&fit=crop",
    accentColor: "#10b981",
    darkModeEnabled: true,
  })
  const [rolesForm, setRolesForm] = useState<any>({
    roles: [
      { name: "Super Admin", count: 2, description: "Full access to all modules, finance records, and system preferences.", permissions: ["all"] },
      { name: "Kitchen Manager", count: 3, description: "Manage menu items, recipes, kitchen operations, and meal prep metrics.", permissions: ["kitchen", "meals", "inventory"] },
      { name: "Delivery Lead", count: 4, description: "Assign drivers, manage delivery slots, optimize routes, and view service areas.", permissions: ["delivery", "service-areas"] },
      { name: "Customer Support", count: 5, description: "Access customer accounts, addresses, notes, and log support queries.", permissions: ["customers", "support"] }
    ]
  })
  const [systemForm, setSystemForm] = useState<any>({
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "en",
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    debugLogs: false
  })

  // Branches local cache state
  const [branchesList, setBranchesList] = useState<any[]>([])

  // Profile Edit fields inside Tab 12
  const [profileName, setProfileName] = useState<string>("")
  const [profileEmail, setProfileEmail] = useState<string>("")
  const [profileRole, setProfileRole] = useState<string>("")

  // Unsaved Changes tracking
  const [isDirty, setIsDirty] = useState<Record<string, boolean>>({})

  // Loading, success & error notifications
  const [isListening, setIsListening] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<{ loading: boolean; success: boolean; error: string | null }>({
    loading: false,
    success: false,
    error: null,
  })

  // Holiday entry scratchpad
  const [newHoliday, setNewHoliday] = useState<string>("")

  // Login session history state
  const [loginHistory, setLoginHistory] = useState<any[]>([])

  // Reusable confirmation Modal settings
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

  // Start 12 Real-time Firestore Listeners on Mount
  useEffect(() => {
    setIsListening(true)
    const unsubBusiness = settingsService.subscribeToDoc<BusinessSettings>("business", setBusinessDb, defaultBusinessSettings)
    const unsubKitchen = settingsService.subscribeToDoc<KitchenSettings>("kitchen", setKitchenDb, defaultKitchenSettings)
    const unsubSub = settingsService.subscribeToDoc<SubscriptionSettings>("subscription", setSubscriptionDb, defaultSubscriptionSettings)
    const unsubDelivery = settingsService.subscribeToDoc<DeliverySettings>("delivery", setDeliveryDb, defaultDeliverySettings)
    const unsubPayment = settingsService.subscribeToDoc<PaymentSettings>("payment", setPaymentDb, defaultPaymentSettings)
    const unsubWallet = settingsService.subscribeToDoc<WalletRewardsSettings>("wallet", setWalletDb, defaultWalletRewardsSettings)
    const unsubCoupon = settingsService.subscribeToDoc<CouponSettings>("coupon", setCouponDb, defaultCouponSettings)
    const unsubNotification = settingsService.subscribeToDoc<NotificationSettings>("notification", setNotificationDb, defaultNotificationSettings)
    const unsubSeo = settingsService.subscribeToDoc<SEOSettings>("seo", setSeoDb, defaultSEOSettings)
    const unsubSocial = settingsService.subscribeToDoc<SocialSettings>("social", setSocialDb, defaultSocialSettings)
    const unsubLegal = settingsService.subscribeToDoc<LegalSettings>("legal", setLegalDb, defaultLegalSettings)
    const unsubSecurity = settingsService.subscribeToDoc<AdminSecuritySettings>("security", setSecurityDb, defaultAdminSecuritySettings)

    // New subscriptions for the missing panels
    const unsubTax = settingsService.subscribeToDoc<any>("tax", setTaxDb, {
      gstPercentage: 5,
      cgstPercentage: 2.5,
      sgstPercentage: 2.5,
      hsnCode: "996331",
      invoicePrefix: "TB-INV-",
      autoGenerateInvoice: true,
      taxInclusivity: "exclusive"
    })
    const unsubBranding = settingsService.subscribeToDoc<any>("branding", setBrandingDb, {
      primaryColor: "#10b981",
      secondaryColor: "#f59e0b",
      fontFamily: "Inter",
      headerTagline: "Fresh & Healthy Meals Delivered Daily",
      appFavicon: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=32&h=32&fit=crop",
      accentColor: "#10b981",
      darkModeEnabled: true,
    })
    const unsubRoles = settingsService.subscribeToDoc<any>("roles", setRolesDb, {
      roles: [
        { name: "Super Admin", count: 2, description: "Full access to all modules, finance records, and system preferences.", permissions: ["all"] },
        { name: "Kitchen Manager", count: 3, description: "Manage menu items, recipes, kitchen operations, and meal prep metrics.", permissions: ["kitchen", "meals", "inventory"] },
        { name: "Delivery Lead", count: 4, description: "Assign drivers, manage delivery slots, optimize routes, and view service areas.", permissions: ["delivery", "service-areas"] },
        { name: "Customer Support", count: 5, description: "Access customer accounts, addresses, notes, and log support queries.", permissions: ["customers", "support"] }
      ]
    })
    const unsubSystem = settingsService.subscribeToDoc<any>("system", setSystemDb, {
      currency: "INR",
      timezone: "Asia/Kolkata",
      language: "en",
      maintenanceMode: false,
      autoBackup: true,
      backupFrequency: "daily",
      debugLogs: false
    })

    // Real-time branches observer for the summary panel
    const qBranches = query(collection(db, "branches"))
    const unsubBranches = onSnapshot(qBranches, (snapshot) => {
      const list: any[] = []
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
      })
      setBranchesList(list)
    }, (err) => {
      console.error("Failed to sync branches for setting view: ", err)
    })

    return () => {
      unsubBusiness()
      unsubKitchen()
      unsubSub()
      unsubDelivery()
      unsubPayment()
      unsubWallet()
      unsubCoupon()
      unsubNotification()
      unsubSeo()
      unsubSocial()
      unsubLegal()
      unsubSecurity()
      unsubTax()
      unsubBranding()
      unsubRoles()
      unsubSystem()
      unsubBranches()
    }
  }, [])

  // Sync snapshot DB state back to Form state if form is not actively edited
  useEffect(() => { if (!isDirty["business"]) setBusinessForm(businessDb) }, [businessDb, isDirty])
  useEffect(() => { if (!isDirty["kitchen"]) setKitchenForm(kitchenDb) }, [kitchenDb, isDirty])
  useEffect(() => { if (!isDirty["subscription"]) setSubscriptionForm(subscriptionDb) }, [subscriptionDb, isDirty])
  useEffect(() => { if (!isDirty["delivery"]) setDeliveryForm(deliveryDb) }, [deliveryDb, isDirty])
  useEffect(() => { if (!isDirty["payment"]) setPaymentForm(paymentDb) }, [paymentDb, isDirty])
  useEffect(() => { if (!isDirty["wallet"]) setWalletForm(walletDb) }, [walletDb, isDirty])
  useEffect(() => { if (!isDirty["coupon"]) setCouponForm(couponDb) }, [couponDb, isDirty])
  useEffect(() => { if (!isDirty["notification"]) setNotificationForm(notificationDb) }, [notificationDb, isDirty])
  useEffect(() => { if (!isDirty["seo"]) setSeoForm(seoDb) }, [seoDb, isDirty])
  useEffect(() => { if (!isDirty["social"]) setSocialForm(socialDb) }, [socialDb, isDirty])
  useEffect(() => { if (!isDirty["legal"]) setLegalForm(legalDb) }, [legalDb, isDirty])
  useEffect(() => { if (!isDirty["security"]) setSecurityForm(securityDb) }, [securityDb, isDirty])
  useEffect(() => { if (!isDirty["tax"]) setTaxForm(taxDb) }, [taxDb, isDirty])
  useEffect(() => { if (!isDirty["branding"]) setBrandingForm(brandingDb) }, [brandingDb, isDirty])
  useEffect(() => { if (!isDirty["roles"]) setRolesForm(rolesDb) }, [rolesDb, isDirty])
  useEffect(() => { if (!isDirty["system"]) setSystemForm(systemDb) }, [systemDb, isDirty])

  // Sync Admin Profile Form Inputs on mount or user shift
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "")
      setProfileEmail(user.email || "")
      setProfileRole(user.role || "")
    }
  }, [user])

  // Real-time user login session log listener
  useEffect(() => {
    if (!user?.id) return
    const q = query(collection(db, "audit_logs"), where("userId", "==", user.id))

    const unsubHistory = onSnapshot(q, (snapshot) => {
      const logs: any[] = []
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() })
      })
      // Sort client side dynamically to guarantee reliable indices
      logs.sort((a, b) => {
        const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp || 0).getTime()
        const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp || 0).getTime()
        return timeB - timeA
      })
      setLoginHistory(logs.slice(0, 8))
    }, (err) => {
      console.error("Failed to query user audit log history:", err)
    })

    return () => unsubHistory()
  }, [user?.id])

  // Mark specific tab as containing unsaved changes
  const markDirty = (tabName: string) => {
    setIsDirty(prev => ({ ...prev, [tabName]: true }))
  };

  // Safe wrapper for triggering Firestore write with full status updates
  const handleSave = async (docId: string, formPayload: any) => {
    setSaveStatus({ loading: true, success: false, error: null })
    try {
      const adminIdentity = user ? { id: user.id, email: user.email, name: user.name } : null
      await settingsService.saveDoc(docId, formPayload, adminIdentity)
      
      // Clear dirty flag for this tab upon successful write
      setIsDirty(prev => ({ ...prev, [docId]: false }))
      setSaveStatus({ loading: false, success: true, error: null })
      
      // Clear success notification after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, success: false }))
      }, 3000)
    } catch (err: any) {
      console.error("Failed to execute settings save:", err)
      let parsedError = "Error saving settings"
      try {
        const parsed = JSON.parse(err.message)
        if (parsed.error) parsedError = parsed.error
      } catch (_) {
        parsedError = err.message || String(err)
      }
      setSaveStatus({ loading: false, success: false, error: parsedError })
    }
  }

  // Trigger Save Confirmation Dialog
  const triggerSaveConfirm = (docId: string, payload: any, displayLabel: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Save Settings Confirmation",
      message: `Are you absolutely sure you want to write these updated configurations for '${displayLabel}'? The customer-facing website will automatically sync in real-time.`,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        handleSave(docId, payload)
      }
    })
  }

  // Helper to add holiday tag to kitchen settings list
  const addKitchenHoliday = () => {
    if (!newHoliday) return
    if (kitchenForm.holidayCalendar.includes(newHoliday)) {
      setNewHoliday("")
      return
    }
    const updatedCalendar = [...kitchenForm.holidayCalendar, newHoliday].sort()
    setKitchenForm(prev => ({ ...prev, holidayCalendar: updatedCalendar }))
    markDirty("kitchen")
    setNewHoliday("")
  }

  // Helper to remove holiday tag
  const removeKitchenHoliday = (dateString: string) => {
    const updatedCalendar = kitchenForm.holidayCalendar.filter(d => d !== dateString)
    setKitchenForm(prev => ({ ...prev, holidayCalendar: updatedCalendar }))
    markDirty("kitchen")
  }

  // Trigger Admin Name updates in Firestore
  const saveAdminProfile = async () => {
    if (!user?.id) return
    setSaveStatus({ loading: true, success: false, error: null })
    try {
      const adminRef = doc(db, "admins", user.id)
      await setDoc(adminRef, { name: profileName }, { merge: true })
      
      setSaveStatus({ loading: false, success: true, error: null })
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, success: false }))
      }, 3000)
    } catch (err: any) {
      setSaveStatus({ loading: false, success: false, error: err.message || "Failed to update profile name" })
    }
  }

  // Handle Send Password Reset Email
  const triggerPasswordResetEmail = async () => {
    if (!profileEmail) return
    setConfirmModal({
      isOpen: true,
      title: "Trigger Password Reset Email",
      message: `Would you like to send a secure password reset email to '${profileEmail}'? This will allow you to change your administrative panel credentials securely.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        setSaveStatus({ loading: true, success: false, error: null })
        try {
          await resetPassword(profileEmail)
          setSaveStatus({
            loading: false,
            success: true,
            error: null
          })
          alert(`Success! Password reset instruction email has been dispatched to ${profileEmail}`)
        } catch (err: any) {
          setSaveStatus({ loading: false, success: false, error: err.message || "Reset failed" })
        }
      }
    })
  }

  // Navigation tabs with icons
  const settingSections = [
    { id: "business", label: "Business Info", icon: Building2, desc: "Primary brand names, licenses, logos & support channels." },
    { id: "branches", label: "Branch Settings", icon: Building2, desc: "Manage operational branches and kitchen locations." },
    { id: "kitchen", label: "Kitchen Settings", icon: ChefHat, desc: "Kitchen operational limits, schedule & statuses." },
    { id: "subscription", label: "Subscription Tiers", icon: Layers, desc: "Trial logic, reminder delays, pause & skip limits." },
    { id: "delivery", label: "Delivery Options", icon: Truck, desc: "Courier limits, free shipment goals & radius filters." },
    { id: "payment", label: "Payment Systems", icon: CreditCard, desc: "Integrated payment gateways, taxes & refund terms." },
    { id: "tax", label: "Tax & GST", icon: Tag, desc: "Configure GST percentages and tax rules." },
    { id: "wallet", label: "Wallet & Rewards", icon: Wallet, desc: "Cashbacks, referral bonuses & wallet expiry limits." },
    { id: "coupon", label: "Coupons & Offers", icon: Tag, desc: "Enable auto coupon validations & system defaults." },
    { id: "notification", label: "Notifications", icon: BellRing, desc: "Firebase push, WhatsApp triggers, SMS & email setups." },
    { id: "branding", label: "Branding", icon: Globe, desc: "Configure logos, colors and site assets." },
    { id: "roles", label: "Roles & Permissions", icon: ShieldCheck, desc: "Manage administrative roles and access rights." },
    { id: "system", label: "System Preferences", icon: Settings, desc: "Timezone, currency and language settings." },
    { id: "seo", label: "SEO Configs", icon: Globe, desc: "Page headers, descriptors, open-graph & analytics ids." },
    { id: "social", label: "Social Media", icon: Share2, desc: "Social URLs & dynamic footer reference handles." },
    { id: "legal", label: "Legal & Policies", icon: Scale, desc: "Privacy policies, delivery, refund & service contracts." },
    { id: "security", label: "Admin Settings", icon: ShieldCheck, desc: "Admin profiles, system timeouts & logged session records." },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Dynamic Header with Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/60 shadow-xl gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="h-8 w-8 text-emerald-500 animate-spin-slow" />
            Business Settings
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Configure system configurations, delivery charges, operational hours, and metadata.
          </p>
        </div>

        {/* Real-time sync tracker indicator */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-white">Firestore Realtime Synced</p>
            <p className="text-[10px] text-zinc-500">Auto updating customer website</p>
          </div>
        </div>
      </div>

      {/* General Notification Toasts */}
      {saveStatus.success && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Settings Written Successfully!</span> Real-time synchronizations were dispatched to the Cloud database.
          </div>
        </div>
      )}

      {saveStatus.error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Save Aborted:</span> {saveStatus.error}
          </div>
        </div>
      )}

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Section Selector panel */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-zinc-900/40 backdrop-blur-xl p-4 rounded-xl border border-zinc-800/60 shadow-md">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 px-2">Settings Sections</h3>
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 ">
              {settingSections.map((sec) => {
                const IconComponent = sec.icon
                const isActive = activeTab === sec.id
                const isFormDirty = !!isDirty[sec.id]

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shrink-0 md:shrink ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span className="truncate flex-1">{sec.label}</span>
                    {isFormDirty && (
                      <Badge className="bg-orange-500/10 text-orange-400 border-none text-[9px] px-1.5 py-0.2">Unsaved</Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side Form Content Pane */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* SEC 1: Business Information */}
          {activeTab === "business" && (
            <Card className="bg-zinc-950 border-zinc-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <CardHeader className="border-b border-zinc-800 pb-5">
                <CardTitle className="text-white text-xl font-black tracking-tight flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                  Business Settings
                </CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-1">
                  Configure corporate parameters, operating hours, compliance licenses, and public customer-facing branding.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-8">
                
                {/* Subsection 1: Brand & Visual Identity */}
                <div className="space-y-4 p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Brand & Visual Identity</h3>
                  </div>
                  
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Business Name</Label>
                      <Input
                        value={businessForm.businessName}
                        onChange={(e) => { setBusinessForm({ ...businessForm, businessName: e.target.value }); markDirty("business"); }}
                        className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 placeholder:text-zinc-600"
                        placeholder="e.g. Taazabites Foodtech Private Limited"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Brand Name</Label>
                      <Input
                        value={businessForm.brandName}
                        onChange={(e) => { setBusinessForm({ ...businessForm, brandName: e.target.value }); markDirty("business"); }}
                        className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 placeholder:text-zinc-600"
                        placeholder="e.g. Taazabites"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label>
                    <Input 
                      value={businessForm.operationalHours || ""} 
                      onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} 
                      className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 placeholder:text-zinc-600" 
                      placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" 
                    />
                    <p className="text-[11px] text-zinc-500">Public operating hours displayed on user-facing storefront.</p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 pt-2">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Business Logo URL</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          value={businessForm.businessLogo}
                          onChange={(e) => { setBusinessForm({ ...businessForm, businessLogo: e.target.value }); markDirty("business"); }}
                          className="bg-zinc-900 border-zinc-800 text-white text-xs focus:border-emerald-500 flex-1"
                        />
                        {businessForm.businessLogo && (
                          <img src={businessForm.businessLogo} alt="Logo" className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Business Banner URL</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          value={businessForm.businessBanner}
                          onChange={(e) => { setBusinessForm({ ...businessForm, businessBanner: e.target.value }); markDirty("business"); }}
                          className="bg-zinc-900 border-zinc-800 text-white text-xs focus:border-emerald-500 flex-1"
                        />
                        {businessForm.businessBanner && (
                          <img src={businessForm.businessBanner} alt="Banner" className="w-16 h-10 rounded-lg bg-zinc-900 border border-zinc-800 object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subsection 2: Contact & Customer Support Channels */}
                <div className="space-y-4 p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Contact & Support Channels</h3>
                  </div>
                  
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Support Email</Label>
                      <Input
                        type="email"
                        value={businessForm.supportEmail}
                        onChange={(e) => { setBusinessForm({ ...businessForm, supportEmail: e.target.value }); markDirty("business"); }}
                        className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 placeholder:text-zinc-600"
                        placeholder="e.g. support@taazabites.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Support Phone</Label>
                      <Input
                        value={businessForm.supportPhone}
                        onChange={(e) => { setBusinessForm({ ...businessForm, supportPhone: e.target.value }); markDirty("business"); }}
                        className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 placeholder:text-zinc-600"
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Website URL</Label>
                      <Input
                        value={businessForm.website}
                        onChange={(e) => { setBusinessForm({ ...businessForm, website: e.target.value }); markDirty("business"); }}
                        className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 placeholder:text-zinc-600"
                        placeholder="e.g. https://taazabites.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Subsection 3: Legal & Regulatory Licenses */}
                <div className="space-y-4 p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Legal & Regulatory Licenses</h3>
                  </div>
                  
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">GST Number (Goods & Services Tax)</Label>
                      <Input
                        value={businessForm.gstNumber}
                        onChange={(e) => { setBusinessForm({ ...businessForm, gstNumber: e.target.value }); markDirty("business"); }}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono focus:border-emerald-500 placeholder:text-zinc-600"
                        placeholder="15-digit Alpha-numeric GSTIN"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">FSSAI Number (Food Safety License)</Label>
                      <Input
                        value={businessForm.fssaiNumber}
                        onChange={(e) => { setBusinessForm({ ...businessForm, fssaiNumber: e.target.value }); markDirty("business"); }}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono focus:border-emerald-500 placeholder:text-zinc-600"
                        placeholder="14-digit FSSAI License Number"
                      />
                    </div>
                  </div>
                </div>

                {/* Subsection 4: Corporate Headquarters */}
                <div className="space-y-4 p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Corporate Headquarters</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Search Address</Label>
                    <PlaceAutocomplete onPlaceSelect={(place: any) => {
                      setBusinessForm(prev => ({
                        ...prev,
                        businessAddress: place.formattedAddress || place.name || prev.businessAddress
                      }));
                      markDirty("business");
                    }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Physical Corporate Address</Label>
                    <textarea
                      rows={2}
                      value={businessForm.businessAddress}
                      onChange={(e) => { setBusinessForm({ ...businessForm, businessAddress: e.target.value }); markDirty("business"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="Complete street details, city, state and pincode"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Google Map Link</Label>
                    <Input
                      value={businessForm.googleMapLink}
                      onChange={(e) => { setBusinessForm({ ...businessForm, googleMapLink: e.target.value }); markDirty("business"); }}
                      className="bg-zinc-900 border-zinc-800 text-white text-xs focus:border-emerald-500"
                      placeholder="e.g. https://maps.google.com/..."
                    />
                  </div>
                </div>

                {/* Save Footer Bar */}
                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("business", businessForm, "Business Information")}
                    disabled={!isDirty["business"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold px-6 py-5 rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
                  >
                    {saveStatus.loading && activeTab === "business" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Business Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 2: Kitchen Settings */}
          {activeTab === "kitchen" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-emerald-500" /> Kitchen Settings
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage kitchen operations, prep limits, schedules, status triggers & holiday calendars.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Kitchen Name</Label>
                    <Input
                      value={kitchenForm.kitchenName}
                      onChange={(e) => { setKitchenForm({ ...kitchenForm, kitchenName: e.target.value }); markDirty("kitchen"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Kitchen Operating Hours</Label>
                    <Input
                      value={kitchenForm.operatingHours}
                      onChange={(e) => { setKitchenForm({ ...kitchenForm, operatingHours: e.target.value }); markDirty("kitchen"); }}
                      placeholder="e.g. 06:00 AM - 10:00 PM"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Average Preparation Time</Label>
                    <Input
                      value={kitchenForm.preparationTime}
                      onChange={(e) => { setKitchenForm({ ...kitchenForm, preparationTime: e.target.value }); markDirty("kitchen"); }}
                      placeholder="e.g. 45 mins"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Kitchen Operating Status</Label>
                    <select
                      value={kitchenForm.kitchenStatus}
                      onChange={(e) => { setKitchenForm({ ...kitchenForm, kitchenStatus: e.target.value as any }); markDirty("kitchen"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Open">🟢 Operational (Open)</option>
                      <option value="Closed">🔴 Closed</option>
                      <option value="Busy">🟠 Peak Orders (Busy)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-semibold uppercase">Search Kitchen Address</Label>
                  <PlaceAutocomplete onPlaceSelect={(place: any) => {
                    setKitchenForm(prev => ({
                      ...prev,
                      kitchenAddress: place.formattedAddress || place.name || prev.kitchenAddress
                    }));
                    markDirty("kitchen");
                  }} />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-semibold uppercase">Kitchen Physical Address</Label>
                  <textarea
                    rows={2}
                    value={kitchenForm.kitchenAddress}
                    onChange={(e) => { setKitchenForm({ ...kitchenForm, kitchenAddress: e.target.value }); markDirty("kitchen"); }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                {/* Holiday calendar tag list manager */}
                <div className="space-y-3 bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl">
                  <div>
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Holiday Calendar</Label>
                    <p className="text-zinc-500 text-[11px]">Declare fixed days the kitchen remains non-operational.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newHoliday}
                      onChange={(e) => setNewHoliday(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <Button onClick={addKitchenHoliday} className="bg-zinc-800 hover:bg-zinc-700 text-white">
                      <Plus className="h-4 w-4 mr-1" /> Add Date
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {kitchenForm.holidayCalendar && kitchenForm.holidayCalendar.length > 0 ? (
                      kitchenForm.holidayCalendar.map((date) => (
                        <div key={date} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-zinc-300">
                          {date}
                          <button
                            type="button"
                            onClick={() => removeKitchenHoliday(date)}
                            className="text-zinc-500 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-600 text-xs italic">No holidays designated yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("kitchen", kitchenForm, "Kitchen Settings")}
                    disabled={!isDirty["kitchen"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 3: Subscription Settings */}
          {activeTab === "subscription" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-500" /> Subscription Settings
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage membership tiers, limits on concurrent active plans, auto renewal & pause options.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  
                  {/* Custom Toggle 1 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60/80">
                    <div>
                      <Label className="text-white text-sm font-semibold">Enable Subscription Plans</Label>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Allow public buyers to subscribe.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSubscriptionForm({ ...subscriptionForm, enablePlans: !subscriptionForm.enablePlans }); markDirty("subscription"); }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        subscriptionForm.enablePlans ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        subscriptionForm.enablePlans ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  {/* Custom Toggle 2 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60/80">
                    <div>
                      <Label className="text-white text-sm font-semibold">Auto Renewal Enforced</Label>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Auto charge cards upon period completion.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSubscriptionForm({ ...subscriptionForm, autoRenewal: !subscriptionForm.autoRenewal }); markDirty("subscription"); }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        subscriptionForm.autoRenewal ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        subscriptionForm.autoRenewal ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Maximum Active Subscription Plans</Label>
                    <Input
                      type="number"
                      value={subscriptionForm.maxActivePlans}
                      onChange={(e) => { setSubscriptionForm({ ...subscriptionForm, maxActivePlans: parseInt(e.target.value) || 0 }); markDirty("subscription"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Renewal Reminder Period (Days)</Label>
                    <Input
                      type="number"
                      value={subscriptionForm.renewalReminderDays}
                      onChange={(e) => { setSubscriptionForm({ ...subscriptionForm, renewalReminderDays: parseInt(e.target.value) || 0 }); markDirty("subscription"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Maximum Subscription Pause Days Limit</Label>
                    <Input
                      type="number"
                      value={subscriptionForm.pauseLimit}
                      onChange={(e) => { setSubscriptionForm({ ...subscriptionForm, pauseLimit: parseInt(e.target.value) || 0 }); markDirty("subscription"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Maximum Meal Skips Limit</Label>
                    <Input
                      type="number"
                      value={subscriptionForm.skipMealLimit}
                      onChange={(e) => { setSubscriptionForm({ ...subscriptionForm, skipMealLimit: parseInt(e.target.value) || 0 }); markDirty("subscription"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-semibold uppercase">Trial Plan Configuration Settings</Label>
                  <textarea
                    rows={2}
                    value={subscriptionForm.trialPlanSettings}
                    onChange={(e) => { setSubscriptionForm({ ...subscriptionForm, trialPlanSettings: e.target.value }); markDirty("subscription"); }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("subscription", subscriptionForm, "Subscription Settings")}
                    disabled={!isDirty["subscription"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 4: Delivery Settings */}
          {activeTab === "delivery" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-500" /> Delivery Settings
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure dynamic delivery fees, minimum orders, coverage radii, and dispatch slots.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Standard Delivery Charges (₹)</Label>
                    <Input
                      type="number"
                      value={deliveryForm.deliveryCharges}
                      onChange={(e) => { setDeliveryForm({ ...deliveryForm, deliveryCharges: parseFloat(e.target.value) || 0 }); markDirty("delivery"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Free Shipment Order Limit (₹)</Label>
                    <Input
                      type="number"
                      value={deliveryForm.freeDeliveryAbove}
                      onChange={(e) => { setDeliveryForm({ ...deliveryForm, freeDeliveryAbove: parseFloat(e.target.value) || 0 }); markDirty("delivery"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Minimum Allowed Order Value (₹)</Label>
                    <Input
                      type="number"
                      value={deliveryForm.minimumOrder}
                      onChange={(e) => { setDeliveryForm({ ...deliveryForm, minimumOrder: parseFloat(e.target.value) || 0 }); markDirty("delivery"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Max Courier Distance (km)</Label>
                    <Input
                      type="number"
                      value={deliveryForm.maxDeliveryDistance}
                      onChange={(e) => { setDeliveryForm({ ...deliveryForm, maxDeliveryDistance: parseFloat(e.target.value) || 0 }); markDirty("delivery"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Radial Delivery Radius Limit (km)</Label>
                    <Input
                      type="number"
                      value={deliveryForm.deliveryRadius}
                      onChange={(e) => { setDeliveryForm({ ...deliveryForm, deliveryRadius: parseFloat(e.target.value) || 0 }); markDirty("delivery"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  {/* Express Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60/80">
                    <div>
                      <Label className="text-white text-xs font-bold uppercase">Express Delivery</Label>
                      <p className="text-zinc-500 text-[9px] mt-0.5">Enable immediate priority courier options.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryForm({
                          ...deliveryForm,
                          deliveryTimeSlots: { ...deliveryForm.deliveryTimeSlots, expressDelivery: !deliveryForm.deliveryTimeSlots.expressDelivery }
                        });
                        markDirty("delivery");
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        deliveryForm.deliveryTimeSlots?.expressDelivery ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        deliveryForm.deliveryTimeSlots?.expressDelivery ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Delivery slots subgroups */}
                <div className="bg-zinc-900/30 border border-zinc-800/60 p-4 rounded-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Meal Dispatch Timing Slots</h3>
                    <p className="text-zinc-500 text-xs">Specify daily intervals customers can select for each shift.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Morning Shift Slot</Label>
                      <Input
                        value={deliveryForm.deliveryTimeSlots?.morning || ""}
                        onChange={(e) => {
                          setDeliveryForm({
                            ...deliveryForm,
                            deliveryTimeSlots: { ...deliveryForm.deliveryTimeSlots, morning: e.target.value }
                          });
                          markDirty("delivery");
                        }}
                        className="bg-zinc-900 border-zinc-800 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Lunch Shift Slot</Label>
                      <Input
                        value={deliveryForm.deliveryTimeSlots?.lunch || ""}
                        onChange={(e) => {
                          setDeliveryForm({
                            ...deliveryForm,
                            deliveryTimeSlots: { ...deliveryForm.deliveryTimeSlots, lunch: e.target.value }
                          });
                          markDirty("delivery");
                        }}
                        className="bg-zinc-900 border-zinc-800 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Dinner Shift Slot</Label>
                      <Input
                        value={deliveryForm.deliveryTimeSlots?.dinner || ""}
                        onChange={(e) => {
                          setDeliveryForm({
                            ...deliveryForm,
                            deliveryTimeSlots: { ...deliveryForm.deliveryTimeSlots, dinner: e.target.value }
                          });
                          markDirty("delivery");
                        }}
                        className="bg-zinc-900 border-zinc-800 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("delivery", deliveryForm, "Delivery Settings")}
                    disabled={!isDirty["delivery"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 5: Payment Settings */}
          {activeTab === "payment" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Settings
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure Razorpay api switches, active wallet settings, taxes and refund policy details.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                
                {/* Gateway activation grid */}
                <div>
                  <Label className="text-zinc-400 text-xs font-semibold uppercase mb-3 block">Activated Payment Channels</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">Enable Razorpay Integration</Label>
                        <p className="text-zinc-500 text-[10px]">Collect using active Merchant endpoints.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPaymentForm({ ...paymentForm, enableRazorpay: !paymentForm.enableRazorpay }); markDirty("payment"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          paymentForm.enableRazorpay ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          paymentForm.enableRazorpay ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">Enable UPI QR / Direct Pay</Label>
                        <p className="text-zinc-500 text-[10px]">Allow instant BHIM, GPay, PhonePe payments.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPaymentForm({ ...paymentForm, enableUPI: !paymentForm.enableUPI }); markDirty("payment"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          paymentForm.enableUPI ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          paymentForm.enableUPI ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">Enable Credit/Debit Cards</Label>
                        <p className="text-zinc-500 text-[10px]">Accept Visa, Mastercard, RuPay cards.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPaymentForm({ ...paymentForm, enableCards: !paymentForm.enableCards }); markDirty("payment"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          paymentForm.enableCards ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          paymentForm.enableCards ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">Enable Net Banking</Label>
                        <p className="text-zinc-500 text-[10px]">Support HDFC, ICICI, SBI direct accounts.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPaymentForm({ ...paymentForm, enableNetBanking: !paymentForm.enableNetBanking }); markDirty("payment"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          paymentForm.enableNetBanking ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          paymentForm.enableNetBanking ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">Enable Internal Taaza Wallet</Label>
                        <p className="text-zinc-500 text-[10px]">Provide swift credits & in-app purchases.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPaymentForm({ ...paymentForm, enableWallet: !paymentForm.enableWallet }); markDirty("payment"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          paymentForm.enableWallet ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          paymentForm.enableWallet ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="space-y-2 p-3 bg-zinc-900/20 rounded-lg border border-zinc-800/60">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Standard Order GST Percentage (%)</Label>
                      <Input
                        type="number"
                        value={paymentForm.gstPercentage}
                        onChange={(e) => { setPaymentForm({ ...paymentForm, gstPercentage: parseFloat(e.target.value) || 0 }); markDirty("payment"); }}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-semibold uppercase">Refund Terms & Policies</Label>
                  <textarea
                    rows={2}
                    value={paymentForm.refundPolicy}
                    onChange={(e) => { setPaymentForm({ ...paymentForm, refundPolicy: e.target.value }); markDirty("payment"); }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("payment", paymentForm, "Payment Settings")}
                    disabled={!isDirty["payment"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 6: Wallet & Rewards */}
          {activeTab === "wallet" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-500" /> Wallet & Rewards
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage welcome signup credits, referral points, point conversions & wallet credit expiry.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2"><Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label><Input value={businessForm.operationalHours || ""} onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" /></div><div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">New Customer Signup Bonus (₹)</Label>
                    <Input
                      type="number"
                      value={walletForm.signupBonus}
                      onChange={(e) => { setWalletForm({ ...walletForm, signupBonus: parseFloat(e.target.value) || 0 }); markDirty("wallet"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Referral Successful Invitation Bonus (₹)</Label>
                    <Input
                      type="number"
                      value={walletForm.referralBonus}
                      onChange={(e) => { setWalletForm({ ...walletForm, referralBonus: parseFloat(e.target.value) || 0 }); markDirty("wallet"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Reward Point Conversion Rate (Points = 1 ₹)</Label>
                    <Input
                      type="number"
                      value={walletForm.rewardPointRate}
                      onChange={(e) => { setWalletForm({ ...walletForm, rewardPointRate: parseFloat(e.target.value) || 0 }); markDirty("wallet"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Minimum Points Required For Redemption</Label>
                    <Input
                      type="number"
                      value={walletForm.minimumRedemption}
                      onChange={(e) => { setWalletForm({ ...walletForm, minimumRedemption: parseInt(e.target.value) || 0 }); markDirty("wallet"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Wallet Credit Balance Expiration Limit (Days)</Label>
                    <Input
                      type="number"
                      value={walletForm.walletExpiry}
                      onChange={(e) => { setWalletForm({ ...walletForm, walletExpiry: parseInt(e.target.value) || 0 }); markDirty("wallet"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("wallet", walletForm, "Wallet & Rewards Settings")}
                    disabled={!isDirty["wallet"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 7: Coupons */}
          {activeTab === "coupon" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-500" /> Coupons & Campaigns
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage coupon campaigns, system caps on coupons & automated first order/referral codes.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2"><Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label><Input value={businessForm.operationalHours || ""} onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" /></div><div className="grid gap-5 md:grid-cols-2">
                  
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60/80">
                    <div>
                      <Label className="text-white text-sm font-semibold">Enable Coupon Codes</Label>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Let users enter promotional coupon keys.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCouponForm({ ...couponForm, enableCoupons: !couponForm.enableCoupons }); markDirty("coupon"); }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        couponForm.enableCoupons ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        couponForm.enableCoupons ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60/80">
                    <div>
                      <Label className="text-white text-sm font-semibold">Auto Apply Qualified Coupons</Label>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Auto evaluate & credit best code at checkout.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCouponForm({ ...couponForm, autoApplyCoupons: !couponForm.autoApplyCoupons }); markDirty("coupon"); }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        couponForm.autoApplyCoupons ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        couponForm.autoApplyCoupons ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Maximum System-wide Coupons Limit</Label>
                    <Input
                      type="number"
                      value={couponForm.maxCoupons}
                      onChange={(e) => { setCouponForm({ ...couponForm, maxCoupons: parseInt(e.target.value) || 0 }); markDirty("coupon"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Default First Order Coupon Key</Label>
                    <Input
                      value={couponForm.firstOrderCoupon}
                      onChange={(e) => { setCouponForm({ ...couponForm, firstOrderCoupon: e.target.value }); markDirty("coupon"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Default Referral Welcome Coupon Key</Label>
                    <Input
                      value={couponForm.referralCoupon}
                      onChange={(e) => { setCouponForm({ ...couponForm, referralCoupon: e.target.value }); markDirty("coupon"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("coupon", couponForm, "Coupon Settings")}
                    disabled={!isDirty["coupon"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 8: Notifications */}
          {activeTab === "notification" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-emerald-500" /> Notifications & Dispatchers
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure push alerts, automated WhatsApp notifications, customer emails and SMS alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Enabled Gateway Channels</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">Firebase Push Notifications</Label>
                        <p className="text-zinc-500 text-[10px]">Send system browser alerts via FCM.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNotificationForm({ ...notificationForm, firebasePush: !notificationForm.firebasePush }); markDirty("notification"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationForm.firebasePush ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          notificationForm.firebasePush ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">WhatsApp Notifications</Label>
                        <p className="text-zinc-500 text-[10px]">Send templated WhatsApp updates.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNotificationForm({ ...notificationForm, whatsApp: !notificationForm.whatsApp }); markDirty("notification"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationForm.whatsApp ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          notificationForm.whatsApp ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">Email Notifications</Label>
                        <p className="text-zinc-500 text-[10px]">Send email templates via SMTP.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNotificationForm({ ...notificationForm, email: !notificationForm.email }); markDirty("notification"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationForm.email ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          notificationForm.email ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60">
                      <div>
                        <Label className="text-white text-sm font-semibold">SMS Notifications</Label>
                        <p className="text-zinc-500 text-[10px]">Send transactional messages via Twilio.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNotificationForm({ ...notificationForm, sms: !notificationForm.sms }); markDirty("notification"); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationForm.sms ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          notificationForm.sms ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Trigger Events</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    
                    <div className="p-3 rounded-xl bg-zinc-900/10 border border-zinc-800/60 flex items-center justify-between">
                      <div>
                        <Label className="text-zinc-200 text-xs font-semibold">Order Status Updates</Label>
                        <p className="text-[9px] text-zinc-500">Upon prep, transit, delivery</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNotificationForm({ ...notificationForm, orderUpdates: !notificationForm.orderUpdates }); markDirty("notification"); }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationForm.orderUpdates ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                          notificationForm.orderUpdates ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/10 border border-zinc-800/60 flex items-center justify-between">
                      <div>
                        <Label className="text-zinc-200 text-xs font-semibold">Subscription Reminders</Label>
                        <p className="text-[9px] text-zinc-500">Alerts for upcoming period renewals</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNotificationForm({ ...notificationForm, subscriptionReminders: !notificationForm.subscriptionReminders }); markDirty("notification"); }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationForm.subscriptionReminders ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                          notificationForm.subscriptionReminders ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/10 border border-zinc-800/60 flex items-center justify-between">
                      <div>
                        <Label className="text-zinc-200 text-xs font-semibold">Payment Alerts</Label>
                        <p className="text-[9px] text-zinc-500">Dispatched invoices or failed bills</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNotificationForm({ ...notificationForm, paymentAlerts: !notificationForm.paymentAlerts }); markDirty("notification"); }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationForm.paymentAlerts ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                          notificationForm.paymentAlerts ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("notification", notificationForm, "Notification Settings")}
                    disabled={!isDirty["notification"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 9: SEO Settings */}
          {activeTab === "seo" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-500" /> SEO Settings & Web Metrics
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage search engine meta headers, index key descriptors, open graph schemas & tag manager IDs.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2"><Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label><Input value={businessForm.operationalHours || ""} onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" /></div><div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Website Meta Title</Label>
                    <Input
                      value={seoForm.websiteTitle}
                      onChange={(e) => { setSeoForm({ ...seoForm, websiteTitle: e.target.value }); markDirty("seo"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Meta Description</Label>
                    <textarea
                      rows={2}
                      value={seoForm.metaDescription}
                      onChange={(e) => { setSeoForm({ ...seoForm, metaDescription: e.target.value }); markDirty("seo"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Search Engine Keywords (comma separated)</Label>
                    <textarea
                      rows={2}
                      value={seoForm.keywords}
                      onChange={(e) => { setSeoForm({ ...seoForm, keywords: e.target.value }); markDirty("seo"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Open Graph Banner Image URL</Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        value={seoForm.openGraphImage}
                        onChange={(e) => { setSeoForm({ ...seoForm, openGraphImage: e.target.value }); markDirty("seo"); }}
                        className="bg-zinc-900 border-zinc-800 text-white text-xs flex-1"
                      />
                      <img src={seoForm.openGraphImage} alt="OG" className="w-16 h-10 rounded-lg bg-zinc-900 border border-zinc-800 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Google Analytics ID (Measurement ID)</Label>
                    <Input
                      value={seoForm.googleAnalyticsId}
                      onChange={(e) => { setSeoForm({ ...seoForm, googleAnalyticsId: e.target.value }); markDirty("seo"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Meta Facebook Pixel ID</Label>
                    <Input
                      value={seoForm.metaPixelId}
                      onChange={(e) => { setSeoForm({ ...seoForm, metaPixelId: e.target.value }); markDirty("seo"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                      placeholder="ID-XXXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Google Tag Manager ID</Label>
                    <Input
                      value={seoForm.googleTagManagerId}
                      onChange={(e) => { setSeoForm({ ...seoForm, googleTagManagerId: e.target.value }); markDirty("seo"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                      placeholder="GTM-XXXXXXXX"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("seo", seoForm, "SEO Settings")}
                    disabled={!isDirty["seo"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 10: Social Media */}
          {activeTab === "social" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-emerald-500" /> Social Media Links
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure corporate social profile pages. These handle dynamically update web footers.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Instagram URL</Label>
                    <Input
                      value={socialForm.instagram}
                      onChange={(e) => { setSocialForm({ ...socialForm, instagram: e.target.value }); markDirty("social"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Facebook URL</Label>
                    <Input
                      value={socialForm.facebook}
                      onChange={(e) => { setSocialForm({ ...socialForm, facebook: e.target.value }); markDirty("social"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">YouTube Channel URL</Label>
                    <Input
                      value={socialForm.youtube}
                      onChange={(e) => { setSocialForm({ ...socialForm, youtube: e.target.value }); markDirty("social"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">LinkedIn Company URL</Label>
                    <Input
                      value={socialForm.linkedin}
                      onChange={(e) => { setSocialForm({ ...socialForm, linkedin: e.target.value }); markDirty("social"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">X (formerly Twitter) Profile URL</Label>
                    <Input
                      value={socialForm.twitter}
                      onChange={(e) => { setSocialForm({ ...socialForm, twitter: e.target.value }); markDirty("social"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("social", socialForm, "Social Media Handles")}
                    disabled={!isDirty["social"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 11: Legal Settings */}
          {activeTab === "legal" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-500" /> Legal & Terms
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Update customer contracts, shipping policy statements, privacy notes & cancellation agreements.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Privacy Policy Agreement</Label>
                    <textarea
                      rows={4}
                      value={legalForm.privacyPolicy}
                      onChange={(e) => { setLegalForm({ ...legalForm, privacyPolicy: e.target.value }); markDirty("legal"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Terms & Conditions Agreement</Label>
                    <textarea
                      rows={4}
                      value={legalForm.termsConditions}
                      onChange={(e) => { setLegalForm({ ...legalForm, termsConditions: e.target.value }); markDirty("legal"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Refund & Compensation Terms</Label>
                    <textarea
                      rows={3}
                      value={legalForm.refundPolicy}
                      onChange={(e) => { setLegalForm({ ...legalForm, refundPolicy: e.target.value }); markDirty("legal"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Shipping & Safe Handling Rules</Label>
                    <textarea
                      rows={3}
                      value={legalForm.shippingPolicy}
                      onChange={(e) => { setLegalForm({ ...legalForm, shippingPolicy: e.target.value }); markDirty("legal"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Subscription Pause & Cancellation Rules</Label>
                    <textarea
                      rows={3}
                      value={legalForm.cancellationPolicy}
                      onChange={(e) => { setLegalForm({ ...legalForm, cancellationPolicy: e.target.value }); markDirty("legal"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("legal", legalForm, "Legal Policy Statements")}
                    disabled={!isDirty["legal"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 2: Branch Settings */}
          {activeTab === "branches" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl animate-fade-in">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-500 animate-pulse" />
                    Branch Operations Summary
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none">
                    Realtime Active
                  </Badge>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Monitor registered operational branches and kitchen fulfillment centers. Real-time synced with system telemetry.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Branches</span>
                    <h4 className="text-2xl font-bold text-white mt-1">{branchesList.length}</h4>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Active Kitchens</span>
                    <h4 className="text-2xl font-bold text-emerald-400 mt-1">
                      {branchesList.filter(b => b.status === "active").length}
                    </h4>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Under Maintenance</span>
                    <h4 className="text-2xl font-bold text-amber-500 mt-1">
                      {branchesList.filter(b => b.status !== "active").length}
                    </h4>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Registered Branch Outlets</h3>
                    <Button 
                      onClick={() => navigate("/branches")}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs px-3 py-1.5 border border-emerald-500/20"
                    >
                      Open Branch Manager <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {branchesList.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {branchesList.map(branch => (
                        <div key={branch.id} className="p-4 rounded-xl bg-zinc-900/10 border border-zinc-800/60 flex flex-col justify-between gap-3 hover:border-zinc-800 transition-colors">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-white text-sm font-bold">{branch.name}</h4>
                              <Badge className={branch.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-none text-[10px]" : "bg-amber-500/10 text-amber-400 border-none text-[10px]"}>
                                {branch.status || "active"}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" /> {branch.address || "No address declared"}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-zinc-800/60/40 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                            <span>Manager: {branch.managerName || "Unassigned"}</span>
                            <span>Slots: {branch.deliverySlots?.length || 0} slots</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 rounded-xl bg-zinc-900/5 border border-zinc-800/60 border-dashed">
                      <p className="text-zinc-500 text-xs italic">No operational branches found in system. Register your first outlet in Branch Manager.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 5b: Tax & GST Settings */}
          {activeTab === "tax" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl animate-fade-in">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-500" /> Tax & GST Compliance Settings
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Define nationwide or regional tax compliance details, base HSN codes, prefix patterns, and auto-invoicing rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2"><Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label><Input value={businessForm.operationalHours || ""} onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" /></div><div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Total GST Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={taxForm.gstPercentage}
                      onChange={(e) => { 
                        const gst = parseFloat(e.target.value) || 0;
                        setTaxForm({ 
                          ...taxForm, 
                          gstPercentage: gst,
                          cgstPercentage: gst / 2,
                          sgstPercentage: gst / 2
                        }); 
                        markDirty("tax"); 
                      }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Food Service HSN/SAC Code</Label>
                    <Input
                      value={taxForm.hsnCode}
                      onChange={(e) => { setTaxForm({ ...taxForm, hsnCode: e.target.value }); markDirty("tax"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Central GST (CGST) share (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={taxForm.cgstPercentage}
                      onChange={(e) => { setTaxForm({ ...taxForm, cgstPercentage: parseFloat(e.target.value) || 0 }); markDirty("tax"); }}
                      className="bg-zinc-900 border-zinc-800 text-zinc-400 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">State GST (SGST) share (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={taxForm.sgstPercentage}
                      onChange={(e) => { setTaxForm({ ...taxForm, sgstPercentage: parseFloat(e.target.value) || 0 }); markDirty("tax"); }}
                      className="bg-zinc-900 border-zinc-800 text-zinc-400 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Tax Invoice Prefix Pattern</Label>
                    <Input
                      value={taxForm.invoicePrefix}
                      onChange={(e) => { setTaxForm({ ...taxForm, invoicePrefix: e.target.value }); markDirty("tax"); }}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono"
                      placeholder="TB-INV-"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Tax Pricing Model</Label>
                    <select
                      value={taxForm.taxInclusivity}
                      onChange={(e) => { setTaxForm({ ...taxForm, taxInclusivity: e.target.value }); markDirty("tax"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="exclusive">Exclusive (Tax added on checkout)</option>
                      <option value="inclusive">Inclusive (Tax included in menu prices)</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2 p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <Label className="text-white text-xs font-semibold">Auto-Generate Tax Invoices</Label>
                      <p className="text-[10px] text-zinc-500">Automatically generate PDF tax invoices in client profiles once subscription capture is complete.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setTaxForm({ ...taxForm, autoGenerateInvoice: !taxForm.autoGenerateInvoice }); markDirty("tax"); }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        taxForm.autoGenerateInvoice ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        taxForm.autoGenerateInvoice ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("tax", taxForm, "Tax & Compliance Settings")}
                    disabled={!isDirty["tax"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Compliance Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 8b: Branding Settings */}
          {activeTab === "branding" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl animate-fade-in">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-500 animate-pulse" /> Branding & Assets Identity
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure primary identity tokens, accent colors, corporate heading styles, header slogans, and customer application icons.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2"><Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label><Input value={businessForm.operationalHours || ""} onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" /></div><div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Primary Application Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={brandingForm.primaryColor}
                        onChange={(e) => { setBrandingForm({ ...brandingForm, primaryColor: e.target.value }); markDirty("branding"); }}
                        className="bg-zinc-900 border-zinc-800 text-white h-10 w-16 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandingForm.primaryColor}
                        onChange={(e) => { setBrandingForm({ ...brandingForm, primaryColor: e.target.value }); markDirty("branding"); }}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Secondary/Accent Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={brandingForm.secondaryColor}
                        onChange={(e) => { setBrandingForm({ ...brandingForm, secondaryColor: e.target.value }); markDirty("branding"); }}
                        className="bg-zinc-900 border-zinc-800 text-white h-10 w-16 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandingForm.secondaryColor}
                        onChange={(e) => { setBrandingForm({ ...brandingForm, secondaryColor: e.target.value }); markDirty("branding"); }}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Typography Font Family</Label>
                    <select
                      value={brandingForm.fontFamily}
                      onChange={(e) => { setBrandingForm({ ...brandingForm, fontFamily: e.target.value }); markDirty("branding"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Inter">Inter (Sans-serif, modern utility)</option>
                      <option value="Outfit">Outfit (Clean, tech-forward geometric)</option>
                      <option value="Space Grotesk">Space Grotesk (Display, futuristic)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Technical code vibe)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Default Brand Favicon</Label>
                    <div className="flex gap-3">
                      <Input
                        value={brandingForm.appFavicon}
                        onChange={(e) => { setBrandingForm({ ...brandingForm, appFavicon: e.target.value }); markDirty("branding"); }}
                        className="bg-zinc-900 border-zinc-800 text-white text-xs flex-1"
                      />
                      <img src={brandingForm.appFavicon} alt="Favicon" className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Customer Header Tagline</Label>
                    <Input
                      value={brandingForm.headerTagline}
                      onChange={(e) => { setBrandingForm({ ...brandingForm, headerTagline: e.target.value }); markDirty("branding"); }}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2 p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <Label className="text-white text-xs font-semibold">Enable Global Dark Mode Theme</Label>
                      <p className="text-[10px] text-zinc-500">Provide dark visual styling as standard for public-facing ordering system.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setBrandingForm({ ...brandingForm, darkModeEnabled: !brandingForm.darkModeEnabled }); markDirty("branding"); }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        brandingForm.darkModeEnabled ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        brandingForm.darkModeEnabled ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("branding", brandingForm, "Corporate Branding Settings")}
                    disabled={!isDirty["branding"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Brand Tokens
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 8c: Roles & Permissions Settings */}
          {activeTab === "roles" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl animate-fade-in">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" /> Administrative Roles & Permissions Matrix
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Audit defined administrative security clearances and structural scopes. Real-time active.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {rolesForm.roles.map((role: any) => (
                    <div key={role.name} className="p-4 rounded-xl bg-zinc-900/10 border border-zinc-800/60 flex flex-col justify-between gap-4 hover:border-zinc-800 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-white text-sm font-bold">{role.name}</h4>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-mono text-[9px]">
                            {role.count} Active Users
                          </Badge>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">{role.description}</p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-zinc-800/60/50">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Permitted Clearance Modules</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {role.permissions.map((perm: string) => (
                            <Badge key={perm} className="bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono text-[9px] px-2 py-0.5">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-zinc-400">
                    To register new administrative users or assign different permission scopes, please navigate to the main <span className="text-emerald-400 font-bold hover:underline cursor-pointer" onClick={() => navigate("/admin-management")}>Admin Management</span> console.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 8d: System Preferences Settings */}
          {activeTab === "system" && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl animate-fade-in">
              <CardHeader className="border-b border-zinc-800/60 pb-5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-500" /> Platform System Preferences
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Define currency tokens, regional timezone baselines, interface language priorities, backup scopes, and debugging metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2"><Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label><Input value={businessForm.operationalHours || ""} onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" /></div><div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Platform Default Currency</Label>
                    <select
                      value={systemForm.currency}
                      onChange={(e) => { setSystemForm({ ...systemForm, currency: e.target.value }); markDirty("system"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - United States Dollar</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="EUR">EUR (€) - Euro</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Timezone</Label>
                    <select
                      value={systemForm.timezone}
                      onChange={(e) => { setSystemForm({ ...systemForm, timezone: e.target.value }); markDirty("system"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">System Master Language</Label>
                    <select
                      value={systemForm.language}
                      onChange={(e) => { setSystemForm({ ...systemForm, language: e.target.value }); markDirty("system"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none"
                    >
                      <option value="en">English (US/UK)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="kn">Kannada (ಕನ್ನಡ)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase">Database Backup Frequency</Label>
                    <select
                      value={systemForm.backupFrequency}
                      onChange={(e) => { setSystemForm({ ...systemForm, backupFrequency: e.target.value }); markDirty("system"); }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none"
                    >
                      <option value="hourly">Hourly (Incremental)</option>
                      <option value="daily">Daily (Full Snapshot)</option>
                      <option value="weekly">Weekly (Archive)</option>
                    </select>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <Label className="text-white text-xs font-semibold">Automatic Firestore Backups</Label>
                      <p className="text-[10px] text-zinc-500">Auto backup complete collections to Google Cloud Storage bucket.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSystemForm({ ...systemForm, autoBackup: !systemForm.autoBackup }); markDirty("system"); }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        systemForm.autoBackup ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        systemForm.autoBackup ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <Label className="text-white text-xs font-semibold">Enable Debug Mode Logging</Label>
                      <p className="text-[10px] text-zinc-500">Log detailed execution metrics inside GCP Cloud Logging console.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSystemForm({ ...systemForm, debugLogs: !systemForm.debugLogs }); markDirty("system"); }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        systemForm.debugLogs ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        systemForm.debugLogs ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-2 md:col-span-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <Label className="text-amber-400 text-xs font-bold">System Maintenance Mode</Label>
                      <p className="text-[10px] text-amber-500/80">Forces public customer website to enter offline placeholder. Admins can still log in.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSystemForm({ ...systemForm, maintenanceMode: !systemForm.maintenanceMode }); markDirty("system"); }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        systemForm.maintenanceMode ? "bg-amber-500" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        systemForm.maintenanceMode ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <Button
                    onClick={() => triggerSaveConfirm("system", systemForm, "Platform System Preferences")}
                    disabled={!isDirty["system"] || saveStatus.loading}
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEC 12: Admin Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              
              {/* Profile sub-card */}
              <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
                <CardHeader className="border-b border-zinc-800/60 pb-5">
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-500" /> Admin Profile Details
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Modify active name credentials for your user account. Email is secured.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Administrator Name</Label>
                      <Input
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Designated Role Group</Label>
                      <Input
                        value={profileRole}
                        disabled
                        className="bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-zinc-400 text-xs font-semibold uppercase">Auth Login Email</Label>
                      <Input
                        value={profileEmail}
                        disabled
                        className="bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={saveAdminProfile}
                      disabled={profileName === user?.name || saveStatus.loading}
                      className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold text-xs"
                    >
                      Update Profile Name
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Password, timeout & 2FA controls card */}
              <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
                <CardHeader className="border-b border-zinc-800/60 pb-5">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="h-5 w-5 text-emerald-500" /> Change Credentials & Security
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Send password resets, toggle two-factor auth states, or define session limits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-2"><Label className="text-zinc-400 text-xs font-semibold uppercase">Operational Hours</Label><Input value={businessForm.operationalHours || ""} onChange={(e) => { setBusinessForm({ ...businessForm, operationalHours: e.target.value }); markDirty("business"); }} className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" placeholder="e.g. Mon-Sun, 9:00 AM - 10:00 PM" /></div><div className="grid gap-5 md:grid-cols-2">
                    
                    {/* Password reset trigger section */}
                    <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col justify-between gap-4">
                      <div>
                        <h4 className="text-white text-sm font-semibold">In-app Password Update</h4>
                        <p className="text-zinc-500 text-[11px] mt-0.5">
                          Clicking below generates a secure reset link to your administrator email to update keys safely.
                        </p>
                      </div>
                      <Button onClick={triggerPasswordResetEmail} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white w-full text-xs">
                        Dispatch Password Reset Email
                      </Button>
                    </div>

                    {/* 2FA Toggle switch */}
                    <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col justify-between gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-semibold">Two Factor Auth (2FA)</Label>
                          <p className="text-zinc-500 text-[11px] mt-0.5">Requires secure OTP check upon signin.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSecurityForm({ ...securityForm, twoFactorAuth: !securityForm.twoFactorAuth }); markDirty("security"); }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                            securityForm.twoFactorAuth ? "bg-emerald-500" : "bg-zinc-700"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                            securityForm.twoFactorAuth ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs font-semibold uppercase">Session Inactive Timeout (minutes)</Label>
                        <Input
                          type="number"
                          value={securityForm.sessionTimeout}
                          onChange={(e) => { setSecurityForm({ ...securityForm, sessionTimeout: parseInt(e.target.value) || 0 }); markDirty("security"); }}
                          className="bg-zinc-900 border-zinc-800 text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Session Expiration Warning System
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Automatically notifies admins 60 seconds prior to session expiry with an interactive modal.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => triggerSessionWarning?.()}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-semibold gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Test Warning Modal (60s)
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                    <Button
                      onClick={() => triggerSaveConfirm("security", securityForm, "Security Settings")}
                      disabled={!isDirty["security"] || saveStatus.loading}
                      className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                    >
                      <Save className="mr-2 h-4 w-4" /> Save Security Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Login session history table (real audit logs) */}
              <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
                <CardHeader className="border-b border-zinc-800/60 pb-5">
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="h-5 w-5 text-emerald-500" /> Active Profile Login History
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Lists recent administrative session logins from your user account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {loginHistory && loginHistory.length > 0 ? (
                    <div className="relative overflow-x-auto rounded-xl border border-zinc-800/60">
                      <table className="data-table">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50">
                          <tr>
                            <th scope="col" className="px-4 py-3">Event Action</th>
                            <th scope="col" className="px-4 py-3">Audit Details</th>
                            <th scope="col" className="px-4 py-3">Timestamp</th>
                            <th scope="col" className="px-4 py-3">Channel IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginHistory.map((log: any) => {
                            const formattedDate = log.timestamp?.seconds
                              ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                              : log.timestamp
                                ? new Date(log.timestamp).toLocaleString()
                                : "N/A"

                            return (
                              <tr key={log.id} className="border-b border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl/40 hover:bg-zinc-900/20">
                                <td className="px-4 py-3 font-semibold text-white text-xs">
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-semibold text-[10px]">
                                    {log.action || "LOGIN"}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs">{log.details || `Logged in successfully`}</td>
                                <td className="px-4 py-3 text-xs font-mono text-zinc-500">{formattedDate}</td>
                                <td className="px-4 py-3 text-xs font-mono text-zinc-500">{log.ipAddress || "client-side"}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-xs text-center py-6 italic">No login records found for this account.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>

      {/* REUSABLE PREMIUM SAVE CONFIRMATION DIALOG MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-emerald-500">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
                <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-900/50 border-t border-zinc-800/60">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold transition-all"
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
