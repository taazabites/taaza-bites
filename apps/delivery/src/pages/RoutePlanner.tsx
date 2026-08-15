import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerDeliveries } from "@/hooks/usePartnerDeliveries";
import { optimizeRouteOrder, buildGoogleDirectionsUrl, estimateRouteKm } from "@/lib/routeUtils";
import { Navigation, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const KITCHEN = { lat: 12.9121, lng: 77.6446 };

export default function RoutePlanner() {
  const { user } = useAuth();
  const { sortedOpen } = usePartnerDeliveries(user?.uid);
  const ordered = useMemo(() => optimizeRouteOrder(sortedOpen, KITCHEN), [sortedOpen]);
  const km = useMemo(() => estimateRouteKm(ordered, KITCHEN), [ordered]);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <RouteIcon className="size-6 text-primary" /> Route
      </h1>
      <p className="text-sm text-muted-foreground">Opens Google Maps. We do not run a private navigation engine.</p>
      <p className="text-sm font-semibold">
        {ordered.length} stops · {km} km
      </p>
      <Button className="w-full h-14" onClick={() => window.open(buildGoogleDirectionsUrl(ordered, KITCHEN), "_blank")}>
        <Navigation className="size-5 mr-2" /> Open Maps
      </Button>
      {ordered.map((d, i) => (
        <Link key={d.id} to={`/deliveries/${d.id}`} className="block bg-card border rounded-xl p-3">
          {i + 1}. {d.orderId} · {d.deliveryArea}
        </Link>
      ))}
    </div>
  );
}
