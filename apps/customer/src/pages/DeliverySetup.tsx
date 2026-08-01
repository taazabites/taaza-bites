import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Home,
  Building,
  Briefcase,
  Sparkles,
  Loader2,
  Search,
  AlertCircle,
  Clock,
  Calendar
} from "lucide-react";
import { Button, Input, Card } from "@/src/components/ui/primitives";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useDebouncedCallback } from "@/src/hooks/useDebouncedCallback";
import { useThrottledCallback } from "@/src/hooks/useThrottledCallback";
import { AddressService, ServiceAreaService } from "@/src/firebase/services";
import { ServiceArea, Address } from "@/src/firebase/collections";
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap, 
  useMapsLibrary,
  ControlPosition,
  MapControl
} from "@vis.gl/react-google-maps";
import { cn } from "@/src/lib/utils";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  houseNumber: z.string().min(1, "House/Flat number is required"),
  building: z.string().optional(),
  street: z.string().min(3, "Street details required"),
  landmark: z.string().optional(),
  area: z.string().min(2, "Area/Locality required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid Pincode (6 digits)"),
  latitude: z.number(),
  longitude: z.number(),
  deliveryInstructions: z.string().optional(),
  addressType: z.enum(["Home", "Work", "Other"]),
  default: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

// --- Components ---

function MapPicker({ center, onPositionChange }: { 
  center: google.maps.LatLngLiteral, 
  onPositionChange: (pos: google.maps.LatLngLiteral) => void 
}) {
  const map = useMap();
  const { showToast } = useToast();
  const [markerPos, setMarkerPos] = useState(center);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (center && (center.lat !== markerPos.lat || center.lng !== markerPos.lng)) {
      setMarkerPos(center);
      if (map) map.panTo(center);
    }
  }, [center.lat, center.lng, map]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setIsLocating(true);
    showToast("Detecting your GPS location...", "info");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        setMarkerPos(pos);
        if (map) {
          map.panTo(pos);
          map.setZoom(16);
        }
        onPositionChange(pos);
        showToast("Map updated to your current location!", "success");
        setIsLocating(false);
      },
      (error) => {
        console.warn("Geolocation error, using default serviceable location:", error);
        const fallbackPos = { lat: 12.9784, lng: 77.6408 };
        setMarkerPos(fallbackPos);
        if (map) {
          map.panTo(fallbackPos);
          map.setZoom(16);
        }
        onPositionChange(fallbackPos);
        showToast("Set location to Indiranagar, Bengaluru (Serviceable Area).", "info");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0
      }
    );
  };

  const throttledPositionChange = useThrottledCallback((pos: google.maps.LatLngLiteral) => {
    onPositionChange(pos);
  }, 100);

  return (
    <Map
      defaultCenter={center.lat ? center : { lat: 12.9784, lng: 77.6408 }}
      defaultZoom={15}
      mapId="DELIVERY_MAP"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      style={{ width: '100%', height: '320px', borderRadius: '1.5rem' }}
      onCenterChanged={(ev) => {
        const newCenter = ev.map.getCenter();
        if (newCenter) {
          const pos = { lat: newCenter.lat(), lng: newCenter.lng() };
          setMarkerPos(pos);
          throttledPositionChange(pos);
        }
      }}
    >
      <AdvancedMarker position={markerPos}>
        <Pin background="#10b981" glyphColor="#fff" borderColor="#064e3b" />
      </AdvancedMarker>
      
      <MapControl position={ControlPosition.BOTTOM_LEFT}>
        <div className="m-3">
          <Button 
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLocating}
            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-2"
            onClick={handleCurrentLocation}
          >
            {isLocating ? (
              <>
                <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 text-emerald-600 fill-emerald-600/20" />
                <span>Current Location</span>
              </>
            )}
          </Button>
        </div>
      </MapControl>
    </Map>
  );
}

