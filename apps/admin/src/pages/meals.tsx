import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Eye, 
  X, 
  Loader2, 
  Sparkles, 
  Check, 
  Flame, 
  ShieldAlert, 
  Award, 
  TrendingUp, 
  IndianRupee, 
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Tag,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkle,
  Upload,
  Download,
  Layers,
  ShoppingBag,
  Info,
  UtensilsCrossed,
  DollarSign,
  Calendar
} from "lucide-react";
import { menuService } from "../services/menu";
import { MenuItem, MealVariant } from "../types";
import { useAuth } from "../contexts/auth-context";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Gorgeous high-quality curated healthy food imagery presets for the Taaza Bites vibe
const PRESET_IMAGES = [
  {
    name: "Detox Avocado Quinoa Bowl",
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    category: "Protein Bowls"
  },
  {
    name: "Summer Berry Greens & Nuts",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    category: "Salads"
  },
  {
    name: "Grilled Herb Salmon & Greens",
    url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80",
    category: "Subscription Meals"
  },
  {
    name: "Zesty Smashed Avocado Toast",
    url: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80",
    category: "Breakfast"
  },
  {
    name: "Fresh Strawberry Basil Smoothie",
    url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
    category: "Smoothies"
  },
  {
    name: "Gluten-Free Walnut Brownie",
    url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
    category: "Healthy Desserts"
  },
  {
    name: "Detox Cold Pressed Green Juice",
    url: "https://images.unsplash.com/photo-1610970881699-44a5587caa90?w=600&auto=format&fit=crop&q=80",
    category: "Juices"
  },
  {
    name: "Zucchini Veggie Protein Bowl",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    category: "Protein Bowls"
  }
];

const CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Smoothies",
  "Salads",
  "Protein Bowls",
  "Millet Meals",
  "Desserts",
  "Beverages",
  "Subscription Meals"
];

