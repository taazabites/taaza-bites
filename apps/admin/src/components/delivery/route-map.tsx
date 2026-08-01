import React, { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary, MapMouseEvent } from '@vis.gl/react-google-maps';
import { Polyline } from './polyline';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, Zap, Loader2, MapPin } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || import.meta.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface RouteMapProps {
  initialPath?: google.maps.LatLngLiteral[];
  onPathChange?: (path: google.maps.LatLngLiteral[]) => void;
}

export function RouteMap({ initialPath = [], onPathChange }: RouteMapProps) {
  const [points, setPoints] = useState<google.maps.LatLngLiteral[]>(initialPath);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const routesLibrary = useMapsLibrary('routes');

  const updatePoints = useCallback((newPoints: google.maps.LatLngLiteral[]) => {
    setPoints(newPoints);
    if (onPathChange) onPathChange(newPoints);
  }, [onPathChange]);

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e.detail.latLng) {
      updatePoints([...points, { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng }]);
    }
  }, [points, updatePoints]);

  const clearPath = () => updatePoints([]);
  const undoLast = () => updatePoints(points.slice(0, -1));

  const optimizePath = async () => {
    if (!routesLibrary || points.length < 3) return;
    
    setIsOptimizing(true);
    try {
      const directionsService = new google.maps.DirectionsService();
      
      // We treat the first point as origin and the same point as destination for a round trip,
      // or the last point as destination. For delivery, we'll use first as origin/destination.
      const origin = points[0];
      const waypoints = points.slice(1).map(p => ({
        location: p,
        stopover: true
      }));

      const request: google.maps.DirectionsRequest = {
        origin: origin,
        destination: origin,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const order = route.waypoint_order;
          
          // Reorder points based on optimization
          const optimizedPoints = [origin];
          order.forEach(index => {
            optimizedPoints.push(points[index + 1]);
          });
          
          updatePoints(optimizedPoints);
        }
        setIsOptimizing(false);
      });
    } catch (error) {
      console.error("Optimization failed:", error);
      setIsOptimizing(false);
    }
  };

  if (!hasValidKey) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 text-xs flex-col gap-2">
        <div className="p-3 bg-zinc-800 rounded-full">
          <MapPin className="h-5 w-5 opacity-20" />
        </div>
        Map functionality unavailable (API Key missing)
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-[350px] w-full rounded-xl overflow-hidden border border-zinc-800 relative group">
        <APIProvider apiKey={API_KEY} version="weekly" libraries={['geometry', 'routes']}>
          <Map
            defaultCenter={points[0] || {lat: 19.0760, lng: 72.8777}}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
            onClick={handleMapClick}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            className="w-full h-full"
          >
            {points.map((point, i) => (
              <AdvancedMarker key={`${i}-${point.lat}`} position={point}>
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-black px-1.5 rounded-full mb-1 shadow-lg ring-2 ${i === 0 ? 'bg-amber-500 text-black ring-amber-500/20' : 'bg-emerald-500 text-zinc-950 ring-emerald-500/20'}`}>
                    {i === 0 ? 'START' : i}
                  </span>
                  <Pin 
                    background={i === 0 ? "#F59E0B" : "#10B981"} 
                    glyphColor="#fff" 
                    borderColor={i === 0 ? "#92400E" : "#065f46"} 
                  />
                </div>
              </AdvancedMarker>
            ))}
            
            {points.length > 1 && (
              <Polyline
                path={points}
                strokeColor="#10B981"
                strokeOpacity={0.8}
                strokeWeight={4}
              />
            )}
          </Map>
        </APIProvider>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-zinc-950/90 border-zinc-800 text-zinc-400 hover:text-white backdrop-blur-md"
            onClick={undoLast}
            title="Undo Last Point"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-zinc-950/90 border-zinc-800 text-rose-500 hover:bg-rose-500/10 backdrop-blur-md"
            onClick={clearPath}
            title="Clear Path"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Optimize Button */}
        {points.length >= 3 && (
          <div className="absolute top-4 left-4">
            <Button
              onClick={optimizePath}
              disabled={isOptimizing}
              className="bg-zinc-950/90 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 backdrop-blur-md h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl"
            >
              {isOptimizing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Zap className="h-3 w-3 fill-emerald-400" />
              )}
              {isOptimizing ? 'Calculating...' : 'Optimize Path'}
            </Button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-lg backdrop-blur-md">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            {points.length === 0 ? "Click map to start drawing path" : `${points.length} Logistics Points Defined`}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
        <Info className="h-3.5 w-3.5 text-emerald-500 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
          <strong className="text-zinc-300">Smart Routing:</strong> The first point is designated as the hub. Adding 3 or more points unlocks the <span className="text-emerald-400">Optimization Engine</span> to calculate the fastest delivery sequence.
        </p>
      </div>
    </div>
  );
}

// Add missing icon for info
import { Info } from 'lucide-react';