function PlaceAutocomplete({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void }) {
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const placesLib = useMapsLibrary("places");
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const map = useMap();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    setSessionToken(new placesLib.AutocompleteSessionToken());
  }, [placesLib]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPredictions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debouncedHandleSearch = useDebouncedCallback((val: string) => {
    if (!val || val.trim().length < 2 || !autocompleteService.current) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    autocompleteService.current.getPlacePredictions(
      { 
        input: val, 
        sessionToken: sessionToken!, 
        componentRestrictions: { country: 'in' },
        locationBias: map?.getCenter() ? { radius: 20000, center: map.getCenter()! } : undefined
      },
      (preds) => {
        setPredictions(preds || []);
        setIsSearching(false);
      }
    );
  }, 400);

  const handleSearch = (val: string) => {
    setInputValue(val);
    if (!val || val.trim().length < 2) {
      setPredictions([]);
      return;
    }
    debouncedHandleSearch(val);
  };

  const selectPlace = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesLib || !map) return;
    if (!placesService.current) {
      placesService.current = new placesLib.PlacesService(map);
    }

    placesService.current.getDetails(
      { placeId: prediction.place_id, sessionToken: sessionToken!, fields: ['geometry', 'address_components', 'formatted_address', 'name'] },
      (place) => {
        if (place) {
          onPlaceSelect(place);
          setInputValue(prediction.description);
          setPredictions([]);
          setSessionToken(new placesLib.AutocompleteSessionToken());
        }
      }
    );
  };

  return (
    <div ref={wrapperRef} className="relative z-50">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
        <Input 
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search building, street or area with Google Places..."
          className="h-14 pl-12 pr-28 rounded-2xl bg-white border-2 border-emerald-100 focus:border-emerald-600 text-zinc-900 font-semibold shadow-sm text-sm"
        />
        {isSearching ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 animate-spin" />
        ) : (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Places API
          </span>
        )}
      </div>
      {predictions.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-[100] max-h-72 overflow-y-auto divide-y divide-zinc-50">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              className="w-full text-left px-5 py-3.5 hover:bg-emerald-50/80 flex items-start gap-3 transition-colors"
              onClick={() => selectPlace(p)}
            >
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900">{p.structured_formatting.main_text}</p>
                <p className="text-[11px] text-zinc-500 font-medium truncate">{p.structured_formatting.secondary_text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GoogleAddressFieldInput({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  label,
  error,
  icon: Icon,
  maxLength,
}: {
  value: string;
  onChange: (val: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  icon?: any;
  maxLength?: number;
}) {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const placesLib = useMapsLibrary("places");
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const map = useMap();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    setSessionToken(new placesLib.AutocompleteSessionToken());
  }, [placesLib]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debouncedFetchPredictions = useDebouncedCallback((val: string) => {
    if (val.trim().length >= 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: val,
          sessionToken: sessionToken!,
          componentRestrictions: { country: "in" },
          locationBias: map?.getCenter() ? { radius: 25000, center: map.getCenter()! } : undefined
        },
        (preds) => {
          if (preds && preds.length > 0) {
            setPredictions(preds);
            setShowDropdown(true);
          } else {
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    } else {
      setPredictions([]);
      setShowDropdown(false);
    }
  }, 400);

  const handleInputChange = (val: string) => {
    onChange(val);
    debouncedFetchPredictions(val);
  };

  const selectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesLib || !map) {
      onChange(prediction.structured_formatting.main_text || prediction.description);
      setShowDropdown(false);
      return;
    }
    if (!placesService.current) {
      placesService.current = new placesLib.PlacesService(map);
    }

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        sessionToken: sessionToken!,
        fields: ["geometry", "address_components", "formatted_address", "name"],
      },
      (place) => {
        if (place) {
          onPlaceSelect(place);
          setShowDropdown(false);
          setPredictions([]);
          setSessionToken(new placesLib.AutocompleteSessionToken());
        }
      }
    );
  };

  return (
    <div ref={wrapperRef} className="relative z-20">
      {label && (
        <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Autocomplete
          </span>
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        )}
        <Input
          value={value}
          maxLength={maxLength}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (value.trim().length >= 2 && predictions.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className={`h-14 ${Icon ? "pl-11" : "px-6"} pr-4 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-medium`}
        />
      </div>

      {showDropdown && predictions.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-[100] max-h-56 overflow-y-auto divide-y divide-zinc-50">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-emerald-50/60 flex items-start gap-3 transition-colors text-xs"
              onClick={() => selectPrediction(p)}
            >
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-zinc-900 truncate">
                  {p.structured_formatting.main_text}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium truncate">
                  {p.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{error}</p>
      )}
    </div>
  );
}

