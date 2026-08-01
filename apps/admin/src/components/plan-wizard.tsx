import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  X, Check, ChevronRight, ChevronLeft, Sparkles, Calculator, 
  Plus, Trash2, Globe, Shield, RefreshCw, Eye, Tag, Heart, 
  MapPin, Gift, Clock, Truck, PlusCircle, AlertCircle, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { serviceAreasService } from "../services/serviceAreas"
import { ServiceArea } from "../types"

// Custom inline Switch component replacing the missing shadcn Switch
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

function Switch({ checked, onCheckedChange, className = "" }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-emerald-500" : "bg-zinc-850"
      } ${className}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// Beautiful premium Unsplash food imagery presets
const PRESET_IMAGES = [
  { name: "Salad Detox", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80" },
  { name: "Keto Steak", url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80" },
  { name: "High-Protein Salmon", url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=500&q=80" },
  { name: "Vegan Fruit Bowl", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80" },
  { name: "Protein Pancake", url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80" },
  { name: "Green Smoothie Juice", url: "https://images.unsplash.com/photo-1610970881699-44a55b4cfd87?auto=format&fit=crop&w=500&q=80" }
]

const DEFAULT_ADDONS = [
  { name: "Cold Pressed Juice", image: "https://images.unsplash.com/photo-1610970881699-44a55b4cfd87?auto=format&fit=crop&w=300&q=80", price: 120, calories: 95, protein: 1, status: "Active" },
  { name: "Whey Protein Shake", image: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=300&q=80", price: 160, calories: 240, protein: 25, status: "Active" },
  { name: "Healthy Avocado Toast", image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=300&q=80", price: 180, calories: 310, protein: 8, status: "Active" },
  { name: "Fresh Fruit Salad Bowl", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80", price: 140, calories: 120, protein: 2, status: "Active" },
  { name: "Zero-Sugar Dessert Cup", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80", price: 150, calories: 150, protein: 4, status: "Active" },
  { name: "Almond Cranberry Salad", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80", price: 140, calories: 190, protein: 6, status: "Active" },
  { name: "Organic Greek Yogurt", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80", price: 90, calories: 110, protein: 10, status: "Active" },
  { name: "Active Peanut Energy Bites", image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=300&q=80", price: 100, calories: 220, protein: 8, status: "Active" },
  { name: "Premium Extra Grilled Chicken", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80", price: 190, calories: 210, protein: 32, status: "Active" },
  { name: "Extra Herb Sauteed Paneer", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80", price: 160, calories: 190, protein: 18, status: "Active" },
  { name: "Omega Extra Boiled Eggs", image: "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7b?auto=format&fit=crop&w=300&q=80", price: 80, calories: 140, protein: 12, status: "Active" },
  { name: "Pan-Seared Extra Tofu", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80", price: 140, calories: 130, protein: 14, status: "Active" }
]

const DEFAULT_FEATURES = [
  { id: "pause", name: "Pause Subscription Anytime", desc: "Allows customer to hold deliveries", checked: true },
  { id: "resume", name: "Instant Delivery Resume", desc: "Resume deliveries via client application", checked: true },
  { id: "freeze", name: "Custom Holiday Freeze", desc: "Freeze billing cycles during travel", checked: true },
  { id: "weekend_skip", name: "Weekend Auto Skip", desc: "Skip Saturday/Sunday optionally", checked: false },
  { id: "meal_swap", name: "Realtime Meal Swapping", desc: "Swap tomorrow's recipes anytime", checked: true },
  { id: "extra_meals", name: "Extra Top-Up Additions", desc: "Add guest meals into calendar", checked: false },
  { id: "referral", name: "Referral Discount Eligible", desc: "Can purchase using referral codes", checked: true },
  { id: "cashback", name: "Wallet Cashback Perks", desc: "Earn direct money on subscription renewals", checked: true },
  { id: "rewards", name: "Reward Points Accelerator", desc: "Accrue loyalty points upon booking", checked: true },
  { id: "free_delivery", name: "Complimentary Free Delivery", desc: "Zero shipping surcharge across active zones", checked: true },
  { id: "priority_kitchen", name: "Priority Kitchen Queue", desc: "Fast-track chef preppings during peak times", checked: false },
  { id: "priority_support", name: "24/7 Dedicated Concierge Support", desc: "Route complaints directly to core admins", checked: false }
]

interface PlanWizardProps {
  isOpen: boolean
  onClose: () => void
  onSave: (planData: any) => Promise<void>
  editingPlan?: any
}

export function PlanWizard({ isOpen, onClose, onSave, editingPlan }: PlanWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([])

  // Initialize unified wizard state
  const [formData, setFormData] = useState<any>({
    planName: "",
    planCode: "",
    slug: "",
    description: "",
    shortDescription: "",
    category: "Gourmet Fit",
    badge: "Bestseller",
    displayOrder: 1,
    thumbnail: PRESET_IMAGES[0].url,
    banner: PRESET_IMAGES[1].url,
    gallery: [PRESET_IMAGES[2].url, PRESET_IMAGES[3].url],
    
    // Step 2
    duration: 30,
    customDurationEnabled: false,
    customDuration: "",

    // Step 3
    breakfast: true,
    lunch: true,
    dinner: true,
    snacks: false,
    mealsPerDay: 2,

    // Step 4
    dietType: "Pure Veg",

    // Step 5
    goal: "Weight Loss",

    // Step 6
    calories: 1200,
    protein: 60,
    carbs: 120,
    fat: 40,
    fiber: 25,
    sugar: 10,
    sodium: 400,

    // Step 7
    price: 4999,
    offerPrice: 4299,
    gst: 5, // 5% standard food tax in India
    packagingCharges: 150,
    deliveryCharges: 0,
    platformCharges: 49,
    walletCashback: 100,
    rewardPoints: 250,
    referralBonus: 150,

    // Step 8
    deliverySlots: ["Morning", "Lunch"],
    serviceAreas: [],

    // Step 9
    addons: DEFAULT_ADDONS,

    // Step 10
    features: DEFAULT_FEATURES,

    // Step 11
    status: "Active"
  })

  // Load service areas dynamically
  useEffect(() => {
    const unsubscribe = serviceAreasService.subscribeToAreas((areas) => {
      setServiceAreas(areas)
      if (areas.length > 0 && formData.serviceAreas.length === 0) {
        // Default select active ones
        setFormData(prev => ({
          ...prev,
          serviceAreas: areas.filter(a => a.status === "Active").map(a => a.id)
        }))
      }
    })
    return () => unsubscribe()
  }, [])

  // Sync editing plan if provided
  useEffect(() => {
    if (editingPlan) {
      setFormData({
        ...formData,
        ...editingPlan,
        planName: editingPlan.planName || editingPlan.name || "",
        duration: editingPlan.duration || 30,
        mealsPerDay: editingPlan.mealsPerDay || 2,
        status: editingPlan.status || "Active",
        addons: editingPlan.addons?.length > 0 ? editingPlan.addons : DEFAULT_ADDONS,
        features: editingPlan.features?.length > 0 
          ? DEFAULT_FEATURES.map(f => ({ ...f, checked: editingPlan.features.includes(f.name) }))
          : DEFAULT_FEATURES
      })
      setCurrentStep(1)
    } else {
      // Clear forms
      setFormData({
        planName: "",
        planCode: "",
        slug: "",
        description: "",
        shortDescription: "",
        category: "Gourmet Fit",
        badge: "Bestseller",
        displayOrder: 1,
        thumbnail: PRESET_IMAGES[0].url,
        banner: PRESET_IMAGES[1].url,
        gallery: [PRESET_IMAGES[2].url, PRESET_IMAGES[3].url],
        duration: 30,
        customDurationEnabled: false,
        customDuration: "",
        breakfast: true,
        lunch: true,
        dinner: true,
        snacks: false,
        mealsPerDay: 2,
        dietType: "Pure Veg",
        goal: "Weight Loss",
        calories: 1200,
        protein: 60,
        carbs: 120,
        fat: 40,
        fiber: 25,
        sugar: 10,
        sodium: 400,
        price: 4999,
        offerPrice: 4299,
        gst: 5,
        packagingCharges: 150,
        deliveryCharges: 0,
        platformCharges: 49,
        walletCashback: 100,
        rewardPoints: 250,
        referralBonus: 150,
        deliverySlots: ["Morning", "Lunch"],
        serviceAreas: serviceAreas.filter(a => a.status === "Active").map(a => a.id),
        addons: DEFAULT_ADDONS,
        features: DEFAULT_FEATURES,
        status: "Active"
      })
      setCurrentStep(1)
    }
  }, [editingPlan, isOpen])

  // Real-time generator for slug and Code
  const generateSlugAndCode = () => {
    if (!formData.planName) return
    const computedSlug = formData.planName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    const initials = formData.planName
      .split(/\s+/)
      .map(w => w[0])
      .join("")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
    const computedCode = `TB-${initials}-${Math.floor(100 + Math.random() * 900)}`

    setFormData(prev => ({
      ...prev,
      slug: computedSlug,
      planCode: computedCode
    }))
  }

  // Auto Calculations
  const basePrice = formData.offerPrice || formData.price || 0
  const gstAmount = (basePrice * formData.gst) / 100
  const finalPrice = Math.round(basePrice + gstAmount + formData.packagingCharges + formData.deliveryCharges + formData.platformCharges)
  const savings = Math.max(0, formData.price - formData.offerPrice)
  const totalMealsCount = (formData.customDurationEnabled ? Number(formData.customDuration || 30) : formData.duration) * formData.mealsPerDay
  const pricePerMeal = totalMealsCount > 0 ? Math.round(finalPrice / totalMealsCount) : 0

  // Update specific values in form
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleSlot = (slot: string) => {
    const slots = [...formData.deliverySlots]
    if (slots.includes(slot)) {
      updateField("deliverySlots", slots.filter(s => s !== slot))
    } else {
      updateField("deliverySlots", [...slots, slot])
    }
  }

  const toggleArea = (areaId: string) => {
    const areas = [...formData.serviceAreas]
    if (areas.includes(areaId)) {
      updateField("serviceAreas", areas.filter(a => a !== areaId))
    } else {
      updateField("serviceAreas", [...areas, areaId])
    }
  }

  const toggleAddon = (index: number) => {
    const updatedAddons = [...formData.addons]
    updatedAddons[index].status = updatedAddons[index].status === "Active" ? "Inactive" : "Active"
    updateField("addons", updatedAddons)
  }

  const updateAddonPrice = (index: number, price: number) => {
    const updatedAddons = [...formData.addons]
    updatedAddons[index].price = price
    updateField("addons", updatedAddons)
  }

  const toggleFeature = (index: number) => {
    const updatedFeatures = [...formData.features]
    updatedFeatures[index].checked = !updatedFeatures[index].checked
    updateField("features", updatedFeatures)
  }

  // Handle Save
  const handleSavePlan = async () => {
    if (!formData.planName || !formData.planCode) {
      setCurrentStep(1)
      alert("Plan Name and Code are mandatory!")
      return
    }

    setIsSubmitting(true)
    try {
      // Compile final clean payload
      const durationVal = formData.customDurationEnabled ? Number(formData.customDuration) : formData.duration
      const activeFeatures = formData.features.filter((f: any) => f.checked).map((f: any) => f.name)
      const selectedAddons = formData.addons.filter((a: any) => a.status === "Active")

      const payload = {
        ...formData,
        name: formData.planName, // Ensure compatibility
        duration: durationVal,
        totalMeals: durationVal * formData.mealsPerDay,
        features: activeFeatures,
        addons: selectedAddons,
        finalPrice,
        pricePerMeal,
        savings,
        subscriberCount: editingPlan?.subscriberCount || 0,
        monthlyRevenue: editingPlan?.monthlyRevenue || 0,
      }

      await onSave(payload)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Error saving plan. Please verify connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step names
  const stepsList = [
    "General Info",
    "Days",
    "Meals",
    "Diet",
    "Goals",
    "Nutrition",
    "Pricing",
    "Delivery",
    "Add-ons",
    "Features",
    "Availability"
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingPlan ? `Upgrade Core Protocol: ${editingPlan.planName || editingPlan.name}` : "Architect New Subscription Plan"}
              </h2>
              <p className="text-xs text-zinc-500">Formulating a compliant health-tier subscription for Mumbai kitchens</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-zinc-200 rounded-full h-8 w-8">
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Progress Tracker Stepper */}
        <div className="px-6 py-4 bg-zinc-900/30 border-b border-zinc-900/50 overflow-x-auto flex items-center gap-2 ">
          {stepsList.map((stepName, idx) => {
            const stepNum = idx + 1
            const isCompleted = currentStep > stepNum
            const isActive = currentStep === stepNum
            return (
              <React.Fragment key={idx}>
                <button
                  type="button"
                  onClick={() => {
                    // Prevent skipping forward past current limits
                    if (stepNum < currentStep || formData.planName) {
                      setCurrentStep(stepNum)
                    }
                  }}
                  className={`flex items-center gap-1.5 shrink-0 focus:outline-none transition-colors duration-200`}
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    isCompleted ? "bg-emerald-500 text-black" : 
                    isActive ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500" : 
                    "bg-zinc-850 text-zinc-500"
                  }`}>
                    {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3px]" /> : stepNum}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? "text-white" : "text-zinc-500"}`}>
                    {stepName}
                  </span>
                </button>
                {stepNum < stepsList.length && (
                  <div className={`h-[1px] w-4 shrink-0 ${isCompleted ? "bg-emerald-500" : "bg-zinc-800"}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Dynamic Step Content Workspace */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Plan Name *</Label>
                      <Input 
                        placeholder="e.g., Lean Muscle Pro Cycle" 
                        value={formData.planName}
                        onChange={(e) => updateField("planName", e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Category</Label>
                      <Select value={formData.category} onValueChange={(val) => updateField("category", val)}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300">
                          <SelectItem value="Gourmet Fit">Gourmet Fit</SelectItem>
                          <SelectItem value="Health Clinical">Health Clinical</SelectItem>
                          <SelectItem value="Keto Shred">Keto Shred</SelectItem>
                          <SelectItem value="Athletic Peak">Athletic Peak</SelectItem>
                          <SelectItem value="Daily Simple">Daily Simple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Plan Code *</Label>
                      <div className="relative">
                        <Input 
                          placeholder="e.g., TB-LMC-120" 
                          value={formData.planCode}
                          onChange={(e) => updateField("planCode", e.target.value)}
                          className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 rounded-xl pr-16"
                        />
                        <button 
                          type="button" 
                          onClick={generateSlugAndCode}
                          className="absolute right-2.5 top-2.5 text-[10px] uppercase font-mono font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded hover:bg-emerald-500/25"
                        >
                          Gen
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Slug URL</Label>
                      <Input 
                        placeholder="lean-muscle-pro-cycle" 
                        value={formData.slug}
                        onChange={(e) => updateField("slug", e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Display Order</Label>
                      <Input 
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => updateField("displayOrder", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Short Description</Label>
                      <Input 
                        placeholder="Summary shown on catalog cards (max 120 chars)" 
                        value={formData.shortDescription}
                        onChange={(e) => updateField("shortDescription", e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Visual Badge</Label>
                      <Input 
                        placeholder="e.g., Slimming Special" 
                        value={formData.badge}
                        onChange={(e) => updateField("badge", e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300 font-bold">Full Plan Description</Label>
                    <Textarea 
                      placeholder="Detailed explanation of the diet protocol, health target, ingredients, and guidelines." 
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 rounded-2xl min-h-[100px]"
                    />
                  </div>

                  {/* Thumbnail / Banner Picker presets */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-bold block">Instant Premium Preset Food Thumbnail</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            updateField("thumbnail", img.url)
                            updateField("banner", img.url)
                          }}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            formData.thumbnail === img.url ? "border-emerald-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-500">Or enter custom Thumbnail URL</Label>
                      <Input 
                        value={formData.thumbnail}
                        onChange={(e) => updateField("thumbnail", e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Duration Configuration */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Select Active Duration Cycle</h3>
                    <p className="text-xs text-zinc-500">The total continuous days for this specific subscription contract</p>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {[3, 5, 7, 10, 15, 20, 30, 45, 60, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          updateField("duration", days)
                          updateField("customDurationEnabled", false)
                        }}
                        className={`p-4 rounded-2xl border text-center transition-all flex flex-col justify-between items-center h-24 ${
                          !formData.customDurationEnabled && formData.duration === days
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        <span className="text-2xl font-black">{days}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Days Cycle</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-zinc-300 font-bold block">Need Custom Days Cycle?</Label>
                      <span className="text-[11px] text-zinc-500">Define precise duration not listed in presets</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formData.customDurationEnabled} 
                        onCheckedChange={(val) => updateField("customDurationEnabled", val)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      {formData.customDurationEnabled && (
                        <Input 
                          type="number" 
                          placeholder="e.g. 120"
                          value={formData.customDuration}
                          onChange={(e) => updateField("customDuration", e.target.value)}
                          className="bg-zinc-900 border-zinc-800 text-white rounded-xl w-24 text-center font-bold"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Meals Configuration */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Meal Slots Selection</h3>
                    <p className="text-xs text-zinc-500">Choose meal slots included in this plan package automatically</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { key: "breakfast", label: "Morning Breakfast", desc: "Sourdoughs, high fiber oatmeal, parathas" },
                      { key: "lunch", label: "Afternoon Lunch", desc: "Healthy brown rices, high lean meat grills" },
                      { key: "dinner", label: "Twilight Dinner", desc: "Low calorie light soups, custom paneer salads" },
                      { key: "snacks", label: "Energy Snacks", desc: "Seed packs, organic cookies, detox juices" }
                    ].map((mSlot) => (
                      <button
                        key={mSlot.key}
                        type="button"
                        onClick={() => updateField(mSlot.key, !formData[mSlot.key])}
                        className={`p-5 rounded-2xl border text-left transition-all h-36 flex flex-col justify-between ${
                          formData[mSlot.key]
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-zinc-900/40 border-zinc-900 text-zinc-500 hover:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Category</span>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            formData[mSlot.key] ? "bg-emerald-500 border-emerald-400" : "border-zinc-700"
                          }`}>
                            {formData[mSlot.key] && <Check className="h-3 w-3 text-black stroke-[3px]" />}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-black text-white block">{mSlot.label}</span>
                          <p className="text-[10px] text-zinc-400 mt-1">{mSlot.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300 font-bold">Total Meals Per Day *</Label>
                    <Select 
                      value={formData.mealsPerDay.toString()} 
                      onValueChange={(val) => updateField("mealsPerDay", Number(val))}
                    >
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl w-full">
                        <SelectValue placeholder="Meals count" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300">
                        <SelectItem value="1">1 Meal / Day (Single Delivery)</SelectItem>
                        <SelectItem value="2">2 Meals / Day (Dual Delivery)</SelectItem>
                        <SelectItem value="3">3 Meals / Day (Full day nutrition)</SelectItem>
                        <SelectItem value="4">4 Meals / Day (Comprehensive program)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* STEP 4: Diet Type */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Target Diet Preference</h3>
                    <p className="text-xs text-zinc-500">Categorize dietary restrictions to direct the cooking kitchen</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: "Pure Veg", desc: "100% plant-based organic and milk derivatives" },
                      { name: "Vegan", desc: "Dairy-free, cruelty-free, strict pure organic vegan" },
                      { name: "Eggitarian", desc: "Plant foods with premium omega egg proteins included" },
                      { name: "Non Veg", desc: "Lean chicken, fish, organic egg combinations included" }
                    ].map((dType) => (
                      <button
                        key={dType.name}
                        type="button"
                        onClick={() => updateField("dietType", dType.name)}
                        className={`p-5 rounded-2xl border text-left transition-all h-36 flex flex-col justify-between ${
                          formData.dietType === dType.name
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-zinc-900/40 border-zinc-900 text-zinc-500 hover:border-zinc-800"
                        }`}
                      >
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dType.name === "Pure Veg" ? "#10b981" : dType.name === "Vegan" ? "#14b8a6" : dType.name === "Eggitarian" ? "#f59e0b" : "#ef4444" }} />
                        <div>
                          <span className="text-sm font-black text-white block">{dType.name}</span>
                          <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{dType.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Health Goal */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Primary Medical or Health Goal</h3>
                    <p className="text-xs text-zinc-500">Maps custom ingredients and calorie caps dynamically</p>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      "Weight Loss", "Fat Loss", "Muscle Gain", "Balanced Diet", 
                      "Strict Keto", "High Protein", "Diabetic Safe", "PCOS Friendly", 
                      "Senior Citizen", "Kids Nutrition Plan"
                    ].map((hlGoal) => (
                      <button
                        key={hlGoal}
                        type="button"
                        onClick={() => updateField("goal", hlGoal)}
                        className={`p-4 rounded-xl border text-center text-xs font-bold transition-all ${
                          formData.goal === hlGoal
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        {hlGoal}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: Nutrition Config */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Daily Target Nutritional Formulation</h3>
                    <p className="text-xs text-zinc-500">Provide precise mean values representing daily macros</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Calories (kcal)</Label>
                      <Input 
                        type="number" 
                        value={formData.calories}
                        onChange={(e) => updateField("calories", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Protein (g)</Label>
                      <Input 
                        type="number" 
                        value={formData.protein}
                        onChange={(e) => updateField("protein", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Carbs (g)</Label>
                      <Input 
                        type="number" 
                        value={formData.carbs}
                        onChange={(e) => updateField("carbs", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Fats (g)</Label>
                      <Input 
                        type="number" 
                        value={formData.fat}
                        onChange={(e) => updateField("fat", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Dietary Fiber (g)</Label>
                      <Input 
                        type="number" 
                        value={formData.fiber}
                        onChange={(e) => updateField("fiber", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Organic Sugar Max (g)</Label>
                      <Input 
                        type="number" 
                        value={formData.sugar}
                        onChange={(e) => updateField("sugar", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Sodium Max (mg)</Label>
                      <Input 
                        type="number" 
                        value={formData.sodium}
                        onChange={(e) => updateField("sodium", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Enterprise Pricing Formula Engine */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Dynamic Plan Billing Formula</h3>
                    <p className="text-xs text-zinc-500">Input base, promotional margins, and automatic client cashback rewards</p>
                  </div>

                  {/* Calculator Summary */}
                  <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl grid grid-cols-4 gap-4 items-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Final Price</span>
                      <span className="text-3xl font-black text-white block">₹{finalPrice.toLocaleString()}</span>
                      <p className="text-[9px] text-emerald-400 font-mono">Incl. GST & surcharges</p>
                    </div>
                    <div className="space-y-0.5 border-l border-zinc-850 pl-4">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Base Savings</span>
                      <span className="text-xl font-black text-emerald-400 block">₹{savings.toLocaleString()}</span>
                      <p className="text-[9px] text-zinc-400">Promotional cut margin</p>
                    </div>
                    <div className="space-y-0.5 border-l border-zinc-850 pl-4">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Total Deliveries</span>
                      <span className="text-xl font-black text-indigo-400 block">{totalMealsCount} meals</span>
                      <p className="text-[9px] text-zinc-400">{formData.mealsPerDay} meals per day</p>
                    </div>
                    <div className="space-y-0.5 border-l border-zinc-850 pl-4">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Cost Per Meal</span>
                      <span className="text-xl font-black text-amber-400 block">₹{pricePerMeal}/meal</span>
                      <p className="text-[9px] text-zinc-400">Average recipe budget</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Catalog Original Price (₹) *</Label>
                      <Input 
                        type="number" 
                        value={formData.price}
                        onChange={(e) => updateField("price", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl font-bold text-amber-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Offer Discount Price (₹) *</Label>
                      <Input 
                        type="number" 
                        value={formData.offerPrice}
                        onChange={(e) => updateField("offerPrice", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl font-bold text-emerald-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">GST Surcharge (%)</Label>
                      <Select 
                        value={formData.gst.toString()} 
                        onValueChange={(val) => updateField("gst", Number(val))}
                      >
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                          <SelectValue placeholder="GST Percent" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300">
                          <SelectItem value="0">0% Exempt</SelectItem>
                          <SelectItem value="5">5% Food Standard (Recommended)</SelectItem>
                          <SelectItem value="12">12% Luxury Goods</SelectItem>
                          <SelectItem value="18">18% Standard Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Packaging / Box Fees (₹)</Label>
                      <Input 
                        type="number" 
                        value={formData.packagingCharges}
                        onChange={(e) => updateField("packagingCharges", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Zone Delivery Surcharge (₹)</Label>
                      <Input 
                        type="number" 
                        value={formData.deliveryCharges}
                        onChange={(e) => updateField("deliveryCharges", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold">Platform Tech Fee (₹)</Label>
                      <Input 
                        type="number" 
                        value={formData.platformCharges}
                        onChange={(e) => updateField("platformCharges", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold flex items-center gap-1"><Gift className="h-3.5 w-3.5 text-zinc-500" /> Wallet Cashback (₹)</Label>
                      <Input 
                        type="number" 
                        value={formData.walletCashback}
                        onChange={(e) => updateField("walletCashback", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-zinc-500" /> Reward Loyalty Points</Label>
                      <Input 
                        type="number" 
                        value={formData.rewardPoints}
                        onChange={(e) => updateField("rewardPoints", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-bold flex items-center gap-1"><Users className="h-3.5 w-3.5 text-zinc-500" /> Referral Bonus (₹)</Label>
                      <Input 
                        type="number" 
                        value={formData.referralBonus}
                        onChange={(e) => updateField("referralBonus", Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: Delivery Slots & Service Areas */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Fulfillment Schedules & Geo-Zones</h3>
                      <p className="text-xs text-zinc-500">Pick acceptable delivery slot hours and active regions in Mumbai</p>
                    </div>
                    <Badge className="bg-zinc-900 border-zinc-800 text-zinc-400 font-mono">
                      {serviceAreas.length} Areas Configured
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-bold">Acceptable Delivery Slots</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: "Morning", time: "6:00 AM - 8:30 AM" },
                        { name: "Lunch", time: "11:30 AM - 1:30 PM" },
                        { name: "Evening", time: "4:00 PM - 6:00 PM" },
                        { name: "Night", time: "8:00 PM - 10:00 PM" }
                      ].map((slot) => {
                        const isSelected = formData.deliverySlots.includes(slot.name)
                        return (
                          <button
                            key={slot.name}
                            type="button"
                            onClick={() => toggleSlot(slot.name)}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                            }`}
                          >
                            <span className="text-xs font-black block">{slot.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-1">{slot.time}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-zinc-900 pt-4">
                    <Label className="text-zinc-300 font-bold block">Authorized Regional Service Areas</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {serviceAreas.map((area) => {
                        const isSelected = formData.serviceAreas.includes(area.id)
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => toggleArea(area.id)}
                            className={`p-3 rounded-xl border text-left transition-all text-xs flex justify-between items-center ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-850"
                            }`}
                          >
                            <div className="truncate">
                              <span className="font-bold block truncate">{area.areaName}</span>
                              <span className="text-[10px] text-zinc-500 block">{area.city}</span>
                            </div>
                            <div className={`h-4 w-4 rounded border shrink-0 ml-2 flex items-center justify-center ${
                              isSelected ? "bg-emerald-500 border-emerald-400" : "border-zinc-800"
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-black stroke-[3px]" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: Add-ons Select List */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Up-sell Menu Add-on Inclusions</h3>
                    <p className="text-xs text-zinc-500">Configure catalog options customers can add during checkout booking</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {formData.addons.map((addon: any, idx: number) => {
                      const isActive = addon.status === "Active"
                      return (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                            isActive ? "bg-zinc-900 border-zinc-800" : "bg-zinc-950/40 border-zinc-900 opacity-60"
                          }`}
                        >
                          <img 
                            src={addon.image} 
                            alt={addon.name} 
                            className="h-12 w-12 rounded-xl object-cover shrink-0 bg-zinc-800" 
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-black text-white block truncate">{addon.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-emerald-400 font-bold">₹{addon.price}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{addon.calories} kcal / {addon.protein}g protein</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              value={addon.price}
                              onChange={(e) => updateAddonPrice(idx, Number(e.target.value))}
                              className="bg-zinc-950 border-zinc-800 text-white rounded w-14 text-center h-7 text-xs font-bold"
                            />
                            <Switch 
                              checked={isActive} 
                              onCheckedChange={() => toggleAddon(idx)}
                              className="data-[state=checked]:bg-emerald-500 scale-75"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STEP 10: Features Multi-Select List */}
              {currentStep === 10 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Policy & Premium Program Features</h3>
                    <p className="text-xs text-zinc-500">Define operational policies and high-tier perks associated with this package</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                    {formData.features.map((feat: any, idx: number) => (
                      <div 
                        key={feat.id}
                        onClick={() => toggleFeature(idx)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          feat.checked 
                            ? "bg-emerald-500/5 border-emerald-500/40 text-white" 
                            : "bg-zinc-950/20 border-zinc-900 text-zinc-500"
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          feat.checked ? "bg-emerald-500 border-emerald-400" : "border-zinc-800"
                        }`}>
                          {feat.checked && <Check className="h-3 w-3 text-black stroke-[3px]" />}
                        </div>
                        <div>
                          <span className="text-xs font-black text-zinc-200 block">{feat.name}</span>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 11: Availability Lifecycle Selection */}
              {currentStep === 11 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Authorize Subscription Catalog Status</h3>
                    <p className="text-xs text-zinc-500">Determine visibility on customer mobile apps and client web store</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { status: "Active", desc: "Instantly viewable and bookable by all customers", color: "border-emerald-500 text-emerald-400", bg: "bg-emerald-500/10" },
                      { status: "Inactive", desc: "Fully disabled, hidden, and rejects renewals", color: "border-zinc-700 text-zinc-400", bg: "bg-zinc-900/30" },
                      { status: "Hidden", desc: "Available for booking only via admin back-channel links", color: "border-purple-500 text-purple-400", bg: "bg-purple-500/10" },
                      { status: "Draft", desc: "Saved as template, invisible on production app", color: "border-amber-500 text-amber-400", bg: "bg-amber-500/10" },
                      { status: "Upcoming", desc: "Teased on catalog with booking deactivated", color: "border-indigo-500 text-indigo-400", bg: "bg-indigo-500/10" },
                      { status: "Archived", desc: "Legacy plan retained strictly for audit tracking", color: "border-rose-500 text-rose-400", bg: "bg-rose-500/10" }
                    ].map((st) => (
                      <button
                        key={st.status}
                        type="button"
                        onClick={() => updateField("status", st.status)}
                        className={`p-5 rounded-2xl border text-left transition-all h-40 flex flex-col justify-between ${
                          formData.status === st.status
                            ? `border-emerald-500 bg-emerald-500/5`
                            : "bg-zinc-900/40 border-zinc-900 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-black text-white">{st.status}</span>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            formData.status === st.status ? "bg-emerald-500 border-emerald-400" : "border-zinc-850"
                          }`}>
                            {formData.status === st.status && <Check className="h-3 w-3 text-black stroke-[3px]" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">{st.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Operational safety declaration warning */}
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-400">Enterprise Database Safety Check</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Transitioning a plan to <strong className="text-white">Inactive</strong> or <strong className="text-white">Archived</strong> will prevent current users from selecting it upon billing cycle renewals, but will NOT interrupt their existing ongoing delivery orders.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation bar */}
        <div className="p-6 border-t border-zinc-900 flex justify-between items-center bg-zinc-950 rounded-b-3xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isSubmitting}
            className="border-zinc-900 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900"
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-bold">Step {currentStep} of {stepsList.length}</span>
          </div>

          {currentStep < stepsList.length ? (
            <Button
              type="button"
              onClick={() => {
                // validation checks before forwarding
                if (currentStep === 1 && (!formData.planName || !formData.planCode)) {
                  alert("Plan Name and Plan Code are mandatory properties!")
                  return
                }
                setCurrentStep(prev => prev + 1)
              }}
              className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold rounded-xl"
            >
              Next Step <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSavePlan}
              disabled={isSubmitting}
              className="bg-emerald-500 text-black hover:bg-emerald-400 font-black rounded-xl px-6"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4 stroke-[3.5px]" /> Authorize & Deploy
                </>
              )}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}
