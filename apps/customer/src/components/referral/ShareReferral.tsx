import { useState } from "react";
import { safeCopyToClipboard } from "@/src/utils/clipboard";
import { 
  Copy, 
  Share2, 
  MessageCircle, 
  Mail, 
  Check, 
  MessageSquare
} from "lucide-react";
import { Button } from "../ui/primitives";
import { useToast } from "@/src/context/ToastContext";
import { cn } from "@/src/lib/utils";

interface ShareReferralProps {
  referralCode: string;
}

export default function ShareReferral({ referralCode }: ShareReferralProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/subscribe?ref=${referralCode}`;
  const shareText = `🌱 Hey! Get ₹250 OFF on your first fresh, organic TaazaBites meal plan! 🥗✨\n\nUse my personal referral code: *${referralCode}*\n\nSign up & claim your discount here:\n${referralLink}\n\nChef-crafted, healthy organic meals delivered fresh to your door! 🚀`;

  const handleCopy = async () => {
    await safeCopyToClipboard(referralLink);
    setCopied(true);
    showToast("Referral link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=Join TaazaBites and Save!&body=${encodeURIComponent(shareText)}`;
  };

  const shareViaSMS = () => {
    window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 p-4 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md">
           <code className="font-mono text-lg font-black tracking-widest text-emerald-400">{referralCode}</code>
           <button 
             onClick={handleCopy}
             className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
           >
             {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
           </button>
        </div>
        
        <Button 
          onClick={handleCopy}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-4 px-8 font-black uppercase tracking-widest text-xs h-auto shadow-xl shadow-indigo-500/20"
        >
          Copy Link
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={shareViaWhatsApp}
          className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
             <MessageCircle className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400">WhatsApp</span>
        </button>

        <button 
          onClick={shareViaEmail}
          className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
             <Mail className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-indigo-400">Email</span>
        </button>

        <button 
          onClick={shareViaSMS}
          className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
             <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-amber-400">SMS</span>
        </button>
      </div>
    </div>
  );
}
