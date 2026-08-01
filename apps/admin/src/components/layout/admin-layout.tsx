import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Breadcrumbs } from "./breadcrumbs"
import { AnimatePresence, motion } from "motion/react"
import { systemMonitoringService } from "../../services/system-monitoring"

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        systemMonitoringService.logPerformance({
          metric: entry.name,
          value: entry.duration || (entry as any).startTime,
          route: window.location.pathname
        })
      })
    })
    
    // Watch for navigation and paint timings
    try {
      observer.observe({ entryTypes: ['navigation', 'paint'] })
    } catch (e) {
      console.warn("PerformanceObserver not supported", e)
    }
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden relative min-w-0">
        <Header setSidebarOpen={setSidebarOpen} />
        <Breadcrumbs />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background/50 relative min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full p-4 md:p-6 lg:p-8 lg:max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          <footer className="border-t border-border bg-card p-4 text-center text-xs text-muted-foreground">
            © 2026 TaazaBites Administration. All Rights Reserved.
          </footer>
        </main>
      </div>
    </div>
  )
}
