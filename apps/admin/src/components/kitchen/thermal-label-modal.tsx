import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, CheckCircle2, QrCode, ShieldCheck, Flame, Utensils, AlertTriangle } from "lucide-react";

interface ThermalLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function ThermalLabelModal({ isOpen, onClose, item }: ThermalLabelModalProps) {
  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate barcode bars
  const barcodeBars = Array.from({ length: 32 }, (_, i) => (
    <div
      key={i}
      className={`h-10 bg-black ${i % 3 === 0 ? "w-1.5" : i % 5 === 0 ? "w-1" : "w-0.5"}`}
    />
  ));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="h-5 w-5 text-emerald-400" />
              Thermal Packaging Label Preview
            </DialogTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
              Ready for Print
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            Standard 4" x 3" Industrial Thermal Sticker with QR Traceability
          </DialogDescription>
        </DialogHeader>

        {/* PRINTABLE LABEL TICKET BOX */}
        <div className="p-6 flex justify-center bg-zinc-900/60">
          <div id="printable-thermal-label" className="w-[320px] bg-white text-black p-4 rounded-xl shadow-2xl border-2 border-black font-mono space-y-3 relative select-none">
            
            {/* Header Header Brand */}
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <div>
                <h3 className="font-extrabold text-lg tracking-tight text-black flex items-center gap-1">
                  TAAZA BITES
                </h3>
                <p className="text-[9px] font-bold text-zinc-700 tracking-wider">FRESH MEAL SUBSCRIPTION</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold bg-black text-white px-2 py-0.5 rounded">
                  {item.mealType || "HIGH PROTEIN"}
                </span>
                <p className="text-[9px] font-bold text-zinc-600 mt-0.5">{item.deliverySlot || "LUNCH (12-2 PM)"}</p>
              </div>
            </div>

            {/* Customer & Order Metadata */}
            <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-zinc-300 pb-2">
              <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase">Customer</p>
                <p className="font-extrabold text-black truncate">{item.customerName || "Amit Singh"}</p>
                <p className="text-[10px] text-zinc-700">Sub ID: {item.subscriptionId || "SUB-9941"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase">Order ID</p>
                <p className="font-extrabold text-black">{item.orderId || "ORD-5521"}</p>
                <p className="text-[10px] text-zinc-700">Qty: {item.quantity || 1} Bowl</p>
              </div>
            </div>

            {/* Meal Title & Description */}
            <div className="border-b border-zinc-300 pb-2">
              <p className="text-[9px] font-bold text-zinc-500 uppercase">Prepared Meal</p>
              <p className="font-extrabold text-sm text-black leading-tight">{item.meal || "Paneer Quinoa Bowl"}</p>
              <p className="text-[10px] text-zinc-700 mt-0.5 font-sans">
                Portion: {item.portionSize || "380g"} (Paneer 150g, Quinoa 140g, Veggies 90g)
              </p>
            </div>

            {/* Macro Breakdown */}
            <div className="bg-zinc-100 p-2 rounded-lg border border-zinc-300 grid grid-cols-4 gap-1 text-center text-[10px]">
              <div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase">Cal</p>
                <p className="font-extrabold text-black">{item.calories || 420}</p>
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase">Protein</p>
                <p className="font-extrabold text-emerald-800">{item.protein || 32}g</p>
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase">Carbs</p>
                <p className="font-extrabold text-black">{item.carbs || 38}g</p>
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase">Fats</p>
                <p className="font-extrabold text-black">{item.fats || 14}g</p>
              </div>
            </div>

            {/* Allergen & Expiry Warning */}
            <div className="flex justify-between items-center text-[9px] border-b border-zinc-300 pb-2">
              <div>
                <span className="font-bold text-rose-700 uppercase">Allergens: </span>
                <span className="font-semibold text-black">{item.allergens || "Dairy (Paneer), Soy"}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-zinc-700">Packed: </span>
                <span className="font-bold text-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Barcode & QR Code Section */}
            <div className="flex justify-between items-center pt-1">
              <div className="flex items-center gap-0.5 overflow-hidden">
                {barcodeBars}
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-black p-1 rounded flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <span className="text-[7px] font-bold mt-0.5">SCAN TRACE</span>
              </div>
            </div>

            {/* Watermark/Verification stamp */}
            <div className="text-center pt-1 border-t border-zinc-200 text-[8px] text-zinc-600 font-bold">
              QC APPROVED • CONSUME WITHIN 24 HOURS (KEEP CHILLED)
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-xl text-xs font-semibold"
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Printer className="h-4 w-4" /> Print Thermal Sticker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
