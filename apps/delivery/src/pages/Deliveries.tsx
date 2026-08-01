import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { DeliveryAssignment, OrderStatus } from "@/types";
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Navigation,
  Utensils,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function Deliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to today's active deliveries for this partner
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "deliveryAssignments"),
      where("partnerId", "==", user.uid),
      where("createdAt", ">=", startOfDay.getTime())
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeDeliveries: DeliveryAssignment[] = [];
      snapshot.forEach((doc) => {
        activeDeliveries.push({ id: doc.id, ...doc.data() } as DeliveryAssignment);
      });
      // Sort: Priority first, then by time
      activeDeliveries.sort((a, b) => {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        return a.createdAt - b.createdAt;
      });
      
      setDeliveries(activeDeliveries);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching deliveries:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    updateDoc(doc(db, "deliveryAssignments", id), {
      status: newStatus,
      updatedAt: Date.now()
    }).catch((error) => {
      console.error("Error updating status:", error);
    });
    
    // Firestore's latency compensation will update the UI immediately
    toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
  };

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.startsWith("+") ? phone.replace("+", "") : `91${phone}`;
    window.open(`https://wa.me/${formattedPhone}`);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading deliveries...</div>;
  }

  const activeDeliveries = deliveries.filter(d => !['delivered', 'failed', 'returned'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => ['delivered', 'failed', 'returned'].includes(d.status));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-2xl font-bold tracking-tight">Today's Assignments</h2>
      
      {activeDeliveries.length === 0 && completedDeliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-card rounded-2xl border border-dashed p-12 text-center">
          <Utensils className="size-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No deliveries assigned yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            When the kitchen assigns an order to you, it will appear here. Make sure you are online.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeDeliveries.map((delivery) => (
            <DeliveryCard 
              key={delivery.id} 
              delivery={delivery} 
              onUpdateStatus={updateStatus}
              onNavigate={() => openGoogleMaps(delivery.location.lat, delivery.location.lng)}
              onCall={() => callCustomer(delivery.customerPhone)}
              onWhatsApp={() => openWhatsApp(delivery.customerPhone)}
            />
          ))}
          
          {completedDeliveries.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Completed</h3>
              <div className="space-y-4 opacity-75">
                {completedDeliveries.map((delivery) => (
                  <div key={delivery.id} className="bg-card rounded-xl border p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{delivery.customerName}</p>
                      <p className="text-sm text-muted-foreground">{delivery.orderId}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        delivery.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DeliveryCard: React.FC<{ 
  delivery: DeliveryAssignment; 
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onNavigate: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
}> = ({ 
  delivery, 
  onUpdateStatus, 
  onNavigate, 
  onCall, 
  onWhatsApp 
}) => {
  return (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden relative">
      {delivery.isPriority && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
          Priority
        </div>
      )}
      
      <div className="p-4 border-b">
            <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold">{delivery.customerName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> {delivery.deliveryTimeSlot}
            </p>
          </div>
          <div className="text-right">
            <Link to={`/deliveries/${delivery.id}`} className="text-sm font-semibold text-primary hover:underline block mb-1">
              View Details &rarr;
            </Link>
            <span className="inline-block mt-1 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {delivery.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex items-start gap-2 mt-4 text-sm bg-muted/30 p-3 rounded-lg">
          <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
          <p className="text-zinc-700 leading-snug">
            {delivery.deliveryAddress}
            <span className="block font-semibold mt-1">{delivery.area}, {delivery.pincode}</span>
          </p>
        </div>
      </div>
      
      <div className="p-4 bg-zinc-50 border-b flex flex-col gap-2">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Utensils className="size-4 text-orange-500" />
          {delivery.mealType} ({delivery.quantity})
        </p>
        <p className="text-xs text-muted-foreground">Items: {delivery.mealItems.join(", ")}</p>
        <div className="flex gap-4 mt-1">
          <span className="text-xs font-medium text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded bg-white">
            {delivery.calories} kcal
          </span>
          <span className="text-xs font-medium text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded bg-white">
            {delivery.protein}g protein
          </span>
        </div>
      </div>
      
      {(delivery.customerNotes || delivery.kitchenNotes) && (
        <div className="p-4 border-b text-sm">
          {delivery.kitchenNotes && (
            <div className="mb-2">
              <span className="font-semibold text-orange-600 block text-xs uppercase tracking-wider">Kitchen Note</span>
              <p className="text-zinc-700">{delivery.kitchenNotes}</p>
            </div>
          )}
          {delivery.customerNotes && (
            <div>
              <span className="font-semibold text-blue-600 block text-xs uppercase tracking-wider">Customer Note</span>
              <p className="text-zinc-700">{delivery.customerNotes}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 flex flex-col gap-3">
        {/* Action Buttons based on status */}
        {delivery.status === 'assigned' && (
          <div className="flex gap-3">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(delivery.id, 'accepted')}>
              Accept
            </Button>
            <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
              const reason = window.prompt("Reason for rejecting:");
              if (reason) {
                onUpdateStatus(delivery.id, 'rejected');
              }
            }}>
              Reject
            </Button>
          </div>
        )}
        
        {delivery.status === 'accepted' && (
          <Button className="w-full" onClick={() => onUpdateStatus(delivery.id, 'picked_up')}>
            Confirm Pickup from Kitchen
          </Button>
        )}
        
        {(delivery.status === 'picked_up' || delivery.status === 'out_for_delivery') && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Button variant="outline" className="flex flex-col h-auto py-2 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={onNavigate}>
                <Navigation className="size-5" />
                <span className="text-xs">Navigate</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-2 gap-1 text-green-600 border-green-200 hover:bg-green-50" onClick={onCall}>
                <Phone className="size-5" />
                <span className="text-xs">Call</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-2 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={onWhatsApp}>
                <MessageCircle className="size-5" />
                <span className="text-xs">Chat</span>
              </Button>
            </div>
            
            {delivery.status === 'picked_up' && (
              <Button className="w-full" onClick={() => onUpdateStatus(delivery.id, 'out_for_delivery')}>
                Start Delivery (Share Location)
              </Button>
            )}
            
            {delivery.status === 'out_for_delivery' && (
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                  const enteredOTP = window.prompt("Enter Delivery OTP provided by customer:");
                  if (enteredOTP === delivery.deliveryOTP || enteredOTP === "1234") { // Mock 1234 for testing purposes usually, but keeping it strict to deliveryOTP
                    if (enteredOTP === delivery.deliveryOTP) {
                      onUpdateStatus(delivery.id, 'delivered');
                    } else {
                      toast.error("Invalid OTP");
                    }
                  } else if (enteredOTP !== null) {
                    toast.error("Invalid OTP");
                  }
                }}>
                  <CheckCircle className="size-4 mr-2" />
                  Mark Delivered
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                  const reason = window.prompt("Reason for failure (e.g. Customer unavailable, Wrong address):");
                  if (reason) {
                    // Update with reason in a real app, here we just change status
                    onUpdateStatus(delivery.id, 'failed');
                  }
                }}>
                  <XCircle className="size-4 mr-2" />
                  Failed
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
