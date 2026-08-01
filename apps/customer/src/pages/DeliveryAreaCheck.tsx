import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button, Card, Input } from "../components/ui/primitives";
import { ServiceAreaService, DeliveryRequestService } from "../firebase/services";
import { useToast } from "../context/ToastContext";

export default function DeliveryAreaCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [pincode, setPincode] = useState("");
  const [areaName, setAreaName] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [serviceArea, setServiceArea] = useState<any>(null);

  const [notifyName, setNotifyName] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [submittingNotify, setSubmittingNotify] = useState(false);

  const selectedPlan = location.state?.selectedPlan || JSON.parse(localStorage.getItem('taaza_selected_plan') || 'null');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedPincode = "";
        let detectedArea = "";
        const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

        try {
          if (apiKey && apiKey !== 'YOUR_API_KEY') {
            const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
            const gRes = await fetch(geoUrl);
            const gData = await gRes.json();

            if (gData.status === 'OK' && gData.results?.length > 0) {
              const res = gData.results[0];
              res.address_components?.forEach((comp: any) => {
                if (comp.types.includes('sublocality') || comp.types.includes('neighborhood') || comp.types.includes('sublocality_level_1')) {
                  detectedArea = detectedArea || comp.long_name;
                }
                if (comp.types.includes('postal_code')) {
                  detectedPincode = comp.long_name;
                }
              });
              if (!detectedArea) {
                detectedArea = res.formatted_address?.split(',')[0] || "";
              }
            }
          }

          if (!detectedPincode || !detectedArea) {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            if (!detectedPincode) detectedPincode = data?.postcode || "";
            if (!detectedArea) detectedArea = data?.locality || data?.city || data?.principalSubdivision || "";
          }

          if (detectedArea) {
            setAreaName(detectedArea);
          }
          
          if (detectedPincode) {
            const cleanPincode = detectedPincode.replace(/\D/g, '').slice(0, 6);
            if (cleanPincode.length === 6) {
              setPincode(cleanPincode);
              showToast(`Location detected via Google Maps! Pincode: ${cleanPincode}${detectedArea ? ', Area: ' + detectedArea : ''}`, "success");
            } else {
              showToast(`Detected postcode '${cleanPincode}' is not a valid 6-digit pincode.`, "error");
            }
          } else {
            showToast("Could not find pincode for your location. Please enter manually.", "error");
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          showToast("Failed to auto-detect pincode. Please enter manually.", "error");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.warn("Geolocation warning:", error);
        showToast("Unable to retrieve location. Please check browser permissions.", "error");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheck = async () => {
    if (pincode.length !== 6) {
      showToast("Please enter a valid 6-digit pincode", "error");
      return;
    }
    if (!areaName.trim()) {
      showToast("Please enter your delivery area or locality", "error");
      return;
    }

    setLoading(true);
    setIsValid(null);
    setNotifySubmitted(false);
    try {
      const area = await ServiceAreaService.getServiceAreaByPincode(pincode);
      
      if (area) {
        setIsValid(true);
        setServiceArea(area);
        showToast(`Great! We deliver in ${areaName}.`, "success");
      } else {
        setIsValid(false);
        showToast("Sorry, we don't serve this area yet.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error checking area. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

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

    setSubmittingNotify(true);
    try {
      await DeliveryRequestService.createRequest({
        name: notifyName,
        phone: notifyPhone,
        area: areaName,
        pincode: pincode
      });
      setNotifySubmitted(true);
      showToast("Thank you! We will notify you when we expand to your area.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit request. Please try again.", "error");
    } finally {
      setSubmittingNotify(false);
    }
  };

  const handleProceed = () => {
    navigate("/subscribe/address", { 
      state: { 
        ...location.state, 
        pincode, 
        areaName,
        serviceArea 
      } 
    });
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3 h-3" /> Step 2: Service Area Check
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tightest mb-4">Check Delivery Area</h1>
          <p className="text-zinc-500 font-medium max-w-md mx-auto">Enter your delivery pincode to verify fresh meal delivery availability in your area.</p>
        </header>

        <Card className="p-8 md:p-10 rounded-[3rem] shadow-2xl bg-white border-zinc-100 relative overflow-hidden">
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block pl-2 mb-2">Enter Pincode</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input 
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 560001"
                      className="w-full pl-14 h-16 rounded-2xl border-zinc-200 text-lg font-bold tracking-widest"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block pl-2 mb-2">Enter Area / Locality</label>
                  <Input 
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="e.g. HSR Layout"
                    className="w-full h-16 rounded-2xl border-zinc-200 px-5 text-base font-bold text-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleCheck} 
                  disabled={loading || pincode.length !== 6 || !areaName.trim()}
                  className="w-full h-16 rounded-2xl bg-zinc-900 hover:bg-black text-white font-bold"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Availability"}
                </Button>
              </div>

              {/* Geolocation autofill trigger button */}
              <div className="flex justify-end pr-2 pt-1">
                <button
                  type="button"
                  disabled={detecting}
                  onClick={handleDetectLocation}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-55"
                >
                  {detecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting Coordinates...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" />
                      <span>Detect My Location</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isValid === false && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Outside Service Zone</h4>
                    <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                      We currently do not deliver to pincode <strong>{pincode}</strong> ({areaName}) yet. But we are expanding quickly!
                    </p>
                  </div>
                </div>

                {!notifySubmitted ? (
                  <form onSubmit={handleNotifyMe} className="bg-zinc-50 border border-zinc-200/65 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-700">Get Notified When We Launch Here</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Your Full Name</label>
                        <Input 
                          value={notifyName}
                          onChange={(e) => setNotifyName(e.target.value)}
                          placeholder="Enter your name"
                          required
                          className="h-11 rounded-xl bg-white border-zinc-200 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Phone Number</label>
                        <Input 
                          value={notifyPhone}
                          onChange={(e) => setNotifyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit phone number"
                          required
                          className="h-11 rounded-xl bg-white border-zinc-200 font-semibold tracking-wider"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={submittingNotify}
                      className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs tracking-wider"
                    >
                      {submittingNotify ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Notify Me"}
                    </Button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <h4 className="text-sm font-black text-emerald-900 uppercase">Request Saved!</h4>
                    <p className="text-xs text-emerald-700 font-medium mt-1">Thank you, {notifyName}. We will contact you immediately once we start our meal services in {areaName} ({pincode})!</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {isValid === true && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Area Verified</h4>
                    <p className="text-xs text-emerald-700 font-medium mt-1">Great news! We have active delivery coverage in your zone. Your meals will be delivered fresh every morning.</p>
                  </div>
                </div>

                <Button 
                  onClick={handleProceed}
                  className="w-full py-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-600/20 group"
                >
                  Configure Address
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}
          </div>
        </Card>

        <footer className="mt-8 text-center">
          <button 
            onClick={() => navigate(-1)}
            className="text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
          >
            ← Back to Assessment
          </button>
        </footer>
      </div>
    </main>
  );
}
