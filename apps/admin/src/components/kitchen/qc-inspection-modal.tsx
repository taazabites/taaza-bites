import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, AlertTriangle, Thermometer, Scale, Box, Utensils, XCircle, Award } from "lucide-react";

interface QcInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onApproveQC: (itemId: string, qcNotes: string) => Promise<void>;
}

export function QcInspectionModal({ isOpen, onClose, item, onApproveQC }: QcInspectionModalProps) {
  if (!item) return null;

  const [check1, setCheck1] = useState(true); // Ingredient & Recipe Compliance
  const [check2, setCheck2] = useState(true); // Weight Check (+/- 5g)
  const [check3, setCheck3] = useState(true); // Hermetic Tray Seal
  const [check4, setCheck4] = useState(true); // Temperature Probe (>=65C hot / <=4C cold)
  const [check5, setCheck5] = useState(true); // Final Visual & Allergen Approval

  const [measuredWeight, setMeasuredWeight] = useState("382");
  const [measuredTemp, setMeasuredTemp] = useState("68.4");
  const [inspectorNotes, setInspectorNotes] = useState("Meal meets all 5 quality standards. Approved for dispatch.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allPassed = check1 && check2 && check3 && check4 && check5;

  const handlePassSubmission = async () => {
    setIsSubmitting(true);
    try {
      await onApproveQC(item.id, inspectorNotes);
      onClose();
    } catch (err) {
      console.error("QC Approval error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              5-Pass Quality Control (QC) Station
            </DialogTitle>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
              Audit Gate #04
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            Audit item <span className="text-white font-bold">{item.meal}</span> (Order ID: <span className="text-emerald-400 font-mono">{item.orderId || 'ORD-5521'}</span>)
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
          
          {/* 5-PASS CHECKLIST */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">5-Point Safety & Portions Checklist</h4>
            
            {/* Check 1 */}
            <div 
              onClick={() => setCheck1(!check1)} 
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                check1 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${check1 ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                {check1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  1. Ingredient & Recipe Compliance
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-zinc-800 border-zinc-700 text-zinc-300">Visual</Badge>
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Ingredients match standardized master recipe card without substitution.</p>
              </div>
            </div>

            {/* Check 2 */}
            <div 
              onClick={() => setCheck2(!check2)} 
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                check2 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${check2 ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                {check2 ? <Scale className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-white">2. Precision Weight Scale Audit</p>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Target: 380g</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    value={measuredWeight}
                    onChange={(e) => setMeasuredWeight(e.target.value)}
                    className="w-24 bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white font-mono"
                    placeholder="Measured g"
                  />
                  <span className="text-[11px] text-zinc-400">grams measured (Tolerance: ±5g)</span>
                </div>
              </div>
            </div>

            {/* Check 3 */}
            <div 
              onClick={() => setCheck3(!check3)} 
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                check3 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${check3 ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                {check3 ? <Box className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">3. Hermetic Tray Seal & Leak Proof</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Heat seal film fully intact, zero air leaks, lidded tightly.</p>
              </div>
            </div>

            {/* Check 4 */}
            <div 
              onClick={() => setCheck4(!check4)} 
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                check4 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${check4 ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                {check4 ? <Thermometer className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-white">4. Infrared Temperature Probe Test</p>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Safe Probe Range</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    value={measuredTemp}
                    onChange={(e) => setMeasuredTemp(e.target.value)}
                    className="w-24 bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white font-mono"
                    placeholder="Temp °C"
                  />
                  <span className="text-[11px] text-zinc-400">°C logged (Hot ≥65°C / Cold ≤4°C)</span>
                </div>
              </div>
            </div>

            {/* Check 5 */}
            <div 
              onClick={() => setCheck5(!check5)} 
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                check5 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${check5 ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                {check5 ? <Award className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">5. Inspector Final Sign-Off & Stamp</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Allergen declaration matches customer profile without cross-contamination.</p>
              </div>
            </div>

          </div>

          {/* INSPECTOR NOTES INPUT */}
          <div className="pt-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block mb-1">
              Quality Inspector Audit Log
            </label>
            <textarea
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              placeholder="Record any portion variations or quality notes..."
            />
          </div>

        </div>

        {/* FOOTER CONTROLS */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div>
            <Badge variant="outline" className={allPassed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}>
              {allPassed ? "5/5 Checks Passed" : "Checks Pending"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              disabled={!allPassed || isSubmitting}
              onClick={handlePassSubmission}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <ShieldCheck className="h-4 w-4" /> Approve & Stamp QC
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