const MEAL_TYPES = [
  { name: "Veg", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { name: "Egg", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { name: "Chicken", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { name: "Fish", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
];

const TAG_OPTIONS = [
  "High Protein",
  "Weight Loss",
  "Muscle Gain",
  "Low Carb",
  "Diabetic Friendly"
];

export default function MenuPage() {
  const { user } = useAuth();
  
  const canManageMeals = user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Operations Manager' || user?.role === 'Nutritionist';

  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMealType, setSelectedMealType] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  // Form states
  const [mealName, setMealName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [mealType, setMealType] = useState("Veg");
  const [calories, setCalories] = useState(450);
  const [protein, setProtein] = useState(25);
  const [carbs, setCarbs] = useState(40);
  const [fat, setFat] = useState(15);
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [servingSize, setServingSize] = useState("1 Bowl (350g)");
  const [price, setPrice] = useState(299);
  const [offerPrice, setOfferPrice] = useState(0);
  const [preparationTime, setPreparationTime] = useState("15 Mins");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'Available' | 'Out of Stock'>('Available');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Draft'>('Active');
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variantSmallPrice, setVariantSmallPrice] = useState(0);
  const [variantSmallOffer, setVariantSmallOffer] = useState(0);
  const [variantRegularPrice, setVariantRegularPrice] = useState(0);
  const [variantRegularOffer, setVariantRegularOffer] = useState(0);
  const [variantLargePrice, setVariantLargePrice] = useState(0);
  const [variantLargeOffer, setVariantLargeOffer] = useState(0);

  // Manual image URL input
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Setup realtime subscription
  useEffect(() => {
    setLoading(true);
    // Menu items listener
    const unsubMenu = menuService.subscribeMenu(
      (data) => {
        setMenuItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load menu items");
        setLoading(false);
      }
    );

    // Categories listener
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
    const unsubCat = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubMenu();
      unsubCat();
    };
  }, []);

  // Sync selected category if preset category gets set or filters change
  const toggleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    setCurrentPage(1);
  };

  // Filter menuItems based on all parameters
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.mealName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesMealType = selectedMealType === "All" || item.mealType === selectedMealType;
    const matchesAvailability = selectedAvailability === "All" || item.availability === selectedAvailability;
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
    
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.every(t => item.tags?.includes(t));

    return matchesSearch && matchesCategory && matchesMealType && matchesAvailability && matchesStatus && matchesTags;
  });

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedItems.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAvailability = async (newAvail: 'Available' | 'Out of Stock') => {
    if (!user) return;
    try {
      setLoading(true);
      await Promise.all(
        selectedIds.map(id => menuService.updateMeal(id, { availability: newAvail }, user.id, user.email))
      );
      setSelectedIds([]);
    } catch (err: any) {
      alert("Error batch-updating availability: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatus = async (newStatus: 'Active' | 'Inactive') => {
    if (!user) return;
    try {
      setLoading(true);
      await Promise.all(
        selectedIds.map(id => menuService.updateMeal(id, { status: newStatus }, user.id, user.email))
      );
      setSelectedIds([]);
    } catch (err: any) {
      alert("Error batch-updating status: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to soft-delete ${selectedIds.length} meals?`)) return;
    try {
      setLoading(true);
      await Promise.all(
        selectedIds.map(id => menuService.deleteMeal(id, user.id, user.email, true))
      );
      setSelectedIds([]);
    } catch (err: any) {
      alert("Error batch soft-deleting: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dashboard Aggregates
  const totalMealsCount = menuItems.length;
  const activeMealsCount = menuItems.filter(item => item.status === 'Active').length;
  const breakfastCount = menuItems.filter(item => item.category === 'Breakfast').length;
  const lunchCount = menuItems.filter(item => item.category === 'Lunch').length;
  const dinnerCount = menuItems.filter(item => item.category === 'Dinner').length;
  const snacksCount = menuItems.filter(item => item.category === 'Snacks').length;
  const beveragesCount = menuItems.filter(item => item.category === 'Beverages' || item.category === 'Smoothies').length;
  const outOfStockMealsCount = menuItems.filter(item => item.availability === 'Out of Stock').length;
  const draftMealsCount = menuItems.filter(item => item.status === 'Draft').length;

  // Reset form helper
  const resetForm = () => {
    setMealName("");
    setShortDesc("");
    setFullDesc("");
    setCategory(CATEGORIES[0]);
    setMealType("Veg");
    setCalories(450);
    setProtein(25);
    setCarbs(40);
    setFat(15);
    setIngredients("");
    setAllergens("");
    setServingSize("1 Bowl (350g)");
    setPrice(299);
    setOfferPrice(0);
    setPreparationTime("15 Mins");
    setDisplayOrder(menuItems.length + 1);
    setTags([]);
    setAvailability('Available');
    setStatus('Active');
    setFeatured(false);
    setBestSeller(false);
    setRecommended(false);
    setImageUrls([]);
    setThumbnailUrl("");
    setHasVariants(false);
    setVariantSmallPrice(0);
    setVariantSmallOffer(0);
    setVariantRegularPrice(0);
    setVariantRegularOffer(0);
    setVariantLargePrice(0);
    setVariantLargeOffer(0);
    setManualImageUrl("");
  };

  // Open Add modal
  const handleOpenAdd = () => {
    resetForm();
    setFormMode("add");
    setActiveItem(null);
    setIsFormOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (item: MenuItem) => {
    setActiveItem(item);
    setFormMode("edit");
    setMealName(item.mealName || "");
    setShortDesc(item.shortDescription || "");
    setFullDesc(item.description || "");
    setCategory(item.category || CATEGORIES[0]);
    setMealType(item.mealType || "Veg");
    setCalories(item.calories || 0);
    setProtein(item.protein || 0);
    setCarbs(item.carbs || 0);
    setFat(item.fat || 0);
    setIngredients(item.ingredients || "");
    setAllergens(item.allergens || "");
    setServingSize(item.servingSize || "");
    setPrice(item.price || 0);
    setOfferPrice(item.offerPrice || 0);
    setPreparationTime(item.preparationTime || "15 Mins");
    setDisplayOrder(item.displayOrder || 1);
    setTags(item.tags || []);
    setAvailability(item.availability || 'Available');
    setStatus(item.status || 'Active');
    setFeatured(!!item.featured);
    setBestSeller(!!item.bestSeller);
    setRecommended(!!item.recommended);
    setImageUrls(item.imageUrls || []);
    setThumbnailUrl(item.thumbnailUrl || "");

    // Process variants
    if (item.variants && item.variants.length > 0) {
      setHasVariants(true);
      const small = item.variants.find(v => v.name === "Small");
      const regular = item.variants.find(v => v.name === "Regular");
      const large = item.variants.find(v => v.name === "Large");
      
      setVariantSmallPrice(small?.price || 0);
      setVariantSmallOffer(small?.offerPrice || 0);
      setVariantRegularPrice(regular?.price || 0);
      setVariantRegularOffer(regular?.offerPrice || 0);
      setVariantLargePrice(large?.price || 0);
      setVariantLargeOffer(large?.offerPrice || 0);
    } else {
      setHasVariants(false);
      setVariantSmallPrice(0);
      setVariantSmallOffer(0);
      setVariantRegularPrice(0);
      setVariantRegularOffer(0);
      setVariantLargePrice(0);
      setVariantLargeOffer(0);
    }
    
    setManualImageUrl("");
    setIsFormOpen(true);
  };

  // Handle Save
  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Compile variants array
    const compiledVariants: MealVariant[] = [];
    if (hasVariants) {
      if (variantSmallPrice > 0) {
        compiledVariants.push({
          name: "Small",
          price: variantSmallPrice,
          offerPrice: variantSmallOffer || undefined
        });
      }
      if (variantRegularPrice > 0) {
        compiledVariants.push({
          name: "Regular",
          price: variantRegularPrice,
          offerPrice: variantRegularOffer || undefined
        });
      }
      if (variantLargePrice > 0) {
        compiledVariants.push({
          name: "Large",
          price: variantLargePrice,
          offerPrice: variantLargeOffer || undefined
        });
      }
    }

    const payload = {
      mealName,
      shortDescription: shortDesc,
      description: fullDesc,
      category,
      mealType,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      ingredients,
      allergens,
      servingSize,
      price: Number(price),
      offerPrice: Number(offerPrice) || 0,
      preparationTime,
      displayOrder: Number(displayOrder),
      tags,
      availability,
      status,
      featured,
      bestSeller,
      recommended,
      thumbnailUrl: thumbnailUrl || imageUrls[0] || "",
      imageUrls,
      variants: compiledVariants
    };

    try {
      setLoading(true);
      if (formMode === "add") {
        await menuService.createMeal(payload, user.id, user.email);
      } else if (formMode === "edit" && activeItem) {
        await menuService.updateMeal(activeItem.id, payload, user.id, user.email);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      alert("Error saving meal protocol: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Duplicate meal protocol
  const handleDuplicate = async (id: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const newId = await menuService.duplicateMeal(id, user.id, user.email);
      console.log("Duplicated meal protocol successfully: " + newId);
    } catch (err: any) {
      alert("Failed to duplicate meal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Delete dialog
  const handleOpenDelete = (item: MenuItem) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };

  // Confirm delete (soft delete)
  const handleDeleteConfirm = async () => {
    if (!activeItem || !user) return;
    try {
      setLoading(true);
      await menuService.deleteMeal(activeItem.id, user.id, user.email, true);
      setIsDeleteOpen(false);
      setActiveItem(null);
    } catch (err: any) {
      alert("Failed to delete meal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop file upload processing
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64Url = event.target.result as string;
            setImageUrls(prev => {
              const updated = [...prev, base64Url];
              if (!thumbnailUrl && updated.length > 0) {
                setThumbnailUrl(base64Url);
              }
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const addManualUrl = () => {
    if (manualImageUrl.trim()) {
      setImageUrls(prev => {
        const updated = [...prev, manualImageUrl.trim()];
        if (!thumbnailUrl) {
          setThumbnailUrl(manualImageUrl.trim());
        }
        return updated;
      });
      setManualImageUrl("");
    }
  };

  const removeImage = (indexToRemove: number) => {
    const removedUrl = imageUrls[indexToRemove];
    const newUrls = imageUrls.filter((_, idx) => idx !== indexToRemove);
    setImageUrls(newUrls);
    if (thumbnailUrl === removedUrl) {
      setThumbnailUrl(newUrls[0] || "");
    }
  };

  // Tags dynamic selector
  const toggleFormTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs uppercase tracking-wider mb-1">
            <Sparkle className="h-4 w-4" /> Culinary Engine
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Menu Management
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm md:text-base max-w-2xl">
            Configure premium kitchen menu offerings, target macro-nutritional goals, build multi-sized pricing grids, and synchronize changes instantly with the storefront.
          </p>
        </div>
        
        {canManageMeals && (
          <div className="flex flex-col sm:flex-row gap-3 self-start md:self-center">
            <button
              onClick={() => toast.success("Exporting CSV...")}
              className="flex items-center justify-center px-4 py-3 bg-zinc-900 text-zinc-300 text-sm font-bold rounded-xl hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
            >
              Export CSV
            </button>
            <button
              onClick={() => toast.info("Import feature coming soon")}
              className="flex items-center justify-center px-4 py-3 bg-zinc-900 text-zinc-300 text-sm font-bold rounded-xl hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
            >
              Import CSV
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2.5 px-5 py-3 bg-emerald-500 text-zinc-950 text-sm font-bold rounded-xl hover:bg-emerald-400 shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5 stroke-[2.5px]" /> Add New Meal
            </button>
          </div>
        )}
      </div>

      {/* UNIFORM MENU MANAGEMENT SUB NAV TABS */}
      <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto  pb-0">
        {[
          { name: "Categories", path: "/meals/categories", icon: Layers },
          { name: "Meals Catalog", path: "/meals", icon: UtensilsCrossed },
          { name: "Pricing Engine", path: "/meals/pricing", icon: DollarSign },
          { name: "Availability Planner", path: "/meals/availability", icon: Calendar }
        ].map((tab) => {
          const isActive = location.pathname === tab.path;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`pb-3 text-sm font-semibold relative transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap px-1 select-none ${
                isActive ? "text-emerald-400 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <TabIcon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              {tab.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* DASHBOARD GRID CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
        {/* Card 1: Total Meals */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Meals</span>
            <Layers className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{totalMealsCount}</h3>
          </div>
        </div>

        {/* Card 2: Active Meals */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Meals</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-400">{activeMealsCount}</h3>
          </div>
        </div>

        {/* Card 3: Breakfast Items */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Breakfast</span>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{breakfastCount}</h3>
          </div>
        </div>

        {/* Card 4: Lunch Items */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Lunch</span>
            <UtensilsCrossed className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{lunchCount}</h3>
          </div>
        </div>

        {/* Card 5: Dinner Items */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Dinner</span>
            <Flame className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{dinnerCount}</h3>
          </div>
        </div>

        {/* Card 6: Snacks */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Snacks</span>
            <Tag className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{snacksCount}</h3>
          </div>
        </div>

        {/* Card 7: Beverages */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Beverages</span>
            <Sparkle className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{beveragesCount}</h3>
          </div>
        </div>

        {/* Card 8: Out of Stock */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-rose-500">{outOfStockMealsCount}</h3>
          </div>
        </div>

        {/* Card 9: Draft Meals */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Drafts</span>
            <Edit2 className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-400">{draftMealsCount}</h3>
          </div>
        </div>
      </div>

      {/* FILTER & MENU GRID CONTAINER */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Category Pills Slider */}
        <div className="px-6 pt-5 pb-3 border-b border-zinc-800/40 bg-zinc-900/10 overflow-x-auto flex gap-2.5 ">
          <button
            onClick={() => { setSelectedCategory("All"); setCurrentPage(1); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
              selectedCategory === "All"
                ? "bg-emerald-500 text-zinc-950 border-emerald-400"
                : "bg-zinc-900/50 text-zinc-400 border-zinc-800/60 hover:border-zinc-700 hover:text-white"
            }`}
          >
            🥗 All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400"
                    : "bg-zinc-900/50 text-zinc-400 border-zinc-800/60 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Filters Controls Panel */}
        <div className="p-5 border-b border-zinc-800/60 bg-zinc-900/40 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search meal name, tags or description..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              {/* Availability Filter */}
              <select
                value={selectedAvailability}
                onChange={(e) => { setSelectedAvailability(e.target.value); setCurrentPage(1); }}
                className="h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Availability</option>
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>

              {/* Meal Type Filter */}
              <select
                value={selectedMealType}
                onChange={(e) => { setSelectedMealType(e.target.value); setCurrentPage(1); }}
                className="h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Meal Types</option>
                <option value="Veg">Veg</option>
                <option value="Egg">Egg</option>
                <option value="Chicken">Chicken</option>
                <option value="Fish">Fish</option>
              </select>

              {/* Reset Filters button */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedMealType("All");
                  setSelectedAvailability("All");
                  setSelectedStatus("All");
                  setSelectedTags([]);
                  setCurrentPage(1);
                }}
                className="h-10 text-xs font-bold text-zinc-400 bg-zinc-900 hover:text-white border border-zinc-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Tags Filtering Grid */}
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/40 pt-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-zinc-500" /> Filter by Target:
            </span>
            {TAG_OPTIONS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all ${
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-zinc-950 text-zinc-500 border-zinc-800/60 hover:text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* MENU DATA TABLE */}
        <div className="overflow-x-auto">
          {loading && menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
              <p className="text-sm text-zinc-500 font-medium">Listening live to culinary Firestore stream...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 flex flex-col items-center gap-2">
              <ShieldAlert className="h-9 w-9" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 flex flex-col items-center gap-2.5">
              <ShoppingBag className="h-12 w-12 text-zinc-700" />
              <p className="text-zinc-400 font-bold text-base">No matching meal protocols found</p>
              <p className="text-xs text-zinc-600 max-w-sm">Adjust search keywords, tags, or clear filters to populate the live catalog.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/25">
                  <th className="py-4 px-6 text-center w-12">
                    <button 
                      onClick={handleSelectAll}
                      className="p-1 rounded text-zinc-500 hover:text-white"
                    >
                      {selectedIds.length === paginatedItems.length ? (
                        <CheckSquare className="h-4.5 w-4.5 text-emerald-500" />
                      ) : (
                        <Square className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4">Image & Meal Protocol</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Base / Offer Rate</th>
                  <th className="py-4 px-4">Macros</th>
                  <th className="py-4 px-4 text-center">Availability</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {paginatedItems.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const hasDisc = item.offerPrice > 0;
                  
                  // Get meal type color
                  const mealTypeColor = MEAL_TYPES.find(t => t.name === item.mealType)?.color || "bg-zinc-800 text-zinc-400";
                  
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.25 }}
                      className={`hover:bg-zinc-900/25 group transition-colors ${
                        isSelected ? "bg-emerald-500/5 hover:bg-emerald-500/10 border-l-2 border-l-emerald-500" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleSelectItem(item.id)}
                          className={`p-1 rounded ${isSelected ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400"}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4.5 w-4.5" />
                          ) : (
                            <Square className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </td>

                      {/* Image & Meal Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-zinc-800 flex-shrink-0">
                            <img
                              src={item.thumbnailUrl || PRESET_IMAGES[0].url}
                              alt={item.mealName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform"
                            />
                            {(item.featured || item.bestSeller || item.recommended) && (
                              <div className="absolute top-1 left-1 bg-amber-500 text-zinc-950 p-0.5 rounded-md shadow-lg">
                                <Award className="h-2.5 w-2.5 stroke-[3px]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {item.mealName}
                              {item.displayOrder !== undefined && (
                                <span className="text-[9px] text-zinc-600 font-mono">#{item.displayOrder}</span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 max-w-[240px] truncate" title={item.shortDescription}>
                              {item.shortDescription || "No short description."}
                            </div>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.map(t => (
                                  <span key={t} className="px-1.5 py-0.5 text-[8px] font-bold tracking-wide rounded bg-zinc-800 text-zinc-400">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                          {item.category}
                        </span>
                      </td>

                      {/* Meal Type */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-md ${mealTypeColor}`}>
                          {item.mealType}
                        </span>
                      </td>

                      {/* Pricing / Rates */}
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          {item.variants && item.variants.length > 0 ? (
                            <div className="text-xs text-zinc-300">
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Sizes available</span>
                              <span className="font-bold text-emerald-400">₹{Math.min(...item.variants.map(v => v.offerPrice || v.price))}</span>
                              <span className="text-zinc-500 text-[10px] font-mono"> to </span>
                              <span className="font-bold text-emerald-400">₹{Math.max(...item.variants.map(v => v.price))}</span>
                            </div>
                          ) : hasDisc ? (
                            <>
                              <span className="font-bold text-emerald-400 text-sm">₹{item.offerPrice}</span>
                              <span className="text-zinc-500 line-through text-[10px] ml-1.5">₹{item.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-zinc-300 text-sm">₹{item.price}</span>
                          )}
                          {!item.variants && <span className="text-zinc-600 block text-[9px] mt-0.5">{item.servingSize || "Standard sizing"}</span>}
                        </div>
                      </td>

                      {/* Nutrition values */}
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-amber-500 flex items-center gap-0.5">
                            <Flame className="h-3 w-3" /> {item.calories} kcal
                          </span>
                          <span className="text-zinc-500 block text-[9px] font-mono mt-0.5">
                            P: <span className="text-zinc-300 font-semibold">{item.protein}g</span> | C: {item.carbs}g | F: {item.fat}g
                          </span>
                        </div>
                      </td>

                      {/* Availability status */}
                      <td className="py-4 px-4 text-center">
                        {item.availability === "Available" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                            Active Prep
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                            No Stock
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {item.status === "Active" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase bg-zinc-900 border border-zinc-800 text-emerald-500 rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" /> Hidden
                          </span>
                        )}
                      </td>
                      {/* Action trigger buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManageMeals ? (
                            <>
                              {/* Edit Item */}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Meal Protocol"
                                className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 transition-all active:scale-95"
                              >
                                <Edit2 className="h-4.5 w-4.5" />
                              </button>

                              {/* Duplicate Item */}
                              <button
                                onClick={() => handleDuplicate(item.id)}
                                title="Duplicate Entry"
                                className="p-2 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 transition-all active:scale-95"
                              >
                                <Copy className="h-4.5 w-4.5" />
                              </button>

                              {/* Soft Delete */}
                              <button
                                onClick={() => handleOpenDelete(item)}
                                title="Soft Delete Meal"
                                className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-zinc-500 text-xs">Read Only</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION BOTTOM FOOTER BAR */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-500 font-medium">
              Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-emerald-400 font-bold">{totalItems}</span> matching protocols
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 text-xs font-bold rounded-lg border transition-all ${
                      isCurrent
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING STICKY BULK ACTION BAR */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl bg-zinc-950 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-black p-4 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl font-black text-sm border border-emerald-500/30">
                {selectedIds.length} Selected
              </div>
              <span className="text-xs text-zinc-400 font-semibold">Bulk Actions Console:</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
              {/* Set availability */}
              <button
                onClick={() => handleBulkAvailability('Available')}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 text-xs font-bold rounded-xl transition-colors"
              >
                Mark Available
              </button>
              <button
                onClick={() => handleBulkAvailability('Out of Stock')}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800 text-xs font-bold rounded-xl transition-colors"
              >
                Mark Out of Stock
              </button>

              {/* Set status */}
              <button
                onClick={() => handleBulkStatus('Active')}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold rounded-xl transition-colors"
              >
                Go Live
              </button>
              <button
                onClick={() => handleBulkStatus('Inactive')}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 border border-zinc-800 text-xs font-bold rounded-xl transition-colors"
              >
                Hide
              </button>

              {/* Delete selected */}
              <button
                onClick={handleBulkDelete}
                className="px-3.5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/25 text-xs font-bold rounded-xl transition-colors"
              >
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="p-2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: ADD / EDIT CULINARY PROTOCOL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60 sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
                    {formMode === "add" ? "Design Culinary Protocol" : `Modify Protocol: ${mealName}`}
                  </h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Define ingredients, precise nutritional targets, customized sizing grid, and promotional flags.</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveMeal} className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* section 1: Basic descriptors */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 border-b border-zinc-800 pb-2 mb-4">
                    1. Identity & Descriptors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Meal Name */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Meal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Smashed Avocado Protein Medley"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Menu Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        {Array.from(new Set([...CATEGORIES, ...categories.map(c => c.name)])).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Short storefront Description */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Short Tagline (appears in browsing grid)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Creamy whipped avocado paired with free-range eggs on toasted flax sourdough."
                        value={shortDesc}
                        onChange={(e) => setShortDesc(e.target.value)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Full Description */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Full Culinary Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the texture, organic source suppliers, or gourmet cooking method behind this meal..."
                        value={fullDesc}
                        onChange={(e) => setFullDesc(e.target.value)}
                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    {/* Ingredients */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Ingredients List
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Avocado, Sourdough Bread, Eggs, Olive Oil, Pumpkin Seeds, microgreens..."
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    {/* Allergens */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Allergens Alert
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Gluten, Egg, Sesame. Leave blank if none."
                        value={allergens}
                        onChange={(e) => setAllergens(e.target.value)}
                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                  </div>
                </div>

                {/* Section 2: Pricing, Sizing & Sizing Variants */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 border-b border-zinc-800 pb-2 mb-4">
                    2. Pricing, Sizing & Variants Grid
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Price */}
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                          Standard Base Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={price || ""}
                          onChange={(e) => setPrice(Number(e.target.value) || 0)}
                          className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Offer price */}
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                          Offer Price (₹, 0 for no discount)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={offerPrice || ""}
                          onChange={(e) => setOfferPrice(Number(e.target.value) || 0)}
                          className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Serving Size */}
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                          Serving Size Description
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 1 Bowl (350g) or 250ml"
                          value={servingSize}
                          onChange={(e) => setServingSize(e.target.value)}
                          className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* HAS CUSTOM VARIANTS SELECTOR */}
                    <div className="bg-zinc-950/40 p-4 border border-zinc-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Enable Portion Variants (Small, Regular, Large)</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Toggle to define custom pricing grids for customers who prefer customized meal sizes.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHasVariants(!hasVariants)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            hasVariants ? 'bg-emerald-500' : 'bg-zinc-850 border border-zinc-800'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-zinc-950 transition-transform ${
                              hasVariants ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {hasVariants && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-zinc-800/40 animate-in fade-in duration-300">
                          {/* Small variant */}
                          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                            <span className="text-xs font-bold text-zinc-300 uppercase block border-b border-zinc-800 pb-1">Portion: Small</span>
                            <div>
                              <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Small Price (₹)</label>
                              <input
                                type="number"
                                value={variantSmallPrice || ""}
                                onChange={(e) => setVariantSmallPrice(Number(e.target.value) || 0)}
                                className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Small Offer (₹)</label>
                              <input
                                type="number"
                                value={variantSmallOffer || ""}
                                onChange={(e) => setVariantSmallOffer(Number(e.target.value) || 0)}
                                className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Regular variant */}
                          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                            <span className="text-xs font-bold text-zinc-300 uppercase block border-b border-zinc-800 pb-1">Portion: Regular</span>
                            <div>
                              <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Regular Price (₹)</label>
                              <input
                                type="number"
                                value={variantRegularPrice || ""}
                                onChange={(e) => setVariantRegularPrice(Number(e.target.value) || 0)}
                                className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Regular Offer (₹)</label>
                              <input
                                type="number"
                                value={variantRegularOffer || ""}
                                onChange={(e) => setVariantRegularOffer(Number(e.target.value) || 0)}
                                className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Large variant */}
                          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                            <span className="text-xs font-bold text-zinc-300 uppercase block border-b border-zinc-800 pb-1">Portion: Large</span>
                            <div>
                              <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Large Price (₹)</label>
                              <input
                                type="number"
                                value={variantLargePrice || ""}
                                onChange={(e) => setVariantLargePrice(Number(e.target.value) || 0)}
                                className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Large Offer (₹)</label>
                              <input
                                type="number"
                                value={variantLargeOffer || ""}
                                onChange={(e) => setVariantLargeOffer(Number(e.target.value) || 0)}
                                className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Nutritional Macros & Type */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 border-b border-zinc-800 pb-2 mb-4">
                    3. Macro-nutritional Profile & Dietary Group
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    
                    {/* Meal Type Group Selection */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Dietary Group <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Veg">Veg (Pure Vegetarian)</option>
                        <option value="Egg">Egg (Contains Eggs)</option>
                        <option value="Chicken">Chicken (Poultry)</option>
                        <option value="Fish">Fish (Seafood)</option>
                      </select>
                    </div>

                    {/* Calories */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Calories (kcal) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={calories || ""}
                        onChange={(e) => setCalories(Number(e.target.value) || 0)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Protein */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Protein (grams) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={protein || ""}
                        onChange={(e) => setProtein(Number(e.target.value) || 0)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Carbs */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Carbohydrates (g) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={carbs || ""}
                        onChange={(e) => setCarbs(Number(e.target.value) || 0)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Fats */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Fats (grams) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={fat || ""}
                        onChange={(e) => setFat(Number(e.target.value) || 0)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                  </div>
                </div>

                {/* Section 4: Image Management */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 border-b border-zinc-800 pb-2 mb-4">
                    4. Gallery, Thumbnail & Presets
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/40 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 relative"
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-8 w-8 text-zinc-500 mx-auto" />
                      <p className="text-xs font-semibold text-zinc-300">Drag & Drop product food photos here, or click to browse</p>
                      <p className="text-[10px] text-zinc-500">Supports PNG, JPEG. Images converted to localized Firestore base64 streams instantly.</p>
                    </div>

                    {/* Quick Manual image URL input */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste any custom web image URL..."
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        className="flex-1 h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addManualUrl}
                        className="px-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-bold text-white rounded-xl transition-all"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Presets Grid */}
                    <div className="space-y-2">
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Select from healthy organic food presets:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                        {PRESET_IMAGES.map((p, idx) => {
                          const isAlreadyInGallery = imageUrls.includes(p.url);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!isAlreadyInGallery) {
                                  setImageUrls([...imageUrls, p.url]);
                                  if (!thumbnailUrl) setThumbnailUrl(p.url);
                                }
                              }}
                              className={`relative aspect-video rounded-xl overflow-hidden border transition-all ${
                                isAlreadyInGallery 
                                  ? "border-emerald-500 scale-[0.97] opacity-60 cursor-not-allowed" 
                                  : "border-zinc-800 hover:border-zinc-700"
                              }`}
                            >
                              <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 text-[8px] font-semibold text-zinc-300 truncate">
                                {p.name}
                              </div>
                              {isAlreadyInGallery && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-emerald-400 stroke-[3px]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Uploaded Image Grid (Thumbnail selection) */}
                    {imageUrls.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active Meal Gallery (Click to make cover picture):</label>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                          {imageUrls.map((url, index) => {
                            const isThumb = thumbnailUrl === url;
                            return (
                              <div
                                key={index}
                                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                  isThumb ? "border-amber-500 scale-[1.02] shadow-lg shadow-amber-500/10" : "border-zinc-800"
                                }`}
                              >
                                <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                                
                                {/* Overlay controllers */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                  <button
                                    type="button"
                                    onClick={() => setThumbnailUrl(url)}
                                    className="bg-amber-500 text-zinc-950 p-1.5 rounded-lg text-[9px] font-extrabold uppercase self-start"
                                  >
                                    Set Thumbnail
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="bg-rose-600 text-white p-1 rounded-lg self-end"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {isThumb && (
                                  <span className="absolute top-1.5 right-1.5 bg-amber-500 text-zinc-950 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                    Cover
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 5: Target Goal Tags & Storefront promotion */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 border-b border-zinc-800 pb-2 mb-4">
                    5. Target Targets & Storefront Badging
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tags selectors */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Target Health Program Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map(opt => {
                          const hasTag = tags.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleFormTag(opt)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                                hasTag
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                                  : "bg-zinc-950 text-zinc-500 border-zinc-800/80 hover:text-zinc-300"
                              }`}
                            >
                              {hasTag ? <CheckCircle className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Promotional Badges checkboxes */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-3">
                        Promotional Badges (Highlights)
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 hover:text-white select-none">
                          <input
                            type="checkbox"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="accent-emerald-500"
                          />
                          Featured Meal
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 hover:text-white select-none">
                          <input
                            type="checkbox"
                            checked={bestSeller}
                            onChange={(e) => setBestSeller(e.target.checked)}
                            className="accent-emerald-500"
                          />
                          Best Seller
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 hover:text-white select-none">
                          <input
                            type="checkbox"
                            checked={recommended}
                            onChange={(e) => setRecommended(e.target.checked)}
                            className="accent-emerald-500"
                          />
                          Recommended
                        </label>
                      </div>
                    </div>

                    {/* Preparation Time */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Preparation Time Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 Mins"
                        value={preparationTime}
                        onChange={(e) => setPreparationTime(e.target.value)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* Sorting Display order */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Display Sorting Order
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* Availability selector */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Kitchen Availability
                      </label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as any)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="Available">Available (In stock / Ready to prep)</option>
                        <option value="Out of Stock">Out of Stock (Awaiting ingredient log)</option>
                      </select>
                    </div>

                    {/* Storefront status */}
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                        Storefront Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="Active">Active (Live in customer store catalogs)</option>
                        <option value="Inactive">Inactive (Hidden from customers)</option>
                        <option value="Draft">Draft (Work in Progress)</option>
                      </select>
                    </div>

                  </div>
                </div>

              </form>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 sticky bottom-0 z-10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMeal}
                  disabled={loading || !mealName}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-zinc-950 text-sm font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10 transition-all"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Deploy Protocol
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* MODAL 3: SOFT DELETE CONFIRM DIALOG */}
      <AnimatePresence>
        {isDeleteOpen && activeItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <ShieldAlert className="h-6 w-6 text-rose-500" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">Decommission Meal Protocol?</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    You are soft-deleting <span className="text-white font-semibold">"{activeItem.mealName}"</span>. It will be hidden from the storefront catalog and kitchen lists but preserved under secure administrator history.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/20 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-zinc-950 text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-rose-500/10"
                >
                  Soft-Delete Meal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
