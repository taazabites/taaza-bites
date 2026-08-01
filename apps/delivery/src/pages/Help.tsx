import { Phone, MessageCircle, AlertTriangle, HelpCircle, Wrench, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Help() {
  const callNumber = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const openWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone}`);
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
            <Button variant="outline" className="justify-start h-12 bg-green-50 hover:bg-green-100 border-green-200" onClick={() => openWhatsApp("918000000003")}>
              <MessageCircle className="size-4 mr-3 text-green-600" />
              WhatsApp Support
            </Button>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-red-800 flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-500" />
            Emergency & Issues
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start h-12 text-red-600 border-red-200 hover:bg-red-100">
              <Siren className="size-4 mr-3" />
              Report Accident
            </Button>
            <Button variant="outline" className="justify-start h-12 text-orange-600 border-orange-200 hover:bg-orange-100">
              <Wrench className="size-4 mr-3" />
              Vehicle Breakdown
            </Button>
            <Button variant="outline" className="justify-start h-12 text-blue-600 border-blue-200 hover:bg-blue-100 md:col-span-2">
              <HelpCircle className="size-4 mr-3" />
              Raise General Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
