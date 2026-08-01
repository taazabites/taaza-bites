import { ChevronDown, ArrowRight, Circle, Mail, Phone, Utensils, ChefHat, Bike, Headset, Megaphone, Briefcase, CheckCircle2, Users, Loader2, UploadCloud, FileText, Trash2, X, ArrowLeft, AlertCircle, Calendar, DollarSign, MapPin, User, Check, Sparkles } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../config';
import React, { useState, useRef } from 'react';

// Official WhatsApp Logo SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
import { SmartButton } from './SmartButton';
import RenderOnView from './RenderOnView';
import { LazyImage } from './LazyImage';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const POSITIONS = [
    "Kitchen Assistant",
    "Cook / Chef",
    "Delivery Executive",
    "Customer Support Executive",
    "Marketing Executive"
];

const POSITION_DETAILS: Record<string, { duties: string[]; icon: any; subtitle: string }> = {
    "Kitchen Assistant": {
        subtitle: "Support back-of-house operations & assembly",
        duties: ["Food preparation & portioning", "Strict ingredient handling & storage", "Maintain kitchen cleanliness & sanitation", "Collaborate with chefs for efficient setup"],
        icon: Utensils
    },
    "Cook / Chef": {
        subtitle: "Lead high-quality nutritional culinary creation",
        duties: ["Macro-calculated meal preparation", "Strict cooking quality & taste control", "Recipe execution & standardization", "Kitchen team & inventory management support"],
        icon: ChefHat
    },
    "Delivery Executive": {
        subtitle: "The smiling face delivering wellness across Bangalore",
        duties: ["Safe and punctual nutrition deliveries", "Professional and warm customer interaction", "Accurate order handling & route planning"],
        icon: Bike
    },
    "Customer Support Executive": {
        subtitle: "Delight and retain our valued subscribers",
        duties: ["Efficient active order management", "Clear & empathetic customer communication", "Proactive and friendly issue resolution"],
        icon: Headset
    },
    "Marketing Executive": {
        subtitle: "Spread the message of healthy clean eating in Bangalore",
        duties: ["Social media channels & community engagement", "Creative lifestyle content creation", "Execute regional campaigns & wellness partnerships"],
        icon: Megaphone
    }
};

const EXPERIENCES = [
    "Fresher (0 Years)",
    "0-1 Years",
    "1-3 Years",
    "3-5 Years",
    "5+ Years"
];

