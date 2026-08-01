import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useNavigate } from "react-router-dom"
import { Plus, Tag, Megaphone, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const actions = [
    {
      icon: <Tag className="h-4 w-4" />,
      label: "Add Coupon",
      path: "/coupons",
      color: "bg-emerald-500",
      textColor: "text-emerald-950"
    },
    {
      icon: <Megaphone className="h-4 w-4" />,
      label: "Create Campaign",
      path: "/marketing",
      color: "bg-blue-500",
      textColor: "text-blue-950"
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: "System Audit",
      path: "/audit-logs",
      color: "bg-purple-500",
      textColor: "text-purple-950"
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 items-end"
          >
            {actions.map((action, idx) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (actions.length - idx) * 0.05 }}
              >
                <Button
                  variant="default"
                  className={`${action.color} ${action.textColor} hover:opacity-90 font-bold shadow-lg rounded-full px-5 py-6 gap-3 flex items-center transition-all hover:scale-105`}
                  onClick={() => {
                    setIsOpen(false)
                    navigate(action.path)
                  }}
                >
                  <span className="bg-black/10 p-1.5 rounded-full">{action.icon}</span>
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'}`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="h-6 w-6" />
        </motion.div>
      </Button>
    </div>
  )
}
