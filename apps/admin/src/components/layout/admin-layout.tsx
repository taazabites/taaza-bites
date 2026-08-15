import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Breadcrumbs } from "./breadcrumbs"
import { AnimatePresence, motion } from "motion/react"
import { systemMonitoringService } from "../../services/system-monitoring"
import { RoleGuard } from "../RoleGuard"

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
        
        <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto bg-background/50">
          <div className="w-full p-4 md:p-6 lg:p-8 lg:max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="w-full"
              >
                <RoleGuard>
                  <Outlet />
                </RoleGuard>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <footer className="shrink-0 border-t border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
          © 2026 TaazaBites Administration. All Rights Reserved.
        </footer>
      </div>
    </div>
  )
}
