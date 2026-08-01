import { Link } from "react-router-dom"
import { Compass, HelpCircle, ArrowLeft, UtensilsCrossed } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 selection:bg-emerald-500/30 selection:text-emerald-400">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
        
        {/* Decorative elements */}
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <Compass className="h-8 w-8 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
        </div>

        <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Error Code: 404
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-4 mb-2">Protocol Uncharted</h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          The operations module or webpage you requested could not be retrieved from our local servers. It might have been relocated during kitchen system maintenance.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            to="/"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Active App
          </Link>
          <a
            href="mailto:support@taazabites.in"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
            Contact Kitchen Support
          </a>
        </div>
      </div>
    </div>
  )
}