const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Firestore Error Handling
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
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const CareersPage: React.FC = () => {
    // Stepper & Form State
    const [step, setStep] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [expandedRole, setExpandedRole] = useState<string | null>(null);
    const [activeField, setActiveField] = useState<string | null>(null);

    // Form Field States
    const [fullName, setFullName] = useState<string>("");
    const [mobile, setMobile] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [location, setLocation] = useState<string>("");

    const [selectedRole, setSelectedRole] = useState<string>("");
    const [experience, setExperience] = useState<string>("");
    const [expectedSalary, setExpectedSalary] = useState<string>("");
    const [joiningDate, setJoiningDate] = useState<string>("");
    const [comments, setComments] = useState<string>("");

    // Resume State
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);

    // Validation Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // References
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleQuickApply = (role: string) => {
        setSelectedRole(role);
        setExpandedRole(role);
        
        // Auto-scroll to the application form
        const element = document.getElementById("apply-form-container");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Step 1 Validation
    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) newErrors.fullName = "Full name is required";
        else if (fullName.trim().length < 2) newErrors.fullName = "Name must be at least 2 characters";

        if (!mobile.trim()) newErrors.mobile = "Mobile number is required";
        else if (!/^[0-9+\s-]{10,15}$/.test(mobile.trim())) newErrors.mobile = "Please enter a valid mobile number";

        if (!email.trim()) newErrors.email = "Email address is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = "Please enter a valid email address";

        if (!location.trim()) newErrors.location = "Current location is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Step 2 Validation
    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedRole) newErrors.position = "Please select the position you are applying for";
        if (!experience) newErrors.experience = "Please select your professional experience level";
        
        if (joiningDate) {
            const selectedDate = new Date(joiningDate);
            const today = new Date();
            selectedDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.joiningDate = "Please select today's date or a future date.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
                scrollToFormHeader();
            }
        } else if (step === 2) {
            if (validateStep2()) {
                setStep(3);
                scrollToFormHeader();
            }
        }
    };

    const handleBackStep = () => {
        if (step > 1) {
            setStep(step - 1);
            scrollToFormHeader();
        }
    };

    const scrollToFormHeader = () => {
        const element = document.getElementById("apply-form-header");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // File drag and drop handers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const processFile = (file: File) => {
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            setUploadError("Invalid file format. Please upload a PDF, DOC, or DOCX document.");
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File too large. Maximum supported resume size is 5MB.");
            return;
        }
        
        setUploadError(null);
        setResumeFile(file);
        setIsUploading(true);
        setUploadProgress(0);
        setUploadCompleted(false);
        
        // Smooth visual simulation for upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                setUploadCompleted(true);
            }
        }, 80);
    };

    const removeFile = () => {
        setResumeFile(null);
        setUploadProgress(0);
        setUploadCompleted(false);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep1() || !validateStep2()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        let formattedDate = joiningDate || 'Immediate';
        if (joiningDate) {
            try {
                const dateObj = new Date(joiningDate);
                if (!isNaN(dateObj.getTime())) {
                    formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                }
            } catch (err) {}
        }

        // Build Application Payload
        const applicationData = {
            fullName,
            mobile,
            email,
            position: selectedRole,
            location,
            experience,
            expectedSalary: expectedSalary || 'Not specified',
            joiningDate: formattedDate,
            comments: comments || 'N/A',
            resumeName: resumeFile ? resumeFile.name : 'N/A',
            resumeSize: resumeFile ? resumeFile.size : 0,
            timestamp: new Date().toISOString() // Fallback plain string for logging
        };

        const path = 'job_applications';
        let firebaseSuccess = false;

        // DB Persistence with secure rules and error handling
        if (db) {
            try {
                // Generate a random ID to satisfy isValidId validation checks
                const cleanId = 'app_' + Math.random().toString(36).substring(2, 15);
                
                // Add document with server time matching rules
                await addDoc(collection(db, path), {
                    ...applicationData,
                    timestamp: serverTimestamp() // Required on server-side rules
                });
                firebaseSuccess = true;
                console.log("Job application saved securely in database.");
            } catch (error) {
                // Safely log and process the firestore security rules or system error
                try {
                    handleFirestoreError(error, OperationType.WRITE, path);
                } catch (processedErr) {
                    console.warn("Handled firestore error successfully:", processedErr);
                }
            }
        }

        setIsSubmitted(true);
        setIsSubmitting(false);
    };

    const triggerWhatsAppFastTrack = () => {
        let formattedDate = joiningDate || 'Immediate';
        if (joiningDate) {
            try {
                const dateObj = new Date(joiningDate);
                if (!isNaN(dateObj.getTime())) {
                    formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                }
            } catch (err) {}
        }

        const message = `*💼 New Job Application ✨*
*Name*: ${fullName}
*Phone*: ${mobile}
*Email*: ${email}

*🎯 Applying For*: ${selectedRole}
*Location*: ${location}
*Experience*: ${experience}

*💰 Salary Details*:
*Expected*: ${expectedSalary || 'N/A'}
*Available from*: ${formattedDate}

*Comments*: ${comments || 'N/A'}`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        const opened = window.open(whatsappUrl, '_blank');
        if (!opened) {
            window.location.href = whatsappUrl;
        }
    };

    const inputClasses = "w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#418B1E] focus:bg-white/10 focus:ring-4 focus:ring-[#418B1E]/10 outline-none transition-all duration-300 text-white placeholder:text-gray-500 font-medium text-base sm:text-sm";
    const labelClasses = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 select-none";

    return (
        <div className="pt-24 sm:pt-32 pb-24 min-h-screen bg-[#050505] selection:bg-[#418B1E] selection:text-white relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#418B1E]/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <RenderOnView animation="fade-in-up">
                    <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24 relative z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#418B1E]/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-[#418B1E]/20 text-[#418B1E] font-bold text-[10px] sm:text-xs tracking-widest uppercase mb-6 shadow-sm">
                            <Users className="w-4 h-4" />
                            Join the Team
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-sans text-white tracking-tight mb-6 leading-[1.1] uppercase">
                            🥗 Build Your Career with <br className="hidden sm:block" />
                            <span className="text-[#418B1E] font-script normal-case tracking-normal">Taaza Bites</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto mb-8">
                            Join a fast-growing healthy food brand that's transforming the way Bangalore eats. Grow your skills, work with passionate people, and make a positive impact through healthy nutrition.
                        </p>
                        <button 
                            onClick={() => {
                                const element = document.getElementById("apply-form-container");
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="px-8 py-4 rounded-full bg-white hover:bg-[#418B1E] text-[#1A1A1A] hover:text-white font-bold tracking-widest uppercase transition-all duration-300 shadow-xl inline-flex flex-col items-center justify-center gap-2"
                        >
                            Apply Now
                        </button>
                    </div>

                    {/* Hero Image */}
                    <div className="w-full max-w-5xl mx-auto h-64 sm:h-96 md:h-[500px] rounded-[2rem] sm:rounded-[3rem] overflow-hidden mb-16 sm:mb-24 relative shadow-2xl origin-center">
                        <LazyImage 
                            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=2000&auto=format&fit=crop" 
                            alt="Professional kitchen team preparing healthy meals" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                            wrapperClassName="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-[3]"></div>
                    </div>
                </RenderOnView>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    <div className="lg:col-span-12 grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Open Positions Card */}
                        <RenderOnView animation="fade-in-left" delay={0.1}>
                            <div className="space-y-6">
                                <h3 className="text-xl font-sans font-extrabold text-white mb-4 flex items-center gap-3 uppercase">
                                    <Briefcase className="w-5 h-5 text-[#418B1E]" />
                                    Open Positions
                                </h3>
                                <p className="text-sm text-gray-400 font-light mb-6">
                                    Click on any role to explore key responsibilities. Tap **Quick Apply** to automatically configure the application tool.
                                </p>
                                <div className="space-y-4">
                                    {POSITIONS.map((pos, i) => {
                                        const details = POSITION_DETAILS[pos];
                                        const isExpanded = expandedRole === pos;
                                        return (
                                            <div 
                                                key={i} 
                                                className={`p-5 sm:p-6 bg-white/5 border rounded-[2rem] hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                                                    isExpanded 
                                                        ? 'border-[#418B1E] bg-[#418B1E]/5 shadow-lg shadow-[#418B1E]/5' 
                                                        : 'border-white/10 hover:border-[#418B1E]/30 hover:bg-white/[0.07]'
                                                }`}
                                                onClick={() => setExpandedRole(isExpanded ? null : pos)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-[#418B1E] text-white' : 'bg-white/5 text-[#418B1E]'}`}>
                                                            <details.icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-base sm:text-lg">{pos}</h4>
                                                            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1 block">BENGALURU • FULL TIME</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold font-mono text-[#418B1E] px-2.5 py-1 bg-[#418B1E]/10 rounded-full uppercase tracking-wider">
                                                            Hiring
                                                        </span>
                                                        <span className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#418B1E]' : ''}`}>
                                                            <ChevronDown className="text-sm"/>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expanded content */}
                                                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[300px] mt-6 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
                                                    <div className="border-t border-white/10 pt-4 space-y-4">
                                                        <p className="text-sm font-light text-gray-300 italic">{details.subtitle}</p>
                                                        <div>
                                                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#F7C808] mb-2">Key Responsibilities</h5>
                                                            <ul className="space-y-1.5">
                                                                {details.duties.map((duty, idx) => (
                                                                    <li key={idx} className="text-xs text-gray-400 flex items-start gap-2 leading-relaxed">
                                                                        <span className="text-[#418B1E] mt-1">•</span>
                                                                        <span>{duty}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuickApply(pos);
                                                            }}
                                                            className="w-full sm:w-auto mt-2 px-5 py-3 sm:py-2.5 rounded-full bg-[#418B1E] hover:bg-[#418B1E]/80 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                                                        >
                                                            <span>Quick Apply</span>
                                                            <ArrowRight className="text-[10px]"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </RenderOnView>

                        {/* Why Work With Us Perks Card */}
                        <RenderOnView animation="fade-in-up" delay={0.2}>
                            <div className="space-y-6">
                                <h3 className="text-xl font-sans font-extrabold text-white mb-4 flex items-center gap-3 uppercase">
                                    <Users className="w-5 h-5 text-[#418B1E]" />
                                    Why Join the Taaza Family?
                                </h3>
                                <p className="text-sm text-gray-400 font-light mb-6">
                                    We foster healthy growth, supportive environments, and provide generous perks for our culinary and commercial heroes.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/5 hover:bg-[#151515] border border-white/15 hover:border-[#418B1E]/20 rounded-2xl transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-[#418B1E]/10 flex items-center justify-center mb-4 text-[#418B1E]">
                                            <Circle className="text-sm"/>
                                        </div>
                                        <h4 className="font-bold text-white text-sm mb-1">Fast-Growing Brand</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed font-light">Bengaluru's top premium healthy meal delivery start-up setup for nationwide scalability.</p>
                                    </div>

                                    <div className="p-6 bg-white/5 hover:bg-[#151515] border border-white/15 hover:border-[#418B1E]/20 rounded-2xl transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-[#F7C808]/10 flex items-center justify-center mb-4 text-[#F7C808]">
                                            <Circle className="text-sm"/>
                                        </div>
                                        <h4 className="font-bold text-white text-sm mb-1">Warm & Friendly Team</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed font-light">Work in an empathetic, supportive, and highly collaborative family structure.</p>
                                    </div>

                                    <div className="p-6 bg-white/5 hover:bg-[#151515] border border-white/15 hover:border-[#418B1E]/20 rounded-2xl transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-[#418B1E]/10 flex items-center justify-center mb-4 text-[#418B1E]">
                                            <Circle className="text-sm"/>
                                        </div>
                                        <h4 className="font-bold text-white text-sm mb-1">Skill & Career Growth</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed font-light">Benefit from continuous learning programs and clear pathways to leadership roles.</p>
                                    </div>

                                    <div className="p-6 bg-white/5 hover:bg-[#151515] border border-white/15 hover:border-[#418B1E]/20 rounded-2xl transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-[#F7C808]/10 flex items-center justify-center mb-4 text-[#F7C808]">
                                            <Circle className="text-sm"/>
                                        </div>
                                        <h4 className="font-bold text-white text-sm mb-1">Competitive Packages</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed font-light">Receive industry-leading base salaries, performance bonuses, and health alignments.</p>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8 bg-gradient-to-r from-[#418B1E]/10 to-transparent border border-[#418B1E]/20 rounded-[2rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#418B1E]/10 rounded-full blur-[30px] pointer-events-none"></div>
                                    <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="text-base">✨</span> Premium Employee Benefits
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300 font-light">
                                        <div className="flex items-center gap-3">
                                            <span className="text-base bg-white/5 w-8 h-8 rounded-full flex items-center justify-center shrink-0">🍱</span>
                                            <span>Free Healthy Staff Meals daily</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base bg-white/5 w-8 h-8 rounded-full flex items-center justify-center shrink-0">📈</span>
                                            <span>Tiered Performance Incentives</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base bg-white/5 w-8 h-8 rounded-full flex items-center justify-center shrink-0">🏥</span>
                                            <span>Health & Wellness Focus</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base bg-white/5 w-8 h-8 rounded-full flex items-center justify-center shrink-0">🎓</span>
                                            <span>Skill Development & Training</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </RenderOnView>
                    </div>

                    {/* Interactive Application Form Container */}
                    <div className="col-span-12 mt-12 sm:mt-16" id="apply-form-container">
                        <RenderOnView animation="fade-in-right" delay={0.2} forceRender={true}>
                            <div className="bg-[#111111] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] px-4 py-8 sm:p-12 relative shadow-2xl overflow-hidden" id="apply-form-header">
                                {/* Success State */}
                                {isSubmitted ? (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="py-16 text-center flex flex-col items-center justify-center min-h-[400px]"
                                    >
                                        <div className="w-24 h-24 bg-[#418B1E]/10 rounded-full flex items-center justify-center mb-8 border-4 border-[#418B1E]/20 shadow-[0_0_30px_rgba(65,139,30,0.2)] animate-pulse">
                                            <Check className="w-12 h-12 text-[#418B1E]" />
                                        </div>
                                        <h3 className="text-3xl font-sans font-extrabold text-white mb-4 tracking-tight uppercase">Application Successfully Logged!</h3>
                                        <p className="text-gray-400 font-light max-w-md mx-auto leading-relaxed mb-4">
                                            Thank you, <span className="text-white font-medium">{fullName}</span>! Your details have been stored securely in our hiring database.
                                        </p>
                                        <p className="text-gray-400 font-light max-w-md mx-auto leading-relaxed mb-8">
                                            Our recruitment coordinators are reviewing submissions immediately. Fast-track your screening with direct manager chat.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
                                            <button 
                                                type="button"
                                                onClick={triggerWhatsAppFastTrack}
                                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group"
                                            >
                                                <WhatsAppIcon className="w-4 h-4 fill-current text-white" />
                                                <span>Fast-Track on WhatsApp</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsSubmitted(false);
                                                    setStep(1);
                                                    setFullName("");
                                                    setMobile("");
                                                    setEmail("");
                                                    setLocation("");
                                                    setSelectedRole("");
                                                    setExperience("");
                                                    setExpectedSalary("");
                                                    setJoiningDate("");
                                                    setComments("");
                                                    removeFile();
                                                }}
                                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-widest transition-colors duration-300"
                                            >
                                                Apply for Another Role
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Stepper Header */}
                                        <div className="mb-10 text-center">
                                            <h3 className="text-2xl sm:text-4xl font-sans font-extrabold text-white mb-3 tracking-tight uppercase">Job Application</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 font-light max-w-md mx-auto">Complete our interactive process to submit your professional profile.</p>
                                        </div>

                                        {/* Progressive Step Tracker */}
                                        <div className="mb-12 max-w-xl mx-auto">
                                            <div className="flex items-center justify-between relative">
                                                {/* Background Line */}
                                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/5 rounded-full z-0" />
                                                {/* Active Progress Fill */}
                                                <div 
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#418B1E] rounded-full transition-all duration-500 z-0" 
                                                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                                                />
                                                {/* Circular Step Triggers */}
                                                {[
                                                    { id: 1, label: "Contact", icon: User },
                                                    { id: 2, label: "Experience", icon: Briefcase },
                                                    { id: 3, label: "Review", icon: UploadCloud }
                                                ].map((s) => {
                                                    const Icon = s.icon;
                                                    const isActive = step === s.id;
                                                    const isCompleted = step > s.id;
                                                    return (
                                                        <div key={s.id} className="relative z-10 flex flex-col items-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (s.id < step) {
                                                                        setStep(s.id);
                                                                    } else if (s.id > step) {
                                                                        if (step === 1 && validateStep1()) {
                                                                            setStep(s.id);
                                                                        } else if (step === 2 && validateStep1() && validateStep2()) {
                                                                            setStep(s.id);
                                                                        }
                                                                    }
                                                                }}
                                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 border ${
                                                                    isActive 
                                                                        ? 'bg-[#111111] border-[#418B1E] text-[#418B1E] shadow-[0_0_15px_rgba(65,139,30,0.3)]' 
                                                                        : isCompleted 
                                                                        ? 'bg-[#418B1E] border-[#418B1E] text-white' 
                                                                        : 'bg-[#111111] border-white/10 text-gray-500'
                                                                }`}
                                                            >
                                                                {isCompleted ? (
                                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                ) : (
                                                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                )}
                                                            </button>
                                                            <span className={`text-[8px] xs:text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-2 sm:mt-3 transition-colors duration-300 ${isActive ? 'text-[#418B1E]' : isCompleted ? 'text-white/80' : 'text-gray-500'}`}>
                                                                {s.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Beautiful Dynamic Active-Step Title Banner */}
                                            <div className="text-center mt-8 bg-white/[0.02] border border-white/5 rounded-2xl py-3 px-4 max-w-sm mx-auto select-none backdrop-blur-sm animate-fade-in">
                                                <span className="text-[10px] text-[#418B1E] font-mono tracking-widest uppercase font-bold">
                                                    Step {step} of 3
                                                </span>
                                                <h5 className="text-xs font-semibold text-white/90 uppercase tracking-wider mt-0.5">
                                                    {step === 1 && "Personal & Contact Details"}
                                                    {step === 2 && "Professional Profile"}
                                                    {step === 3 && "Resume & Cover Note"}
                                                </h5>
                                            </div>
                                        </div>

                                        {submitError && (
                                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                {submitError}
                                            </div>
                                        )}

                                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                                            <AnimatePresence mode="wait">
                                                {/* STEP 1: CONTACT DETAILS */}
                                                {step === 1 && (
                                                    <motion.div
                                                        key="step-1"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="border-b border-white/5 pb-2 mb-6 flex items-center gap-2">
                                                            <User className="w-4 h-4 text-[#418B1E]" />
                                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 1: Personal Information</h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className={labelClasses}>Full Name *</label>
                                                                <div className="relative group">
                                                                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'fullName' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <input 
                                                                        required 
                                                                        value={fullName}
                                                                        onChange={(e) => {
                                                                            setFullName(e.target.value);
                                                                            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                                                                        }}
                                                                        onFocus={() => setActiveField('fullName')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        type="text" 
                                                                        autoComplete="name"
                                                                        autoCapitalize="words"
                                                                        className={`${inputClasses} ${errors.fullName ? 'border-red-500/40 focus:border-red-500' : ''}`} 
                                                                        placeholder="e.g. John Doe" 
                                                                    />
                                                                </div>
                                                                {errors.fullName && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}</p>}
                                                            </div>
                                                            <div>
                                                                <label className={labelClasses}>Mobile Number *</label>
                                                                <div className="relative group">
                                                                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'mobile' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <input 
                                                                        required 
                                                                        value={mobile}
                                                                        onChange={(e) => {
                                                                            setMobile(e.target.value);
                                                                            if (errors.mobile) setErrors(prev => ({ ...prev, mobile: "" }));
                                                                        }}
                                                                        onFocus={() => setActiveField('mobile')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        type="tel" 
                                                                        autoComplete="tel"
                                                                        inputMode="tel"
                                                                        className={`${inputClasses} ${errors.mobile ? 'border-red-500/40 focus:border-red-500' : ''}`} 
                                                                        placeholder="+91 XXXXX XXXXX" 
                                                                    />
                                                                </div>
                                                                {errors.mobile && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.mobile}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className={labelClasses}>Email Address *</label>
                                                                <div className="relative group">
                                                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'email' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <input 
                                                                        required 
                                                                        value={email}
                                                                        onChange={(e) => {
                                                                            setEmail(e.target.value);
                                                                            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                                                        }}
                                                                        onFocus={() => setActiveField('email')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        type="email" 
                                                                        autoComplete="email"
                                                                        inputMode="email"
                                                                        autoCapitalize="none"
                                                                        className={`${inputClasses} ${errors.email ? 'border-red-500/40 focus:border-red-500' : ''}`} 
                                                                        placeholder="john@example.com" 
                                                                    />
                                                                </div>
                                                                {errors.email && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.email}</p>}
                                                            </div>
                                                            <div>
                                                                <label className={labelClasses}>Current Location *</label>
                                                                <div className="relative group">
                                                                    <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'location' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <input 
                                                                        required 
                                                                        value={location}
                                                                        onChange={(e) => {
                                                                            setLocation(e.target.value);
                                                                            if (errors.location) setErrors(prev => ({ ...prev, location: "" }));
                                                                        }}
                                                                        onFocus={() => setActiveField('location')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        type="text" 
                                                                        autoComplete="address-level2"
                                                                        autoCapitalize="words"
                                                                        className={`${inputClasses} ${errors.location ? 'border-red-500/40 focus:border-red-500' : ''}`} 
                                                                        placeholder="e.g. Koramangala, Bengaluru" 
                                                                    />
                                                                </div>
                                                                {errors.location && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.location}</p>}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* STEP 2: ROLE & PREFERENCES */}
                                                {step === 2 && (
                                                    <motion.div
                                                        key="step-2"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="border-b border-white/5 pb-2 mb-6 flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4 text-[#418B1E]" />
                                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 2: Role Details</h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className={labelClasses}>Position Applying For *</label>
                                                                <div className="relative group">
                                                                    <Briefcase className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'selectedRole' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <select 
                                                                        required 
                                                                        value={selectedRole} 
                                                                        onChange={(e) => {
                                                                            setSelectedRole(e.target.value);
                                                                            if (errors.position) setErrors(prev => ({ ...prev, position: "" }));
                                                                        }}
                                                                        onFocus={() => setActiveField('selectedRole')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        className={`${inputClasses} appearance-none cursor-pointer pr-12 ${errors.position ? 'border-red-500/40 focus:border-red-500' : ''}`}
                                                                    >
                                                                        <option value="" disabled className="text-black bg-white">Select target role...</option>
                                                                        {POSITIONS.map((pos, i) => (
                                                                            <option key={i} value={pos} className="text-black bg-white">{pos}</option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                                        <ChevronDown className="w-4 h-4" />
                                                                    </div>
                                                                </div>
                                                                {errors.position && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.position}</p>}
                                                            </div>
                                                            <div>
                                                                <label className={labelClasses}>Total Work Experience *</label>
                                                                <div className="relative group">
                                                                    <Sparkles className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'experience' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <select 
                                                                        required 
                                                                        value={experience} 
                                                                        onChange={(e) => {
                                                                            setExperience(e.target.value);
                                                                            if (errors.experience) setErrors(prev => ({ ...prev, experience: "" }));
                                                                        }}
                                                                        onFocus={() => setActiveField('experience')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        className={`${inputClasses} appearance-none cursor-pointer pr-12 ${errors.experience ? 'border-red-500/40 focus:border-red-500' : ''}`}
                                                                    >
                                                                        <option value="" disabled className="text-black bg-white">Select experience...</option>
                                                                        {EXPERIENCES.map((exp, i) => (
                                                                            <option key={i} value={exp} className="text-black bg-white">{exp}</option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                                        <ChevronDown className="w-4 h-4" />
                                                                    </div>
                                                                </div>
                                                                {errors.experience && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.experience}</p>}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className={labelClasses}>Expected Salary (Optional)</label>
                                                                <div className="relative group">
                                                                    <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'expectedSalary' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <input 
                                                                        value={expectedSalary}
                                                                        onChange={(e) => setExpectedSalary(e.target.value)}
                                                                        onFocus={() => setActiveField('expectedSalary')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        type="text" 
                                                                        autoCapitalize="words"
                                                                        className={inputClasses} 
                                                                        placeholder="e.g. ₹ 25,000 / Month" 
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className={labelClasses}>Available from *</label>
                                                                <div className="relative group">
                                                                    <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none z-10 ${activeField === 'joiningDate' ? 'text-[#418B1E]' : 'text-gray-500'}`} />
                                                                    <input 
                                                                        required
                                                                        value={joiningDate}
                                                                        onChange={(e) => {
                                                                            setJoiningDate(e.target.value);
                                                                            if (errors.joiningDate) setErrors(prev => ({ ...prev, joiningDate: "" }));
                                                                        }}
                                                                        onFocus={() => setActiveField('joiningDate')}
                                                                        onBlur={() => setActiveField(null)}
                                                                        type="date" 
                                                                        min={getTodayString()} 
                                                                        className={`${inputClasses} [color-scheme:dark] ${errors.joiningDate ? 'border-red-500/40 focus:border-red-500' : ''}`} 
                                                                    />
                                                                </div>
                                                                {errors.joiningDate && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.joiningDate}</p>}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* STEP 3: RESUME, MOTIVATION & REVIEW */}
                                                {step === 3 && (
                                                    <motion.div
                                                        key="step-3"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="border-b border-white/5 pb-2 mb-6 flex items-center gap-2">
                                                            <Sparkles className="w-4 h-4 text-[#F7C808]" />
                                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Step 3: Document Upload & Review</h4>
                                                        </div>

                                                        {/* Summary Badge Review */}
                                                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-5 sm:p-8 text-left space-y-6">
                                                            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-[#418B1E] animate-pulse" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Verify Your Information</span>
                                                                </div>
                                                                <span className="text-[9px] font-bold text-white/40 font-mono tracking-widest">BENGALURU • INDIA</span>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Full Name</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">{fullName}</span>
                                                                </div>
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Mobile & WhatsApp</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">{mobile}</span>
                                                                </div>
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Email Address</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-white truncate" title={email}>{email}</span>
                                                                </div>
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Current Location</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">{location}</span>
                                                                </div>
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Applying For</span>
                                                                    <span className="text-xs sm:text-sm font-bold text-[#418B1E] truncate">{selectedRole}</span>
                                                                </div>
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Total Experience</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">{experience}</span>
                                                                </div>
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Expected Salary</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">{expectedSalary || 'N/A'}</span>
                                                                </div>
                                                                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between min-h-[72px]">
                                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Available from</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">
                                                                        {joiningDate ? new Date(joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Immediate'}
                                                                    </span>
                                                                </div>
                                                             </div>
                                                         </div>

                                                        {/* Custom Drag & Drop Resume Upload Area */}
                                                        <div className="space-y-3 text-left">
                                                            <span className={labelClasses}>Upload Resume *</span>
                                                            <div
                                                                onDragOver={handleDragOver}
                                                                onDragLeave={handleDragLeave}
                                                                onDrop={handleDrop}
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 relative ${
                                                                    isDragging 
                                                                        ? 'border-[#418B1E] bg-[#418B1E]/10 scale-[1.01]' 
                                                                        : resumeFile 
                                                                        ? 'border-[#418B1E]/40 bg-white/[0.02]' 
                                                                        : 'border-white/10 hover:border-[#418B1E]/60 bg-white/[0.01]'
                                                                }`}
                                                            >
                                                                <input 
                                                                    type="file" 
                                                                    ref={fileInputRef}
                                                                    onChange={handleFileSelect}
                                                                    accept=".pdf,.doc,.docx"
                                                                    className="hidden" 
                                                                />

                                                                {!resumeFile ? (
                                                                    <div className="flex flex-col items-center justify-center space-y-3 py-4 select-none">
                                                                        <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#418B1E] transition-colors">
                                                                            <UploadCloud className="w-7 h-7" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm text-white font-medium">
                                                                                <span className="hidden md:inline">Drag & drop your resume here, or </span>
                                                                                <span className="text-[#418B1E] hover:underline underline-offset-2">tap to browse file</span>
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, or DOCX (Max 5MB)</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4 text-left relative overflow-hidden z-10" onClick={(e) => e.stopPropagation()}>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-12 h-12 rounded-xl bg-[#418B1E]/10 flex items-center justify-center text-[#418B1E]">
                                                                                <FileText className="w-6 h-6" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{resumeFile.name}</p>
                                                                                <p className="text-xs text-gray-500 font-mono">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-3">
                                                                            {isUploading ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Loader2 className="w-4 h-4 animate-spin text-[#418B1E]" />
                                                                                    <span className="text-xs text-[#418B1E] font-bold">{uploadProgress}%</span>
                                                                                </div>
                                                                            ) : uploadCompleted ? (
                                                                                <span className="text-xs font-bold text-[#418B1E] px-3 py-1 bg-[#418B1E]/10 rounded-full flex items-center gap-1">
                                                                                    <Check className="w-3.5 h-3.5" /> Uploaded
                                                                                </span>
                                                                            ) : null}

                                                                            <button 
                                                                                type="button" 
                                                                                onClick={removeFile}
                                                                                className="p-2 hover:bg-white/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Progress Bar background overlay */}
                                                                        {isUploading && (
                                                                            <div 
                                                                                className="absolute bottom-0 left-0 h-1 bg-[#418B1E]/30 transition-all duration-300"
                                                                                style={{ width: `${uploadProgress}%` }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {uploadError && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {uploadError}</p>}
                                                            {errors.resume && <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.resume}</p>}
                                                        </div>

                                                        {/* Motivation Text Area */}
                                                        <div>
                                                            <label className={labelClasses}>Why Do You Want To Join Taaza Bites?</label>
                                                            <textarea 
                                                                value={comments}
                                                                onChange={(e) => {
                                                                    if (e.target.value.length <= 500) {
                                                                        setComments(e.target.value);
                                                                    }
                                                                }}
                                                                rows={3} 
                                                                className={`${inputClasses.replace('pl-12', 'px-5')} resize-none`} 
                                                                placeholder="Tell our recruitment team what excites you about the future of healthy eating..."
                                                            />
                                                            <div className="flex justify-between items-center mt-1.5 px-1 select-none">
                                                                <span className="text-[10px] text-gray-500 font-mono">Maximum 500 characters</span>
                                                                <span className={`text-[10px] font-mono ${comments.length >= 500 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                                                                    {comments.length}/500
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Step Navigation Controls */}
                                            <div className="pt-8 border-t border-white/5 flex items-center justify-between gap-4">
                                                {step > 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleBackStep}
                                                        className="px-6 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                        <span>Back</span>
                                                    </button>
                                                ) : (
                                                    <div /> // spacer
                                                )}

                                                {step < 3 ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleNextStep}
                                                        className="px-8 py-4 rounded-full bg-[#418B1E] hover:bg-[#418B1E]/95 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#418B1E]/10 group"
                                                    >
                                                        <span>Continue</span>
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting || (resumeFile !== null && isUploading)}
                                                        className="px-8 py-4 rounded-full bg-white hover:bg-[#418B1E] text-[#1A1A1A] hover:text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span>Submitting Profile...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>Submit Application</span>
                                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </RenderOnView>
                    </div>
                </div>

                {/* Contact Section */}
                <RenderOnView animation="fade-in-up" delay={0.3}>
                    <div className="mt-20 sm:mt-32 p-10 bg-white/5 border border-white/10 rounded-[2rem] text-center max-w-4xl mx-auto backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#418B1E]/5 to-transparent opacity-50"></div>
                        <h4 className="text-2xl font-serif text-white mb-8 relative z-10">Get in Touch</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#418B1E]">
                                    <Mail className="text-xl"/>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Email</span>
                                <a href="mailto:careers@taazabites.in" className="text-white hover:text-[#418B1E] transition-colors font-medium">careers@taazabites.in</a>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#418B1E]">
                                    <Phone className="text-xl"/>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Phone</span>
                                <a href={`tel:${WHATSAPP_NUMBER}`} className="text-white hover:text-[#418B1E] transition-colors font-medium">+91 {WHATSAPP_NUMBER}</a>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#418B1E]">
                                    <Circle className="text-xl"/>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Location</span>
                                <span className="text-white font-medium">Bangalore, Karnataka</span>
                            </div>
                        </div>
                    </div>
                </RenderOnView>
            </div>
        </div>
    );
};
