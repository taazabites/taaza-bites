import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { DeliveryAssignment } from "@/types";
import { ArrowLeft, MapPin, Phone, Clock, FileText, CheckCircle2, Navigation, Utensils, IndianRupee, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<DeliveryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "deliveryAssignments", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as DeliveryAssignment);
        } else {
          toast.error("Order not found");
          navigate("/deliveries");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    try {
      await updateDoc(doc(db, "deliveryAssignments", order.id), {
        status: newStatus,
        updatedAt: Date.now()
      });
      setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleVerifyOTP = () => {
    if (!order) return;
    if (otp === order.deliveryOTP) {
      toast.success("OTP Verified Successfully");
      // Could move to next step, or just allow completing delivery
      handleStatusUpdate("delivered");
    } else {
      toast.error("Invalid OTP");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !order) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `delivery_proofs/${order.id}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.error("Upload error:", error);
          toast.error("Failed to upload photo");
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(doc(db, "deliveryAssignments", order.id), {
            deliveryPhotoUrl: downloadURL,
            updatedAt: Date.now()
          });
          setOrder(prev => prev ? { ...prev, deliveryPhotoUrl: downloadURL } : null);
          toast.success("Proof of delivery uploaded!");
          setUploading(false);
        }
      );
    } catch (error) {
      console.error("Error initiating upload:", error);
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-600 size-8" /></div>;
  }

  if (!order) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-bold text-slate-800">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-xs text-slate-500 capitalize font-medium">{order.status.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto w-full">
        
        {/* Customer Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{order.customerName}</h2>
              <div className="flex gap-2 mt-2">
                <a href={`tel:${order.customerPhone}`} className="inline-flex items-center justify-center size-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                  <Phone className="size-5" />
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${order.location?.lat},${order.location?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center size-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <Navigation className="size-5" />
                </a>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                {order.paymentStatus === 'paid' ? 'PAID' : 'COD'}
              </span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <MapPin className="size-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">{order.deliveryAddress}</p>
              <p className="text-xs text-slate-500 mt-1">{order.area} - {order.pincode}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Utensils className="size-4 text-emerald-600" />
            Order Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-500">Meal Type</span>
              <span className="font-medium text-slate-800">{order.mealType}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-500">Quantity</span>
              <span className="font-medium text-slate-800">{order.quantity} x Meal</span>
            </div>
            {order.mealItems && order.mealItems.length > 0 && (
              <div className="border-b border-slate-50 pb-2">
                <span className="text-slate-500 block mb-1">Items</span>
                <ul className="list-disc pl-5 font-medium text-slate-800 space-y-0.5">
                  {order.mealItems.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-500">Time Slot</span>
              <span className="font-medium text-slate-800">{order.deliveryTimeSlot}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(order.customerNotes || order.kitchenNotes) && (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
              <FileText className="size-4" />
              Notes
            </h3>
            <div className="space-y-2 text-sm">
              {order.customerNotes && (
                <div>
                  <span className="text-amber-700 font-medium">Customer: </span>
                  <span className="text-amber-900">{order.customerNotes}</span>
                </div>
              )}
              {order.kitchenNotes && (
                <div>
                  <span className="text-amber-700 font-medium">Kitchen: </span>
                  <span className="text-amber-900">{order.kitchenNotes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions based on status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 mb-2">Delivery Workflow</h3>
          
          {['assigned', 'accepted'].includes(order.status) && (
            <div className="grid grid-cols-2 gap-3">
              {order.status === 'assigned' && (
                <Button onClick={() => handleStatusUpdate('accepted')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Accept Order
                </Button>
              )}
              <Button 
                onClick={() => handleStatusUpdate('picked_up')} 
                className="w-full bg-blue-600 hover:bg-blue-700 col-span-2"
                disabled={order.status === 'assigned'}
              >
                Mark Picked Up
              </Button>
            </div>
          )}

          {order.status === 'picked_up' && (
            <Button onClick={() => handleStatusUpdate('out_for_delivery')} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Start Delivery
            </Button>
          )}

          {order.status === 'out_for_delivery' && (
            <div className="space-y-4">
              {/* Photo Proof */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                {order.deliveryPhotoUrl ? (
                  <div className="space-y-2">
                    <img src={order.deliveryPhotoUrl} alt="Delivery Proof" className="rounded-lg max-h-48 mx-auto object-cover" />
                    <p className="text-sm text-emerald-600 font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="size-4" /> Photo Uploaded
                    </p>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-slate-300 text-slate-700"
                    >
                      {uploading ? <Loader2 className="animate-spin size-4 mr-2" /> : <Camera className="size-4 mr-2" />}
                      Take Delivery Photo
                    </Button>
                  </>
                )}
              </div>

              {/* OTP Verification */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Verify Customer OTP</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                  />
                  <Button onClick={handleVerifyOTP} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
                    Verify & Deliver
                  </Button>
                </div>
              </div>
            </div>
          )}

          {['delivered', 'failed', 'returned'].includes(order.status) && (
            <div className="text-center py-4 bg-slate-50 rounded-xl">
              <CheckCircle2 className="size-10 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-slate-800">Delivery Completed</p>
              <p className="text-sm text-slate-500 mt-1">This order is now in history.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
