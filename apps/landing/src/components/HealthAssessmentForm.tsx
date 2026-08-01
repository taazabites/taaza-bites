import { WHATSAPP_NUMBER } from '../config';
import React, { useState, useEffect } from "react";
import { useToast } from './Toast';
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Activity, Apple, Check, ChevronRight, MapPin, Stethoscope, User, CalendarDays, ArrowLeft, ChevronDown, Circle, ArrowRight, MessageCircle, Utensils, Leaf, Coffee, Sun, Moon, Clock, Navigation, Compass, Loader2, Flame, Heart, TrendingDown, TrendingUp, Dumbbell, Award, ShieldAlert, Copy } from "lucide-react";

const STEPS = [
  { title: "Basic Details", description: "Let's start with the basics.", icon: User },
  { title: "Goal & Plan", description: "What are you trying to achieve?", icon: Activity },
  { title: "Food Preferences", description: "Tell us about your diet & lifestyle.", icon: Apple },
  { title: "Medical Details", description: "Important health & medical details.", icon: Stethoscope },
  { title: "Lifestyle", description: "Your daily habits & activity levels.", icon: Flame },
  { title: "Delivery Address", description: "Where should we deliver your meals?", icon: MapPin },
];

export const HealthAssessmentForm: React.FC = () => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  // Smooth scroll to top and defensively clamp currentStep when step changes
  useEffect(() => {
    const totalSteps = STEPS?.length ?? 6;
    if (currentStep < 0) {
      setCurrentStep(0);
    } else if (currentStep >= totalSteps) {
      setCurrentStep(totalSteps - 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [formData, setFormData] = useState({
    // Section 1
    fullName: "",
    phone: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    // Section 2
    primaryGoal: "",
    planDuration: "3", // Minimum 3 days
    mealPreference: "",
    // Section 3 (Combined mostly)
    detoxWater: 0,
    detoxJuices: 0,
    smoothies: 0,
    noAddons: false,
    addonPreference: "",
    // Section 4
    dietPreference: "",
    nonVegPreference: "",
    // Section 5
    medicalConditions: "",
    otherMedical: "",
    allergies: "",
    // Section 6
    activityLevel: "",
    sleep: "",
    stressLevel: "",
    junkFood: "",
    breakfastTime: "",
    lunchTime: "",
    dinnerTime: "",
    digestiveIssues: "",
    // Section 8
    addressLine1: "",
    apartmentArea: "",
    pincode: "",
    city: "",
    deliverySlots: "",
    googleMapsLink: "",
  });

  const [customMeals, setCustomMeals] = useState<{
    breakfastTime: boolean;
    lunchTime: boolean;
    dinnerTime: boolean;
  }>({
    breakfastTime: false,
    lunchTime: false,
    dinnerTime: false,
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");

  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setIsDetecting(true);
    setLocationStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en"
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            const road = data.address?.road || data.address?.house_number || data.address?.street || "";
            const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || data.address?.city_district || "";
            const rawPostcode = data.address?.postcode || "";
            const postcode = rawPostcode.replace(/\D/g, "").slice(0, 6);
            const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.state_district || "Bangalore";
            
            let addressLine1 = road;
            if (!addressLine1 && data.display_name) {
              addressLine1 = data.display_name.split(',')[0] || "";
            }

            setFormData((prev) => ({
              ...prev,
              addressLine1: addressLine1,
              apartmentArea: suburb,
              pincode: postcode,
              city: city,
              googleMapsLink: googleMapsLink,
            }));
            setLocationStatus("success");
            showToast("Location detected and address auto-filled!", "success");
          } else {
            setFormData((prev) => ({
              ...prev,
              googleMapsLink: googleMapsLink,
            }));
            setLocationStatus("success");
            showToast("Coordinates detected! Please fill in your address.", "success");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setFormData((prev) => ({
            ...prev,
            googleMapsLink: googleMapsLink,
          }));
          setLocationStatus("success");
          showToast("Coordinates detected! Please fill in your address.", "success");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetecting(false);
        setLocationStatus("error");
        let errorMsg = "Unable to retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access was denied. Please enable permission in your browser.";
        }
        showToast(errorMsg, "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (submitStatus === "success") {
      // Primary explosive burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      })?.catch(e => console.warn("Confetti", e));
      
      // Secondary playful delayed sparks for duration
      const end = Date.now() + 2 * 1000;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }

        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        })?.catch(e => console.warn("Confetti", e));
      }, 200);

      return () => clearInterval(interval);
    }
  }, [submitStatus]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuantity = (field: string, operation: "add" | "sub") => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        operation === "add"
          ? (prev[field as keyof typeof prev] as number) + 1
          : Math.max(0, (prev[field as keyof typeof prev] as number) - 1),
    }));
  };

  const nextStep = () => {
    // Validate required fields based on step before advancing
    const form = document.getElementById("assessment-form") as HTMLFormElement;
    if (form) {
      if (!form.reportValidity()) {
        return;
      }
    }
    const maxStep = (STEPS?.length ?? 6) - 1;
    if (currentStep < maxStep) {
      setDirection(1);
      setCurrentStep((c) => Math.min(maxStep, c + 1));
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((c) => Math.max(0, c - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxStep = (STEPS?.length ?? 6) - 1;
    if (currentStep !== maxStep) {
      nextStep();
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const h = parseFloat(formData.height);
      const w = parseFloat(formData.weight);
      const bmi = (h && w && h > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : "N/A";

      const message = `*✨ New Health Assessment ✨*
*Name*: ${formData.fullName}
*Phone*: ${formData.phone}
*Age/Gender*: ${formData.age} / ${formData.gender}
*Height/Weight*: ${formData.height}cm / ${formData.weight}kg (BMI: ${bmi})

*🎯 Goal/Plan*: ${formData.primaryGoal} for ${formData.planDuration} Days
*Meal Preference*: ${formData.mealPreference}
*Diet Preference*: ${formData.dietPreference}
${formData.nonVegPreference ? `*Non-Veg Preference*: ${formData.nonVegPreference}\n` : ''}
*❤️ Health Details*:
*Medical Conditions*: ${formData.medicalConditions || 'None'} ${formData.otherMedical ? `(${formData.otherMedical})` : ''}
*Allergies*: ${formData.allergies || 'None'}
*Stress / Sleep / Activity*: ${formData.stressLevel || 'N/A'} / ${formData.sleep || 'N/A'}hrs / ${formData.activityLevel || 'N/A'}
*Eating Schedule*: Breakfast: ${formData.breakfastTime || 'N/A'}, Lunch: ${formData.lunchTime || 'N/A'}, Dinner: ${formData.dinnerTime || 'N/A'}

*📍 Delivery Details*:
*Address*: ${formData.addressLine1}${formData.apartmentArea ? `, ${formData.apartmentArea}` : ''}, ${formData.city} - ${formData.pincode}
*Slot*: ${formData.deliverySlots}
*Map Link*: ${formData.googleMapsLink || 'N/A'}`;

      setSubmittedMessage(message);

      // Submit assessment data to the backend API asynchronously (no await to preserve user gesture)
      fetch("/api/health-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })?.catch((apiError) => {
        console.error("Failed to post health assessment to backend API:", apiError);
      });

      setSubmitStatus("success");
      showToast("Health preferences saved successfully!", "success");
      
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      const opened = window.open(whatsappUrl, '_blank');
      if (!opened) {
         window.location.href = whatsappUrl;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (submitStatus === "success") {
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(submittedMessage)}`;
    return (
      <div className="min-h-screen bg-[#F5F2ED] py-12 sm:py-24 px-4 flex items-center justify-center">
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100 max-w-xl w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-[#059669]"/>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-3">
            Assessment Submitted!
          </h2>
          <p className="text-sm text-gray-600 mb-6 font-light leading-relaxed max-w-md mx-auto">
            We are opening WhatsApp with your personalized health assessment. If it didn't open automatically, please click the button below to initiate your consultation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white rounded-full font-bold uppercase tracking-wider text-xs sm:text-sm transition-all shadow-md shadow-[#059669]/20 gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" /> Send Message
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(submittedMessage);
                showToast("Message copied to clipboard!", "success");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-full font-medium text-xs sm:text-sm transition-all gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" /> Copy Message
            </button>
          </div>

          {submittedMessage && (
            <div className="text-left bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 mb-8 max-h-48 overflow-y-auto">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Message Preview:</span>
              <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{submittedMessage}</pre>
            </div>
          )}

          <button
            onClick={() => {
              window.history.pushState(null, "", "/");
              window.dispatchEvent(new Event("popstate"));
            }}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer underline underline-offset-4"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-96 bg-[#059669] -skew-y-3 origin-top-left -z-10 opacity-10"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-200 blur-3xl opacity-30 rounded-full"></div>

      {/* Floating Back Button */}
      <button 
         onClick={() => {
            window.history.pushState(null, "", "/subscriptions");
            window.dispatchEvent(new Event("popstate"));
         }}
         className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/50 hover:bg-white backdrop-blur flex items-center justify-center w-12 h-12 rounded-full shadow-sm hover:shadow-md transition-all text-gray-700"
         title="Go Back"
      >
         <ArrowLeft />
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4 tracking-tight">
            Health Assessment
          </h1>
          <p className="text-gray-600 font-light max-w-lg mx-auto">
            Craft your perfect meal plan profile. Tell us your goals, and let
            our experts compile your personalized nutrition schedule.
          </p>
        </div>

        {/* Modern Stepper */}
        <div className="mb-10 px-4 md:px-0">
          <div className="flex items-center justify-between relative flex-nowrap w-full">
            <div className="absolute left-0 top-1/2 -mt-[2px] w-full h-[4px] bg-white border border-gray-100 rounded-full -z-10 shadow-sm"></div>
            <motion.div 
               className="absolute left-0 top-1/2 -mt-[2px] h-[4px] bg-[#059669] rounded-full -z-10 shadow-[0_0_10px_rgba(5,150,105,0.4)]"
               initial={{ width: "0%" }}
               animate={{ width: `${((((STEPS?.length ?? 0) > 1) ? (currentStep / ((STEPS?.length ?? 0) - 1)) : 0) * 100)}%` }}
               transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {(STEPS ?? [])?.map((step, idx) => {
              const StepIcon = step?.icon || User;
              const isCompleted = currentStep > idx;
              const isCurrent = currentStep === idx;
              return (
                <div key={idx} className="relative flex flex-col items-center group shrink-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all duration-500 ${isCompleted ? 'bg-[#059669] text-white shadow-lg shadow-[#059669]/30 scale-95' : isCurrent ? 'bg-white border-2 border-[#059669] text-[#059669] shadow-xl scale-110' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                    {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <StepIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${isCurrent ? 'opacity-100' : 'opacity-50'}`} />}
                  </div>
                  {/* Tooltip for desktop */}
                  <div className={`hidden md:block absolute top-full mt-3 px-3 py-1.5 bg-gray-900 text-white text-[10px] uppercase tracking-widest rounded shadow-xl whitespace-nowrap pointer-events-none transition-all duration-300 z-20 ${isCurrent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    {step?.title || ""}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] flex flex-col relative">
          {/* Header for current step */}
            {(() => {
                const currentStepInfo = (STEPS?.[currentStep]) || (STEPS?.[0]) || { title: "", description: "", icon: User };
                const Icon = currentStepInfo.icon || User;
                return (
                  <div className="p-6 sm:p-10 border-b border-gray-100 bg-white flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-serif text-gray-900">
                          {currentStepInfo?.title || ""}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {currentStepInfo?.description || ""}
                        </p>
                    </div>
                  </div>
                );
            })()}

          {/* Step Content */}
          <div className="p-5 sm:p-8 flex-1 relative overflow-x-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="w-full"
              >
                <form
                  id="assessment-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Step 0: Basic Details */}
                  {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 relative">
                        <input
                          required
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder=" "
                          className="peer w-full px-4 pt-6 pb-2 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all bg-white"
                        />
                        <label
                          htmlFor="fullName"
                          className="absolute left-4 top-4 text-xs font-medium text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 transition-all pointer-events-none uppercase tracking-wider peer-focus:text-[#059669]"
                        >
                          Full Name *
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          pattern="[0-9]{10}"
                          placeholder=" "
                          className="peer w-full px-4 pt-6 pb-2 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all bg-white"
                        />
                        <label
                          htmlFor="phone"
                          className="absolute left-4 top-4 text-xs font-medium text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 transition-all pointer-events-none uppercase tracking-wider peer-focus:text-[#059669]"
                        >
                          WhatsApp Number *
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder=" "
                          className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-gray-50/50"
                        />
                        <label
                          htmlFor="age"
                          className="absolute left-4 top-4 text-xs font-medium text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 transition-all pointer-events-none uppercase tracking-wider"
                        >
                          Age *
                        </label>
                      </div>
                      <div className="relative">
                        <select
                          required
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-gray-50/50 appearance-none"
                        >
                          <option value="" disabled hidden></option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <label
                          htmlFor="gender"
                          className={`absolute left-4 top-2 text-xs font-medium text-gray-400 transition-all pointer-events-none uppercase tracking-wider ${!formData.gender ? "top-4 text-base" : ""}`}
                        >
                          Gender *
                        </label>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>
                      <div className="hidden md:block"></div>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          id="height"
                          name="height"
                          value={formData.height}
                          onChange={handleChange}
                          placeholder=" "
                          className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-gray-50/50"
                        />
                        <label
                          htmlFor="height"
                          className="absolute left-4 top-4 text-xs font-medium text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 transition-all pointer-events-none uppercase tracking-wider"
                        >
                          Height (cm) *
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          step="0.1"
                          id="weight"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          placeholder=" "
                          className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-gray-50/50"
                        />
                        <label
                          htmlFor="weight"
                          className="absolute left-4 top-4 text-xs font-medium text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 transition-all pointer-events-none uppercase tracking-wider"
                        >
                          Weight (kg) *
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Goal & Plan */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Primary Goal *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { name: "Weight Loss", icon: TrendingDown },
                            { name: "Weight Gain", icon: TrendingUp },
                            {
                              name: "Healthy Maintenance",
                              icon: Heart,
                            },
                            { name: "Muscle Building", icon: Dumbbell },
                            {
                              name: "Medical Condition",
                              icon: ShieldAlert,
                            },
                          ].map((goal) => {
                            const GoalIcon = goal?.icon || Heart;
                            const goalName = goal?.name || "";
                            return (
                              <label
                                key={goalName}
                                className={`flex flex-col items-center justify-center p-5 border rounded-2xl cursor-pointer transition-all text-center text-xs font-semibold ${formData.primaryGoal === goalName ? "border-[#059669] bg-[#059669]/5 text-[#059669] shadow-inner ring-2 ring-[#059669]/20" : "border-gray-200 text-gray-600 hover:border-[#059669]/50 hover:bg-white bg-gray-50/50"}`}
                              >
                                <input
                                  type="radio"
                                  name="primaryGoal"
                                  value={goalName}
                                  checked={formData.primaryGoal === goalName}
                                  onChange={handleChange}
                                  className="hidden"
                                />
                                <GoalIcon
                                  className={`w-7 h-7 mb-3 transition-colors ${formData.primaryGoal === goalName ? "text-[#059669]" : "text-gray-400"}`}
                                />
                                {goalName}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Meal Preference *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { name: "All Meals (Breakfast + Lunch + Dinner)", icon: Utensils, label: "All Meals" },
                            { name: "Lunch + Dinner", icon: Apple, label: "Lunch + Dinner" },
                            { name: "Only Lunch", icon: Sun, label: "Only Lunch" },
                            { name: "Only Dinner", icon: Moon, label: "Only Dinner" },
                          ].map((meal) => {
                            const MealIcon = meal?.icon || Utensils;
                            const mealName = meal?.name || "";
                            const mealLabel = meal?.label || "";
                            return (
                              <label
                                key={mealName}
                                className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all text-sm font-medium ${formData.mealPreference === mealName ? "border-[#059669] bg-[#059669]/5 text-[#059669] shadow-inner" : "border-gray-200 text-gray-600 hover:border-[#059669]/50 hover:bg-white bg-gray-50/50"}`}
                              >
                                <input
                                  type="radio"
                                  name="mealPreference"
                                  value={mealName}
                                  checked={formData.mealPreference === mealName}
                                  onChange={handleChange}
                                  required
                                  className="hidden"
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${formData.mealPreference === mealName ? "bg-[#059669] text-white shadow-md shadow-[#059669]/20" : "bg-white border text-gray-400"}`}>
                                  <MealIcon className="w-5 h-5" />
                                </div>
                                <span className="leading-tight flex-1">{mealLabel}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plan Duration (Days) *
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            required
                            type="number"
                            name="planDuration"
                            value={formData.planDuration}
                            onChange={handleChange}
                            min="3"
                            className="w-32 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-gray-50/50"
                          />
                          <span className="text-sm text-gray-500">
                            Minimum 3 days
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Food Preferences */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Diet Preference *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { name: "Vegetarian", icon: Leaf },
                            { name: "Non-Vegetarian", icon: Utensils },
                            { name: "Vegan", icon: Apple },
                            { name: "Eggetarian", icon: Coffee },
                            { name: "Jain (No Onion/Garlic)", icon: Heart },
                          ].map((diet) => {
                            const DietIcon = diet?.icon || Leaf;
                            const dietName = diet?.name || "";
                            return (
                              <label
                                key={dietName}
                                className={`flex flex-col items-center justify-center p-5 border rounded-2xl cursor-pointer transition-all text-center text-xs font-semibold ${formData.dietPreference === dietName ? "border-[#059669] bg-[#059669]/5 text-[#059669] shadow-inner ring-2 ring-[#059669]/20" : "border-gray-200 text-gray-600 hover:border-[#059669]/50 hover:bg-white bg-gray-50/50"}`}
                              >
                                <input
                                  type="radio"
                                  name="dietPreference"
                                  value={dietName}
                                  checked={formData.dietPreference === dietName}
                                  onChange={handleChange}
                                  className="hidden"
                                />
                                <DietIcon
                                  className={`w-7 h-7 mb-3 transition-colors ${formData.dietPreference === dietName ? "text-[#059669]" : "text-gray-400"}`}
                                />
                                {dietName}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: ["Non-Vegetarian", "Eggetarian"].includes(
                            formData.dietPreference,
                          )
                            ? "auto"
                            : 0,
                          opacity: ["Non-Vegetarian", "Eggetarian"].includes(
                            formData.dietPreference,
                          )
                            ? 1
                            : 0,
                        }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          If Non-Veg/Egg, what do you eat?
                        </label>
                        <input
                          type="text"
                          name="nonVegPreference"
                          value={formData.nonVegPreference}
                          onChange={handleChange}
                          placeholder="e.g., Chicken, Fish, Egg"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-gray-50/50"
                        />
                      </motion.div>

                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Optional Add-ons
                        </label>
                        <div className="space-y-3 mb-4">
                          {["detoxWater", "detoxJuices", "smoothies"].map(
                            (addon) => (
                              <div
                                key={addon}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${formData.noAddons ? "opacity-50 grayscale border-gray-100" : "border-gray-200 bg-white"}`}
                              >
                                <span className="font-medium text-gray-700 capitalize">
                                  {addon.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    disabled={formData.noAddons}
                                    onClick={() => handleQuantity(addon, "sub")}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100"
                                  >
                                    -
                                  </button>
                                  <span className="w-4 text-center font-medium">
                                    {
                                      formData[
                                        addon as keyof typeof formData
                                      ] as number
                                    }
                                  </span>
                                  <button
                                    type="button"
                                    disabled={formData.noAddons}
                                    onClick={() => handleQuantity(addon, "add")}
                                    className="w-8 h-8 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center hover:bg-[#059669]/20 disabled:hover:bg-[#059669]/10"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="noAddons"
                            checked={formData.noAddons}
                            onChange={handleChange}
                            className="w-5 h-5 accent-[#059669] rounded"
                          />
                          <span className="text-sm text-gray-600">
                            No add-ons required
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Health Details */}
                  {currentStep === 3 && (() => {
                    const h = parseFloat(formData.height);
                    const w = parseFloat(formData.weight);
                    const bmi = (h && w && h > 0) ? (w / ((h / 100) * (h / 100))).toFixed(1) : null;
                    const getBmiStatus = (bmiVal: number) => {
                       if (bmiVal < 18.5) return { status: "Underweight", color: "text-blue-500", bg: "bg-blue-50" };
                       if (bmiVal < 25) return { status: "Normal", color: "text-[#059669]", bg: "bg-[#059669]/10" };
                       if (bmiVal < 30) return { status: "Overweight", color: "text-amber-500", bg: "bg-amber-50" };
                       return { status: "Obese", color: "text-red-500", bg: "bg-red-50" };
                    };
                    const bmiDetails = bmi ? getBmiStatus(parseFloat(bmi)) : null;

                    return (
                    <div className="space-y-6">
                      {bmi && bmiDetails && (
                        <div className={`p-4 rounded-2xl flex items-center justify-between border border-gray-100 ${bmiDetails.bg}`}>
                           <div>
                             <p className="text-sm text-gray-500 font-medium">Calculated BMI</p>
                             <p className={`text-2xl font-bold ${bmiDetails.color}`}>{bmi}</p>
                           </div>
                           <div className={`px-4 py-2 rounded-full text-sm font-bold ${bmiDetails.color} bg-white shadow-sm`}>
                             {bmiDetails.status}
                           </div>
                        </div>
                      )}
                      
                      <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="mt-1 text-red-500">
                            <Circle className="text-xl"/>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Medical Baseline
                            </h3>
                            <p className="text-sm text-gray-500">
                              This helps us tailor ingredients safely.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Medical Conditions (Optional)
                            </label>
                            <select
                              name="medicalConditions"
                              value={formData.medicalConditions}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all bg-white shadow-sm"
                            >
                              <option value="">None</option>
                              <option value="Diabetes">Diabetes</option>
                              <option value="Hypertension (Blood Pressure)">
                                Hypertension (Blood Pressure)
                              </option>
                              <option value="PCOS/PCOD">PCOS/PCOD</option>
                              <option value="Thyroid">Thyroid</option>
                              <option value="High Cholesterol">
                                High Cholesterol
                              </option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {formData.medicalConditions === "Other" && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Please specify
                              </label>
                              <input
                                type="text"
                                name="otherMedical"
                                value={formData.otherMedical}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all bg-white shadow-sm"
                              />
                            </motion.div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Food Allergies (Optional)
                            </label>
                            <input
                              type="text"
                              name="allergies"
                              value={formData.allergies}
                              onChange={handleChange}
                              placeholder="e.g., nuts, dairy, lactose"
                              className="w-full px-4 py-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all bg-white shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })()}

                  {/* Step 4: Lifestyle */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Activity Level
                          </label>
                          <select
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-white"
                          >
                            <option value="">Select level</option>
                            <option value="Sedentary">Sedentary</option>
                            <option value="Lightly Active">
                              Lightly Active
                            </option>
                            <option value="Moderately Active">
                              Moderately Active
                            </option>
                            <option value="Very Active">Very Active</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stress Level
                          </label>
                          <select
                            name="stressLevel"
                            value={formData.stressLevel}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-white"
                          >
                            <option value="">Select level</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Average Sleep (Hours)
                          </label>
                          <input
                            type="text"
                            name="sleep"
                            value={formData.sleep}
                            onChange={handleChange}
                            placeholder="e.g. 7"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-gray-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Junk Food Frequency
                          </label>
                          <select
                            name="junkFood"
                            value={formData.junkFood}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 transition-all bg-white"
                          >
                            <option value="">Select</option>
                            <option value="Rarely">Rarely</option>
                            <option value="1-2 times/week">
                              1-2 times/week
                            </option>
                            <option value="3-4 times/week">
                              3-4 times/week
                            </option>
                            <option value="Daily">Daily</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-base font-serif font-medium text-gray-900 mb-1 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-[#059669]" />
                          Typical Eating Schedule
                        </h3>
                        <p className="text-xs text-gray-500 mb-6 font-light">
                          Select a standard time with a single tap, or enter a custom hour slot.
                        </p>
                        
                        <div className="space-y-4">
                          {/* Breakfast */}
                          <div className="bg-gray-50/40 rounded-2xl p-4 border border-gray-100 hover:border-[#059669]/20 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                  <Coffee className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">Breakfast</h4>
                                  <p className="text-[11px] text-gray-500 font-light">Morning fueling</p>
                                </div>
                              </div>
                              
                              <div className="flex-1 flex flex-col items-start sm:items-end gap-2 sm:max-w-md w-full">
                                <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end w-full">
                                  {["08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "Skip"].map((opt) => {
                                    const isSelected = formData.breakfastTime === opt && !customMeals.breakfastTime;
                                    return (
                                      <button
                                        type="button"
                                        key={opt}
                                        onClick={() => {
                                          setCustomMeals(prev => ({ ...prev, breakfastTime: false }));
                                          setFormData(prev => ({ ...prev, breakfastTime: opt }));
                                        }}
                                        className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                                          isSelected
                                            ? "bg-[#059669] border-[#059669] text-white font-medium shadow-sm"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-[#059669]/50"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCustomMeals(prev => ({ ...prev, breakfastTime: true }));
                                      const currentVal = formData.breakfastTime;
                                      if (!currentVal || ["08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "Skip"].includes(currentVal)) {
                                        setFormData(prev => ({ ...prev, breakfastTime: "08:00" }));
                                      }
                                    }}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                                      customMeals.breakfastTime
                                        ? "bg-[#059669] border-[#059669] text-white font-medium shadow-sm"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-[#059669]/50"
                                    }`}
                                  >
                                    Custom
                                  </button>
                                </div>
                                
                                <AnimatePresence>
                                  {customMeals.breakfastTime && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="w-full sm:w-auto mt-1"
                                    >
                                      <input
                                        type="time"
                                        name="breakfastTime"
                                        value={formData.breakfastTime.includes("AM") || formData.breakfastTime.includes("PM") || formData.breakfastTime === "Skip" ? "08:00" : formData.breakfastTime}
                                        onChange={handleChange}
                                        className="w-full sm:w-32 px-3 py-1.5 rounded-xl border border-[#059669]/30 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 text-xs text-gray-700 bg-white shadow-sm"
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>

                          {/* Lunch */}
                          <div className="bg-gray-50/40 rounded-2xl p-4 border border-gray-100 hover:border-[#059669]/20 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                  <Sun className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">Lunch</h4>
                                  <p className="text-[11px] text-gray-500 font-light">Midday peak performance</p>
                                </div>
                              </div>
                              
                              <div className="flex-1 flex flex-col items-start sm:items-end gap-2 sm:max-w-md w-full">
                                <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end w-full">
                                  {["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM"].map((opt) => {
                                    const isSelected = formData.lunchTime === opt && !customMeals.lunchTime;
                                    return (
                                      <button
                                        type="button"
                                        key={opt}
                                        onClick={() => {
                                          setCustomMeals(prev => ({ ...prev, lunchTime: false }));
                                          setFormData(prev => ({ ...prev, lunchTime: opt }));
                                        }}
                                        className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                                          isSelected
                                            ? "bg-[#059669] border-[#059669] text-white font-medium shadow-sm"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-[#059669]/50"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCustomMeals(prev => ({ ...prev, lunchTime: true }));
                                      const currentVal = formData.lunchTime;
                                      if (!currentVal || ["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM"].includes(currentVal)) {
                                        setFormData(prev => ({ ...prev, lunchTime: "13:00" }));
                                      }
                                    }}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                                      customMeals.lunchTime
                                        ? "bg-[#059669] border-[#059669] text-white font-medium shadow-sm"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-[#059669]/50"
                                    }`}
                                  >
                                    Custom
                                  </button>
                                </div>
                                
                                <AnimatePresence>
                                  {customMeals.lunchTime && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="w-full sm:w-auto mt-1"
                                    >
                                      <input
                                        type="time"
                                        name="lunchTime"
                                        value={formData.lunchTime.includes("AM") || formData.lunchTime.includes("PM") ? "13:00" : formData.lunchTime}
                                        onChange={handleChange}
                                        className="w-full sm:w-32 px-3 py-1.5 rounded-xl border border-[#059669]/30 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 text-xs text-gray-700 bg-white shadow-sm"
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>

                          {/* Dinner */}
                          <div className="bg-gray-50/40 rounded-2xl p-4 border border-gray-100 hover:border-[#059669]/20 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                  <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">Dinner</h4>
                                  <p className="text-[11px] text-gray-500 font-light">Evening winds down</p>
                                </div>
                              </div>
                              
                              <div className="flex-1 flex flex-col items-start sm:items-end gap-2 sm:max-w-md w-full">
                                <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end w-full">
                                  {["07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM"].map((opt) => {
                                    const isSelected = formData.dinnerTime === opt && !customMeals.dinnerTime;
                                    return (
                                      <button
                                        type="button"
                                        key={opt}
                                        onClick={() => {
                                          setCustomMeals(prev => ({ ...prev, dinnerTime: false }));
                                          setFormData(prev => ({ ...prev, dinnerTime: opt }));
                                        }}
                                        className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                                          isSelected
                                            ? "bg-[#059669] border-[#059669] text-white font-medium shadow-sm"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-[#059669]/50"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCustomMeals(prev => ({ ...prev, dinnerTime: true }));
                                      const currentVal = formData.dinnerTime;
                                      if (!currentVal || ["07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM"].includes(currentVal)) {
                                        setFormData(prev => ({ ...prev, dinnerTime: "20:00" }));
                                      }
                                    }}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                                      customMeals.dinnerTime
                                        ? "bg-[#059669] border-[#059669] text-white font-medium shadow-sm"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-[#059669]/50"
                                    }`}
                                  >
                                    Custom
                                  </button>
                                </div>
                                
                                <AnimatePresence>
                                  {customMeals.dinnerTime && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="w-full sm:w-auto mt-1"
                                    >
                                      <input
                                        type="time"
                                        name="dinnerTime"
                                        value={formData.dinnerTime.includes("AM") || formData.dinnerTime.includes("PM") ? "20:00" : formData.dinnerTime}
                                        onChange={handleChange}
                                        className="w-full sm:w-32 px-3 py-1.5 rounded-xl border border-[#059669]/30 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 text-xs text-gray-700 bg-white shadow-sm"
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Delivery Details */}
                  {currentStep === 5 && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Premium GPS Locator Section (Matches the visual mock with MapPin badge in a pulsing ring) */}
                      <div className="bg-emerald-50/40 rounded-3xl p-6 border border-[#059669]/10 text-center relative overflow-hidden flex flex-col items-center justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#059669]/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                        
                        <div className="relative mb-4 flex items-center justify-center">
                          {isDetecting && (
                            <div className="absolute inset-0 w-16 h-16 bg-[#059669]/20 rounded-full animate-ping"></div>
                          )}
                          <div className={`w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-[#059669] transition-all relative z-10 ${isDetecting ? "border-2 border-[#059669]/30" : "hover:scale-105"}`}>
                            {isDetecting ? (
                              <Loader2 className="w-6 h-6 animate-spin text-[#059669]" />
                            ) : locationStatus === "success" ? (
                              <Check className="w-6 h-6 text-emerald-600" />
                            ) : (
                              <MapPin className="w-6 h-6" />
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-serif font-medium text-gray-900 mb-1">
                          {locationStatus === "success" ? "Delivery Coordinates Locked" : "Detect Delivery Location"}
                        </h3>
                        <p className="text-xs text-gray-500 font-light max-w-sm mb-4 leading-relaxed">
                          Verify your delivery address instantly using GPS. Our system will locate your coordinates and pre-fill the parameters below.
                        </p>

                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetecting}
                          className="px-5 py-2 bg-white border border-gray-200 hover:border-[#059669] text-gray-700 hover:text-[#059669] rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
                        >
                          {isDetecting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#059669]" />
                              Locating kitchen...
                            </>
                          ) : locationStatus === "success" ? (
                            <>
                              <Navigation className="w-3.5 h-3.5 text-[#059669] fill-[#059669]/10" />
                              Re-detect Location
                            </>
                          ) : (
                            <>
                              <Navigation className="w-3.5 h-3.5" />
                              Detect My Location
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-amber-50/30 p-6 rounded-3xl border border-amber-100/40">
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Address Line 1 *
                              </label>
                              <input
                                required
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                placeholder="House No., Flat/Villa, Street Name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all bg-white shadow-sm text-sm sm:text-base text-gray-800 placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Apartment / Area *
                              </label>
                              <input
                                required
                                type="text"
                                name="apartmentArea"
                                value={formData.apartmentArea}
                                onChange={handleChange}
                                placeholder="Apartment Name, Suburb, Landmark"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all bg-white shadow-sm text-sm sm:text-base text-gray-800 placeholder:text-gray-400"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Pincode *
                              </label>
                              <input
                                required
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                pattern="[0-9]{6}"
                                maxLength={6}
                                placeholder="6-digit PIN code"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all bg-white shadow-sm text-sm sm:text-base text-gray-800 placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                City *
                              </label>
                              <input
                                required
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Bengaluru"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all bg-white shadow-sm text-sm sm:text-base text-gray-800 placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Delivery Slot *
                              </label>
                              <select
                                required
                                name="deliverySlots"
                                value={formData.deliverySlots}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all bg-white shadow-sm text-sm sm:text-base text-gray-800"
                              >
                                <option value="">Select slot</option>
                                <option value="Morning (7-9 AM)">
                                  Morning (7-9 AM)
                                </option>
                                <option value="Afternoon (11-1 PM)">
                                  Afternoon (11-1 PM)
                                </option>
                                <option value="Evening (5-7 PM)">
                                  Evening (5-7 PM)
                                </option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                              Google Maps Link (Optional)
                            </label>
                            <input
                              type="text"
                              name="googleMapsLink"
                              value={formData.googleMapsLink}
                              onChange={handleChange}
                              placeholder="Maps coordinates link (auto-generated or copy-pasted)"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all bg-white shadow-sm mb-1 text-sm sm:text-base text-gray-800 placeholder:text-gray-400"
                            />
                            <p className="text-[10px] text-gray-400 font-light">
                              Highly recommended to enable pinpoint dispatch directly to your kitchen door.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="p-5 sm:p-6 border-t border-gray-100 bg-white flex items-center justify-between mt-auto">
            <button
              type="button"
              onClick={prevStep}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-opacity ${currentStep === 0 ? "opacity-0 cursor-default" : "opacity-100 hover:bg-gray-100 text-gray-700"}`}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2"/> Back
            </button>

            {submitStatus === "error" && (
              <div className="absolute bottom-20 right-6 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm border border-red-100 flex items-center shadow-sm">
                <Circle className="mr-2 w-4"/> Something
                went wrong. Please try again.
              </div>
            )}
            {currentStep < (STEPS?.length ?? 6) - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-md shadow-[#059669]/20 flex items-center group cursor-pointer"
              >
                Continue <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform"/>
              </button>
            ) : (
              <button
                type="submit"
                form="assessment-form"
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.getElementById("assessment-form") as HTMLFormElement;
                  if (form) {
                    if (form.reportValidity()) {
                      if (typeof form.requestSubmit === "function") {
                        form.requestSubmit();
                      } else {
                        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                      }
                    } else {
                      const firstInvalid = form.querySelector(":invalid");
                      if (firstInvalid) {
                        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }
                  }
                }}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-md shadow-[#059669]/20 flex items-center disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit <MessageCircle className="ml-3 text-lg group-hover:scale-110 transition-transform"/>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
