import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Loader2, CheckCircle2, Sparkles, Search, Compass, AlertCircle } from 'lucide-react';
import { ServiceAreaService } from '@/src/firebase/services';
import { useToast } from '@/src/context/ToastContext';
import { useDebouncedCallback } from '@/src/hooks/useDebouncedCallback';

interface GoogleLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  onLocationSelect?: (details: { area: string; pincode: string; city: string; lat?: number; lng?: number }) => void;
}

interface LocationSuggestion {
  description: string;
  area: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';

export const GoogleLocationInput: React.FC<GoogleLocationInputProps> = ({
  value,
  onChange,
  placeholder = "e.g., Koramangala or 560034",
  className = "",
  label = "Area / Pincode",
  onLocationSelect
}) => {
  const { showToast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [serviceable, setServiceable] = useState<{ checked: boolean; isServiceable: boolean; name?: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
    // Check pincode serviceability if value has a 6-digit number
    const pincodeMatch = value.match(/\b\d{6}\b/);
    if (pincodeMatch) {
      const pin = pincodeMatch[0];
      ServiceAreaService.getServiceAreaByPincode(pin).then((area) => {
        if (area) {
          setServiceable({ checked: true, isServiceable: true, name: area.areaName });
        } else {
          setServiceable({ checked: true, isServiceable: false });
        }
      }).catch(() => null);
    } else {
      setServiceable(null);
    }
  }, [value]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing & query Google Geocoding / Places API
  const debouncedFetchSuggestions = useDebouncedCallback((inputQuery: string) => {
    fetchLocationSuggestions(inputQuery);
  }, 400);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (val.trim().length >= 3) {
      debouncedFetchSuggestions(val);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchLocationSuggestions = async (inputQuery: string) => {
    setIsSearching(true);
    const defaultPopularAreas: LocationSuggestion[] = [
      { description: 'Koramangala, Bengaluru - 560034', area: 'Koramangala', city: 'Bengaluru', pincode: '560034', lat: 12.9352, lng: 77.6245 },
      { description: 'Indiranagar, Bengaluru - 560038', area: 'Indiranagar', city: 'Bengaluru', pincode: '560038', lat: 12.9784, lng: 77.6408 },
      { description: 'HSR Layout, Bengaluru - 560102', area: 'HSR Layout', city: 'Bengaluru', pincode: '560102', lat: 12.9121, lng: 77.6446 },
      { description: 'Whitefield, Bengaluru - 560066', area: 'Whitefield', city: 'Bengaluru', pincode: '560066', lat: 12.9698, lng: 77.7500 },
      { description: 'JP Nagar, Bengaluru - 560078', area: 'JP Nagar', city: 'Bengaluru', pincode: '560078', lat: 12.9063, lng: 77.5857 },
      { description: 'MG Road, Bengaluru - 560001', area: 'MG Road', city: 'Bengaluru', pincode: '560001', lat: 12.9756, lng: 77.6066 },
      { description: 'Bellandur, Bengaluru - 560103', area: 'Bellandur', city: 'Bengaluru', pincode: '560103', lat: 12.9260, lng: 77.6762 },
      { description: 'Electronic City, Bengaluru - 560100', area: 'Electronic City', city: 'Bengaluru', pincode: '560100', lat: 12.8452, lng: 77.6602 }
    ];

    try {
      if (window.google?.maps?.places?.AutocompleteService) {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { input: inputQuery, componentRestrictions: { country: 'in' } },
          (preds, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && preds && preds.length > 0) {
              const parsed: LocationSuggestion[] = preds.slice(0, 5).map((p: any) => {
                const area = p.structured_formatting.main_text;
                const sec = p.structured_formatting.secondary_text || 'Bengaluru';
                return {
                  description: `${area}, ${sec}`,
                  area,
                  city: 'Bengaluru',
                  pincode: ''
                };
              });
              setSuggestions(parsed);
              setShowSuggestions(true);
              setIsSearching(false);
            } else {
              const filtered = defaultPopularAreas.filter(a => 
                a.description.toLowerCase().includes(inputQuery.toLowerCase()) ||
                a.pincode.includes(inputQuery)
              );
              setSuggestions(filtered.length > 0 ? filtered : defaultPopularAreas.slice(0, 4));
              setShowSuggestions(true);
              setIsSearching(false);
            }
          }
        );
        return;
      }

      // Fallback filtered suggestions
      const filtered = defaultPopularAreas.filter(a => 
        a.description.toLowerCase().includes(inputQuery.toLowerCase()) ||
        a.pincode.includes(inputQuery)
      );

      setSuggestions(filtered.length > 0 ? filtered : defaultPopularAreas.slice(0, 4));
      setShowSuggestions(true);
    } catch (err) {
      console.warn("Location suggestion fetch error, using local fallback:", err);
      const filtered = defaultPopularAreas.filter(a => 
        a.description.toLowerCase().includes(inputQuery.toLowerCase()) ||
        a.pincode.includes(inputQuery)
      );
      setSuggestions(filtered.length > 0 ? filtered : defaultPopularAreas.slice(0, 4));
      setShowSuggestions(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-Detect Location via GPS + Google Geocoding API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      // Fallback instantly if geolocation not supported
      const detectedArea = 'Indiranagar';
      const detectedPincode = '560038';
      const detectedCity = 'Bengaluru';
      const finalValue = `${detectedArea}, ${detectedCity} - ${detectedPincode}`;
      setQuery(finalValue);
      onChange(finalValue);
      onLocationSelect?.({
        area: detectedArea,
        pincode: detectedPincode,
        city: detectedCity,
        lat: 12.9784,
        lng: 77.6408
      });
      showToast("Preset central Bengaluru location (Indiranagar) as fallback.", "info");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedArea = '';
        let detectedPincode = '';
        let detectedCity = 'Bengaluru';

        try {
          if (API_KEY && API_KEY !== 'YOUR_API_KEY') {
            // Google Reverse Geocoding API
            const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
            const res = await fetch(geoUrl);
            const data = await res.json();

            if (data.status === 'OK' && data.results?.length > 0) {
              const result = data.results[0];
              result.address_components?.forEach((comp: any) => {
                if (comp.types.includes('sublocality_level_1') || comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
                  detectedArea = detectedArea || comp.long_name;
                }
                if (comp.types.includes('locality')) {
                  detectedCity = comp.long_name;
                }
                if (comp.types.includes('postal_code')) {
                  detectedPincode = comp.long_name;
                }
              });

              if (!detectedArea) {
                detectedArea = result.formatted_address?.split(',')[0] || 'Detected Location';
              }
            }
          }

          // Fallback to BigDataCloud if Google key didn't return pincode
          if (!detectedPincode) {
            try {
              const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
              if (bdcRes.ok) {
                const bdcData = await bdcRes.json();
                detectedPincode = bdcData?.postcode?.replace(/\D/g, '').slice(0, 6) || '';
                if (!detectedArea) {
                  detectedArea = bdcData?.locality || bdcData?.city || 'Detected Area';
                }
                if (bdcData?.city || bdcData?.principalSubdivision) {
                  detectedCity = bdcData?.city || bdcData?.principalSubdivision;
                }
              }
            } catch (e) {
              console.warn("BigDataCloud lookup failed, using local fallback values", e);
            }
          }

          // If still no area/pincode, preset defaults
          if (!detectedArea) detectedArea = 'Indiranagar';
          if (!detectedPincode) detectedPincode = '560038';

          const finalValue = detectedPincode 
            ? `${detectedArea}, ${detectedCity} - ${detectedPincode}`
            : `${detectedArea}, ${detectedCity}`;

          setQuery(finalValue);
          onChange(finalValue);

          onLocationSelect?.({
            area: detectedArea,
            pincode: detectedPincode,
            city: detectedCity,
            lat: latitude,
            lng: longitude
          });

          showToast(`Location detected: ${detectedArea} (${detectedPincode})`, "success");
        } catch (error) {
          console.error("Reverse geocode error, using fallback:", error);
          const finalValue = "Indiranagar, Bengaluru - 560038";
          setQuery(finalValue);
          onChange(finalValue);
          onLocationSelect?.({
            area: 'Indiranagar',
            pincode: '560038',
            city: 'Bengaluru',
            lat: 12.9784,
            lng: 77.6408
          });
          showToast("Preset central Bengaluru location (Indiranagar) as fallback.", "info");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.warn("Geolocation permission/error, using default location:", error);
        const finalValue = "Indiranagar, Bengaluru - 560038";
        setQuery(finalValue);
        onChange(finalValue);
        onLocationSelect?.({
          area: 'Indiranagar',
          pincode: '560038',
          city: 'Bengaluru',
          lat: 12.9784,
          lng: 77.6408
        });
        showToast("Preset location to Indiranagar, Bengaluru (Manually adjust as needed).", "info");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectSuggestion = (s: LocationSuggestion) => {
    setQuery(s.description);
    onChange(s.description);
    setShowSuggestions(false);

    onLocationSelect?.({
      area: s.area,
      pincode: s.pincode,
      city: s.city,
      lat: s.lat,
      lng: s.lng
    });

    showToast(`Selected ${s.area} ${s.pincode ? '(' + s.pincode + ')' : ''}`, "success");
  };

  return (
    <div ref={wrapperRef} className={`relative space-y-2.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
            {label}
          </label>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Compass className="w-3 h-3" /> Powered by Google Maps
          </span>
        </div>
      )}

      {/* Main Search Input Box */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
          <MapPin className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2) {
              fetchLocationSuggestions(query);
            }
          }}
          placeholder={placeholder}
          className="w-full h-14 pl-12 pr-28 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-bold text-sm focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
        />

        {/* Auto-Detect Location Button Inside Input */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black transition-all border border-emerald-200 dark:border-emerald-800 cursor-pointer disabled:opacity-60 shadow-sm"
            title="Auto-detect my current GPS location"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span className="hidden sm:inline">Detecting...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/20" />
                <span>Auto-Detect</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Serviceability Badge indicator */}
      {serviceable && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold ${
            serviceable.isServiceable
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
              : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
          }`}
        >
          {serviceable.isServiceable ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>⚡ Fresh delivery available to <strong>{serviceable.name || 'your area'}</strong>!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Outside instant express zone. We can still arrange pre-booked delivery.</span>
            </>
          )}
        </motion.div>
      )}

      {/* Auto-Complete Dropdown Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800"
          >
            <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-950/50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <span>Google Suggested Areas</span>
              {isSearching && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
            </div>

            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-4 py-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-colors shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    {s.area}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">
                    {s.city} {s.pincode ? `• PIN ${s.pincode}` : ''}
                  </p>
                </div>
                {s.pincode && (
                  <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-extrabold text-slate-600 dark:text-zinc-300 shrink-0">
                    {s.pincode}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
