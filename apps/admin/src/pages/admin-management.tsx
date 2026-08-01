import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/auth-context";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { 
  systemMonitoringService, 
  AuditLogRecord, 
  AdminSessionRecord, 
  SecurityEventRecord 
} from "../services/system-monitoring";
import { Role, RolePermissions, Permission } from "../lib/rbac";
import { 
  Shield, 
  Clock, 
  History, 
  User, 
  Lock, 
  Plus, 
  Search, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  X, 
  Check, 
  Power, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Globe, 
  Activity, 
  UserMinus, 
  RefreshCw, 
  UserCheck, 
  LockOpen 
} from "lucide-react";

// Local seed generator for monitoring database collections if empty
const ensureCollectionsSeeded = async () => {
  try {
    await systemMonitoringService.ensureMonitoringSeeded();
  } catch (error) {
    console.error("Monitoring seed failed:", error);
  }
};

export default function AdminManagementPage() {
  const { user: currentUser } = useAuth();
  
  // Real-time states
  const [admins, setAdmins] = useState<any[]>([]);
  const [sessions, setSessions] = useState<AdminSessionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEventRecord[]>([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState("admins");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  
  // Add Admin form fields
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("Admin");
  const [newStatus, setNewStatus] = useState<"Active" | "Suspended">("Active");
  
  // Edit Admin form fields
  const [editRole, setEditRole] = useState<Role>("Admin");
  const [editStatus, setEditStatus] = useState<"Active" | "Suspended">("Active");

  // Filter/Search parameters
  const [logFilterModule, setLogFilterModule] = useState("All");
  const [securityFilterSeverity, setSecurityFilterSeverity] = useState("All");

  // Selected Role for Role & Permissions viewer
  const [selectedViewerRole, setSelectedViewerRole] = useState<Role>("Super Admin");

  // Initialize and load real-time listeners
  useEffect(() => {
    // Seed system log collections if they have no records yet
    ensureCollectionsSeeded();

    setLoading(true);

    // 1. Admins listener
    const unsubscribeAdmins = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        const adminsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAdmins(adminsList);
        setLoading(false);
      },
      (error) => {
        console.error("Admins subscription error:", error);
        setLoading(false);
      }
    );

    // 2. Sessions listener
    const sessionsQuery = query(collection(db, "adminSessions"), orderBy("loginAt", "desc"), limit(50));
    const unsubscribeSessions = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const sessionsList = snapshot.docs.map(doc => doc.data() as AdminSessionRecord);
        setSessions(sessionsList);
      },
      (error) => {
        console.error("Sessions subscription error:", error);
      }
    );

    // 3. Audit Logs listener
    const auditQuery = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribeAudit = onSnapshot(
      auditQuery,
      (snapshot) => {
        const auditList = snapshot.docs.map(doc => doc.data() as AuditLogRecord);
        setAuditLogs(auditList);
      },
      (error) => {
        console.error("Audit Logs subscription error:", error);
      }
    );

    // 4. Security Events listener
    const securityQuery = query(collection(db, "securityEvents"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribeSecurity = onSnapshot(
      securityQuery,
      (snapshot) => {
        const securityList = snapshot.docs.map(doc => doc.data() as SecurityEventRecord);
        setSecurityEvents(securityList);
      },
      (error) => {
        console.error("Security Events subscription error:", error);
      }
    );

    return () => {
      unsubscribeAdmins();
      unsubscribeSessions();
      unsubscribeAudit();
      unsubscribeSecurity();
    };
  }, []);

  // Handle Add Admin Action
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    try {
      const emailLower = newEmail.trim().toLowerCase();
      const inviteId = emailLower.replace(/[^a-zA-Z0-9]/g, "_");
      
      const inviteData = {
        name: newName.trim(),
        email: emailLower,
        role: newRole,
        desiredStatus: newStatus,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || 'system',
      };

      // Phase 4: store invite — claimed as admins/{uid} on first login
      await setDoc(doc(db, "adminInvites", inviteId), inviteData, { merge: true });
      toast.success(`Invite sent for ${emailLower}. They gain access on first login.`);

      // Log action
      await systemMonitoringService.logAction({
        adminId: currentUser?.id || "system",
        adminName: currentUser?.name || "System Master",
        role: currentUser?.role || "Super Admin",
        module: "Admin Management",
        action: `Invited staff: ${inviteData.name} (${inviteData.role}) — pending first login`,
        recordId: inviteId,
        status: "Success"
      });

      // Reset
      setNewEmail("");
      setNewName("");
      setNewRole("Admin");
      setNewStatus("Active");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to create admin profile:", error);
    }
  };

  // Open Edit Dialog
  const openEditModal = (admin: any) => {
    setSelectedAdmin(admin);
    setEditRole(admin.role);
    setEditStatus(admin.status);
    setIsEditModalOpen(true);
  };

  // Save Edit Admin Action
  const handleEditAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      const adminRef = doc(db, "admins", selectedAdmin.id);
      await updateDoc(adminRef, {
        role: editRole,
        status: editStatus
      });

      // Log action
      await systemMonitoringService.logAction({
        adminId: currentUser?.id || "system",
        adminName: currentUser?.name || "System Master",
        role: currentUser?.role || "Super Admin",
        module: "Admin Management",
        action: `Updated admin ${selectedAdmin.name} role to ${editRole}, status to ${editStatus}`,
        recordId: selectedAdmin.id,
        status: "Success"
      });

      setIsEditModalOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Failed to update admin profile:", error);
    }
  };

  // Instant Suspend/Activate toggle in-list
  const toggleAdminStatus = async (admin: any) => {
    try {
      const nextStatus = admin.status === "Active" ? "Suspended" : "Active";
      const adminRef = doc(db, "admins", admin.id);
      await updateDoc(adminRef, { status: nextStatus });

      // Log action
      await systemMonitoringService.logAction({
        adminId: currentUser?.id || "system",
        adminName: currentUser?.name || "System Master",
        role: currentUser?.role || "Super Admin",
        module: "Admin Management",
        action: `Toggled status of ${admin.name} to ${nextStatus}`,
        recordId: admin.id,
        status: nextStatus === "Active" ? "Success" : "Warning"
      });
    } catch (error) {
      console.error("Failed to toggle admin status:", error);
    }
  };

  // Remove Admin Profile
  const deleteAdminProfile = async (admin: any) => {
    if (!confirm(`Are you sure you want to permanently remove access profile for ${admin.name}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "admins", admin.id));

      // Log action
      await systemMonitoringService.logAction({
        adminId: currentUser?.id || "system",
        adminName: currentUser?.name || "System Master",
        role: currentUser?.role || "Super Admin",
        module: "Admin Management",
        action: `Deleted admin profile: ${admin.name} (${admin.email})`,
        recordId: admin.id,
        status: "Warning"
      });
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  // Terminate Live session (Forces logout)
  const revokeSession = async (session: AdminSessionRecord) => {
    try {
      const sessionRef = doc(db, "adminSessions", session.sessionId);
      await updateDoc(sessionRef, {
        status: "Expired",
        logoutAt: new Date().toISOString()
      });

      // Log action
      await systemMonitoringService.logAction({
        adminId: currentUser?.id || "system",
        adminName: currentUser?.name || "System Master",
        role: currentUser?.role || "Super Admin",
        module: "Authentication",
        action: `Revoked live session of ${session.adminName} (IP: ${session.ipAddress})`,
        recordId: session.sessionId,
        status: "Warning"
      });
    } catch (error) {
      console.error("Failed to revoke session:", error);
    }
  };

  // Resolve security alert status
  const resolveSecurityEvent = async (event: SecurityEventRecord) => {
    try {
      const eventRef = doc(db, "securityEvents", event.eventId);
      await updateDoc(eventRef, {
        status: "Resolved"
      });

      // Log action
      await systemMonitoringService.logAction({
        adminId: currentUser?.id || "system",
        adminName: currentUser?.name || "System Master",
        role: currentUser?.role || "Super Admin",
        module: "Security Monitoring",
        action: `Resolved security incident: ${event.type} (${event.email})`,
        recordId: event.eventId,
        status: "Success"
      });
    } catch (error) {
      console.error("Failed to resolve security incident:", error);
    }
  };

  // Filter lists based on search
  const filteredAdmins = admins.filter(admin => {
    const term = searchQuery.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(term) ||
      admin.email?.toLowerCase().includes(term) ||
      admin.role?.toLowerCase().includes(term)
    );
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = (
      log.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress?.includes(searchQuery)
    );
    const matchesFilter = logFilterModule === "All" || log.module === logFilterModule;
    return matchesSearch && matchesFilter;
  });

  const filteredSecurity = securityEvents.filter(event => {
    const matchesSearch = (
      event.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.details?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesFilter = securityFilterSeverity === "All" || event.severity === securityFilterSeverity;
    return matchesSearch && matchesFilter;
  });

  // Calculate live counters
  const activeAdminsCount = admins.filter(a => a.status === "Active").length;
  const liveSessionsCount = sessions.filter(s => s.status === "Active").length;
  const criticalAlertsCount = securityEvents.filter(e => e.status === "Open" && e.severity === "Critical").length;
  const warningAlertsCount = securityEvents.filter(e => e.status === "Open" && e.severity === "High").length;

  // Format nice timestamps
  const formatTime = (isoString?: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTimeFull = (isoString?: string) => {
    if (!isoString) return "-";
    return `${formatDate(isoString)} at ${formatTime(isoString)}`;
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            Admin & Access Management
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time control over administrative profiles, authorized roles, security events, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "admins" && (
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Administrator
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Administrators</p>
              <h4 className="text-2xl font-bold text-white mt-1">{admins.length}</h4>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {activeAdminsCount} accounts active
              </p>
            </div>
            <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
              <User className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/80 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Active Sessions</p>
              <h4 className="text-2xl font-bold text-white mt-1">{liveSessionsCount}</h4>
              <p className="text-[10px] text-zinc-500 mt-1">Live active connections</p>
            </div>
            <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-emerald-500">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/80 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Unresolved Threats</p>
              <h4 className="text-2xl font-bold text-rose-500 mt-1">{criticalAlertsCount + warningAlertsCount}</h4>
              <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                {criticalAlertsCount} critical incident{criticalAlertsCount === 1 ? '' : 's'} open
              </p>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${criticalAlertsCount > 0 ? "bg-rose-950/20 border-rose-900/30 text-rose-500" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/80 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Operations Logged</p>
              <h4 className="text-2xl font-bold text-zinc-100 mt-1">{auditLogs.length}</h4>
              <p className="text-[10px] text-zinc-400 mt-1">Real-time audit history</p>
            </div>
            <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
              <History className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800/80 p-2 rounded-xl">
          <TabsList className="bg-zinc-900/40 border border-zinc-800/60 p-1 flex overflow-x-auto gap-1">
            <TabsTrigger value="admins" className="data-[state=active]:bg-zinc-800 text-xs sm:text-sm font-medium cursor-pointer">
              <User className="h-3.5 w-3.5 mr-2" /> Admins
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-zinc-800 text-xs sm:text-sm font-medium cursor-pointer">
              <Shield className="h-3.5 w-3.5 mr-2" /> Roles & Perms
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-zinc-800 text-xs sm:text-sm font-medium cursor-pointer">
              <Clock className="h-3.5 w-3.5 mr-2" /> Live Sessions
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-zinc-800 text-xs sm:text-sm font-medium cursor-pointer">
              <History className="h-3.5 w-3.5 mr-2" /> System Audit
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-zinc-800 text-xs sm:text-sm font-medium cursor-pointer">
              <ShieldAlert className="h-3.5 w-3.5 mr-2" /> Threats ({criticalAlertsCount + warningAlertsCount})
            </TabsTrigger>
          </TabsList>

          {/* Dynamic Search / Controls */}
          {activeTab !== "roles" && (
            <div className="relative flex items-center w-full sm:w-72">
              <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-lg text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 text-zinc-400 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab CONTENT: Admins List */}
        <TabsContent value="admins">
          <Card className="bg-zinc-950 border-zinc-800 shadow-xl rounded-xl">
            <CardHeader className="border-b border-zinc-900/80 pb-5">
              <CardTitle className="text-white text-lg">System Access Directory</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Active pre-provisioned administrators and operational team roles. Set status to suspended to revoke all session capabilities instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                  <p className="text-sm text-zinc-500">Loading live directory from Firestore...</p>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  <UserMinus className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-white text-sm">No administrators found</h5>
                  <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                    {searchQuery ? "No matches correspond to your active filters. Try resetting search term." : "Create your first operational partner or team member."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-900/40">
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Name</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Email Address</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Authorized Role</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmins.map((admin) => {
                        const isSelf = admin.email === currentUser?.email;
                        return (
                          <TableRow key={admin.id} className="border-zinc-800 hover:bg-zinc-900/20">
                            <TableCell className="text-white font-medium text-sm py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/20">
                                  {admin.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="block font-medium">{admin.name}</span>
                                  {isSelf && (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 text-[9px] h-4 mt-0.5 font-normal">
                                      Logged In
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-300 text-sm">{admin.email}</TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-1.5">
                                <Shield className={`h-3.5 w-3.5 ${admin.role === "Super Admin" ? "text-amber-500" : "text-emerald-500"}`} />
                                <span className="text-zinc-200 text-sm font-medium">{admin.role}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <button 
                                onClick={() => !isSelf && toggleAdminStatus(admin)}
                                disabled={isSelf}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                                  admin.status === "Active" 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                } ${isSelf ? "" : "cursor-pointer hover:bg-opacity-80"}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${admin.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                                {admin.status || "Active"}
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(admin)}
                                  className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer text-xs"
                                >
                                  Edit Role
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isSelf}
                                  onClick={() => deleteAdminProfile(admin)}
                                  className={`h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 cursor-pointer text-xs ${isSelf ? "opacity-40" : ""}`}
                                >
                                  Remove
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab CONTENT: Roles & Permissions Matrix */}
        <TabsContent value="roles">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left selector */}
            <Card className="bg-zinc-950 border-zinc-800 shadow-xl rounded-xl lg:col-span-4">
              <CardHeader className="border-b border-zinc-900/80 pb-5">
                <CardTitle className="text-white text-sm uppercase tracking-wider text-zinc-400">Roles Index</CardTitle>
                <CardDescription className="text-zinc-500 text-xs">
                  Select a predefined template role to evaluate authorized actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 px-2">
                <div className="flex flex-col gap-1">
                  {(Object.keys(RolePermissions) as Role[]).map((r) => {
                    const active = selectedViewerRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setSelectedViewerRole(r)}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between border transition-all text-sm font-medium cursor-pointer ${
                          active 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-inner" 
                            : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield className={`h-4 w-4 ${active ? "text-emerald-400" : "text-zinc-500"}`} />
                          <span>{r}</span>
                        </div>
                        <Badge className={`border-none ${active ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-900 text-zinc-500"}`}>
                          {r === "Super Admin" ? "All" : RolePermissions[r].length}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Right matrix viewer */}
            <Card className="bg-zinc-950 border-zinc-800 shadow-xl rounded-xl lg:col-span-8">
              <CardHeader className="border-b border-zinc-900/80 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <CardTitle className="text-white text-lg">{selectedViewerRole} Permissions</CardTitle>
                  </div>
                  <CardDescription className="text-zinc-500 text-xs mt-1">
                    System permissions and restricted scopes mapped to this user classification.
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-1">
                  {selectedViewerRole === "Super Admin" ? "Super Admin Override" : "Standard RBAC Rule"}
                </Badge>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Capability Mapping</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Permission items list */}
                    {[
                      { key: "manage_all", label: "Global System Controls", desc: "Unlimited bypass of all RBAC guards" },
                      { key: "manage_customers", label: "Customer Records", desc: "View and edit accounts and notes" },
                      { key: "manage_orders", label: "Orders Dispatch", desc: "Manage preparing and out for delivery" },
                      { key: "manage_subscriptions", label: "Subscription Plans", desc: "Edit healthy goals & plans pricing" },
                      { key: "manage_kitchen", label: "Kitchen Board", desc: "Manage food prep queue and packing" },
                      { key: "manage_menu", label: "Menu Catalogue", desc: "Modify recipes and categorizations" },
                      { key: "manage_inventory", label: "Inventory Stock", desc: "Create purchase orders & ingredients" },
                      { key: "manage_drivers", label: "Drivers Board", desc: "Roster active delivery agents" },
                      { key: "manage_routes", label: "Routes Dispatch", desc: "Optimize location and shipping vectors" },
                      { key: "manage_payments", label: "Transactions & Revenue", desc: "Audit Razorpay transactions and invoices" },
                      { key: "manage_refunds", label: "Refund Authorizations", desc: "Authorize credit reversals" },
                      { key: "manage_tickets", label: "Support Tickets", desc: "Resolve customer issues and support" }
                    ].map((p) => {
                      // Check if mapped
                      const isPermitted = selectedViewerRole === "Super Admin" || 
                        RolePermissions[selectedViewerRole].includes(p.key as Permission) ||
                        RolePermissions[selectedViewerRole].includes("manage_all");
                      
                      return (
                        <div 
                          key={p.key} 
                          className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
                            isPermitted 
                              ? "bg-emerald-500/[0.02] border-emerald-500/10" 
                              : "bg-zinc-900/10 border-zinc-900 text-zinc-500"
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                            isPermitted ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-900 text-zinc-600"
                          }`}>
                            {isPermitted ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                          </div>
                          <div>
                            <span className={`block text-xs font-semibold ${isPermitted ? "text-zinc-200" : "text-zinc-500"}`}>{p.label}</span>
                            <span className="block text-[10px] text-zinc-500 mt-0.5 leading-normal">{p.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab CONTENT: Live Sessions */}
        <TabsContent value="sessions">
          <Card className="bg-zinc-950 border-zinc-800 shadow-xl rounded-xl">
            <CardHeader className="border-b border-zinc-900/80 pb-5">
              <CardTitle className="text-white text-lg">Real-time Connection Monitor</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Administrators currently logged into the HQ panel. Terminate connection instantly to prompt re-authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-10 w-10 text-zinc-700 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm text-zinc-500 font-medium">No live connections tracked</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-900/40">
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Administrator</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Address IP</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Host / Browser</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Auth Time</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider text-right">Scope</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((s) => {
                        const isRevokable = s.status === "Active" && s.email !== currentUser?.email;
                        return (
                          <TableRow key={s.sessionId} className="border-zinc-800 hover:bg-zinc-900/20">
                            <TableCell className="text-white font-medium py-4">
                              <div>
                                <span className="block font-semibold text-sm">{s.adminName}</span>
                                <span className="block text-xs text-zinc-500 mt-0.5">{s.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-300 font-mono text-xs">{s.ipAddress}</TableCell>
                            <TableCell className="text-zinc-300 text-xs">
                              <div className="flex items-center gap-1.5">
                                {s.device?.toLowerCase().includes("phone") ? (
                                  <Smartphone className="h-3.5 w-3.5 text-zinc-500" />
                                ) : s.device?.toLowerCase().includes("mac") ? (
                                  <Laptop className="h-3.5 w-3.5 text-zinc-500" />
                                ) : (
                                  <Monitor className="h-3.5 w-3.5 text-zinc-500" />
                                )}
                                <span>{s.browser} on {s.device}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-400 text-xs font-medium">
                              <div>
                                <span className="block">{formatDate(s.loginAt)}</span>
                                <span className="block text-[10px] text-zinc-500 mt-0.5">{formatTime(s.loginAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] font-semibold border-none px-2 py-0.5 ${
                                s.status === "Active" 
                                  ? "bg-emerald-500/10 text-emerald-400 animate-pulse" 
                                  : s.status === "Logged Out" 
                                    ? "bg-zinc-900 text-zinc-500" 
                                    : "bg-amber-500/10 text-amber-500"
                              }`}>
                                {s.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {isRevokable ? (
                                <Button
                                  onClick={() => revokeSession(s)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 text-xs cursor-pointer"
                                >
                                  <Power className="h-3.5 w-3.5 mr-1" />
                                  Kill Connection
                                </Button>
                              ) : (
                                <span className="text-xs text-zinc-600 font-medium px-3 italic">
                                  {s.status === "Active" ? "You" : "Completed"}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab CONTENT: System Audit Logs */}
        <TabsContent value="audit">
          <Card className="bg-zinc-950 border-zinc-800 shadow-xl rounded-xl">
            <CardHeader className="border-b border-zinc-900/80 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-white text-lg">Immutable Operations Audit Ledger</CardTitle>
                <CardDescription className="text-zinc-500 text-xs mt-1">
                  Chronological record of state updates, configuration overrides, and dashboard activities.
                </CardDescription>
              </div>

              {/* Module Filter selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Filter Module:</span>
                <select 
                  value={logFilterModule}
                  onChange={(e) => setLogFilterModule(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">All Modules</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Admin Management">Admin Management</option>
                  <option value="Menu Management">Menu Management</option>
                  <option value="Order Management">Order Management</option>
                  <option value="Settings">Settings</option>
                  <option value="Customers">Customers</option>
                  <option value="Security Monitoring">Security Monitoring</option>
                  <option value="Business">Business</option>
                  <option value="Growth">Growth</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredAuditLogs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  <History className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 font-medium">No actions matches module filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-900/40">
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Timestamp</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Operator</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Scope / Module</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Action Recorded</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Client Context</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider text-right">Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuditLogs.map((log) => (
                        <TableRow key={log.logId} className="border-zinc-800 hover:bg-zinc-900/20">
                          <TableCell className="py-4 text-xs font-medium font-mono text-zinc-400">
                            <div>
                              <span className="block text-zinc-300">{formatDate(log.createdAt)}</span>
                              <span className="block text-zinc-500 text-[10px] mt-0.5">{formatTime(log.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm py-4">
                            <div>
                              <span className="block font-semibold text-zinc-200">{log.adminName}</span>
                              <span className="block text-[10px] text-zinc-500 mt-0.5">{log.role}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-md text-[10px] font-medium uppercase tracking-wider">
                              {log.module}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-200 text-sm max-w-xs truncate py-4" title={log.action}>
                            {log.action}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-400 font-mono">
                            <div>
                              <span className="block">{log.ipAddress}</span>
                              <span className="block text-[10px] text-zinc-500 mt-0.5">{log.browser}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <Badge className={`text-[10px] font-semibold rounded-full border-none px-2 py-0.5 ${
                              log.status === "Success" 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : log.status === "Failed" 
                                  ? "bg-rose-500/10 text-rose-400" 
                                  : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {log.status || "Success"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab CONTENT: Security Alerts */}
        <TabsContent value="security">
          <Card className="bg-zinc-950 border-zinc-800 shadow-xl rounded-xl">
            <CardHeader className="border-b border-zinc-900/80 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Intrusion and Policy Threats Tracker
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs mt-1">
                  Live detection of unauthorized endpoint access attempts, high-consecutively failed logins, or anomalous IP logins.
                </CardDescription>
              </div>

              {/* Severity filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Severity:</span>
                <select 
                  value={securityFilterSeverity}
                  onChange={(e) => setSecurityFilterSeverity(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="All">All Anomalies</option>
                  <option value="Critical">Critical Threats</option>
                  <option value="High">High Threats</option>
                  <option value="Medium">Medium Policy</option>
                  <option value="Low">Low Warning</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredSecurity.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <h5 className="font-semibold text-white text-sm">Security logs are healthy</h5>
                  <p className="text-xs text-zinc-500 mt-1">No security violations or alert threats currently match your filter settings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSecurity.map((event) => {
                    const isCritical = event.severity === "Critical" || event.severity === "High";
                    const isOpen = event.status === "Open" || event.status === "Investigating";
                    
                    return (
                      <div 
                        key={event.eventId}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${
                          !isOpen 
                            ? "bg-zinc-900/15 border-zinc-850 opacity-60" 
                            : isCritical 
                              ? "bg-rose-950/5 border-rose-900/20" 
                              : "bg-amber-950/5 border-amber-900/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                            !isOpen
                              ? "bg-zinc-800 border-zinc-750 text-zinc-500"
                              : isCritical 
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-zinc-100">{event.type}</span>
                              <Badge className={`text-[9px] font-semibold border-none rounded-full px-2 py-0.2 ${
                                event.severity === "Critical" 
                                  ? "bg-rose-500/25 text-rose-400" 
                                  : event.severity === "High" 
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                    : event.severity === "Medium"
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-zinc-900 text-zinc-400"
                              }`}>
                                {event.severity}
                              </Badge>
                              <Badge className={`text-[9px] font-semibold border-none px-2 py-0.2 ${
                                event.status === "Open" 
                                  ? "bg-rose-500/10 text-rose-400 animate-pulse" 
                                  : event.status === "Investigating" 
                                    ? "bg-amber-500/10 text-amber-400" 
                                    : "bg-zinc-900 text-zinc-500"
                              }`}>
                                {event.status}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-normal">
                              {event.details}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 mt-2 font-mono">
                              <span>Origin IP: {event.ipAddress}</span>
                              <span>•</span>
                              <span>Target: {event.email || "System"}</span>
                              <span>•</span>
                              <span>Logged: {formatDateTimeFull(event.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 md:self-center self-end">
                          {isOpen ? (
                            <Button
                              onClick={() => resolveSecurityEvent(event)}
                              size="sm"
                              className="bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs h-8 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Dismiss Violation
                            </Button>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                              <LockOpen className="h-3 w-3 text-emerald-500" /> Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL DIALOG: Add Admin */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-400" />
              Pre-Provision Admin Access
            </h3>
            <p className="text-xs text-zinc-500 mt-1 mb-5">
              Input their registered email and assign their role template. The profile is auto-linked upon their first login.
            </p>

            <form onSubmit={handleAddAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Operator Full Name</label>
                <Input
                  required
                  placeholder="e.g. Sneha Reddy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. sneha@taazabites.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Administrative Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Super Admin">Super Admin (All scopes + overrides)</option>
                  <option value="Admin">Admin (Full operations control)</option>
                  <option value="Operations Manager">Operations Manager (Customers + Subscription management)</option>
                  <option value="Kitchen Manager">Kitchen Manager (Kitchen production, Menu, Stock)</option>
                  <option value="Kitchen Staff">Kitchen Staff (View kitchen board and update tasks)</option>
                  <option value="Delivery Manager">Delivery Manager (Drivers, dispatch routes)</option>
                  <option value="Delivery Partner">Delivery Partner (View and complete deliveries)</option>
                  <option value="Finance Manager">Finance Manager (Payments, transactions, audits)</option>
                  <option value="Marketing Manager">Marketing Manager (Campaign logs and reports)</option>
                  <option value="CRM Executive">CRM Executive (Manage customers, subscriptions, notes)</option>
                  <option value="Support Executive">Support Executive (Tickets, customer assessment notes)</option>
                  <option value="Inventory Manager">Inventory Manager (Stock movements, POs, suppliers)</option>
                  <option value="Analytics Viewer">Analytics Viewer (Reports and business intelligence)</option>
                  <option value="Read Only Auditor">Read Only Auditor (Audit logs read-only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Account Launch Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="launch_status"
                      checked={newStatus === "Active"}
                      onChange={() => setNewStatus("Active")}
                      className="accent-emerald-500"
                    />
                    <span>Active (Authorize login immediately)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="launch_status"
                      checked={newStatus === "Suspended"}
                      onChange={() => setNewStatus("Suspended")}
                      className="accent-rose-500"
                    />
                    <span>Suspended</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full text-zinc-400 hover:text-white hover:bg-zinc-900 h-10 text-sm cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-10 text-sm cursor-pointer"
                >
                  Confirm Provisioning
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: Edit Admin */}
      {isEditModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => { setIsEditModalOpen(false); setSelectedAdmin(null); }}
              className="absolute right-4 top-4 h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              Configure Role Boundaries
            </h3>
            <p className="text-xs text-zinc-500 mt-1 mb-5">
              Update accessibility settings and permission scope policies for <span className="text-zinc-200 font-semibold">{selectedAdmin.name}</span>.
            </p>

            <form onSubmit={handleEditAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Registered Email</label>
                <Input
                  disabled
                  value={selectedAdmin.email}
                  className="bg-zinc-900 border-zinc-850 text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Administrative Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Super Admin">Super Admin (All scopes + overrides)</option>
                  <option value="Admin">Admin (Full operations control)</option>
                  <option value="Operations Manager">Operations Manager (Customers + Subscription management)</option>
                  <option value="Kitchen Manager">Kitchen Manager (Kitchen production, Menu, Stock)</option>
                  <option value="Kitchen Staff">Kitchen Staff (View kitchen board and update tasks)</option>
                  <option value="Delivery Manager">Delivery Manager (Drivers, dispatch routes)</option>
                  <option value="Delivery Partner">Delivery Partner (View and complete deliveries)</option>
                  <option value="Finance Manager">Finance Manager (Payments, transactions, audits)</option>
                  <option value="Marketing Manager">Marketing Manager (Campaign logs and reports)</option>
                  <option value="CRM Executive">CRM Executive (Manage customers, subscriptions, notes)</option>
                  <option value="Support Executive">Support Executive (Tickets, customer assessment notes)</option>
                  <option value="Inventory Manager">Inventory Manager (Stock movements, POs, suppliers)</option>
                  <option value="Analytics Viewer">Analytics Viewer (Reports and business intelligence)</option>
                  <option value="Read Only Auditor">Read Only Auditor (Audit logs read-only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">User Access State</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="edit_status"
                      checked={editStatus === "Active"}
                      onChange={() => setEditStatus("Active")}
                      className="accent-emerald-500"
                    />
                    <span>Active Authorized</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="edit_status"
                      checked={editStatus === "Suspended"}
                      onChange={() => setEditStatus("Suspended")}
                      className="accent-rose-500"
                    />
                    <span>Suspended / Terminated</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setIsEditModalOpen(false); setSelectedAdmin(null); }}
                  className="w-full text-zinc-400 hover:text-white hover:bg-zinc-900 h-10 text-sm cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-10 text-sm cursor-pointer"
                >
                  Save Policy Configs
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
