import * as React from "react"
import { motion } from "framer-motion"
import { FileQuestion, SearchX, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: "search" | "inbox" | "file"
  action?: React.ReactNode
}

export function EmptyState({ 
  title, 
  description, 
  icon = "inbox", 
  action, 
  className,
  ...props 
}: EmptyStateProps) {
  
  const icons = {
    search: SearchX,
    inbox: Inbox,
    file: FileQuestion,
  }
  
  const Icon = icons[icon]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center h-full min-h-[400px] w-full bg-card/20 rounded-xl border border-dashed border-border/60",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4 shadow-inner ring-1 ring-white/5">
        <Icon className="h-8 w-8 text-muted-foreground/80" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </motion.div>
  )
}
