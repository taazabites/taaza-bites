import React from "react"
import { Link, useLocation } from "react-router-dom"
import { CreditCard, CalendarClock, AlertTriangle, Sparkles } from "lucide-react"

export function SubscriptionsNavTabs() {
  const location = useLocation()
  const currentPath = location.pathname

  const tabs = [
    { title: "Active Subscriptions", href: "/subscriptions", icon: CreditCard },
    { title: "Upcoming Renewals", href: "/subscriptions/renewals", icon: CalendarClock },
    { title: "Expiring Soon", href: "/subscriptions/expiring", icon: AlertTriangle },
    { title: "Subscription Plans", href: "/plans", icon: Sparkles },
  ]

  return (
    <div className="flex border-b border-zinc-800/80 gap-2 overflow-x-auto pb-px mb-6 ">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.href
        return (
          <Link
            key={tab.href}
            to={tab.href}
            id={`tab-link-${tab.href.replace("/", "").replace("/", "-")}`}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              isActive
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/[0.02]"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
            <span>{tab.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
