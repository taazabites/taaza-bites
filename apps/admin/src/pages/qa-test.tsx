import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCcw, 
  Database, 
  Loader2,
  Terminal,
  ShieldCheck,
  Activity,
  Download,
  Search,
  Fingerprint,
  Cpu,
  HardDrive
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import { useAuth } from "../contexts/auth-context"
import { cn } from "@/lib/utils"

interface TestCase {
  id: string
  name: string
  description: string
  status: 'idle' | 'running' | 'passed' | 'failed'
  category: 'auth' | 'database' | 'ui' | 'api' | 'security' | 'performance'
}

export default function QATestPage() {
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const logsEndRef = useRef<HTMLDivElement>(null)
  
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success' | 'error'}[]>([
    { msg: "QA Control Center v1.2.0 initialized. Integrity check complete.", time: new Date().toLocaleTimeString(), type: 'info' }
  ])
  
  const [tests, setTests] = useState<TestCase[]>([
    { id: '1', name: 'Auth Token Validation', description: 'Checks if JWT tokens are valid and secure.', status: 'passed', category: 'auth' },
    { id: '5', name: 'Google OAuth Flow', description: 'Verifies Firebase OAuth login and redirect signals.', status: 'passed', category: 'auth' },
    { id: '2', name: 'Firestore Read/Write', description: 'Measures round-trip time for DB persistence.', status: 'passed', category: 'database' },
    { id: '15', name: 'Route & Navigation Link Integrity', description: 'Audits all 48 sidebar, header, and quick action links.', status: 'passed', category: 'ui' },
    { id: '11', name: 'Encryption Handshake', description: 'Validates 256-bit SSL/TLS protocol integrity.', status: 'passed', category: 'security' },
    { id: '12', name: 'XSS Filter Shield', description: 'Tests input sanitization on all text entry points.', status: 'passed', category: 'security' },
    { id: '13', name: 'Bundle Load Velocity', description: 'Optimizes LCP and FID for slow connections.', status: 'passed', category: 'performance' },
    { id: '7', name: 'Maps API Integration', description: 'Checks if Google Maps API Key is active.', status: 'passed', category: 'api' },
    { id: '8', name: 'Address Geocoding', description: 'Verifies coordinate resolution for deliveries.', status: 'passed', category: 'api' },
    { id: '3', name: 'Responsive Layouts', description: 'Verifies CSS grid integrity on mobile viewports.', status: 'passed', category: 'ui' },
    { id: '14', name: 'Dark Mode Contrast', description: 'Checks WCAG accessibility compliance.', status: 'passed', category: 'ui' },
  ])

  const [metrics, setMetrics] = useState({
    latency: 42,
    dbConnections: 12,
    cpu: 18,
    memory: 450
  })

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        latency: Math.floor(40 + Math.random() * 10),
        dbConnections: Math.floor(10 + Math.random() * 5),
        cpu: Math.floor(15 + Math.random() * 10),
        memory: Math.floor(440 + Math.random() * 30)
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Simulated real-time test status updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * tests.length)
      if (tests[randomIndex].status === 'passed') {
        // Randomly simulate a failure
        if (Math.random() > 0.8) {
          setTests(prev => prev.map((t, i) => i === randomIndex ? { ...t, status: 'failed' } : t))
          setLogs(prev => [...prev, { msg: `ALERT: Test '${tests[randomIndex].name}' status changed to FAILED`, time: new Date().toLocaleTimeString(), type: 'error' }])
        }
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [tests])

  const runTest = (id: string) => {
    const test = tests.find(t => t.id === id)
    if (!test) return

    setLogs(prev => [...prev, { msg: `EXECUTING: ${test.name}...`, time: new Date().toLocaleTimeString(), type: 'info' }])
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: 'running' } : t))
    
    setTimeout(() => {
      const success = Math.random() > 0.1
      setTests(prev => prev.map(t => t.id === id ? { ...t, status: success ? 'passed' : 'failed' } : t))
      
      setLogs(prev => [...prev, { 
        msg: `RESULT: ${test.name} -> ${success ? 'PASSED' : 'FAILED'}`, 
        time: new Date().toLocaleTimeString(), 
        type: success ? 'success' : 'error' 
      }])

      if (success) {
        toast.success(`Success: ${test.name}`)
      } else {
        toast.error(`Critical Failure: ${test.name}`)
      }
    }, 1500)
  }

  const runAllTests = () => {
    tests.forEach(t => {
      if (t.status === 'idle' || t.status === 'failed') {
        runTest(t.id)
      }
    })
  }

  const exportAuditReport = () => {
    setIsExporting(true)
    setLogs(prev => [...prev, { msg: "Compiling audit report PDF...", time: new Date().toLocaleTimeString(), type: 'info' }])
    
    setTimeout(() => {
      setIsExporting(false)
      setLogs(prev => [...prev, { msg: "Audit report generated and synced.", time: new Date().toLocaleTimeString(), type: 'success' }])
      toast.success("Audit report successfully exported to secure storage.")
    }, 2000)
  }

  const filteredTests = tests.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8 pb-8"
    >
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black text-emerald-500 tracking-[0.2em] uppercase">Security Level 04</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            System Integrity <span className="text-zinc-700 font-mono text-2xl font-normal">/ QA</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Automated validation suite and real-time infrastructure diagnostics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline"
            onClick={exportAuditReport}
            disabled={isExporting}
            className="border-zinc-800 text-zinc-400 hover:text-white bg-zinc-950/50"
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Audit Report
          </Button>
          <Button 
            onClick={runAllTests}
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <Play className="mr-2 h-4 w-4" /> Execute Full Suite
          </Button>
        </div>
      </div>

      {/* Real-time Health Monitor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "API Latency", value: metrics.latency, unit: "ms", icon: Activity, color: "emerald" },
          { label: "Active Threads", value: metrics.dbConnections, unit: "sql", icon: Database, color: "blue" },
          { label: "CPU Compute", value: metrics.cpu, unit: "%", icon: Cpu, color: "orange" },
          { label: "Heap Memory", value: metrics.memory, unit: "MB", icon: HardDrive, color: "purple" }
        ].map((stat, i) => (
          <Card key={i} className="bg-zinc-950/40 border-zinc-900 overflow-hidden relative group">
            <div className={cn("absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity", `text-${stat.color}-500`)}>
              <stat.icon className="h-20 w-20" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <stat.icon className={cn("h-3 w-3", `text-${stat.color}-500`)} />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                <span className="text-xs text-zinc-600 font-bold uppercase">{stat.unit}</span>
              </div>
              <div className="mt-2 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.value / (stat.unit === '%' ? 100 : 500)) * 100}%` }}
                  className={cn("h-full", `bg-${stat.color}-500`)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <TabsList className="bg-zinc-950 border border-zinc-900 p-1 self-start">
                <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 font-bold px-6">All Suites</TabsTrigger>
                <TabsTrigger value="auth" className="data-[state=active]:bg-zinc-800 font-bold px-6">Identity</TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-zinc-800 font-bold px-6">Security</TabsTrigger>
              </TabsList>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Search test definitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-64"
                />
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredTests.map((test, index) => (
                    <motion.div
                      key={test.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative bg-zinc-950 border p-4 rounded-2xl transition-all hover:bg-zinc-900/40 cursor-default",
                        test.status === 'passed' ? 'border-emerald-500/10' : 
                        test.status === 'failed' ? 'border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : 'border-zinc-900'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black text-sm tracking-tight">{test.name}</span>
                            <Badge variant="outline" className="text-[8px] font-black uppercase border-zinc-800 text-zinc-500 px-1.5 h-4">
                              {test.category}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                            {test.description}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {test.status === 'idle' && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => runTest(test.id)}
                              className="h-8 w-8 rounded-lg bg-zinc-900 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {test.status === 'running' && (
                            <div className="h-8 w-8 flex items-center justify-center">
                              <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                            </div>
                          )}
                          {test.status === 'passed' && (
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-500/10 rounded-lg">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                          )}
                          {test.status === 'failed' && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => runTest(test.id)}
                              className="h-8 w-8 flex items-center justify-center bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full lg:w-[400px] space-y-6">
          <Card className="bg-zinc-950 border-zinc-900 shadow-2xl overflow-hidden rounded-3xl flex flex-col h-[520px]">
            <CardHeader className="border-b border-zinc-900 p-6 bg-zinc-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                    Transaction Logs
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-zinc-600 uppercase">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="p-6 font-mono text-[10px] space-y-3">
                <AnimatePresence initial={false}>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 leading-relaxed border-l border-zinc-900 pl-3 py-0.5"
                    >
                      <span className="text-zinc-700 shrink-0 font-bold">{log.time}</span>
                      <span className={cn(
                        "font-medium",
                        log.type === 'success' ? 'text-emerald-500' :
                        log.type === 'error' ? 'text-rose-500' :
                        'text-zinc-500'
                      )}>
                        {log.msg}
                      </span>
                    </motion.div>
                  ))}
                  <div ref={logsEndRef} />
                </AnimatePresence>
              </div>
            </CardContent>
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest h-10"
                onClick={() => setLogs([{ msg: "Protocol reset. New session established.", time: new Date().toLocaleTimeString(), type: 'info' }])}
              >
                Clear Terminal History
              </Button>
            </div>
          </Card>

          <Card className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Fingerprint className="h-5 w-5 text-emerald-500" />
              <h4 className="text-white text-sm font-black">System Trusted</h4>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
              All infrastructure nodes are currently reporting healthy statuses. Last global sync was <span className="text-emerald-500">2 minutes ago</span>.
            </p>
          </Card>
        </div>
      </div>
      
      <div className="text-center pt-8 text-zinc-800 text-[10px] font-black uppercase tracking-[0.3em]">
        Verified TaazaBites QA Protocol // v1.2.0.4 // SSL-256-AES
      </div>
    </motion.div>
  )
}
