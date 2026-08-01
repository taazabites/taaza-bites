import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Search, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Bike, 
  HelpCircle,
  PhoneCall,
  Mail,
  ChevronDown
} from "lucide-react";
import { Button, Card, Input } from "../components/ui/primitives";
import { ServiceAreaService, DeliveryRequestService } from "../firebase/services";
import { ServiceArea } from "../firebase/collections";
import { useToast } from "../context/ToastContext";

export default function DeliveryAreas() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);

  // Notify form state
  const [notifyName, setNotifyName] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyPincode, setNotifyPincode] = useState("");
  const [notifyArea, setNotifyArea] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [submittingNotify, setSubmittingNotify] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await ServiceAreaService.getServiceAreas();
        setServiceAreas(areas);
        setFilteredAreas(areas);
      } catch (err) {
        console.error("Error loading service areas:", err);
        showToast("Unable to load delivery locations. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, [showToast]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAreas(serviceAreas);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = serviceAreas.filter(area => {
      const matchCity = area.city?.toLowerCase().includes(query);
      const matchHub = area.hub?.toLowerCase().includes(query);
      const matchName = area.name?.toLowerCase().includes(query);
      const matchArea = area.area?.toLowerCase().includes(query);
      
      const matchPincode = area.pincodes?.some(p => p.includes(query)) || area.pincode?.includes(query);
      const matchSubAreas = area.subAreas?.some(sub => sub.toLowerCase().includes(query));

      return matchCity || matchHub || matchName || matchArea || matchPincode || matchSubAreas;
    });

    setFilteredAreas(filtered);
  }, [searchQuery, serviceAreas]);

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyName.trim()) {
      showToast("Please enter your name.", "error");
      return;
    }
    if (notifyPhone.length !== 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    if (notifyPincode.length !== 6) {
      showToast("Please enter a valid 6-digit pincode.", "error");
      return;
    }
    if (!notifyArea.trim()) {
      showToast("Please enter your area or locality.", "error");
      return;
    }

    setSubmittingNotify(true);
    try {
      await DeliveryRequestService.createRequest({
        name: notifyName,
        phone: notifyPhone,
        area: notifyArea,
        pincode: notifyPincode
      });
      setNotifySubmitted(true);
      showToast("Thank you! We will notify you when we launch in your area.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit request. Please try again.", "error");
    } finally {
      setSubmittingNotify(false);
    }
  };

  const deliveryFAQs = [
    {
      q: "What are your delivery timings?",
      a: "Our standard morning delivery window is between 6:30 AM and 8:30 AM daily. Your meals are delivered completely fresh, prepared by our chefs just hours before dispatch."
    },
    {
      q: "Can I choose or customize my delivery slot?",
      a: "Yes! During checkout, you can select your preferred delivery time slot that fits your morning schedule. You can also adjust or pause slots directly in your customer dashboard."
    },
    {
      q: "How are the meals packaged for transport?",
      a: "All meals are sealed in premium, 100% recyclable, microwave-safe containers and carried inside insulated, temperature-controlled delivery bags to maintain crisp freshness and nutritional value."
    },
    {
      q: "What if I am outside your current service area?",
      a: "Please fill out the 'Notify Me' request form! We are actively expanding to new micro-markets in Bangalore and prioritize new hub openings based on areas with the highest waitlist counts."
    },
    {
      q: "Can I temporarily pause deliveries while traveling?",
      a: "Absolutely. You can pause, resume, or reschedule deliveries at no extra cost directly from your customer dashboard with a simple 24-hour notice."
    }
  ];

  return (
    <div className="bg-zinc-50 min-h-screen pt-28 pb-16">
      
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100/60 mb-5"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" /> Delivery Coverage
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Guaranteed Fresh Delivery Zones
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-sm md:text-base max-w-2xl mx-auto mt-4 font-semibold"
          >
            We prepare meals and deliver them fresh to active regions across Bengaluru. Check our hubs, search by pincode, or sign up for expansion alerts.
          </motion.p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: SEARCH & NOTIFY ME */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* 2. SEARCH BOX */}
          <div className="bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" /> Search Your Zone
              </h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Type pincode, area name, or sub-locality
              </p>
              
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 560035, Kasavanahalli, HSR Layout"
                  className="w-full pl-14 h-16 rounded-2xl border-zinc-200 text-base font-bold text-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* 3. AREA CARDS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                Active Service Zones ({filteredAreas.length})
              </h3>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase"
                >
                  Clear Search
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-4">Analyzing delivery zones...</p>
              </div>
            ) : filteredAreas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAreas.map((area, index) => (
                  <motion.div
                    key={area.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white border border-zinc-200/90 rounded-[2rem] p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-100/60">
                          {area.hub || "Taaza Hub"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> 6:30 - 8:30 AM
                        </div>
                      </div>

                      <h4 className="text-xl font-black text-zinc-950 tracking-tight leading-tight">{area.area || area.name}</h4>
                      <p className="text-zinc-400 text-xs font-bold tracking-tight uppercase mt-0.5">{area.city}</p>

                      <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Covered Pincodes</p>
                          <div className="flex flex-wrap gap-1.5">
                            {area.pincodes?.map((pin) => (
                              <span key={pin} className="px-2 py-0.5 bg-zinc-100 text-zinc-800 text-[10px] font-black tracking-widest rounded-md">
                                {pin}
                              </span>
                            )) || (
                              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 text-[10px] font-black tracking-widest rounded-md">
                                {area.pincode}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Key Sub-Locilities Covered</p>
                          <div className="flex flex-wrap gap-1.5">
                            {area.subAreas?.map((sub) => (
                              <span key={sub} className="px-2.5 py-1 bg-emerald-50/50 border border-emerald-100/40 text-emerald-800 text-[10px] font-bold tracking-tight rounded-full">
                                {sub}
                              </span>
                            )) || (
                              <span className="text-zinc-400 text-xs">Standard Area Area Coverage</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end">
                      <Link to="/plans">
                        <Button className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 group">
                          Select Plan <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-zinc-200/90 rounded-[2.5rem] p-8 text-center"
              >
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h4 className="text-base font-black text-zinc-900 uppercase tracking-tight">No Matching Zone Found</h4>
                <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto mt-1 leading-relaxed">
                  We currently do not serve the queried location. However, you can submit a notification request below to tell us where to launch next!
                </p>
              </motion.div>
            )}
          </div>

          {/* 4. NOTIFY ME FLOW INTEGRATION */}
          <div className="bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {!notifySubmitted ? (
              <form onSubmit={handleNotifyMe} className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" /> Don&apos;t See Your Location?
                  </h3>
                  <p className="text-zinc-500 text-xs font-semibold mt-1">
                    Fill out our expansion waitlist request. We plan our hub expansions according to demand!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1.5">Full Name</label>
                    <Input 
                      value={notifyName}
                      onChange={(e) => setNotifyName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="h-12 rounded-xl bg-white border-zinc-200 font-semibold text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1.5">Mobile Number</label>
                    <Input 
                      value={notifyPhone}
                      onChange={(e) => setNotifyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      required
                      className="h-12 rounded-xl bg-white border-zinc-200 font-semibold tracking-wider text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1.5">Pincode</label>
                    <Input 
                      value={notifyPincode}
                      onChange={(e) => setNotifyPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit pincode"
                      required
                      className="h-12 rounded-xl bg-white border-zinc-200 font-semibold tracking-widest text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1.5">Locality / Colony</label>
                    <Input 
                      value={notifyArea}
                      onChange={(e) => setNotifyArea(e.target.value)}
                      placeholder="e.g. Indiranagar, Whitefield"
                      required
                      className="h-12 rounded-xl bg-white border-zinc-200 font-semibold text-sm"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingNotify}
                  className="w-full md:w-auto h-12 px-8 rounded-xl bg-zinc-950 hover:bg-black text-white font-black text-xs uppercase tracking-wider"
                >
                  {submittingNotify ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Waitlist Request"}
                </Button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-xl font-black text-emerald-950 uppercase">Successfully Added to Waitlist!</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto mt-2 font-medium">
                  Thanks, <strong>{notifyName}</strong>. We have logged your request for <strong>{notifyArea} ({notifyPincode})</strong>. You will receive an SMS and email notification immediately when our delivery kitchen registers coverage here!
                </p>
                <button 
                  onClick={() => {
                    setNotifyName("");
                    setNotifyPhone("");
                    setNotifyPincode("");
                    setNotifyArea("");
                    setNotifySubmitted(false);
                  }}
                  className="mt-6 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase"
                >
                  Submit Another Location
                </button>
              </motion.div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: DELIVERY INFO & FAQs */}
        <div className="space-y-10">
          
          {/* 5. DELIVERY INFORMATION */}
          <div className="bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl" />
            
            <h3 className="text-base font-black text-zinc-950 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Bike className="w-5 h-5 text-emerald-600" /> Delivery Standards
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Morning Dispatch</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">We deliver daily from 6:30 AM to 8:30 AM. Perfect fresh fuel before your day starts.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Insulated Packing</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">Dispatched in custom protective packs, ensuring meals are fresh, cold-retained, and safe.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Contactless Delivery</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">Our delivery executives follow strict hygiene guidelines and support contactless delivery protocols.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. FAQ SECTION */}
          <div className="bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="text-base font-black text-zinc-950 uppercase tracking-wider mb-5 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" /> Coverage FAQs
            </h3>

            <div className="space-y-3.5">
              {deliveryFAQs.map((faq, idx) => (
                <div key={idx} className="border-b border-zinc-100 pb-3">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex justify-between items-center text-left text-xs font-black text-zinc-800 uppercase tracking-tight hover:text-emerald-600 transition-colors py-1.5 cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${openFaqIndex === idx ? "rotate-180 text-emerald-600" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed pl-1">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* 7. CONTACT SECTION */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-600/10 rounded-full filter blur-2xl" />
            
            <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-emerald-400">Delivery Support</h3>
            <h4 className="text-lg font-black tracking-tight leading-tight">Need assistance with your delivery?</h4>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              If you have specific access gating, complex colony structures, or bulk order delivery queries, contact our desk.
            </p>

            <div className="mt-5 space-y-3.5 pt-4 border-t border-zinc-900 text-xs text-zinc-300">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold">+91 79757 71457</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold">deliveries@taazabites.com</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
