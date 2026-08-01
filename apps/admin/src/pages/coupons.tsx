import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Loader2, 
  Plus, 
  RefreshCcw, 
  Search, 
  Trash2, 
  Edit2, 
  Tag, 
  Percent, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Eye, 
  Check, 
  Layers, 
  MapPin, 
  Users, 
  FileImage, 
  ExternalLink, 
  ChevronRight, 
  Sliders, 
  PlayCircle,
  HelpCircle,
  Clock,
  ArrowUpDown,
  LayoutGrid,
  IndianRupee,
  Target
} from "lucide-react";
import { couponService } from "../services/coupons";
import { planService } from "../services/plans";
import { serviceAreasService } from "../services/serviceAreas";
import { Coupon, Offer, SubscriptionPlan, ServiceArea } from "../types";
import { useAuth } from "../contexts/auth-context";
import { motion, AnimatePresence } from "motion/react";

export default function CouponsPage() {
  const { user } = useAuth();
  
  // Tab states: 'coupons' | 'offers' | 'sandbox'
  const [activeTab, setActiveTab] = useState<'coupons' | 'offers' | 'sandbox'>('coupons');

  // Real-time Collections state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);

  // Page UX states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Search & Filters state
  const [couponSearch, setCouponSearch] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [couponTypeFilter, setCouponTypeFilter] = useState<"All" | "Percentage" | "Flat">("All");
  
  const [offerSearch, setOfferSearch] = useState("");
  const [offerStatusFilter, setOfferStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  // Bulk selection state
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  // Dialog / Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponModalMode, setCouponModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerModalMode, setOfferModalMode] = useState<"create" | "edit">("create");
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);

  // Form states for Coupons
  const [couponForm, setCouponForm] = useState({
    title: "",
    couponCode: "",
    description: "",
    discountType: "Percentage" as "Percentage" | "Flat" | "Free Delivery",
    discountValue: 10,
    maximumDiscount: 200,
    minimumOrder: 499,
    validFrom: "",
    validUntil: "",
    maximumUsage: 500,
    usagePerCustomer: 1,
    applicablePlans: [] as string[],
    applicableAreas: [] as string[],
    applicableCategories: [] as string[],
    applicableCustomers: "", // input as comma-separated string of emails
    subscriptionOnly: false,
    firstOrderOnly: false,
    autoApply: false,
    status: "Active" as "Active" | "Inactive"
  });

  // Form states for Offers/Banners
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    bannerImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200", // default placeholder option
    redirectUrl: "/plans",
    ctaText: "Explore Now",
    offerType: "Promotion" as 'Promotion' | 'Announcement' | 'Survey' | 'Update',
    applicableAreas: [] as string[],
    displayOrder: 1,
    status: "Active" as "Active" | "Inactive",
    startDate: "",
    endDate: ""
  });

  // Sandbox simulated state
  const [sandboxState, setSandboxState] = useState({
    couponCode: "",
    customerEmail: "user@example.com",
    isFirstOrder: "No",
    hasActiveSubscription: "No",
    orderAmount: "500",
    selectedPlan: "All",
    selectedArea: "All"
  });

  const [sandboxResult, setSandboxResult] = useState<{
    valid: boolean;
    reason: string;
    details: { name: string; status: "passed" | "failed" | "skipped"; message: string }[];
    savings: number;
  } | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Subscribe to Firebase real-time listeners on component mount
  useEffect(() => {
    setLoading(true);
    
    // Auto-seed if database collection is empty on load
    const ensureSeededData = async () => {
      try {
        await couponService.seedCouponsAndOffers();
      } catch (err) {
        console.error("Auto-seeding check failed:", err);
      }
    };
    ensureSeededData();

    // Coupons Real-time Subscription
    const unsubCoupons = couponService.subscribeToCoupons((data) => {
      setCoupons(data);
      setLoading(false);
    });

    // Offers Real-time Subscription
    const unsubOffers = couponService.subscribeToOffers((data) => {
      setOffers(data);
    });

    // Plans Real-time Subscription
    const unsubPlans = planService.subscribePlans((data) => {
      setPlans(data);
    });

    // Service Areas Real-time Subscription
    const unsubAreas = serviceAreasService.subscribeToAreas((data) => {
      setAreas(data);
    });

    return () => {
      unsubCoupons();
      unsubOffers();
      unsubPlans();
      unsubAreas();
    };
  }, []);

  // Utility to trigger alert feedback
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // Helper: Force full re-seed to recover pristine defaults
  const handleRestoreDefaults = async () => {
    try {
      setSeeding(true);
      await couponService.seedCouponsAndOffers();
      triggerSuccess("Standard default coupons and offer banners have been initialized!");
    } catch (err: any) {
      triggerError("Seeding failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // 2. Computed KPIs for Dashboard
  const kpis = useMemo(() => {
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.status === "Active").length;
    
    // Expired Coupons check
    const nowStr = new Date().toISOString().split('T')[0];
    const expiredCoupons = coupons.filter(c => c.validUntil && c.validUntil < nowStr).length;

    // Redemptions
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

    // Approximate Discount Given: Sum of (usedCount * discountValue) for Flat Amount, or (usedCount * averageOrder(₹500) * (discountValue / 100)) for Percentage
    const totalDiscountGiven = coupons.reduce((sum, c) => {
      if (c.discountType === "Flat") {
        return sum + ((c.usedCount || 0) * c.discountValue);
      } else {
        const estOrderValue = 550; // Mumbai estimated healthy meal average
        const estDiscountPerUse = estOrderValue * (c.discountValue / 100);
        const cappedDiscount = c.maximumDiscount > 0 ? Math.min(estDiscountPerUse, c.maximumDiscount) : estDiscountPerUse;
        return sum + ((c.usedCount || 0) * cappedDiscount);
      }
    }, 0);

    // Top Performing Coupon (by usedCount)
    const sortedByUsage = [...coupons].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0));
    const topCoupon = sortedByUsage.length > 0 && sortedByUsage[0].usedCount > 0 
      ? sortedByUsage[0] 
      : null;

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalRedemptions,
      totalDiscountGiven: Math.round(totalDiscountGiven),
      topCouponCode: topCoupon ? topCoupon.couponCode : "None",
      topCouponUsage: topCoupon ? topCoupon.usedCount : 0
    };
  }, [coupons]);

  // 3. Coupons Filtering and Search
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = 
        c.couponCode.toLowerCase().includes(couponSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(couponSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(couponSearch.toLowerCase());

      const matchesStatus = 
        couponStatusFilter === "All" || 
        c.status === couponStatusFilter;

      const matchesType = 
        couponTypeFilter === "All" || 
        c.discountType === couponTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, couponSearch, couponStatusFilter, couponTypeFilter]);

  // 4. Offer Banners Filtering and Search
  const filteredOffers = useMemo(() => {
    return offers.filter(o => {
      const matchesSearch = 
        o.title.toLowerCase().includes(offerSearch.toLowerCase()) ||
        o.description.toLowerCase().includes(offerSearch.toLowerCase()) ||
        o.redirectUrl.toLowerCase().includes(offerSearch.toLowerCase());

      const matchesStatus = 
        offerStatusFilter === "All" || 
        o.status === offerStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [offers, offerSearch, offerStatusFilter]);

  // 5. Coupon Form validation and processing
  const validateCouponForm = () => {
    const errors: Record<string, string> = {};
    if (!couponForm.title.trim()) errors.title = "Coupon title is required";
    if (!couponForm.couponCode.trim()) {
      errors.couponCode = "Coupon code is required";
    } else if (!/^[A-Z0-9_]{3,20}$/.test(couponForm.couponCode.toUpperCase().trim())) {
      errors.couponCode = "Code must be 3-20 characters, alphanumeric with no spaces";
    }
    if (couponForm.discountValue <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    } else if (couponForm.discountType === "Percentage" && couponForm.discountValue > 100) {
      errors.discountValue = "Percentage discount cannot exceed 100%";
    }
    if (couponForm.minimumOrder < 0) errors.minimumOrder = "Cannot be negative";
    if (couponForm.maximumDiscount < 0) errors.maximumDiscount = "Cannot be negative";
    if (couponForm.maximumUsage <= 0) errors.maximumUsage = "Maximum usage must be at least 1";
    if (couponForm.usagePerCustomer <= 0) errors.usagePerCustomer = "Usage per customer must be at least 1";
    if (couponForm.validFrom && couponForm.validUntil && couponForm.validFrom > couponForm.validUntil) {
      errors.validUntil = "Valid Until date must be after Valid From date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Modal
  const openCreateCoupon = () => {
    setCouponForm({
      title: "",
      couponCode: "",
      description: "",
      discountType: "Percentage",
      discountValue: 15,
      maximumDiscount: 150,
      minimumOrder: 499,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maximumUsage: 500,
      usagePerCustomer: 1,
      applicablePlans: [],
      applicableAreas: [],
      applicableCategories: [],
      applicableCustomers: "",
      subscriptionOnly: false,
      firstOrderOnly: false,
      autoApply: false,
      status: "Active"
    });
    setFormErrors({});
    setCouponModalMode("create");
    setIsCouponModalOpen(true);
  };

  // Open Edit Modal
  const openEditCoupon = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setCouponForm({
      title: coupon.title,
      couponCode: coupon.couponCode,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maximumDiscount: coupon.maximumDiscount || 0,
      minimumOrder: coupon.minimumOrder || 0,
      validFrom: coupon.validFrom || "",
      validUntil: coupon.validUntil || "",
      maximumUsage: coupon.maximumUsage || 100,
      usagePerCustomer: coupon.usagePerCustomer || 1,
      applicablePlans: coupon.applicablePlans || [],
      applicableAreas: coupon.applicableAreas || [],
      applicableCategories: coupon.applicableCategories || [],
      applicableCustomers: coupon.applicableCustomers ? coupon.applicableCustomers.join(', ') : "",
      subscriptionOnly: !!coupon.subscriptionOnly,
      firstOrderOnly: !!coupon.firstOrderOnly,
      autoApply: !!coupon.autoApply,
      status: coupon.status
    });
    setFormErrors({});
    setCouponModalMode("edit");
    setIsCouponModalOpen(true);
  };

  // Open View Modal
  const openViewCoupon = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setCouponModalMode("view");
    setIsCouponModalOpen(true);
  };

  // Create or Update Coupon Action
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateCouponForm()) return;

    try {
      setSaving(true);
      
      const parsedCustomers = couponForm.applicableCustomers
        ? couponForm.applicableCustomers.split(',').map(email => email.trim().toLowerCase()).filter(email => email.length > 0)
        : [];

      const couponPayload = {
        couponId: currentCoupon?.couponId || "",
        title: couponForm.title.trim(),
        couponCode: couponForm.couponCode.toUpperCase().replace(/\s+/g, "").trim(),
        description: couponForm.description.trim(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        maximumDiscount: Number(couponForm.maximumDiscount),
        minimumOrder: Number(couponForm.minimumOrder),
        validFrom: couponForm.validFrom,
        validUntil: couponForm.validUntil,
        maximumUsage: Number(couponForm.maximumUsage),
        usagePerCustomer: Number(couponForm.usagePerCustomer),
        applicablePlans: couponForm.applicablePlans,
        applicableAreas: couponForm.applicableAreas,
        applicableCategories: couponForm.applicableCategories,
        applicableCustomers: parsedCustomers,
        subscriptionOnly: couponForm.subscriptionOnly,
        firstOrderOnly: couponForm.firstOrderOnly,
        autoApply: couponForm.autoApply,
        status: couponForm.status
      };

      if (couponModalMode === "create") {
        await couponService.createCoupon(couponPayload, user.id, user.email);
        triggerSuccess(`Coupon code ${couponPayload.couponCode} created successfully!`);
      } else if (couponModalMode === "edit" && currentCoupon) {
        await couponService.updateCoupon(currentCoupon.id, couponPayload, user.id, user.email);
        triggerSuccess(`Coupon code ${couponPayload.couponCode} updated successfully!`);
      }
      setIsCouponModalOpen(false);
    } catch (err: any) {
      triggerError("Coupon Save Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Coupon Status Quickly
  const handleToggleCouponStatus = async (coupon: Coupon) => {
    if (!user) return;
    try {
      const nextStatus = coupon.status === "Active" ? "Inactive" : "Active";
      await couponService.updateCoupon(coupon.id, { status: nextStatus }, user.id, user.email);
      triggerSuccess(`Set Coupon ${coupon.couponCode} availability to ${nextStatus}`);
    } catch (err: any) {
      triggerError("Failed to toggle status: " + err.message);
    }
  };

  // Duplicate Coupon
  const handleDuplicateCoupon = async (coupon: Coupon) => {
    if (!user) return;
    try {
      setSaving(true);
      const duplicatePayload = {
        title: `${coupon.title} (Copy)`,
        couponCode: `${coupon.couponCode}_DUP`,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maximumDiscount: coupon.maximumDiscount,
        minimumOrder: coupon.minimumOrder,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        maximumUsage: coupon.maximumUsage,
        usagePerCustomer: coupon.usagePerCustomer,
        applicablePlans: coupon.applicablePlans,
        applicableAreas: coupon.applicableAreas,
        applicableCategories: coupon.applicableCategories || [],
        applicableCustomers: coupon.applicableCustomers || [],
        subscriptionOnly: coupon.subscriptionOnly,
        firstOrderOnly: coupon.firstOrderOnly,
        autoApply: coupon.autoApply,
        status: "Inactive" as const // start duplicated coupon inactive for safety
      };

      await couponService.createCoupon(duplicatePayload, user.id, user.email);
      triggerSuccess(`Duplicated coupon successfully as ${duplicatePayload.couponCode}!`);
    } catch (err: any) {
      triggerError("Duplication failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to permanently delete coupon "${coupon.couponCode}"? This cannot be undone.`)) return;

    try {
      setSaving(true);
      await couponService.deleteCoupon(coupon.id, user.id, user.email);
      triggerSuccess(`Deleted coupon "${coupon.couponCode}" successfully.`);
    } catch (err: any) {
      triggerError("Delete failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 6. Offer Forms actions and handlers
  const validateOfferForm = () => {
    const errors: Record<string, string> = {};
    if (!offerForm.title.trim()) errors.title = "Offer title is required";
    if (!offerForm.bannerImage.trim()) errors.bannerImage = "Banner image URL is required";
    if (offerForm.displayOrder <= 0) errors.displayOrder = "Display order must be 1 or higher";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateOffer = () => {
    setOfferForm({
      title: "",
      description: "",
      bannerImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200",
      redirectUrl: "/plans",
      ctaText: "Explore Now",
      offerType: "Promotion",
      applicableAreas: [],
      displayOrder: offers.length + 1,
      status: "Active",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setFormErrors({});
    setOfferModalMode("create");
    setIsOfferModalOpen(true);
  };

  const openEditOffer = (offer: Offer) => {
    setCurrentOffer(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description || "",
      bannerImage: offer.bannerImage,
      redirectUrl: offer.redirectUrl || "/plans",
      ctaText: offer.ctaText || "Explore Now",
      offerType: offer.offerType || "Promotion",
      applicableAreas: offer.applicableAreas || [],
      displayOrder: offer.displayOrder || 1,
      status: offer.status,
      startDate: offer.startDate || "",
      endDate: offer.endDate || ""
    });
    setFormErrors({});
    setOfferModalMode("edit");
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateOfferForm()) return;

    try {
      setSaving(true);
      const offerPayload = {
        offerId: currentOffer?.offerId || "",
        title: offerForm.title.trim(),
        description: offerForm.description.trim(),
        bannerImage: offerForm.bannerImage.trim(),
        redirectUrl: offerForm.redirectUrl.trim(),
        ctaText: offerForm.ctaText.trim(),
        offerType: offerForm.offerType,
        applicableAreas: offerForm.applicableAreas,
        displayOrder: Number(offerForm.displayOrder),
        status: offerForm.status,
        startDate: offerForm.startDate,
        endDate: offerForm.endDate
      };

      if (offerModalMode === "create") {
        await couponService.createOffer(offerPayload, user.id, user.email);
        triggerSuccess(`Banner Offer "${offerPayload.title}" published!`);
      } else if (offerModalMode === "edit" && currentOffer) {
        await couponService.updateOffer(currentOffer.id, offerPayload, user.id, user.email);
        triggerSuccess(`Banner Offer "${offerPayload.title}" updated!`);
      }
      setIsOfferModalOpen(false);
    } catch (err: any) {
      triggerError("Offer publication failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOfferStatus = async (offer: Offer) => {
    if (!user) return;
    try {
      const nextStatus = offer.status === "Active" ? "Inactive" : "Active";
      await couponService.updateOffer(offer.id, { status: nextStatus }, user.id, user.email);
      triggerSuccess(`Set banner offer "${offer.title}" availability to ${nextStatus}`);
    } catch (err: any) {
      triggerError("Failed to toggle offer: " + err.message);
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete banner offer "${offer.title}"?`)) return;

    try {
      setSaving(true);
      await couponService.deleteOffer(offer.id, user.id, user.email);
      triggerSuccess(`Banner offer "${offer.title}" deleted.`);
    } catch (err: any) {
      triggerError("Failed to delete offer: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 7. Bulk Actions handler
  const handleBulkCouponToggle = async (status: "Active" | "Inactive") => {
    if (!user || selectedCoupons.length === 0) return;
    try {
      setSaving(true);
      for (const couponId of selectedCoupons) {
        await couponService.updateCoupon(couponId, { status }, user.id, user.email);
      }
      triggerSuccess(`Bulk modified ${selectedCoupons.length} coupons status to ${status}.`);
      setSelectedCoupons([]);
    } catch (err: any) {
      triggerError("Bulk modification failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkCouponDelete = async () => {
    if (!user || selectedCoupons.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCoupons.length} selected coupons?`)) return;

    try {
      setSaving(true);
      for (const couponId of selectedCoupons) {
        await couponService.deleteCoupon(couponId, user.id, user.email);
      }
      triggerSuccess(`Bulk deleted ${selectedCoupons.length} coupons successfully.`);
      setSelectedCoupons([]);
    } catch (err: any) {
      triggerError("Bulk delete failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Select / Deselect individual rows
  const toggleSelectCoupon = (couponId: string) => {
    setSelectedCoupons(prev => 
      prev.includes(couponId) ? prev.filter(id => id !== couponId) : [...prev, couponId]
    );
  };

  const toggleSelectAllCoupons = () => {
    if (selectedCoupons.length === filteredCoupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(filteredCoupons.map(c => c.id));
    }
  };

  // 8. Dynamic Coupon Validation Sandbox logic
  const handleRunValidation = () => {
    const targetCoupon = coupons.find(c => c.couponCode === sandboxState.couponCode);
    if (!targetCoupon) {
      setSandboxResult({
        valid: false,
        reason: "Coupon code does not exist.",
        details: [{ name: "Code Verification", status: "failed", message: "Coupon code not found in database." }],
        savings: 0
      });
      return;
    }

    const checks: { name: string; status: "passed" | "failed" | "skipped"; message: string }[] = [];
    let overallValid = true;
    const now = new Date().toISOString().split('T')[0];
    const simAmount = Number(sandboxState.orderAmount);

    // Expiry Date check
    if (targetCoupon.validFrom && now < targetCoupon.validFrom) {
      checks.push({ name: "Validation Window", status: "failed", message: `Coupon validity starts in future (${targetCoupon.validFrom})` });
      overallValid = false;
    } else if (targetCoupon.validUntil && now > targetCoupon.validUntil) {
      checks.push({ name: "Coupon Expiration", status: "failed", message: `Coupon expired on ${targetCoupon.validUntil}` });
      overallValid = false;
    } else {
      checks.push({ name: "Coupon Validity Period", status: "passed", message: `Coupon is currently active (Ends ${targetCoupon.validUntil || 'Never'})` });
    }

    // Status check
    if (targetCoupon.status !== "Active") {
      checks.push({ name: "Global Active Status", status: "failed", message: "Coupon has been manually disabled by Admin." });
      overallValid = false;
    } else {
      checks.push({ name: "Availability Status", status: "passed", message: "Coupon status is active." });
    }

    // Minimum Order amount check
    if (simAmount < targetCoupon.minimumOrder) {
      checks.push({ name: "Minimum Order Target", status: "failed", message: `Simulated order (₹${simAmount}) is below required ₹${targetCoupon.minimumOrder}` });
      overallValid = false;
    } else {
      checks.push({ name: "Minimum Order Target", status: "passed", message: `Simulated order exceeds minimum ₹${targetCoupon.minimumOrder}` });
    }

    // Usage Limit checks
    if (targetCoupon.maximumUsage > 0 && targetCoupon.usedCount >= targetCoupon.maximumUsage) {
      checks.push({ name: "Global Usage Cap", status: "failed", message: `Coupon exceeded maximum allowed uses (${targetCoupon.usedCount}/${targetCoupon.maximumUsage})` });
      overallValid = false;
    } else {
      checks.push({ name: "Global Usage Capacity", status: "passed", message: `Coupon utilization is safe (${targetCoupon.usedCount || 0}/${targetCoupon.maximumUsage || 'Uncapped'} used)` });
    }

    // Customer Specific Eligibility check
    if (targetCoupon.applicableCustomers && targetCoupon.applicableCustomers.length > 0) {
      const emailMatch = targetCoupon.applicableCustomers.includes(sandboxState.customerEmail.toLowerCase().trim());
      if (!emailMatch) {
        checks.push({ name: "Customer Restriction List", status: "failed", message: `Simulated customer email is not eligible for this coupon.` });
        overallValid = false;
      } else {
        checks.push({ name: "Customer Eligibility Check", status: "passed", message: `Matched targeted customer roster list.` });
      }
    } else {
      checks.push({ name: "Universal Customer Access", status: "passed", message: "Applicable universally to all customers." });
    }

    // First Order only checks
    if (targetCoupon.firstOrderOnly) {
      if (sandboxState.isFirstOrder !== "Yes") {
        checks.push({ name: "New User Check", status: "failed", message: "First order restriction failed. simulated user already ordered." });
        overallValid = false;
      } else {
        checks.push({ name: "First Order Eligibility", status: "passed", message: "Simulated as user's first checkout order." });
      }
    } else {
      checks.push({ name: "Order History Restriction", status: "skipped", message: "Eligible for both new and returning customers." });
    }

    // Subscription Only checks
    if (targetCoupon.subscriptionOnly) {
      if (sandboxState.hasActiveSubscription !== "Yes") {
        checks.push({ name: "Subscription Only Check", status: "failed", message: "Coupon restricted to active subscription meal plans." });
        overallValid = false;
      } else {
        checks.push({ name: "Active Subscription Check", status: "passed", message: "Simulated subscriber connection validated." });
      }
    } else {
      checks.push({ name: "Billing Model Check", status: "skipped", message: "Applicable on single-checkout plans as well." });
    }

    // Service Area Eligibility
    if (targetCoupon.applicableAreas && targetCoupon.applicableAreas.length > 0) {
      if (sandboxState.selectedArea === "All") {
        checks.push({ name: "Regional Delivery Zone", status: "failed", message: "Zone not specified, coupon requires a targeted serviceable region." });
        overallValid = false;
      } else if (!targetCoupon.applicableAreas.includes(sandboxState.selectedArea)) {
        checks.push({ name: "Regional Delivery Zone Check", status: "failed", message: `Target area (${sandboxState.selectedArea}) not in allowed zone list.` });
        overallValid = false;
      } else {
        checks.push({ name: "Regional Delivery Zone Check", status: "passed", message: `Zone matches eligible sector.` });
      }
    } else {
      checks.push({ name: "Geographic Delivery Check", status: "passed", message: "Valid across all delivery pincodes globally." });
    }

    // Plan Specific Eligibility
    if (targetCoupon.applicablePlans && targetCoupon.applicablePlans.length > 0) {
      if (sandboxState.selectedPlan === "All") {
        checks.push({ name: "Meal Plan Eligibility", status: "failed", message: "Meal plan not chosen. Coupon requires specific targeted diet plans." });
        overallValid = false;
      } else if (!targetCoupon.applicablePlans.includes(sandboxState.selectedPlan)) {
        checks.push({ name: "Meal Plan Eligibility", status: "failed", message: `Simulated plan does not match targeted allowed plan roster.` });
        overallValid = false;
      } else {
        checks.push({ name: "Meal Plan Eligibility Check", status: "passed", message: `Simulated meal plan matches eligible menu categories.` });
      }
    } else {
      checks.push({ name: "Universal Plan Access", status: "passed", message: "Eligible across all plan tiers and subcategories." });
    }

    // Calculate Discount Savings
    let discountAmount = 0;
    if (overallValid) {
      if (targetCoupon.discountType === "Percentage") {
        discountAmount = simAmount * (targetCoupon.discountValue / 100);
        if (targetCoupon.maximumDiscount > 0 && discountAmount > targetCoupon.maximumDiscount) {
          discountAmount = targetCoupon.maximumDiscount;
        }
      } else {
        discountAmount = targetCoupon.discountValue;
      }
      // Cannot save more than order total
      discountAmount = Math.min(discountAmount, simAmount);
    }

    setSandboxResult({
      valid: overallValid,
      reason: overallValid ? "All validation checks passed! Coupon applied successfully." : "Coupon could not be applied due to constraint failures.",
      details: checks,
      savings: Math.round(discountAmount)
    });
  };

  // Helper toggle list selection
  const handleToggleFormArray = (field: 'applicablePlans' | 'applicableAreas' | 'applicableCategories', item: string) => {
    setCouponForm(prev => {
      const current = prev[field];
      const next = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
      return { ...prev, [field]: next };
    });
  };

  return (
    <div className="space-y-8 p-6 text-zinc-100 max-w-[1600px] mx-auto pb-16">
      
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Coupons & Offer Campaigns</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Configure promotional codes, regional eligibility thresholds, and publish interactive banner campaigns.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreDefaults}
            disabled={seeding}
            className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 gap-2 h-9 text-xs"
          >
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Reset Default Campaigns
          </Button>
          
          {activeTab === 'coupons' && (
            <Button
              size="sm"
              onClick={openCreateCoupon}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-9 text-xs shadow-lg shadow-emerald-600/10 font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          )}

          {activeTab === 'offers' && (
            <Button
              size="sm"
              onClick={openCreateOffer}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-9 text-xs shadow-lg shadow-emerald-600/10 font-semibold"
            >
              <Plus className="h-4 w-4" />
              Publish Banner Offer
            </Button>
          )}
        </div>
      </div>

      {/* Success/Error Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-md"
          >
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-md"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive KPI Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-zinc-950/40 border-zinc-900/50 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Tag className="h-12 w-12 text-white" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                Total Coupons
              </CardDescription>
              <CardTitle className="text-white text-3xl font-black mt-1 tabular-nums">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : kpis.totalCoupons}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono bg-zinc-900/50 w-fit px-2 py-0.5 rounded-full border border-zinc-800/50">
                Live Repository
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-zinc-950/40 border-zinc-900/50 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <PlayCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Now
              </CardDescription>
              <CardTitle className="text-emerald-400 text-3xl font-black mt-1 tabular-nums">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : kpis.activeCoupons}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[10px] text-emerald-500/80 flex items-center gap-1 font-mono bg-emerald-500/5 w-fit px-2 py-0.5 rounded-full border border-emerald-500/10">
                Customer Facing
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-zinc-950/40 border-zinc-900/50 shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="h-12 w-12 text-rose-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Expired
              </CardDescription>
              <CardTitle className="text-zinc-400 text-3xl font-black mt-1 tabular-nums">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-500" /> : kpis.expiredCoupons}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[10px] text-rose-500/80 flex items-center gap-1 font-mono bg-rose-500/5 w-fit px-2 py-0.5 rounded-full border border-rose-500/10">
                Campaigns Ended
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-zinc-950/40 border-zinc-900/50 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Redemptions
              </CardDescription>
              <CardTitle className="text-emerald-400 text-3xl font-black mt-1 tabular-nums">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : kpis.totalRedemptions}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 font-mono bg-emerald-400/5 w-fit px-2 py-0.5 rounded-full border border-emerald-400/10">
                Checkout Success
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-zinc-950/40 border-zinc-900/50 shadow-xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="h-12 w-12 text-orange-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Total Savings
              </CardDescription>
              <CardTitle className="text-white text-3xl font-black mt-1 tabular-nums">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : `₹${kpis.totalDiscountGiven.toLocaleString()}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[10px] text-orange-500/80 flex items-center gap-1 font-mono bg-orange-500/5 w-fit px-2 py-0.5 rounded-full border border-orange-500/10">
                Promo Efficiency
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-zinc-950/40 border-zinc-900/50 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Tag className="h-12 w-12 text-emerald-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Top Performer
              </CardDescription>
              <CardTitle className="text-emerald-400 text-2xl font-black mt-1 tracking-wider truncate">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : kpis.topCouponCode}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono bg-zinc-900/50 w-fit px-2 py-0.5 rounded-full border border-zinc-800/50">
                {kpis.topCouponUsage} Redeems
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-zinc-900/60 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'coupons' 
                ? 'border-emerald-500 text-emerald-400 font-bold' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Coupons Codes Management
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'offers' 
                ? 'border-emerald-500 text-emerald-400 font-bold' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Promo Banner Offers (CMS)
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'sandbox' 
                ? 'border-emerald-500 text-emerald-400 font-bold' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Coupon Validation Sandbox
          </button>
        </div>

        <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-1.5 pb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Realtime Sync Active
        </div>
      </div>

      {/* =====================================
          TAB 1: COUPON CODES MANAGEMENT
          ===================================== */}
      {activeTab === 'coupons' && (
        <Card className="bg-zinc-950/50 border-zinc-800 shadow-lg rounded-xl overflow-hidden">
          
          {/* Filters Bar */}
          <div className="p-4 md:p-6 border-b border-zinc-900/60 bg-zinc-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search coupons (code, title)..."
                  value={couponSearch}
                  onChange={(e) => setCouponSearch(e.target.value)}
                  className="pl-9 h-9 bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs shrink-0">Status:</span>
                <select
                  value={couponStatusFilter}
                  onChange={(e) => setCouponStatusFilter(e.target.value as any)}
                  className="h-9 px-2 bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs shrink-0">Type:</span>
                <select
                  value={couponTypeFilter}
                  onChange={(e) => setCouponTypeFilter(e.target.value as any)}
                  className="h-9 px-2 bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Types</option>
                  <option value="Percentage">Percentage Only</option>
                  <option value="Flat">Flat Amount Only</option>
                </select>
              </div>
            </div>

            {/* Bulk actions and counts */}
            <div className="flex items-center gap-2">
              {selectedCoupons.length > 0 && (
                <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/40 rounded-lg px-3 py-1 text-xs text-zinc-300">
                  <span>{selectedCoupons.length} Selected</span>
                  <div className="h-4 w-[1px] bg-zinc-800" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBulkCouponToggle("Active")}
                    className="h-7 text-emerald-400 hover:text-white px-2 py-0 text-xs"
                  >
                    Enable
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBulkCouponToggle("Inactive")}
                    className="h-7 text-zinc-400 hover:text-white px-2 py-0 text-xs"
                  >
                    Disable
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleBulkCouponDelete}
                    className="h-7 text-rose-400 hover:text-white px-2 py-0 text-xs"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Table content */}
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-400 text-sm font-medium">Synchronizing Campaign Data...</p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4 text-center px-4">
                <Tag className="h-12 w-12 text-zinc-800" />
                <div>
                  <p className="font-semibold text-zinc-300 text-lg">No Active Campaigns</p>
                  <p className="text-xs text-zinc-600 mt-1 max-w-sm">
                    Initiate new promotional outreach by creating your first coupon code.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-zinc-950/50">
                {filteredCoupons.map((coupon, index) => {
                  const usagePercent = coupon.maximumUsage ? (coupon.usedCount / coupon.maximumUsage) * 100 : 0;
                  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                  const isExhausted = coupon.maximumUsage && coupon.usedCount >= coupon.maximumUsage;
                  
                  return (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Ticket Container */}
                      <div className={`relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 shadow-lg ${!coupon.status || isExpired || isExhausted ? 'opacity-60' : ''}`}>
                        
                        {/* Perforation Left */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 group-hover:border-emerald-500/40 transition-colors" />
                        {/* Perforation Right */}
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 group-hover:border-emerald-500/40 transition-colors" />

                        {/* Top Header Section */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${coupon.discountType === 'Percentage' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              {coupon.discountType === 'Percentage' ? <Percent className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="text-white text-sm font-bold tracking-tight">{coupon.title}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className={`text-[9px] py-0 px-1.5 h-4 border-zinc-800 bg-zinc-950 ${coupon.status === 'Active' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                  {coupon.status}
                                </Badge>
                                <span className="text-[10px] text-zinc-500 font-medium">Min: ₹{coupon.minimumOrder}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={selectedCoupons.includes(coupon.id)}
                              onChange={() => toggleSelectCoupon(coupon.id)}
                              className="accent-emerald-500 rounded border-zinc-800 h-4 w-4 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Middle Code Section */}
                        <div className="bg-zinc-950/50 border border-dashed border-zinc-800 rounded-xl p-3 flex items-center justify-between group/code relative hover:border-emerald-500/30 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Coupon Code</span>
                            <span className="text-white font-mono text-lg font-black tracking-widest">{coupon.couponCode}</span>
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.couponCode);
                              triggerSuccess(`Code ${coupon.couponCode} copied to clipboard!`);
                            }}
                            className="p-2 hover:bg-emerald-500/10 rounded-lg text-zinc-500 hover:text-emerald-400 transition-all active:scale-90"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-zinc-500 mt-4 line-clamp-2 min-h-[32px] leading-relaxed italic">
                          "{coupon.description || "No specific terms configured for this campaign."}"
                        </p>

                        {/* Usage Progress */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500 font-bold uppercase tracking-tighter">Campaign Utilization</span>
                            <span className="text-zinc-300 font-mono">{coupon.usedCount} / {coupon.maximumUsage || '∞'}</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                              className={`h-full rounded-full ${usagePercent > 90 ? 'bg-rose-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            />
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-5 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>Expires: {coupon.validUntil || 'Never'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openViewCoupon(coupon)}
                              className="h-7 w-7 text-zinc-500 hover:text-white"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditCoupon(coupon)}
                              className="h-7 w-7 text-zinc-500 hover:text-white"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDuplicateCoupon(coupon)}
                              className="h-7 w-7 text-zinc-500 hover:text-white"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteCoupon(coupon)}
                              className="h-7 w-7 text-zinc-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Overlay Indicators */}
                        {isExpired && (
                          <div className="absolute top-2 right-2 rotate-12">
                            <Badge className="bg-rose-500 text-white border-none shadow-lg text-[9px]">EXPIRED</Badge>
                          </div>
                        )}
                        {isExhausted && (
                          <div className="absolute top-2 right-2 rotate-12">
                            <Badge className="bg-amber-500 text-white border-none shadow-lg text-[9px]">EXHAUSTED</Badge>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* =====================================
          TAB 2: PROMO BANNER OFFERS CMS
          ===================================== */}
      {activeTab === 'offers' && (
        <Card className="bg-zinc-950/50 border-zinc-800 shadow-lg rounded-xl overflow-hidden">
          
          {/* Filters Bar */}
          <div className="p-4 md:p-6 border-b border-zinc-900/60 bg-zinc-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search promo banners (title, url)..."
                  value={offerSearch}
                  onChange={(e) => setOfferSearch(e.target.value)}
                  className="pl-9 h-9 bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs shrink-0">Status:</span>
                <select
                  value={offerStatusFilter}
                  onChange={(e) => setOfferStatusFilter(e.target.value as any)}
                  className="h-9 px-2 bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Banners</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

      {/* Table Content */}
          <CardContent className="p-0 bg-zinc-950/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-400 text-sm font-medium">Synchronizing Promo Assets...</p>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4 text-center px-4">
                <FileImage className="h-12 w-12 text-zinc-800" />
                <div>
                  <p className="font-semibold text-zinc-300 text-lg">No Promo Banners found</p>
                  <p className="text-xs text-zinc-600 mt-1 max-w-sm">
                    Configure active CMS carousel offers by adding a new promo banner.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {filteredOffers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col h-full">
                      {/* Banner Preview */}
                      <div className="relative h-40 w-full overflow-hidden bg-zinc-950">
                        {offer.bannerImage ? (
                          <img 
                            src={offer.bannerImage} 
                            alt={offer.title} 
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-zinc-800">
                            <FileImage className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                        
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-emerald-600/90 text-white border-none text-[9px] px-2 py-0.5 shadow-lg">
                            {offer.offerType}
                          </Badge>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                           <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-mono">
                             <Clock className="h-3 w-3" />
                             <span>Order: #{offer.displayOrder}</span>
                           </div>
                           <Badge variant="outline" className={`text-[9px] border-none ${offer.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                             {offer.status}
                           </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="text-white text-sm font-bold truncate mb-1">{offer.title}</h4>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 mb-4 italic leading-relaxed">
                          {offer.description || "Campaign announcement subtext..."}
                        </p>

                        <div className="mt-auto space-y-3">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3 text-emerald-500" />
                              <span className="truncate max-w-[120px]">{offer.redirectUrl}</span>
                            </div>
                            <span className="text-emerald-400">{offer.ctaText}</span>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                            <span className="text-[9px] text-zinc-600 font-mono">
                              Ends: {offer.endDate || "Permanent"}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditOffer(offer)}
                                className="h-7 w-7 text-zinc-500 hover:text-white"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleToggleOfferStatus(offer)}
                                className="h-7 w-7 text-zinc-500 hover:text-emerald-400"
                              >
                                {offer.status === 'Active' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteOffer(offer)}
                                className="h-7 w-7 text-zinc-500 hover:text-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* =====================================
          TAB 3: COUPON VALIDATION SANDBOX
          ===================================== */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Simulation setup */}
          <Card className="bg-zinc-950/50 border-zinc-800 shadow-lg lg:col-span-5">
            <CardHeader className="border-b border-zinc-900 bg-zinc-900/10">
              <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>Simulation Configuration</span>
              </CardTitle>
              <CardDescription className="text-zinc-500 text-[11px] mt-0.5">
                Set custom customer and shopping context parameters to test exact coupon resolution.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              {/* Select Coupon */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Select Target Coupon Code</Label>
                <select
                  value={sandboxState.couponCode}
                  onChange={(e) => setSandboxState(prev => ({ ...prev, couponCode: e.target.value }))}
                  className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Coupon --</option>
                  {coupons.map(c => (
                    <option key={c.id} value={c.couponCode}>
                      {c.couponCode} ({c.title})
                    </option>
                  ))}
                </select>
              </div>

              {/* Order total amount */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Cart / Order Amount (₹)</Label>
                <Input
                  type="number"
                  value={sandboxState.orderAmount}
                  onChange={(e) => setSandboxState(prev => ({ ...prev, orderAmount: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                />
              </div>

              {/* Customer Email simulation */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Customer Email Address</Label>
                <Input
                  type="email"
                  value={sandboxState.customerEmail}
                  onChange={(e) => setSandboxState(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                />
              </div>

              {/* Simulated flags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs">Is First Order?</Label>
                  <select
                    value={sandboxState.isFirstOrder}
                    onChange={(e) => setSandboxState(prev => ({ ...prev, isFirstOrder: e.target.value }))}
                    className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs">Is Subscription Plan checkout?</Label>
                  <select
                    value={sandboxState.hasActiveSubscription}
                    onChange={(e) => setSandboxState(prev => ({ ...prev, hasActiveSubscription: e.target.value }))}
                    className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              {/* Selected Plan simulation */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Target Diet Subscription Plan</Label>
                <select
                  value={sandboxState.selectedPlan}
                  onChange={(e) => setSandboxState(prev => ({ ...prev, selectedPlan: e.target.value }))}
                  className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All / Standard Checkout</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Selected Area PIN simulation */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Checkout Delivery PIN Code</Label>
                <select
                  value={sandboxState.selectedArea}
                  onChange={(e) => setSandboxState(prev => ({ ...prev, selectedArea: e.target.value }))}
                  className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">None / Universal Area</option>
                  {areas.flatMap(a => a.pincodes || []).map(pin => (
                    <option key={pin} value={pin}>{pin}</option>
                  ))}
                </select>
              </div>

              {/* Launch check */}
              <Button
                onClick={handleRunValidation}
                disabled={!sandboxState.couponCode}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 rounded-lg mt-4 flex items-center justify-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Execute Validation Resolution
              </Button>

            </CardContent>
          </Card>
             {/* Results panel */}
          <Card className="bg-zinc-950/50 border-zinc-800 shadow-2xl lg:col-span-7 flex flex-col justify-between overflow-hidden">
            <div>
              <CardHeader className="border-b border-zinc-900 bg-zinc-900/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Resolution Engine
                    </CardTitle>
                    <CardDescription className="text-zinc-500 text-[10px]">
                      Simulating Firestore-based checkout resolution logic.
                    </CardDescription>
                  </div>
                  {sandboxResult && (
                    <Badge className={sandboxResult.valid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}>
                      {sandboxResult.valid ? "PASSED" : "FAILED"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!sandboxResult ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4 text-center">
                    <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800">
                      <HelpCircle className="h-10 w-10 text-zinc-700" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-400 text-sm">Awaiting Instruction</p>
                      <p className="text-[11px] text-zinc-600 max-w-xs mt-1 leading-relaxed">
                        Input campaign parameters on the left and execute the resolution engine to see the diagnostic path.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Diagnostic Summary Header */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border flex items-center gap-5 ${
                        sandboxResult.valid 
                          ? 'bg-emerald-500/5 border-emerald-500/10' 
                          : 'bg-rose-500/5 border-rose-500/10'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${sandboxResult.valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {sandboxResult.valid ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-black text-lg ${sandboxResult.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sandboxResult.valid ? 'Resolution: APPLIED' : 'Resolution: REJECTED'}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          {sandboxResult.reason}
                        </p>
                      </div>
                    </motion.div>

                    {/* Savings calculation */}
                    {sandboxResult.valid && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Savings Amount</span>
                          <span className="text-2xl font-black text-white">₹{sandboxResult.savings}</span>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                          <span className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-wider block mb-1">New Total</span>
                          <span className="text-2xl font-black text-emerald-400">₹{Number(sandboxState.orderAmount) - sandboxResult.savings}</span>
                        </div>
                      </div>
                    )}

                    {/* List of audits */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <h5 className="text-white text-[10px] font-black tracking-widest uppercase">Audit Decision Path</h5>
                        <span className="text-zinc-600 font-mono text-[9px]">{sandboxResult.details.length} nodes checked</span>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {sandboxResult.details.map((audit, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group flex items-center justify-between p-3 text-xs bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 rounded-xl transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-1.5 w-1.5 rounded-full ${audit.status === 'passed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : audit.status === 'failed' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-zinc-700'}`} />
                              <span className="text-zinc-400 font-bold tracking-tight">{audit.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-zinc-500 font-mono italic opacity-60 group-hover:opacity-100 transition-opacity">{audit.message}</span>
                              {audit.status === 'passed' ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : audit.status === 'failed' ? (
                                <XCircle className="h-3.5 w-3.5 text-rose-500" />
                              ) : (
                                <HelpCircle className="h-3.5 w-3.5 text-zinc-700" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </CardContent>
            </div>
            
            <div className="p-6 border-t border-zinc-900 bg-zinc-900/20 text-[10px] text-zinc-600 leading-relaxed font-mono flex items-start gap-3">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span>
                Diagnostic simulation evaluates standard checkout lifecycle hooks. Rule priority is calculated top-down; universal rules are verified before targeting-specific overrides.
              </span>
            </div>
          </Card>

        </div>
      )}

      {/* =====================================
          DIALOG: CREATE / EDIT / VIEW COUPON MODAL
          ===================================== */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl shadow-black/80 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-white text-base">
                    {couponModalMode === "create" && "Create New Coupon"}
                    {couponModalMode === "edit" && `Edit Coupon: ${currentCoupon?.couponCode}`}
                    {couponModalMode === "view" && `View Coupon Rules: ${currentCoupon?.couponCode}`}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCouponModalOpen(false)} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {couponModalMode === "view" && currentCoupon ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* View Only Body */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Coupon Title</span>
                      <span className="text-white text-xs mt-1 block font-semibold">{currentCoupon.title}</span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg relative group">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Coupon Code</span>
                      <span className="text-emerald-400 text-xs font-mono font-bold mt-1 block tracking-widest">{currentCoupon.couponCode}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(currentCoupon.couponCode);
                          triggerSuccess("Code copied!");
                        }}
                        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-emerald-500/10 rounded transition-all text-zinc-500 hover:text-emerald-400"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Subtext Description</span>
                    <span className="text-zinc-300 text-xs mt-1 block leading-relaxed">{currentCoupon.description || "None configured."}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Discount Type</span>
                      <span className="text-white text-xs mt-1 block">{currentCoupon.discountType}</span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Value</span>
                      <span className="text-white text-xs mt-1 block font-bold">
                        {currentCoupon.discountType === 'Percentage' ? `${currentCoupon.discountValue}%` : `₹${currentCoupon.discountValue}`}
                      </span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Min Spend</span>
                      <span className="text-white text-xs mt-1 block">₹{currentCoupon.minimumOrder}</span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Max Capped</span>
                      <span className="text-white text-xs mt-1 block">{currentCoupon.maximumDiscount ? `₹${currentCoupon.maximumDiscount}` : 'None'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Usage Status</span>
                      <span className="text-white text-xs mt-1 block">Used {currentCoupon.usedCount || 0} / {currentCoupon.maximumUsage || 'Unlimited'} times</span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Usage Per Customer</span>
                      <span className="text-white text-xs mt-1 block">{currentCoupon.usagePerCustomer || 1} time(s) allowed</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Valid From</span>
                      <span className="text-white text-xs font-mono mt-1 block">{currentCoupon.validFrom || "Immediate"}</span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Valid Until / Expiry</span>
                      <span className="text-white text-xs font-mono mt-1 block">{currentCoupon.validUntil || "Never"}</span>
                    </div>
                  </div>

                  {/* Criteria checklist */}
                  <div className="space-y-2 border-t border-zinc-900 pt-4">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Rule Criteria Settings</span>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900/20 text-zinc-300 border border-zinc-900">
                        {currentCoupon.subscriptionOnly ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-600" />}
                        <span>Subscription Only</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900/20 text-zinc-300 border border-zinc-900">
                        {currentCoupon.firstOrderOnly ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-600" />}
                        <span>First Order Only</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900/20 text-zinc-300 border border-zinc-900">
                        {currentCoupon.autoApply ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-600" />}
                        <span>Auto Apply Checkout</span>
                      </div>
                    </div>
                  </div>

                  {/* Lists targeted */}
                  <div className="space-y-3 border-t border-zinc-900 pt-4">
                    <div>
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Applicable Service PIN Zones</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentCoupon.applicableAreas && currentCoupon.applicableAreas.length > 0 ? (
                          currentCoupon.applicableAreas.map(area => (
                            <Badge key={area} className="bg-zinc-900 text-zinc-300 font-mono text-[9px] border-zinc-800">{area}</Badge>
                          ))
                        ) : (
                          <span className="text-zinc-600 italic text-[10px]">Universal access (All Area codes allowed)</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Applicable Diet Subscription Plans</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentCoupon.applicablePlans && currentCoupon.applicablePlans.length > 0 ? (
                          currentCoupon.applicablePlans.map(plan => (
                            <Badge key={plan} className="bg-zinc-900 text-zinc-300 text-[9px] border-zinc-800">{plan}</Badge>
                          ))
                        ) : (
                          <span className="text-zinc-600 italic text-[10px]">Universal access (All Plans allowed)</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Simulated Customer Restrictions List</span>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                        {currentCoupon.applicableCustomers && currentCoupon.applicableCustomers.length > 0 ? (
                          currentCoupon.applicableCustomers.join(', ')
                        ) : (
                          "Open registration (Universal for all user accounts)"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Close footer */}
                  <div className="flex justify-end border-t border-zinc-900 pt-4">
                    <Button
                      onClick={() => setIsCouponModalOpen(false)}
                      className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800 h-9 rounded-lg text-xs"
                    >
                      Dismiss View
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveCoupon} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  
                  {/* SECTION: BASIC INFO */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/50">
                      <LayoutGrid className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Campaign Identity</h4>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Campaign Display Title</Label>
                      <Input
                        id="title"
                        value={couponForm.title}
                        onChange={e => setCouponForm({ ...couponForm, title: e.target.value })}
                        className="bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        placeholder="e.g. Monsoon Wellness Special"
                      />
                      {formErrors.title && <p className="text-rose-500 text-[10px] font-medium">{formErrors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="couponCode" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Redemption Code</Label>
                        <Input
                          id="couponCode"
                          value={couponForm.couponCode}
                          onChange={e => setCouponForm({ ...couponForm, couponCode: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 font-mono tracking-widest uppercase placeholder-zinc-600 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                          placeholder="HEALTHY20"
                        />
                        {formErrors.couponCode && <p className="text-rose-500 text-[10px] font-medium">{formErrors.couponCode}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Lifecycle Status</Label>
                        <select
                          value={couponForm.status}
                          onChange={e => setCouponForm({ ...couponForm, status: e.target.value as any })}
                          className="w-full h-10 px-3 bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500/50"
                        >
                          <option value="Active">Active (Public)</option>
                          <option value="Inactive">Inactive (Draft)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Promotional Subtext</Label>
                      <Input
                        id="description"
                        value={couponForm.description}
                        onChange={e => setCouponForm({ ...couponForm, description: e.target.value })}
                        className="bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        placeholder="Short catchy description for the mobile app"
                      />
                    </div>
                  </div>

                  {/* SECTION: ECONOMIC RULES */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/50">
                      <IndianRupee className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Economic Controls</h4>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Calculation Mode</Label>
                        <select
                          value={couponForm.discountType}
                          onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                          className="w-full h-10 px-3 bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500/50"
                        >
                          <option value="Percentage">Percentage (%) Off</option>
                          <option value="Flat">Flat Amount (₹) Off</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="discountValue" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Value</Label>
                        <Input
                          id="discountValue"
                          type="number"
                          value={couponForm.discountValue}
                          onChange={e => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        />
                        {formErrors.discountValue && <p className="text-rose-500 text-[10px] font-medium">{formErrors.discountValue}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="minimumOrder" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Min Order (₹)</Label>
                        <Input
                          id="minimumOrder"
                          type="number"
                          value={couponForm.minimumOrder}
                          onChange={e => setCouponForm({ ...couponForm, minimumOrder: Number(e.target.value) })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="maximumDiscount" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Max Cap (₹)</Label>
                        <Input
                          id="maximumDiscount"
                          type="number"
                          disabled={couponForm.discountType === 'Flat'}
                          value={couponForm.discountType === 'Flat' ? couponForm.discountValue : couponForm.maximumDiscount}
                          onChange={e => setCouponForm({ ...couponForm, maximumDiscount: Number(e.target.value) })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50 disabled:opacity-30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="maximumUsage" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Global Cap</Label>
                        <Input
                          id="maximumUsage"
                          type="number"
                          value={couponForm.maximumUsage}
                          onChange={e => setCouponForm({ ...couponForm, maximumUsage: Number(e.target.value) })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="usagePerCustomer" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">User Cap</Label>
                        <Input
                          id="usagePerCustomer"
                          type="number"
                          value={couponForm.usagePerCustomer}
                          onChange={e => setCouponForm({ ...couponForm, usagePerCustomer: Number(e.target.value) })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION: TARGETING */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/50">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Precision Targeting</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="validFrom" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Launch Date</Label>
                        <Input
                          id="validFrom"
                          type="date"
                          value={couponForm.validFrom}
                          onChange={e => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="validUntil" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Expiry Date</Label>
                        <Input
                          id="validUntil"
                          type="date"
                          value={couponForm.validUntil}
                          onChange={e => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50"
                        />
                        {formErrors.validUntil && <p className="text-rose-500 text-[10px] font-medium">{formErrors.validUntil}</p>}
                      </div>
                    </div>

                    <div className="space-y-3 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900/50">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight block mb-2">Qualifying Criteria</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2.5 text-xs cursor-pointer text-zinc-300 hover:text-white transition-colors group">
                          <input
                            type="checkbox"
                            checked={couponForm.subscriptionOnly}
                            onChange={e => setCouponForm({ ...couponForm, subscriptionOnly: e.target.checked })}
                            className="accent-emerald-500 h-4 w-4 rounded-md border-zinc-800 bg-zinc-950"
                          />
                          <span>Subscribers Only</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs cursor-pointer text-zinc-300 hover:text-white transition-colors group">
                          <input
                            type="checkbox"
                            checked={couponForm.firstOrderOnly}
                            onChange={e => setCouponForm({ ...couponForm, firstOrderOnly: e.target.checked })}
                            className="accent-emerald-500 h-4 w-4 rounded-md border-zinc-800 bg-zinc-950"
                          />
                          <span>New Users Only</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs cursor-pointer text-zinc-300 hover:text-white transition-colors group">
                          <input
                            type="checkbox"
                            checked={couponForm.autoApply}
                            onChange={e => setCouponForm({ ...couponForm, autoApply: e.target.checked })}
                            className="accent-emerald-500 h-4 w-4 rounded-md border-zinc-800 bg-zinc-950"
                          />
                          <span>Auto-Apply</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight flex items-center justify-between">
                          <span>Target Diet Plans</span>
                          <span className="text-[9px] text-zinc-600 italic">Universal if none selected</span>
                        </Label>
                        <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
                          {plans.map(plan => (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => handleToggleFormArray('applicablePlans', plan.name)}
                              className={`text-[9px] px-3 py-1.5 rounded-lg border transition-all ${
                                couponForm.applicablePlans.includes(plan.name)
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {plan.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight flex items-center justify-between">
                          <span>Target PIN Zones</span>
                          <span className="text-[9px] text-zinc-600 italic">Universal if none selected</span>
                        </Label>
                        <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
                          {areas.flatMap(a => a.pincodes || []).map(pin => (
                            <button
                              key={pin}
                              type="button"
                              onClick={() => handleToggleFormArray('applicableAreas', pin)}
                              className={`text-[9px] px-3 py-1.5 rounded-lg border font-mono transition-all ${
                                couponForm.applicableAreas.includes(pin)
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {pin}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="applicableCustomers" className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Direct Account Targeting (Emails)</Label>
                        <Input
                          id="applicableCustomers"
                          value={couponForm.applicableCustomers}
                          onChange={e => setCouponForm({ ...couponForm, applicableCustomers: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl h-10 text-xs focus-visible:ring-emerald-500/50 font-mono"
                          placeholder="user1@fitstay.in, user2@fitstay.in..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-zinc-900">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsCouponModalOpen(false)}
                      className="text-zinc-500 hover:text-white hover:bg-zinc-900 h-10 rounded-xl text-xs px-6"
                    >
                      Discard Changes
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white h-10 rounded-xl text-xs px-8 shadow-lg shadow-emerald-900/20 font-bold transition-all active:scale-95"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (couponModalMode === 'create' ? 'Launch Campaign' : 'Sync Changes')}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================
          DIALOG: CREATE / EDIT BANNER OFFER MODAL
          ===================================== */}
      <AnimatePresence>
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-black/80 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-white text-base">
                    {offerModalMode === "create" ? "Publish New Banner Offer" : `Modify Banner Offer: ${currentOffer?.title}`}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsOfferModalOpen(false)} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOffer} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Offer Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="offerTitle" className="text-zinc-400 text-xs">Offer Banner Title</Label>
                  <Input
                    id="offerTitle"
                    value={offerForm.title}
                    onChange={e => setOfferForm({ ...offerForm, title: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    placeholder="e.g. Taste the Keto Transformation"
                  />
                  {formErrors.title && <p className="text-rose-500 text-[10px]">{formErrors.title}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="offerDesc" className="text-zinc-400 text-xs">Offer Subtext Subtitle</Label>
                  <Input
                    id="offerDesc"
                    value={offerForm.description}
                    onChange={e => setOfferForm({ ...offerForm, description: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    placeholder="e.g. Organic, chef-curated low-carb keto subscriptions at ₹200 off!"
                  />
                </div>

                {/* Banner Image URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="bannerImage" className="text-zinc-400 text-xs">Banner Graphic Image URL</Label>
                  <Input
                    id="bannerImage"
                    value={offerForm.bannerImage}
                    onChange={e => setOfferForm({ ...offerForm, bannerImage: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-[11px] placeholder-zinc-600 rounded-lg h-9 focus-visible:ring-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Enter any valid Unsplash image URL or hosting resource path. It will display in checkout sliders.
                  </p>
                  {formErrors.bannerImage && <p className="text-rose-500 text-[10px]">{formErrors.bannerImage}</p>}
                </div>

                {/* Graphic Preview */}
                {offerForm.bannerImage && (
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Banner Mockup Preview</span>
                    <div className="h-28 w-full rounded-xl overflow-hidden border border-zinc-900 bg-zinc-900/50 flex items-center justify-center">
                      <img 
                        src={offerForm.bannerImage} 
                        alt="Offer preview" 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Redirect link URL */}
                  <div className="space-y-1.5">
                    <Label htmlFor="redirectUrl" className="text-zinc-400 text-xs">Client Redirect Link path</Label>
                    <select
                      value={offerForm.redirectUrl}
                      onChange={e => setOfferForm({ ...offerForm, redirectUrl: e.target.value })}
                      className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="/plans">Meal Subscription Plans Page</option>
                      <option value="/meals">Individual Cooked Meals Page</option>
                      <option value="/kitchen">Operations Kitchen Page</option>
                      <option value="/support">Help & Support Center</option>
                    </select>
                  </div>

                  {/* CTA Text */}
                  <div className="space-y-1.5">
                    <Label htmlFor="ctaText" className="text-zinc-400 text-xs">Button CTA Text</Label>
                    <Input
                      id="ctaText"
                      value={offerForm.ctaText}
                      onChange={e => setOfferForm({ ...offerForm, ctaText: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                      placeholder="e.g. Subscribe Now"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Offer Type */}
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">Campaign Category</Label>
                    <select
                      value={offerForm.offerType}
                      onChange={e => setOfferForm({ ...offerForm, offerType: e.target.value as any })}
                      className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Promotion">Promotion (Sales focus)</option>
                      <option value="Announcement">Announcement (General Info)</option>
                      <option value="Survey">Survey (Feedback focus)</option>
                      <option value="Update">Update (Product release)</option>
                    </select>
                  </div>

                  {/* Display Order */}
                  <div className="space-y-1.5">
                    <Label htmlFor="displayOrder" className="text-zinc-400 text-xs">CMS Display Order rank</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={offerForm.displayOrder}
                      onChange={e => setOfferForm({ ...offerForm, displayOrder: Number(e.target.value) })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.displayOrder && <p className="text-rose-500 text-[10px]">{formErrors.displayOrder}</p>}
                  </div>
                </div>

                {/* Multi-select applicable areas for Offer */}
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <Label className="text-zinc-400 text-xs block">Limit Visibility to Targeted PIN Zones (Leave empty for universal)</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1 border border-zinc-900 rounded-lg">
                    {areas.flatMap(a => a.pincodes || []).map(pin => (
                      <button
                        key={pin}
                        type="button"
                        onClick={() => {
                          const current = offerForm.applicableAreas || [];
                          const next = current.includes(pin) 
                            ? current.filter(p => p !== pin)
                            : [...current, pin];
                          setOfferForm({ ...offerForm, applicableAreas: next });
                        }}
                        className={`text-[10px] px-2 py-1 rounded-full border font-mono transition-colors ${
                          (offerForm.applicableAreas || []).includes(pin)
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {pin}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate" className="text-zinc-400 text-xs">Campaign Launch Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={offerForm.startDate}
                      onChange={e => setOfferForm({ ...offerForm, startDate: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate" className="text-zinc-400 text-xs">Campaign Expire Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={offerForm.endDate}
                      onChange={e => setOfferForm({ ...offerForm, endDate: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Status Availability */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs">CMS Banner Availability</Label>
                  <select
                    value={offerForm.status}
                    onChange={e => setOfferForm({ ...offerForm, status: e.target.value as any })}
                    className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active (Shows in banner carousels)</option>
                    <option value="Inactive">Inactive (Suppressed / Draft)</option>
                  </select>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 rounded-lg text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 rounded-lg text-xs px-4 shadow-md shadow-emerald-600/10 font-semibold"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Banner"}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
