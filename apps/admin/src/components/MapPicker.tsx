import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useState, useCallback, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  initialLocation?: Location;
  onLocationSelect: (location: Location) => void;
}

export function MapPicker({ initialLocation, onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<Location>(initialLocation || { lat: 19.0760, lng: 72.8777 });
  const map = useMap();

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
      if (map) {
        map.panTo(initialLocation);
      }
    }
  }, [initialLocation, map]);

  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setPosition(newPos);
      onLocationSelect(newPos);
    }
  }, [onLocationSelect]);

  const handleMapClick = useCallback((e: any) => {
    if (e.detail.latLng) {
      const newPos = {
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng
      };
      setPosition(newPos);
      onLocationSelect(newPos);
    }
  }, [onLocationSelect]);

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
      <Map
        defaultCenter={position}
        defaultZoom={13}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onClick={handleMapClick}
        mapId="DEMO_MAP_ID"
      >
        <AdvancedMarker
          position={position}
          draggable={true}
          onDragEnd={handleDragEnd}
        />
      </Map>
    </div>
  );
}
