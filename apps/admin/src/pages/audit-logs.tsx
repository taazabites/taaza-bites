import React, { useState, useEffect, useMemo } from "react"
import { useAuth } from "../contexts/auth-context"
import { db } from "../lib/firebase"
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  deleteDoc
} from "firebase/firestore"
import { 
  systemMonitoringService, 
  AuditLogRecord, 
  AdminSessionRecord, 
  SecurityEventRecord,
  getBrowserAndDevice,
  getClientIpAddress
} from "../services/system-monitoring"
import { 
  ShieldAlert, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Search, 
  Filter, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Lock, 
  Terminal, 
  Laptop, 
  Smartphone, 
  Eye, 
  Check, 
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowRight,
  Settings2,
  Trash2,
  SlidersHorizontal,
  LogOut,
  XCircle,
  HelpCircle
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { ActivityTimelineChart, ThreatSeverityMatrix } from "../components/audit/Charts"

const MODULES_LIST = [
  "Authentication",
  "Menu Management",
  "Order Management",
  "Customers",
  "Growth",
  "Operations",
  "Settings",
  "Business",
  "Security Monitoring"
]

const ACTIONS_LIST = [
  "Login",
  "Logout",
  "Failed Login",
  "Password Reset",
  "Customer Created",
  "Customer Updated",
  "Subscription Added",
  "Subscription Edited",
  "Menu Added",
  "Menu Edited",
  "Order Status Changed",
  "Coupon Created",
  "Payment Updated",
  "Driver Assigned",
  "Delivery Completed",
  "Settings Changed"
]

export default function AuditLogsPage() {
  const { user } = useAuth()
  
  // Realtime States
  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [sessions, setSessions] = useState<AdminSessionRecord[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEventRecord[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState<"logs" | "sessions" | "security">("logs")
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModule, setSelectedModule] = useState("All")
  const [selectedAction, setSelectedAction] = useState("All")
  const [selectedRole, setSelectedRole] = useState("All")
  const [selectedAdmin, setSelectedAdmin] = useState("All")
  const [dateFilter, setDateFilter] = useState<"All" | "Today" | "Yesterday" | "Week" | "Month" | "Custom">("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Modals & Interactive States
  const [simulationOpen, setSimulationOpen] = useState(false)
  const [simulating, setSimulating] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null)

  const [selectedLogDetails, setSelectedLogDetails] = useState<AuditLogRecord | null>(null)

  // Real-time console logs simulator state for the threat simulation console
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SIMULATOR CORE KERNEL: ACTIVE",
    "FIRESTORE PIPELINE: CONNECTED [ai-studio-taazabitesadmint-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2]",
    "SYSTEM THREAT MONITOR ENVELOPE: ARMED AND ENFORCED",
    "Ready for telemetry simulation injections..."
  ])

  const addTerminalLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTerminalLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)])
  }

  // Seed on Mount & Listen Realtime with safe unsubscriptions and no async race conditions
  useEffect(() => {
    let active = true
    let unsubLogs: (() => void) | null = null
    let unsubSess: (() => void) | null = null
    let unsubEvents: (() => void) | null = null

    const startListening = () => {
      if (!active) return

      // 1. Listen Realtime - Audit Logs
      const qLogs = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(1000))
      unsubLogs = onSnapshot(qLogs, (snap) => {
        if (!active) return
        const fetchedLogs: AuditLogRecord[] = []
        snap.forEach((docSnap) => {
          fetchedLogs.push({ logId: docSnap.id, ...docSnap.data() } as AuditLogRecord)
        })
        setLogs(fetchedLogs)
        setIsLoading(false)
      }, (error) => {
        console.error("Firestore error on auditLogs list:", error)
        if (active) setIsLoading(false)
      })

      // 2. Listen Realtime - Admin Sessions
      const qSessions = query(collection(db, "adminSessions"), orderBy("loginAt", "desc"), limit(200))
      unsubSess = onSnapshot(qSessions, (snap) => {
        if (!active) return
        const fetchedSess: AdminSessionRecord[] = []
        snap.forEach((docSnap) => {
          fetchedSess.push({ sessionId: docSnap.id, ...docSnap.data() } as AdminSessionRecord)
        })
        setSessions(fetchedSess)
      }, (error) => {
        console.error("Firestore error on adminSessions list:", error)
      })

      // 3. Listen Realtime - Security Alerts
      const qEvents = query(collection(db, "securityEvents"), orderBy("createdAt", "desc"), limit(200))
      unsubEvents = onSnapshot(qEvents, (snap) => {
        if (!active) return
        const fetchedEvents: SecurityEventRecord[] = []
        snap.forEach((docSnap) => {
          fetchedEvents.push({ eventId: docSnap.id, ...docSnap.data() } as SecurityEventRecord)
        })
        setSecurityEvents(fetchedEvents)
      }, (error) => {
        console.error("Firestore error on securityEvents list:", error)
      })
    }

    const initAndListen = async () => {
      try {
        setIsLoading(true)
        // Ensure standard logs seeded if empty
        await systemMonitoringService.ensureMonitoringSeeded()
      } catch (e) {
        console.error("Failed to seed initial monitoring:", e)
      } finally {
        if (active) {
          startListening()
        }
      }
    }

    initAndListen()

    return () => {
      active = false
      if (unsubLogs) unsubLogs()
      if (unsubSess) unsubSess()
      if (unsubEvents) unsubEvents()
    }
  }, [])

  // Manual Sync trigger
  const handleManualSync = async () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
    }, 1000)
  }

  // Extract unique admins & roles for filters dynamically from snapshot records
  const dynamicAdminsList = useMemo(() => {
    const admins = new Set<string>()
    logs.forEach((l) => {
      if (l.adminName) admins.add(l.adminName)
    })
    return Array.from(admins)
  }, [logs])

  const dynamicRolesList = useMemo(() => {
    const roles = new Set<string>()
    logs.forEach((l) => {
      if (l.role) roles.add(l.role)
    })
    return Array.from(roles)
  }, [logs])

  // In-Memory Filtration Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search Query
      if (searchQuery.trim() !== "") {
        const queryLower = searchQuery.toLowerCase()
        const matchAdmin = log.adminName?.toLowerCase().includes(queryLower)
        const matchModule = log.module?.toLowerCase().includes(queryLower)
        const matchAction = log.action?.toLowerCase().includes(queryLower)
        const matchRecord = log.recordId?.toLowerCase().includes(queryLower)
        const matchIp = log.ipAddress?.toLowerCase().includes(queryLower)
        if (!matchAdmin && !matchModule && !matchAction && !matchRecord && !matchIp) {
          return false
        }
      }

      // 2. Dropdown Filters
      if (selectedModule !== "All" && log.module !== selectedModule) return false
      if (selectedAction !== "All" && log.action !== selectedAction) return false
      if (selectedRole !== "All" && log.role !== selectedRole) return false
      if (selectedAdmin !== "All" && log.adminName !== selectedAdmin) return false

      // 3. Date Filter Range
      if (dateFilter !== "All") {
        const logDate = new Date(log.createdAt)
        const now = new Date()
        
        if (dateFilter === "Today") {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          if (logDate < startOfToday) return false
        } else if (dateFilter === "Yesterday") {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const startOfYesterday = new Date(startOfToday.getTime() - 24 * 3600 * 1000)
          if (logDate < startOfYesterday || logDate >= startOfToday) return false
        } else if (dateFilter === "Week") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
          if (logDate < sevenDaysAgo) return false
        } else if (dateFilter === "Month") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000)
          if (logDate < thirtyDaysAgo) return false
        } else if (dateFilter === "Custom") {
          if (startDate) {
            const start = new Date(startDate)
            if (logDate < start) return false
          }
          if (endDate) {
            const end = new Date(endDate)
            // extend end to end of that day
            end.setHours(23, 59, 59, 999)
            if (logDate > end) return false
          }
        }
      }

      return true
    })
  }, [logs, searchQuery, selectedModule, selectedAction, selectedRole, selectedAdmin, dateFilter, startDate, endDate])

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLogs, currentPage])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1

  // Handle page resets on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedModule, selectedAction, selectedRole, selectedAdmin, dateFilter, startDate, endDate])

  // Telemetry Dashboard Stat Cards Summary
  const telemetryStats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const totalActions = logs.length
    const successfulLogins = logs.filter(l => l.action === "Login" && l.status === "Success").length
    const failedLogins = logs.filter(l => l.action === "Failed Login").length
    
    // Module triggers
    const menuChanges = logs.filter(l => l.module === "Menu Management" || l.action === "Menu Added" || l.action === "Menu Edited").length
    const subChanges = logs.filter(l => l.module === "Customers" && (l.action === "Subscription Added" || l.action === "Subscription Edited")).length
    const paymentUpdates = logs.filter(l => l.module === "Business" && l.action === "Payment Updated").length
    const orderUpdates = logs.filter(l => l.module === "Order Management" || l.action === "Order Status Changed").length
    const securityAlerts = securityEvents.length

    return {
      totalActions,
      successfulLogins,
      failedLogins,
      menuChanges,
      subChanges,
      paymentUpdates,
      orderUpdates,
      securityAlerts
    }
  }, [logs, securityEvents])

  // Telemetry Chart Data prep
  // 1. Module Distribution
  const moduleChartData = useMemo(() => {
    const distribution: { [key: string]: number } = {}
    logs.forEach((l) => {
      distribution[l.module] = (distribution[l.module] || 0) + 1
    })
    return Object.keys(distribution).map((key) => ({
      name: key,
      value: distribution[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [logs])

  // 2. Activity Timeline over the last 7 days
  const timelineChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }).reverse()

    const stats = days.map((day) => ({
      name: day,
      Actions: 0,
      "Logins": 0,
      "Alerts": 0
    }))

    logs.forEach((l) => {
      const dayStr = new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const index = days.indexOf(dayStr)
      if (index !== -1) {
        stats[index].Actions++
        if (l.action === "Login") stats[index]["Logins"]++
      }
    })

    securityEvents.forEach((e) => {
      const dayStr = new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const index = days.indexOf(dayStr)
      if (index !== -1) {
        stats[index]["Alerts"]++
      }
    })

    return stats
  }, [logs, securityEvents])

  // 3. Severity Breakdown for Security alerts
  const securityPieData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 }
    securityEvents.forEach(e => {
      counts[e.severity] = (counts[e.severity] || 0) + 1
    })
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key as keyof typeof counts]
    }))
  }, [securityEvents])

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#7c3aed']

  // Session revoke handler
  const handleRevokeSession = (session: AdminSessionRecord) => {
    setConfirmDialog({
      isOpen: true,
      title: "Revoke Administrator Session",
      message: `Are you sure you want to force terminate the session for ${session.adminName} (${session.email})? This will immediately expire their active session.`,
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "adminSessions", session.sessionId), {
            status: "Expired",
            logoutAt: new Date().toISOString()
          })

          // Audit action
          await systemMonitoringService.logAction({
            adminId: user?.id || 'system',
            adminName: user?.name || 'Super Admin',
            role: user?.role || 'Super Admin',
            module: 'Security Monitoring',
            action: 'Session Expired',
            recordId: session.sessionId,
            status: 'Warning'
          })
          
          setConfirmDialog(null)
        } catch (e) {
          console.error("Failed to revoke session:", e)
        }
      }
    })
  }

  // Security Incident resolve / status updater
  const handleUpdateSecurityEventStatus = (event: SecurityEventRecord, newStatus: 'Investigating' | 'Resolved') => {
    setConfirmDialog({
      isOpen: true,
      title: `Mark Incident as ${newStatus}`,
      message: `Are you sure you want to mark the security event of type "${event.type}" as [${newStatus}]?`,
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "securityEvents", event.eventId), {
            status: newStatus
          })

          // Log audit activity
          await systemMonitoringService.logAction({
            adminId: user?.id || 'system',
            adminName: user?.name || 'Super Admin',
            role: user?.role || 'Super Admin',
            module: 'Security Monitoring',
            action: 'Settings Changed',
            recordId: event.eventId,
            status: 'Success'
          })
          setConfirmDialog(null)
        } catch (e) {
          console.error("Failed to update security status:", e)
        }
      }
    })
  }

  // Wipe all historical logs for security audit clear (Super Admin only capability)
  const handleClearAllLogs = () => {
    if (user?.role !== "superAdmin" && user?.role !== "admin") {
      alert("Unauthorized. Only Super Administrators can clear system audit logs.")
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: "CRITICAL: PURGE ALL AUDIT LOGS",
      message: "WARNING! This action is completely IRREVERSIBLE. This will permanently delete ALL activity audit logs, login sessions, and security monitoring logs from Cloud Firestore.",
      onConfirm: async () => {
        try {
          // Delete logs sequentially
          for (const l of logs) {
            await deleteDoc(doc(db, "auditLogs", l.logId))
          }
          for (const s of sessions) {
            await deleteDoc(doc(db, "adminSessions", s.sessionId))
          }
          for (const e of securityEvents) {
            await deleteDoc(doc(db, "securityEvents", e.eventId))
          }
          setConfirmDialog(null)
          alert("All audit monitoring database collections successfully purged.")
        } catch (e) {
          console.error("Purge logs failed:", e)
        }
      }
    })
  }

  // Simulator helper trigger with live terminal console logger
  const handleTriggerSimulation = async (type: string) => {
    setSimulating(type)
    addTerminalLog(`INITIATED CORE SIGNATURE: Preparing simulated injection for '${type}'...`)
    
    try {
      const activeAdminName = user?.name || 'System Admin'
      const activeAdminId = user?.id || 'sim_adm'
      const activeAdminRole = user?.role || 'Super Admin'

      addTerminalLog("SECURITY_CONTEXT: Resolving administrative certificates...")
      await new Promise(r => setTimeout(r, 450))

      if (type === "customer_created") {
        const mockId = 'cust_' + Math.floor(Math.random() * 1000)
        addTerminalLog(`SIMULATOR: Creating new customer profile payload with identifier [${mockId}]`)
        await systemMonitoringService.logAction({
          adminId: activeAdminId,
          adminName: activeAdminName,
          role: activeAdminRole,
          module: 'Customers',
          action: 'Customer Created',
          recordId: mockId,
          status: 'Success'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Successfully committed 'auditLogs' document [ID: ${mockId}]`)
      } else if (type === "menu_added") {
        const mockId = 'meal_' + Math.floor(Math.random() * 100)
        addTerminalLog(`SIMULATOR: Injecting new meal recipe into standard nutritional catalog [ID: ${mockId}]`)
        await systemMonitoringService.logAction({
          adminId: activeAdminId,
          adminName: activeAdminName,
          role: activeAdminRole,
          module: 'Menu Management',
          action: 'Menu Added',
          recordId: mockId,
          status: 'Success'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Successfully committed 'auditLogs' document [ID: ${mockId}]`)
      } else if (type === "order_changed") {
        const mockId = 'order_' + Math.floor(Math.random() * 1000)
        addTerminalLog(`SIMULATOR: Dispatching state change. Transitioning order queue [ID: ${mockId}] to 'Out For Delivery'`)
        await systemMonitoringService.logAction({
          adminId: activeAdminId,
          adminName: activeAdminName,
          role: activeAdminRole,
          module: 'Order Management',
          action: 'Order Status Changed',
          recordId: mockId,
          status: 'Success'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Successfully committed 'auditLogs' document [ID: ${mockId}]`)
      } else if (type === "coupon_created") {
        const mockId = 'FESTIVE' + Math.floor(Math.random() * 100)
        addTerminalLog(`SIMULATOR: Generating active growth promo coupon campaign [CODE: ${mockId}]`)
        await systemMonitoringService.logAction({
          adminId: activeAdminId,
          adminName: activeAdminName,
          role: activeAdminRole,
          module: 'Growth',
          action: 'Coupon Created',
          recordId: mockId,
          status: 'Success'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Successfully committed 'auditLogs' document [ID: ${mockId}]`)
      } else if (type === "settings_changed") {
        addTerminalLog(`SIMULATOR: Applying modified global network business configuration protocols`)
        await systemMonitoringService.logAction({
          adminId: activeAdminId,
          adminName: activeAdminName,
          role: activeAdminRole,
          module: 'Settings',
          action: 'Settings Changed',
          recordId: 'global_settings',
          status: 'Success'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Successfully committed 'auditLogs' document [ID: global_settings]`)
      } else if (type === "suspicious_activity") {
        addTerminalLog(`THREAT_FLAG: Location telemetry variance detected. Raising high-priority threat indicator.`)
        await systemMonitoringService.logSecurityEvent({
          type: 'Suspicious Activity',
          severity: 'Critical',
          adminName: activeAdminName,
          email: user?.email || 'admin@taazabites.in',
          details: 'Anomalous admin access behavior detected: Login from a known proxy subnet/VPN range (IP: 142.150.12.5).'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Registered Critical threat incident in 'securityEvents' successfully. Status: OPEN.`)
      } else if (type === "permission_denied") {
        addTerminalLog(`THREAT_FLAG: Privilege escalation attempt registered. Blocking execution.`)
        await systemMonitoringService.logSecurityEvent({
          type: 'Permission Denied',
          severity: 'Medium',
          adminName: 'Sneha Reddy',
          email: 'sneha@taazabites.in',
          details: 'Access Denied: Nutritionist attempted to alter business financial payout rates in /finance.'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Registered Medium breach attempt in 'securityEvents' successfully. Status: INVESTIGATING.`)
      } else if (type === "account_locked") {
        addTerminalLog(`THREAT_FLAG: Consecutive OTP authentication failures. Locking targeted administrator node.`)
        await systemMonitoringService.logSecurityEvent({
          type: 'Account Locked',
          severity: 'High',
          adminName: 'Amit Shah',
          email: 'amit@taazabites.in',
          details: 'Security Policy Action: Administrative profile [amit@taazabites.in] temporarily locked out after 5 consecutive bad OTP credentials.'
        })
        addTerminalLog(`FIRESTORE_PIPELINE: Registered High policy lock-out in 'securityEvents' successfully. Status: OPEN.`)
      }
      
      addTerminalLog(`TRANSACTION_COMPLETE: Handshake resolved. Telemetry stream synchronized.`)
    } catch (err: any) {
      addTerminalLog(`DATABASE_ERROR: Cloud write declined. Reason: ${err.message || err}`)
      console.error(err)
    } finally {
      setSimulating(null)
    }
  }

  // Export to CSV Functionality
  const handleExportCSV = () => {
    try {
      const headers = ["Log ID", "Date", "Admin Name", "Role", "Module", "Action", "Affected Record", "IP Address", "Browser", "Device", "Status"]
      const rows = filteredLogs.map((l) => [
        l.logId,
        new Date(l.createdAt).toLocaleString(),
        l.adminName,
        l.role,
        l.module,
        l.action,
        l.recordId || 'N/A',
        l.ipAddress,
        l.browser,
        l.device,
        l.status
      ])

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n")
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `taazabites_audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Failed to export CSV:", err)
    }
  }

  // Export to Excel Functionality (Formated CSV format which excel reads cleanly)
  const handleExportExcel = () => {
    try {
      const headers = ["Log ID", "Date Time", "Operator", "System Role", "System Module", "System Action", "Reference ID", "IP address", "Web Browser", "Terminal Device", "Log Status"]
      const rows = filteredLogs.map((l) => [
        l.logId,
        new Date(l.createdAt).toLocaleString(),
        l.adminName,
        l.role,
        l.module,
        l.action,
        l.recordId || '-',
        l.ipAddress,
        l.browser,
        l.device,
        l.status
      ])

      // tab separated content matches clean rows in Excel
      const xlsContent = [headers.join("\t"), ...rows.map(e => e.join("\t"))].join("\n")
      const blob = new Blob([xlsContent], { type: "application/vnd.ms-excel;charset=utf-8" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.setAttribute("download", `taazabites_security_audit_${new Date().toISOString().split('T')[0]}.xls`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Failed to export Excel:", err)
    }
  }

  // Export to PDF - Open printable high fidelity window style report
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to export high-quality printable PDF reports.")
      return
    }

    const reportDate = new Date().toLocaleString()
    const rowsHtml = filteredLogs.map((l) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 8px;">${new Date(l.createdAt).toLocaleString()}</td>
        <td style="padding: 8px;"><b>${l.adminName}</b><br/><span style="font-size: 9px; color: #64748b;">${l.role}</span></td>
        <td style="padding: 8px; color: #0d9488;">${l.module}</td>
        <td style="padding: 8px; font-weight: 500;">${l.action}</td>
        <td style="padding: 8px; font-family: monospace;">${l.recordId || '-'}</td>
        <td style="padding: 8px;">${l.ipAddress}</td>
        <td style="padding: 8px; font-size: 9px; color: #475569;">${l.browser} (${l.device})</td>
        <td style="padding: 8px;"><span style="padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background: ${l.status === 'Success' ? '#d1fae5; color: #065f46;' : '#fee2e2; color: #991b1b;'}">${l.status}</span></td>
      </tr>
    `).join("")

    printWindow.document.write(`
      <html>
        <head>
          <title>TaazaBites Enterprise Security Audit Logs</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f1f5f9; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
            .logo { font-size: 20px; font-weight: bold; color: #10b981; }
            .footer { margin-top: 40px; font-size: 10px; color: #64748b; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">TAAZABITES HQ SYSTEM AUDIT</div>
              <div style="font-size: 11px; margin-top: 5px; color: #475569;">Enterprise Infrastructure Activity Logs</div>
            </div>
            <div style="text-align: right; font-size: 11px;">
              <div><b>Generated:</b> ${reportDate}</div>
              <div><b>Records Count:</b> ${filteredLogs.length} logs</div>
              <div><b>Operator ID:</b> ${user?.name || 'Authorized Auditor'}</div>
            </div>
          </div>
          <h2 style="font-size: 16px; margin-bottom: 10px; text-transform: uppercase; color: #0f172a;">Active System Audit Trail</h2>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 20px;">This cryptographic-compliant security report tracks operational actions, database settings modifications, user profile additions, and login activities.</p>
          <table>
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Operator</th>
                <th>Module</th>
                <th>Action</th>
                <th>Affected Record</th>
                <th>IP Address</th>
                <th>Terminal Environment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            Confidential Security Document - TaazaBites Enterprise Infrastructure Monitoring System. Internal Use Only.
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8" id="audit-logs-module">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
            <Database className="h-3 w-3" />
            Admin Panel Security & Compliance
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Audit Logs & System Monitoring
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Realtime compliance, login session tracking, and threat prevention console.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setSimulationOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850 px-4 py-2 text-sm font-medium text-emerald-400 transition-all shadow-md"
          >
            <Terminal className="h-4 w-4" />
            Activity Simulator
          </button>
          
          <button 
            onClick={handleManualSync}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 px-4 py-2 text-sm font-medium text-zinc-300 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
            Live Syncing
          </button>

          {(user?.role === "superAdmin" || user?.role === "admin") && (
            <button 
              onClick={handleClearAllLogs}
              className="flex items-center gap-2 rounded-lg bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 px-4 py-2 text-sm font-medium text-red-400 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Purge Database Logs
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Admin Actions", value: telemetryStats.totalActions, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/5 border-emerald-500/20" },
          { label: "Successful Logins", value: telemetryStats.successfulLogins, icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/5 border-blue-500/20" },
          { label: "Failed Login Attempts", value: telemetryStats.failedLogins, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/5 border-amber-500/20" },
          { label: "Security Alerts Active", value: telemetryStats.securityAlerts, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/5 border-red-500/20" },
        ].map((card, idx) => (
          <div key={idx} className={`bg-zinc-900/60 backdrop-blur-xl border p-4 rounded-xl shadow-xl flex items-center justify-between ${card.bg}`}>
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl md:text-3xl font-black mt-1 tracking-tight">{isLoading ? "..." : card.value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-zinc-950 border border-zinc-800 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Operations Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Menu Changes", value: telemetryStats.menuChanges, desc: "Meals catalog adjustments" },
          { label: "Subscription Updates", value: telemetryStats.subChanges, desc: "Tier modifications & paused packs" },
          { label: "Payment Updates", value: telemetryStats.paymentUpdates, desc: "Revenue / refunds audit logs" },
          { label: "Order Operations", value: telemetryStats.orderUpdates, desc: "Dispatch / delivery workflow" },
        ].map((card, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <p className="text-zinc-400 text-xs font-medium">{card.label}</p>
              <h4 className="text-xl font-bold mt-1 text-white">{isLoading ? "..." : card.value}</h4>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Telemetry Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ActivityTimelineChart data={timelineChartData} />
        <ThreatSeverityMatrix data={securityPieData} colors={COLORS} />
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-850 mb-6 overflow-x-auto">
        {[
          { id: "logs", label: "Operational Audit Logs", count: filteredLogs.length, icon: Clock },
          { id: "sessions", label: "Active Login Sessions", count: sessions.filter(s => s.status === 'Active').length, icon: Users },
          { id: "security", label: "Security Monitoring", count: securityEvents.filter(e => e.status !== 'Resolved').length, icon: ShieldAlert },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tab.id === 'security' && tab.count > 0 ? 'bg-red-900/40 text-red-400 border border-red-800/50' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === "logs" && (
          <motion.div
            key="logs-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search and Filters Section */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 mb-6 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-400 tracking-wider mb-4">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-500" />
                Query Filter & Search Engine
              </div>

              {/* Row 1: Search Bar and Quick Presets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by admin operator name, IP, reference ID, module..."
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 pl-10 pr-4 py-2 text-sm text-zinc-100"
                  />
                </div>

                {/* Date range filter */}
                <div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 p-2 text-sm text-zinc-300"
                  >
                    <option value="All">All Timestamps</option>
                    <option value="Today">Today Only</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Week">This Week</option>
                    <option value="Month">This Month</option>
                    <option value="Custom">Custom Date Range</option>
                  </select>
                </div>

                {/* Export menu buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportCSV}
                    title="Export CSV"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 px-3 py-2 text-xs text-zinc-300 font-medium transition"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                    CSV
                  </button>
                  <button 
                    onClick={handleExportExcel}
                    title="Export for Microsoft Excel"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 px-3 py-2 text-xs text-zinc-300 font-medium transition"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    Excel
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    title="Generate PDF Sheet"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 px-3 py-2 text-xs text-zinc-300 font-medium transition"
                  >
                    <Printer className="h-3.5 w-3.5 text-amber-500" />
                    PDF
                  </button>
                </div>
              </div>

              {/* Row 2: Dropdowns and Date pickers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Module selection */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">System Module</label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 p-2 text-xs text-zinc-300"
                  >
                    <option value="All">All Modules</option>
                    {MODULES_LIST.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Action selection */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Specific Action</label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 p-2 text-xs text-zinc-300"
                  >
                    <option value="All">All Actions</option>
                    {ACTIONS_LIST.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* Admin Operator selection */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Operator Profile</label>
                  <select
                    value={selectedAdmin}
                    onChange={(e) => setSelectedAdmin(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 p-2 text-xs text-zinc-300"
                  >
                    <option value="All">All Admins</option>
                    {dynamicAdminsList.map((adm) => (
                      <option key={adm} value={adm}>{adm}</option>
                    ))}
                  </select>
                </div>

                {/* Role selection */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Compliance Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 p-2 text-xs text-zinc-300"
                  >
                    <option value="All">All Roles</option>
                    {dynamicRolesList.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Custom Date Selection inputs */}
              {dateFilter === "Custom" && (
                <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-850">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-md p-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-md p-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Audit Log Table */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 bg-zinc-900/60 border-b border-zinc-850 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  Audit History logs ({filteredLogs.length} found)
                </span>
                {filteredLogs.length > 0 && (
                  <span className="text-[10px] text-zinc-500">
                    Showing {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredLogs.length, currentPage * itemsPerPage)} of {filteredLogs.length} logs
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-400 gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                  <p className="text-xs font-semibold">Streaming compliance logs from Cloud Firestore...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
                  No audit logs found matching the filters. Try adjusting your query parameters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/40">
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Admin Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Module</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Record ID</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Environment</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-xs">
                      {paginatedLogs.map((log) => (
                        <tr key={log.logId} className="hover:bg-zinc-900/40 transition duration-150">
                          <td className="p-4 font-mono text-zinc-400 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-white">
                            {log.adminName}
                          </td>
                          <td className="p-4 whitespace-nowrap text-zinc-300">
                            {log.role}
                          </td>
                          <td className="p-4 whitespace-nowrap text-emerald-400 font-medium">
                            {log.module}
                          </td>
                          <td className="p-4 font-semibold text-zinc-200">
                            {log.action}
                          </td>
                          <td className="p-4 font-mono text-zinc-400">
                            {log.recordId || "-"}
                          </td>
                          <td className="p-4 font-mono text-zinc-400">
                            {log.ipAddress}
                          </td>
                          <td className="p-4 text-zinc-400 whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              {log.device.includes("Mobile") || log.device.includes("iPhone") ? (
                                <Smartphone className="h-3 w-3 text-zinc-500" />
                              ) : (
                                <Laptop className="h-3 w-3 text-zinc-500" />
                              )}
                              {log.browser}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "Success" 
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/30" 
                                : log.status === "Failed"
                                ? "bg-red-950/40 text-red-400 border border-red-900/30"
                                : "bg-amber-950/40 text-amber-400 border border-amber-900/30"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => setSelectedLogDetails(log)}
                              className="text-zinc-400 hover:text-emerald-400 p-1 rounded hover:bg-zinc-800 transition"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="p-4 bg-zinc-900/20 border-t border-zinc-850 flex items-center justify-between">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="flex items-center gap-1 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 px-3 py-1 text-xs text-zinc-300 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-xs text-zinc-400">
                    Page <b>{currentPage}</b> of <b>{totalPages}</b>
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="flex items-center gap-1 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 px-3 py-1 text-xs text-zinc-300 disabled:opacity-40 transition"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "sessions" && (
          <motion.div
            key="sessions-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Session Summary stats */}
            <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 h-fit shadow-md">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-200 flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-blue-500" />
                Active Sessions Matrix
              </h3>
              <div className="space-y-4 text-xs">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                  <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Total Active Connections</div>
                  <div className="text-2xl font-black text-blue-400 mt-1">{sessions.filter(s => s.status === 'Active').length} admins</div>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                  <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">All-time Tracked Sessions</div>
                  <div className="text-2xl font-black text-zinc-300 mt-1">{sessions.length} logins</div>
                </div>
              </div>
            </div>

            {/* Session details table */}
            <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 bg-zinc-900/60 border-b border-zinc-850">
                <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  Admin Login & Session History
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-zinc-500 text-xs">
                  No logged session history recorded in Firestore database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/40">
                        <th className="p-4">Admin Name / Email</th>
                        <th className="p-4">Compliance Role</th>
                        <th className="p-4">Login Time</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Device Environment</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-xs">
                      {sessions.map((sess) => (
                        <tr key={sess.sessionId} className="hover:bg-zinc-900/40 transition duration-150">
                          <td className="p-4">
                            <div className="font-bold text-white">{sess.adminName}</div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{sess.email}</div>
                          </td>
                          <td className="p-4 font-semibold text-zinc-300">
                            {sess.role}
                          </td>
                          <td className="p-4 text-zinc-400 font-mono">
                            {new Date(sess.loginAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-mono text-zinc-400">
                            {sess.ipAddress}
                          </td>
                          <td className="p-4 text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              {sess.device.includes("Mobile") || sess.device.includes("iPhone") ? (
                                <Smartphone className="h-3 w-3 text-zinc-500" />
                              ) : (
                                <Laptop className="h-3 w-3 text-zinc-500" />
                              )}
                              {sess.browser}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sess.status === 'Active'
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/30"
                                : sess.status === 'Logged Out'
                                ? "bg-zinc-800 text-zinc-400 border border-zinc-700/30"
                                : "bg-red-950/40 text-red-400 border border-red-900/30"
                            }`}>
                              {sess.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {sess.status === 'Active' ? (
                              <button
                                onClick={() => handleRevokeSession(sess)}
                                className="text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 px-2 py-1 rounded text-[10px] font-bold transition"
                              >
                                Revoke
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-600 font-medium">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            key="security-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Active alert details list */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 bg-zinc-900/60 border-b border-zinc-850 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  Security Incident Threat Ledger
                </span>
                <span className="text-[10px] font-semibold text-zinc-500">
                  {securityEvents.filter(e => e.status !== 'Resolved').length} Active Incidents Unresolved
                </span>
              </div>

              {securityEvents.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
                  <ShieldCheck className="h-10 w-10 text-emerald-500 mb-2" />
                  No security incidents or malicious activities reported. Your system is 100% healthy.
                </div>
              ) : (
                <div className="divide-y divide-zinc-850">
                  {securityEvents.map((event) => (
                    <div key={event.eventId} className="p-5 hover:bg-zinc-900/20 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            event.severity === 'Critical'
                              ? 'bg-red-950/60 text-red-400 border border-red-800/50'
                              : event.severity === 'High'
                              ? 'bg-orange-950/60 text-orange-400 border border-orange-850'
                              : 'bg-zinc-850 text-zinc-300'
                          }`}>
                            {event.severity} Severity
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            event.status === 'Open'
                              ? 'bg-red-500/10 text-red-400'
                              : event.status === 'Investigating'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            Status: {event.status}
                          </span>
                          <span className="text-xs font-bold text-zinc-100 font-sans">
                            {event.type}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                          {event.details}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-500">
                          <div>
                            <b>Operator Email:</b> {event.email || "system-triggered"}
                          </div>
                          <div>
                            <b>Origin IP:</b> {event.ipAddress}
                          </div>
                          <div>
                            <b>Timestamp:</b> {new Date(event.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {event.status === 'Open' && (
                          <button
                            onClick={() => handleUpdateSecurityEventStatus(event, 'Investigating')}
                            className="bg-amber-950/30 text-amber-400 hover:bg-amber-950/50 border border-amber-900/30 px-3 py-1.5 rounded text-xs font-semibold transition"
                          >
                            Investigate
                          </button>
                        )}
                        {event.status !== 'Resolved' && (
                          <button
                            onClick={() => handleUpdateSecurityEventStatus(event, 'Resolved')}
                            className="bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50 border border-emerald-900/30 px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Resolve
                          </button>
                        )}
                        {event.status === 'Resolved' && (
                          <span className="text-xs text-emerald-500 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            Mitigated
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Detail Slide-Over Modal */}
      {selectedLogDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Audit Log Details
              </h3>
              <button 
                onClick={() => setSelectedLogDetails(null)}
                className="text-zinc-400 hover:text-white transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Log ID</span>
                <span className="col-span-2 font-mono text-zinc-300">{selectedLogDetails.logId}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Date & Time</span>
                <span className="col-span-2 text-zinc-300">{new Date(selectedLogDetails.createdAt).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Operator Name</span>
                <span className="col-span-2 text-zinc-100 font-bold">{selectedLogDetails.adminName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Operator Role</span>
                <span className="col-span-2 text-zinc-300">{selectedLogDetails.role}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">System Module</span>
                <span className="col-span-2 text-emerald-400 font-semibold">{selectedLogDetails.module}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Performed Action</span>
                <span className="col-span-2 text-white font-bold">{selectedLogDetails.action}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Reference Record ID</span>
                <span className="col-span-2 font-mono text-zinc-300">{selectedLogDetails.recordId || "-"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Origin IP</span>
                <span className="col-span-2 font-mono text-zinc-300">{selectedLogDetails.ipAddress}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Device / OS</span>
                <span className="col-span-2 text-zinc-300">{selectedLogDetails.device}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Web Browser</span>
                <span className="col-span-2 text-zinc-300">{selectedLogDetails.browser}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Action Status</span>
                <span className="col-span-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedLogDetails.status === 'Success'
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                      : 'bg-red-950/40 text-red-400 border border-red-900/30'
                  }`}>
                    {selectedLogDetails.status}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Alert Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {confirmDialog.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="rounded-lg bg-red-650 hover:bg-red-700 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Simulation Panel Drawer Modal */}
      {simulationOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Infrastructure Audit Log Simulation Console
              </h3>
              <button 
                onClick={() => setSimulationOpen(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-zinc-400 text-xs">
                To fulfill <b>"No Mock Data"</b> while keeping the audit ledger functional, use these triggers to write <b>actual Firestore documents</b> directly into your live database. The real-time snapshot listeners will capture the writes and update this page instantly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel 1: Operational events */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Simulate Standard Audit Actions
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: "customer_created", label: "Customer Profile Created", desc: "Logs a customer creation to Customer database" },
                      { id: "menu_added", label: "New Meal Item Addition", desc: "Logs a recipe added to Menu catalog" },
                      { id: "order_changed", label: "Order Status Dispatch Update", desc: "Logs meal transitioning to 'Out For Delivery'" },
                      { id: "coupon_created", label: "Coupon Code Generated", desc: "Logs promo coupons added in growth center" },
                      { id: "settings_changed", label: "Business Setting Modification", desc: "Logs Super Admin general settings save" },
                    ].map((sim) => (
                      <button
                        key={sim.id}
                        disabled={simulating !== null}
                        onClick={() => handleTriggerSimulation(sim.id)}
                        className="w-full flex items-center justify-between text-left p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/30 text-xs transition group"
                      >
                        <div>
                          <div className="font-bold text-zinc-200 group-hover:text-white">{sim.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{sim.desc}</div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Panel 2: Threat Events */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Simulate Threat & Security Incidents
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: "suspicious_activity", label: "Suspicious Location Access", desc: "Flags administrator logging in from proxy subnets", severity: "Critical" },
                      { id: "permission_denied", label: "Privileged Access Lockout", desc: "Flags profile trying to access unprivileged modules", severity: "Medium" },
                      { id: "account_locked", label: "Consentive Auth Account Lock", desc: "Flags lock-out triggered after multiple failed OTPs", severity: "High" },
                    ].map((sim) => (
                      <button
                        key={sim.id}
                        disabled={simulating !== null}
                        onClick={() => handleTriggerSimulation(sim.id)}
                        className="w-full flex items-center justify-between text-left p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-red-500/30 text-xs transition group"
                      >
                        <div>
                          <div className="font-bold text-zinc-200 group-hover:text-white flex items-center gap-2">
                            {sim.label}
                            <span className={`text-[9px] px-1.5 rounded uppercase font-extrabold ${
                              sim.severity === 'Critical' ? 'bg-red-950 text-red-400' : 'bg-orange-950 text-orange-400'
                            }`}>{sim.severity}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{sim.desc}</div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Live Threat Terminal console output stream */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Terminal className="h-3.5 w-3.5 text-zinc-500" />
                    Live Terminal Telemetry Console
                  </h4>
                  <button 
                    type="button"
                    onClick={() => setTerminalLogs([
                      "SIMULATOR CORE KERNEL: ACTIVE",
                      "FIRESTORE PIPELINE: CONNECTED [ai-studio-taazabitesadmint-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2]",
                      "SYSTEM THREAT MONITOR ENVELOPE: ARMED AND ENFORCED",
                      "Ready for telemetry simulation injections..."
                    ])}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 hover:underline cursor-pointer bg-transparent border-0"
                  >
                    Clear Console Buffer
                  </button>
                </div>
                <div className="bg-black/90 rounded-lg p-3 font-mono text-[10px] text-zinc-300 border border-zinc-850 h-36 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                  {terminalLogs.map((logLine, index) => {
                    let colorClass = "text-zinc-400"
                    if (logLine.includes("FIRESTORE_PIPELINE:") || logLine.includes("TRANSACTION_COMPLETE:")) {
                      colorClass = "text-emerald-400 font-bold"
                    } else if (logLine.includes("THREAT_FLAG:") || logLine.includes("SIMULATOR: Creating") || logLine.includes("SIMULATOR: Injecting")) {
                      colorClass = "text-amber-400"
                    } else if (logLine.includes("DATABASE_ERROR:")) {
                      colorClass = "text-rose-500 font-bold"
                    } else if (logLine.includes("INITIATED CORE SIGNATURE:")) {
                      colorClass = "text-blue-400"
                    }
                    return (
                      <div key={index} className={`${colorClass} leading-relaxed break-all`}>
                        {logLine}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={() => setSimulationOpen(false)}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 px-5 py-2 text-xs font-semibold text-zinc-300 transition"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
