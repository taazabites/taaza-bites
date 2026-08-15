import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, MessageCircle, AlertTriangle, HelpCircle, Wrench, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import type { PartnerIssueReport } from "@/types";

const ISSUE_OPTIONS: { type: PartnerIssueReport["type"]; label: string; icon: React.ReactNode }[] = [
  { type: "accident", label: "Accident", icon: <Siren className="size-4 mr-3" /> },
  { type: "vehicle", label: "Vehicle problem", icon: <Wrench className="size-4 mr-3" /> },
  { type: "food_damaged", label: "Food damaged", icon: <AlertTriangle className="size-4 mr-3" /> },
  { type: "wrong_package", label: "Wrong package", icon: <AlertTriangle className="size-4 mr-3" /> },
  { type: "customer_unavailable", label: "Customer unavailable", icon: <HelpCircle className="size-4 mr-3" /> },
  { type: "address_issue", label: "Address issue", icon: <HelpCircle className="size-4 mr-3" /> },
  { type: "kitchen_delay", label: "Kitchen delay", icon: <HelpCircle className="size-4 mr-3" /> },
  { type: "traffic", label: "Traffic", icon: <HelpCircle className="size-4 mr-3" /> },
  { type: "other", label: "Other", icon: <HelpCircle className="size-4 mr-3" /> },
];

export default function Help() {
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const callNumber = (phone: string) => window.open(`tel:${phone}`);
  const openWhatsApp = (phone: string) => window.open(`https://wa.me/${phone}`);

  const reportIssue = async (type: PartnerIssueReport["type"], label: string) => {
    if (!user) return;
    const detail = window.prompt(`Describe the issue (${label}):`, "") ?? "";
    setSubmitting(type);
    try {
      let location: { lat: number; lng: number } | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        /* optional */
      }

      await addDoc(collection(db, "partnerIssueReports"), {
        partnerId: user.uid,
        partnerName: profile?.name,
        type,
        message: detail || label,
        location: location || null,
        createdAt: Date.now(),
        status: "open",
      } satisfies Omit<PartnerIssueReport, "id"> & { location: unknown });

      toast.success("Issue sent to admin instantly");
    } catch {
      toast.error("Could not send issue — try calling dispatch");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h2 className="text-2xl font-bold tracking-tight">Help Center</h2>

      <div className="grid gap-4">
        <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <HelpCircle className="size-5 text-blue-500" />
            Support Contacts
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start h-12" onClick={() => callNumber("+918000000001")}>
              <Phone className="size-4 mr-3 text-green-600" />
              Call Dispatch / Admin
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => callNumber("+918000000002")}>
              <Phone className="size-4 mr-3 text-orange-500" />
              Call Central Kitchen
            </Button>
            <Button
              variant="outline"
              className="justify-start h-12 bg-green-50 hover:bg-green-100 border-green-200"
              onClick={() => openWhatsApp("918000000003")}
            >
              <MessageCircle className="size-4 mr-3 text-green-600" />
              WhatsApp Support
            </Button>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-red-800 flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-500" />
            Report Problem
          </h3>
          <p className="text-xs text-red-700/80">Admin receives this instantly in partnerIssueReports.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ISSUE_OPTIONS.map((opt) => (
              <Button
                key={opt.type}
                variant="outline"
                disabled={!!submitting}
                className="justify-start h-12 text-red-700 border-red-200 hover:bg-red-100"
                onClick={() => reportIssue(opt.type, opt.label)}
              >
                {opt.icon}
                {submitting === opt.type ? "Sending…" : opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
