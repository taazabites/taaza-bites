/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';

export function PlaceAutocomplete({ onPlaceSelect }: { onPlaceSelect: (place: any) => void }) {
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    try {
      // Initialize classic Autocomplete on our input element
      autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      });

      // Listen for place changes
      listener = autocomplete.addListener('place_changed', () => {
        if (!autocomplete) return;
        const place = autocomplete.getPlace();
        
        if (place) {
          const formattedAddress = place.formatted_address || place.name || '';
          const name = place.name || '';
          
          // Map to support both legacy and new Places API properties expected by parents
          const addressComponents = place.address_components?.map((c: any) => ({
            longText: c.long_name,
            shortText: c.short_name,
            types: c.types
          })) || [];

          const location = place.geometry?.location ? {
            lat: typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat,
            lng: typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
          } : null;

          if (formattedAddress) {
            setInputValue(formattedAddress);
          }

          onPlaceSelect({
            formattedAddress,
            name,
            addressComponents,
            address_components: place.address_components || [],
            location,
            geometry: place.geometry
          });
        }
      });
    } catch (err) {
      console.warn("Could not load classic Google Maps Autocomplete fallback:", err);
    }

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [places, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder="Search for an address or area..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 placeholder:text-zinc-500 rounded-lg"
    />
  );
}