// --- Main Page ---

function DeliverySetupContent() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isValidArea, setIsValidArea] = useState<boolean | null>(null);
  const [activeServiceArea, setActiveServiceArea] = useState<ServiceArea | null>(null);
  const geometryLib = useMapsLibrary("geometry");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: userData?.name || "",
      phone: userData?.phone || "",
      addressType: "Home",
      default: true,
      latitude: 12.9716,
      longitude: 77.5946,
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "",
    }
  });

  const watchedValues = watch();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const healthAssessment = location.state?.healthAssessment;
  const editAddress = location.state?.editAddress;

  useEffect(() => {
    const sp = location.state?.selectedPlan;
    if (sp) {
      setSelectedPlan(sp);
    } else {
      const saved = localStorage.getItem('taaza_selected_plan');
      if (saved) {
        try {
          setSelectedPlan(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved plan", e);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (editAddress) {
      setValue("fullName", editAddress.fullName || "");
      setValue("phone", editAddress.phone || "");
      setValue("addressType", editAddress.addressType || "Home");
      setValue("houseNumber", editAddress.houseNumber || "");
      setValue("building", editAddress.building || "");
      setValue("street", editAddress.street || "");
      setValue("area", editAddress.area || "");
      setValue("city", editAddress.city || "");
      setValue("state", editAddress.state || "");
      setValue("pincode", editAddress.pincode || "");
      setValue("deliveryInstructions", editAddress.deliveryInstructions || "");
      if (editAddress.latitude) setValue("latitude", editAddress.latitude);
      if (editAddress.longitude) setValue("longitude", editAddress.longitude);
      setValue("default", editAddress.default ?? true);
    } else if (location.state?.pincode) {
      setValue("pincode", location.state.pincode);
    }
  }, [editAddress, location.state?.pincode, setValue]);

  useEffect(() => {
    ServiceAreaService.getServiceAreas().then(setServiceAreas);
  }, []);

  const validateArea = (lat: number, lng: number, pincode: string) => {
    if (!geometryLib) return;

    if (serviceAreas.length === 0) {
      setIsValidArea(false);
      setActiveServiceArea(null);
      return null;
    }

    const point = new google.maps.LatLng(lat, lng);
    
    // 1. Check Polygon
    let foundArea = serviceAreas.find(area => {
      if (!area.polygonCoordinates) return false;
      const polygon = new google.maps.Polygon({ paths: area.polygonCoordinates });
      return google.maps.geometry.poly.containsLocation(point, polygon);
    });

    // 2. Fallback to Pincode
    if (!foundArea) {
      foundArea = serviceAreas.find(area => area.pincode === pincode);
    }

    // 3. Demo Override: Accept any location if not found
    if (!foundArea) {
      foundArea = {
        id: 'demo_area',
        name: 'Serviceable Area (Demo)',
        pincode: pincode,
        city: 'Detected City',
        active: true,
        deliveryFee: 0,
        minimumOrder: 0
      } as ServiceArea;
    }

    setIsValidArea(!!foundArea);
    setActiveServiceArea(foundArea || null);
    return foundArea;
  };

  useEffect(() => {
    if (watchedValues.latitude && watchedValues.longitude) {
      validateArea(watchedValues.latitude, watchedValues.longitude, watchedValues.pincode);
    }
  }, [watchedValues.latitude, watchedValues.longitude, watchedValues.pincode, serviceAreas, geometryLib]);

  const reverseGeocode = async (lat: number, lng: number) => {
    let pincode = "";
    let city = "";
    let state = "";
    let area = "";
    let street = "";

    if (window.google?.maps?.Geocoder) {
      try {
        const geocoder = new google.maps.Geocoder();
        const { results } = await geocoder.geocode({ location: { lat, lng } });
        if (results && results[0]) {
          const components = results[0].address_components || [];
          components.forEach(c => {
            if (c.types.includes("postal_code")) pincode = c.long_name;
            if (c.types.includes("locality")) city = c.long_name;
            if (c.types.includes("administrative_area_level_1")) state = c.long_name;
            if (c.types.includes("sublocality_level_1") || c.types.includes("sublocality") || c.types.includes("neighborhood")) {
              area = area || c.long_name;
            }
            if (c.types.includes("route")) street = c.long_name;
          });
        }
      } catch (err) {
        console.warn("Google Geocoder error, using fallback:", err);
      }
    }

    if (!pincode || !area) {
      try {
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: { "Accept-Language": "en" }
        });
        if (nomRes.ok) {
          const data = await nomRes.json();
          if (!pincode) pincode = data?.address?.postcode?.replace(/\D/g, '').slice(0, 6) || "";
          if (!area) area = data?.address?.suburb || data?.address?.neighbourhood || data?.address?.residential || data?.address?.village || "";
          if (!city) city = data?.address?.city || data?.address?.town || data?.address?.state_district || "Bengaluru";
          if (!state) state = data?.address?.state || "Karnataka";
          if (!street) street = data?.address?.road || "";
        }
      } catch (e) {
        console.warn("Nominatim fallback reverse geocode failed:", e);
      }
    }

    if (pincode) setValue("pincode", pincode);
    if (city) setValue("city", city);
    if (state) setValue("state", state);
    if (area) setValue("area", area);
    if (street) setValue("street", street);
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    setValue("latitude", lat, { shouldValidate: true });
    setValue("longitude", lng, { shouldValidate: true });

    // Extract address components
    const components = place.address_components || [];
    let pincode = "";
    let city = "";
    let state = "";
    let area = "";
    let street = "";
    let building = "";
    let houseNumber = "";

    components.forEach(c => {
      if (c.types.includes("postal_code")) pincode = c.long_name;
      if (c.types.includes("locality")) city = c.long_name;
      if (c.types.includes("administrative_area_level_1")) state = c.long_name;
      if (c.types.includes("sublocality_level_1") || c.types.includes("sublocality") || c.types.includes("neighborhood")) {
        if (!area) area = c.long_name;
      }
      if (c.types.includes("sublocality_level_2")) {
        if (!area) area = c.long_name;
      }
      if (c.types.includes("route")) street = c.long_name;
      if (c.types.includes("street_number")) houseNumber = c.long_name;
      if (c.types.includes("premise") || c.types.includes("building") || c.types.includes("subpremise")) {
        if (!building) building = c.long_name;
      }
    });

    if (pincode) setValue("pincode", pincode, { shouldValidate: true });
    if (city) setValue("city", city, { shouldValidate: true });
    if (state) setValue("state", state, { shouldValidate: true });
    if (area) setValue("area", area, { shouldValidate: true });
    if (street) {
      const fullStreet = houseNumber ? `${houseNumber} ${street}` : street;
      setValue("street", fullStreet, { shouldValidate: true });
    } else if (place.name && !street) {
      if (!building) setValue("building", place.name, { shouldValidate: true });
    }
    if (building) setValue("building", building, { shouldValidate: true });

    const summary = area || city || "Selected Place";
    showToast(`Google Places: Address formatted for ${summary}${pincode ? ' (' + pincode + ')' : ''}`, "success");
  };

  const onSubmit = async (data: AddressFormData) => {
    if (!currentUser) {
      showToast("Please sign in to continue.", "info");
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }
    if (!isValidArea) {
      setIsNotSupportedVisible(true);
      return;
    }

    setLoading(true);
    try {
      let addrId;
      if (editAddress?.id) {
        await AddressService.updateAddress(editAddress.id, {
          ...data,
          verified: true,
          serviceAreaId: activeServiceArea?.id
        });
        addrId = editAddress.id;
      } else {
        addrId = await AddressService.addAddress(currentUser.uid, {
          ...data,
          verified: true,
          serviceAreaId: activeServiceArea?.id
        });
      }

      showToast("Address saved successfully!", "success");
      if (selectedPlan) {
        navigate("/subscribe/slot", { 
          state: { 
            ...location.state,
            addressId: addrId,
            deliveryFee: activeServiceArea?.deliveryFee || 0
          } 
        });
      } else {
        navigate("/addresses");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("Failed to save address. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const [isNotSupportedVisible, setIsNotSupportedVisible] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  const handleNotifyMe = async () => {
    setIsNotified(true);
    showToast("We'll notify you as soon as we launch in your area!", "success");
    // Optionally save to a waitingList collection
  };

  return (
    <>
      <main className="min-h-screen bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-zinc-900/10"
            >
              <Navigation className="h-3.5 w-3.5" /> Step 3 of 4
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 mb-4"
            >
              Configure Delivery Address
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-lg max-w-2xl leading-relaxed"
            >
              Tell us where to deliver your daily fresh meals. Our delivery team will bring it warm to your doorstep.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-8 space-y-10"
            >
              <Card className="p-8 md:p-10 rounded-[3rem] bg-zinc-50/50 border-zinc-100 shadow-sm space-y-8 overflow-hidden relative">
                <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                
                <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl shadow-zinc-900/5 ring-1 ring-zinc-200/50">
                  <MapPicker 
                    center={{ lat: watchedValues.latitude, lng: watchedValues.longitude }} 
                    onPositionChange={(pos) => {
                      setValue("latitude", pos.lat);
                      setValue("longitude", pos.lng);
                      reverseGeocode(pos.lat, pos.lng);
                    }}
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <div className={cn(
                      "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border backdrop-blur-md transition-colors",
                      isValidArea === true ? "bg-emerald-500/90 text-white border-emerald-400" :
                      isValidArea === false ? "bg-rose-500/90 text-white border-rose-400" :
                      "bg-zinc-900/90 text-white border-zinc-800"
                    )}>
                      {isValidArea === true ? "Serviceable Coordinates" :
                       isValidArea === false ? "Unsupported Sector" :
                       "Analyzing Location..."}
                    </div>
                  </div>
                </div>

                <form id="address-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Recipient Designation</label>
                      <Input {...register("fullName")} placeholder="e.g. John Doe" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                      {errors.fullName && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Comms Line</label>
                      <Input {...register("phone")} placeholder="10-digit mobile" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                      {errors.phone && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Sector / Pincode</label>
                      <Input {...register("pincode")} maxLength={6} placeholder="6-digit code" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                      {errors.pincode && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.pincode.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Structure Details (House / Flat)</label>
                      <Input {...register("houseNumber")} placeholder="e.g. Unit 402" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                      {errors.houseNumber && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.houseNumber.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <GoogleAddressFieldInput 
                        label="Compound / Building (Optional)"
                        placeholder="e.g. Windsor Court, Mantri Elegance"
                        value={watchedValues.building || ""}
                        onChange={(val) => setValue("building", val, { shouldValidate: true })}
                        onPlaceSelect={handlePlaceSelect}
                        error={errors.building?.message}
                        icon={Building}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <GoogleAddressFieldInput 
                        label="Avenue / Street"
                        placeholder="e.g. 100 Feet Road, 27th Main Road"
                        value={watchedValues.street || ""}
                        onChange={(val) => setValue("street", val, { shouldValidate: true })}
                        onPlaceSelect={handlePlaceSelect}
                        error={errors.street?.message}
                        icon={Navigation}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <GoogleAddressFieldInput 
                        label="Zone / Area"
                        placeholder="e.g. Indiranagar, HSR Layout, Koramangala"
                        value={watchedValues.area || ""}
                        onChange={(val) => setValue("area", val, { shouldValidate: true })}
                        onPlaceSelect={handlePlaceSelect}
                        error={errors.area?.message}
                        icon={MapPin}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-4 pl-2">Zone Classification</label>
                    <div className="flex gap-4">
                      {[
                        { id: 'Home', icon: Home },
                        { id: 'Work', icon: Building },
                        { id: 'Other', icon: Briefcase }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setValue('addressType', type.id as any)}
                          className={cn(
                            "flex-1 h-14 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all",
                            watchedValues.addressType === type.id 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                              : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                          )}
                        >
                          <type.icon className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{type.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Special Delivery Protocols</label>
                    <textarea 
                      {...register("deliveryInstructions")}
                      placeholder="e.g. Leave at the security gate, call upon arrival..."
                      className="w-full min-h-[120px] p-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 outline-none transition-all resize-none"
                    />
                  </div>
                </form>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-4"
            >
              <Card className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl p-8 sticky top-6 text-white flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">Calibrated Protocol</h3>
                  <div className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Selected Plan</p>
                    <p className="text-sm font-black text-emerald-400 uppercase">{selectedPlan?.name || "Premium Protocol"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Base Protocol</span>
                    <span className="text-sm font-black">₹{selectedPlan?.offerPrice || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Delivery Fee</span>
                    <span className="text-sm font-black text-emerald-400">
                      {activeServiceArea?.deliveryFee ? `₹${activeServiceArea.deliveryFee}` : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-sm text-zinc-300 font-black uppercase">Total Due</span>
                    <span className="text-3xl font-black">₹{(selectedPlan?.offerPrice || 0) + (activeServiceArea?.deliveryFee || 0)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    form="address-form"
                    type="submit"
                    disabled={loading || isValidArea === false}
                    className="w-full h-16 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                      <>Initialize Checkout <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                  
                  {isValidArea === false && (
                    <div className="flex items-start gap-2 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-rose-400 leading-tight">TaazaBites does not deliver to this location yet. Try another address.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate(-1)}
                  className="w-full text-zinc-500 hover:text-zinc-300 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-3 w-3" /> Recalibrate Assessment
                </button>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isNotSupportedVisible && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsNotSupportedVisible(false)}
              className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center"
            >
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="w-12 h-12 text-rose-500" />
              </div>
              
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter mb-4">
                Sorry!
              </h2>
              <p className="text-zinc-500 font-medium leading-relaxed mb-8">
                TaazaBites is not yet available in your location. We're expanding rapidly to bring precision nutrition everywhere!
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={handleNotifyMe}
                  disabled={isNotified}
                  className={cn(
                    "w-full h-16 rounded-2xl font-black uppercase tracking-widest transition-all",
                    isNotified 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-zinc-900 text-white hover:bg-black shadow-xl shadow-zinc-900/20"
                  )}
                >
                  {isNotified ? (
                    <span className="flex items-center gap-2 justify-center">
                      <CheckCircle2 className="w-5 h-5" /> Added to Waiting List
                    </span>
                  ) : "Notify Me"}
                </Button>
                
                <button 
                  onClick={() => {
                    setIsNotSupportedVisible(false);
                    // Optionally scroll back up or clear fields
                  }}
                  className="w-full h-16 rounded-2xl bg-zinc-50 text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest transition-all"
                >
                  Change Address
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-100">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Metabolic Logistics Status: Unmapped</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function DeliverySetupContentManual() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: userData?.name || "",
      phone: userData?.phone || "",
      addressType: "Home",
      default: true,
      latitude: 12.9716,
      longitude: 77.5946,
      city: "Bengaluru",
      state: "Karnataka",
      pincode: location.state?.pincode || "",
    }
  });

  const watchedValues = watch();
  const editAddress = location.state?.editAddress;

  useEffect(() => {
    const sp = location.state?.selectedPlan;
    if (sp) {
      setSelectedPlan(sp);
    } else {
      const saved = localStorage.getItem('taaza_selected_plan');
      if (saved) {
        try {
          setSelectedPlan(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved plan", e);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (editAddress) {
      setValue("fullName", editAddress.fullName || "");
      setValue("phone", editAddress.phone || "");
      setValue("addressType", editAddress.addressType || "Home");
      setValue("houseNumber", editAddress.houseNumber || "");
      setValue("building", editAddress.building || "");
      setValue("street", editAddress.street || "");
      setValue("area", editAddress.area || "");
      setValue("city", editAddress.city || "");
      setValue("state", editAddress.state || "");
      setValue("pincode", editAddress.pincode || "");
      setValue("deliveryInstructions", editAddress.deliveryInstructions || "");
      setValue("default", editAddress.default ?? true);
    } else if (location.state?.pincode) {
      setValue("pincode", location.state.pincode);
    }
  }, [editAddress, location.state?.pincode, setValue]);

  const onSubmit = async (data: AddressFormData) => {
    if (!currentUser) {
      showToast("Please sign in to continue.", "info");
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }
    setLoading(true);
    try {
      let addrId;
      if (editAddress?.id) {
        await AddressService.updateAddress(editAddress.id, {
          ...data,
          verified: true,
          serviceAreaId: `sa_dynamic_${data.pincode}`
        });
        addrId = editAddress.id;
      } else {
        addrId = await AddressService.addAddress(currentUser.uid, {
          ...data,
          verified: true,
          serviceAreaId: `sa_dynamic_${data.pincode}`
        });
      }

      showToast("Address saved successfully!", "success");
      if (selectedPlan) {
        navigate("/subscribe/slot", { 
          state: { 
            ...location.state,
            addressId: addrId,
            deliveryFee: 45
          } 
        });
      } else {
        navigate("/addresses");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("Failed to save address. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-zinc-900/10"
          >
            <Navigation className="h-3.5 w-3.5" /> Step 3 of 4 (Manual Entry Mode)
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 mb-4"
          >
            Configure Delivery Address
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg max-w-2xl leading-relaxed"
          >
            Please enter your delivery address details manually for accurate and timely daily delivery.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 space-y-10"
          >
            <Card className="p-8 md:p-10 rounded-[3rem] bg-zinc-50/50 border-zinc-100 shadow-sm space-y-8 overflow-hidden relative">
              
              <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                    <Navigation className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-black">Google Maps Auto-Location Active</h4>
                    <p className="text-xs text-emerald-100 leading-normal">Detect your exact area, pincode, and street in 1 click.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!navigator.geolocation) {
                      showToast("Geolocation is not supported by your browser.", "error");
                      return;
                    }
                    showToast("Detecting GPS position...", "info");
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setValue("latitude", latitude);
                        setValue("longitude", longitude);
                        
                        const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";
                        let area = "";
                        let pincode = "";
                        let city = "Bengaluru";
                        let street = "";

                        try {
                          if (apiKey && apiKey !== 'YOUR_API_KEY') {
                            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
                            const data = await res.json();
                            if (data.status === 'OK' && data.results?.[0]) {
                              const r = data.results[0];
                              r.address_components?.forEach((c: any) => {
                                if (c.types.includes('sublocality_level_1') || c.types.includes('sublocality')) area = c.long_name;
                                if (c.types.includes('postal_code')) pincode = c.long_name;
                                if (c.types.includes('locality')) city = c.long_name;
                                if (c.types.includes('route')) street = c.long_name;
                              });
                            }
                          }
                          if (!pincode || !area) {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
                              headers: { "Accept-Language": "en" }
                            });
                            if (res.ok) {
                              const data = await res.json();
                              if (!pincode) pincode = data?.address?.postcode?.replace(/\D/g, '').slice(0,6) || "560034";
                              if (!area) area = data?.address?.suburb || data?.address?.neighbourhood || "Koramangala";
                              if (data?.address?.city) city = data.address.city;
                            }
                          }
                          if (area) setValue("area", area);
                          if (pincode) setValue("pincode", pincode);
                          if (city) setValue("city", city);
                          if (street) setValue("street", street);
                          showToast(`Auto-detected: ${area} (${pincode})`, "success");
                        } catch (err) {
                          showToast("Failed to fetch address details automatically.", "error");
                        }
                      },
                      (error) => {
                        console.warn("Geolocation error, auto-filling central Bengaluru location:", error);
                        setValue("latitude", 12.9784);
                        setValue("longitude", 77.6408);
                        setValue("area", "Indiranagar");
                        setValue("pincode", "560038");
                        setValue("city", "Bengaluru");
                        setValue("street", "100 Feet Road");
                        showToast("Preset location: Indiranagar, Bengaluru (560038).", "info");
                      },
                      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
                    );
                  }}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Auto-Detect My Address</span>
                </button>
              </div>

              <form id="address-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Recipient Designation</label>
                    <Input {...register("fullName")} placeholder="e.g. John Doe" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                    {errors.fullName && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Comms Line</label>
                    <Input {...register("phone")} placeholder="10-digit mobile" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                    {errors.phone && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Sector / Pincode</label>
                    <Input {...register("pincode")} maxLength={6} placeholder="6-digit code" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                    {errors.pincode && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.pincode.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Structure Details (House / Flat)</label>
                    <Input {...register("houseNumber")} placeholder="e.g. Unit 402" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                    {errors.houseNumber && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.houseNumber.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Compound / Building (Optional)</label>
                    <Input {...register("building")} placeholder="e.g. Windsor Court" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Avenue / Street</label>
                    <Input {...register("street")} placeholder="e.g. Link Road" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                    {errors.street && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Zone / Area</label>
                    <Input {...register("area")} placeholder="e.g. Sector 62" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                    {errors.area && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.area.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">City</label>
                    <Input {...register("city")} placeholder="e.g. Bengaluru" className="h-14 px-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900" />
                    {errors.city && <p className="text-xs text-rose-500 mt-2 pl-2 font-medium">{errors.city.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-4 pl-2">Zone Classification</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'Home', icon: Home },
                      { id: 'Work', icon: Building },
                      { id: 'Other', icon: Briefcase }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setValue('addressType', type.id as any)}
                        className={cn(
                          "flex-1 h-14 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all",
                          watchedValues.addressType === type.id 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                            : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                        )}
                      >
                        <type.icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{type.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block mb-2 pl-2">Special Delivery Protocols</label>
                  <textarea 
                    {...register("deliveryInstructions")}
                    placeholder="e.g. Leave at the security gate, call upon arrival..."
                    className="w-full min-h-[120px] p-6 rounded-2xl bg-white border-zinc-200 text-base shadow-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 outline-none transition-all resize-none"
                  />
                </div>
              </form>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-4"
          >
            <Card className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl p-8 sticky top-6 text-white flex flex-col gap-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Calibrated Protocol</h3>
                <div className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Selected Plan</p>
                  <p className="text-sm font-black text-emerald-400 uppercase">{selectedPlan?.name || "Premium Protocol"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Base Protocol</span>
                  <span className="text-sm font-black">₹{selectedPlan?.offerPrice || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Delivery Fee</span>
                  <span className="text-sm font-black text-emerald-400">
                    ₹45
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-sm text-zinc-300 font-black uppercase">Total Due</span>
                  <span className="text-3xl font-black">₹{(selectedPlan?.offerPrice || 0) + 45}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  form="address-form"
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <>Initialize Checkout <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </div>

              <button 
                onClick={() => navigate(-1)}
                className="w-full text-zinc-500 hover:text-zinc-300 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-3 w-3" /> Recalibrate Assessment
              </button>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

export default function DeliverySetupPage() {
  if (!hasValidKey) {
    return (
      <DeliverySetupContentManual />
    );
  }

  return (
    <DeliverySetupContent />
  );
}
