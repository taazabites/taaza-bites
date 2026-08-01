import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supportService } from "../services/support";
import { customerService } from "../services/customers";
import { subscriptionService } from "../services/subscriptions";
import { orderService } from "../services/orders";
import { 
  SupportTicket, 
  TicketReply, 
  SupportAgent, 
  KnowledgeBaseItem, 
  Order, 
  Subscription, 
  Transaction 
} from "../types";
import { useAuth } from "../contexts/auth-context";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// Icons
import {
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Filter,
  Send,
  User,
  Phone,
  Mail,
  ArrowRight,
  DollarSign,
  Sliders,
  UserCheck,
  FileText,
  BookOpen,
  Plus,
  Award,
  Activity,
  Coffee,
  X,
  ExternalLink,
  Check,
  ShieldAlert,
  Archive,
  Star,
  Bookmark
} from "lucide-react";

// Charts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";

export default function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Seeding state
  const [seeding, setSeeding] = useState(false);

  // Firestore Realtime Collections States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer 360 Dynamic Fetching (for selected ticket)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerSubscriptions, setCustomerSubscriptions] = useState<Subscription[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([]);
  const [customerSupportHistory, setCustomerSupportHistory] = useState<SupportTicket[]>([]);
  const [customerWalletBalance, setCustomerWalletBalance] = useState<number>(0);
  const [customerRewardPoints, setCustomerRewardPoints] = useState<number>(0);
  const [loadingCustomer360, setLoadingCustomer360] = useState(false);

  // Realtime Ticket Replies State (for selected ticket)
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Navigation and Workspace Selection States
  const [activeTab, setActiveTab] = useState<"tickets" | "kb" | "faq" | "analytics">("tickets");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedTicketWorkspaceTab, setSelectedTicketWorkspaceTab] = useState<"conversation" | "customer_360">("conversation");

  // FAQ Management state
  const [faqs, setFaqs] = useState([
    { id: "1", question: "How to update subscription?", answer: "Go to your profile -> Subscriptions." },
    { id: "2", question: "How to request a refund?", answer: "Contact support via chat." },
  ]);
  const [isNewFAQOpen, setIsNewFAQOpen] = useState(false);
  const [newFAQData, setNewFAQData] = useState({ question: "", answer: "" });
  const [creatingFAQ, setCreatingFAQ] = useState(false);

  const handleDeleteFAQ = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  // Filters for Ticket List
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterAgent, setFilterAgent] = useState<string>("All");

  // Chat composer states
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachments, setReplyAttachments] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Internal Notes state
  const [internalNote, setInternalNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Create Ticket Dialog States
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerId: "cust_manual",
    subject: "",
    category: "General Inquiry" as SupportTicket["category"],
    priority: "Medium" as SupportTicket["priority"],
    message: ""
  });
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Create KB Item Dialog States
  const [isNewKBOpen, setIsNewKBOpen] = useState(false);
  const [newKBData, setNewKBData] = useState({
    title: "",
    category: "General Inquiry",
    content: "",
    type: "FAQ" as KnowledgeBaseItem["type"]
  });
  const [creatingKB, setCreatingKB] = useState(false);
  const [kbSearchQuery, setKbSearchQuery] = useState("");
  const [kbCategoryFilter, setKbCategoryFilter] = useState("All");

  // Quick Action Dialogs States
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState(350);
  const [refundReason, setRefundReason] = useState("Double billing compensation");
  const [refunding, setRefunding] = useState(false);

  const [isSubControlOpen, setIsSubControlOpen] = useState(false);
  const [subTargetStatus, setSubTargetStatus] = useState<"Active" | "Paused" | "Cancelled">("Paused");
  const [subControlReason, setSubControlReason] = useState("Temporary pause requested");
  const [updatingSub, setUpdatingSub] = useState(false);

  // Ticket Assignment State
  const [assigningAgentId, setAssigningAgentId] = useState("");
  const [assigningPriority, setAssigningPriority] = useState<SupportTicket["priority"]>("Medium");
  const [assigningDueDate, setAssigningDueDate] = useState("");

  // Seed databases on load if empty
  const triggerSeeding = async () => {
    try {
      setSeeding(true);
      await supportService.ensureSupportSeeded();
    } catch (err: any) {
      console.error("Database seeding failure:", err);
    } finally {
      setSeeding(false);
    }
  };

  // 1. Set up Realtime Firestore Listeners
  useEffect(() => {
    // Fire off database seeding on mount
    triggerSeeding().then(() => {
      // Once seeding is completed or evaluated, start listeners
      const unsubscribeTickets = supportService.subscribeToTickets((ticketList) => {
        setTickets(ticketList);
        setLoading(false);
      });

      const unsubscribeAgents = supportService.subscribeToAgents((agentList) => {
        setAgents(agentList);
      });

      const unsubscribeKB = supportService.subscribeToKB((kbList) => {
        setKnowledgeBase(kbList);
      });

      return () => {
        unsubscribeTickets();
        unsubscribeAgents();
        unsubscribeKB();
      };
    });
  }, []);

  // 2. Realtime replies listener when selected ticket changes
  useEffect(() => {
    if (!selectedTicket) {
      setReplies([]);
      return;
    }

    setLoadingReplies(true);
    const unsubscribeReplies = supportService.subscribeToReplies(selectedTicket.id, (replyList) => {
      setReplies(replyList);
      setLoadingReplies(false);
      // Auto-scroll to chat bottom
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    // Populate local textfield for notes
    setInternalNote(selectedTicket.notes || "");
    setAssigningAgentId(selectedTicket.assignedAgentId || "unassigned");
    setAssigningPriority(selectedTicket.priority || "Medium");
    setAssigningDueDate(selectedTicket.dueDate || "");

    // Fetch customer 360 profile
    fetchCustomer360(selectedTicket.customerId);

    return () => unsubscribeReplies();
  }, [selectedTicket]);

  // Sync selectedTicket references to match real-time edits in list
  useEffect(() => {
    if (selectedTicket) {
      const liveTicket = tickets.find(t => t.id === selectedTicket.id);
      if (liveTicket && JSON.stringify(liveTicket) !== JSON.stringify(selectedTicket)) {
        setSelectedTicket(liveTicket);
      }
    }
  }, [tickets, selectedTicket]);

  // Fetch Customer 360-degree dynamics
  const fetchCustomer360 = async (customerId: string) => {
    if (!customerId) return;
    setLoadingCustomer360(true);
    try {
      // 1. Fetch Orders
      const orders = await orderService.getOrdersByCustomerId(customerId);
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCustomerOrders(orders.slice(0, 10));

      // 2. Fetch Subscriptions
      const subscriptions = await subscriptionService.getSubscriptionsByCustomerId(customerId);
      setCustomerSubscriptions(subscriptions.slice(0, 5));

      // 3. Fetch Transactions - for now we use mock transactions from the customer profile or dedicated service
      // In UI Stabilization, we can just show empty or mock for now if finance service isn't ready
      setCustomerTransactions([]);

      // 4. Fetch other support tickets
      const otherTickets = tickets.filter(t => t.customerId === customerId && t.id !== selectedTicket?.id);
      setCustomerSupportHistory(otherTickets.slice(0, 10));

      // 5. Fetch Customer Account Balance
      const customers = await customerService.getCustomers(100);
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setCustomerWalletBalance(customer.walletBalance || 0);
        setCustomerRewardPoints(customer.rewardPoints || 0);
      } else {
        setCustomerWalletBalance(250); // defaults
        setCustomerRewardPoints(150);
      }
    } catch (e) {
      console.error("Customer 360 loading error: ", e);
    } finally {
      setLoadingCustomer360(false);
    }
  };

  // Computed Stats for Top Panel Cards
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "Open").length;
    const pending = tickets.filter(t => t.status === "Pending").length;
    const inProgress = tickets.filter(t => t.status === "In Progress").length;
    const resolved = tickets.filter(t => t.status === "Resolved").length;
    const closed = tickets.filter(t => t.status === "Closed").length;
    
    // Average CSAT calculation
    const ratedTickets = tickets.filter(t => typeof t.satisfactionRating === "number");
    const avgCsat = ratedTickets.length > 0 
      ? (ratedTickets.reduce((acc, t) => acc + (t.satisfactionRating || 0), 0) / ratedTickets.length).toFixed(1)
      : "4.8";

    return { total, open, pending, inProgress, resolved, closed, avgCsat };
  }, [tickets]);

  // Filtered Tickets for Active Support Desk Side Bar
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // 1. Search filter
      const matchSearch = 
        ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category filter
      const matchCategory = filterCategory === "All" || ticket.category === filterCategory;

      // 3. Priority filter
      const matchPriority = filterPriority === "All" || ticket.priority === filterPriority;

      // 4. Status filter
      const matchStatus = filterStatus === "All" || ticket.status === filterStatus;

      // 5. Agent filter
      const matchAgent = filterAgent === "All" || 
        (filterAgent === "Unassigned" && !ticket.assignedAgentId) ||
        ticket.assignedAgentId === filterAgent;

      return matchSearch && matchCategory && matchPriority && matchStatus && matchAgent;
    });
  }, [tickets, searchQuery, filterCategory, filterPriority, filterStatus, filterAgent]);

  // Filtered Knowledge Base Items
  const filteredKB = useMemo(() => {
    return knowledgeBase.filter(item => {
      const matchSearch = 
        item.title.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
        item.itemId.toLowerCase().includes(kbSearchQuery.toLowerCase());
      
      const matchCat = kbCategoryFilter === "All" || item.category === kbCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [knowledgeBase, kbSearchQuery, kbCategoryFilter]);

  // Send reply handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyMessage.trim() && !replyAttachments.trim())) return;

    setSendingReply(true);
    try {
      const attachmentsArray = replyAttachments ? replyAttachments.split(",").map(url => url.trim()) : [];
      await supportService.addTicketReply(
        selectedTicket.id,
        user?.id || "admin_agent",
        user?.name || user?.email || "Support Agent",
        "agent",
        replyMessage,
        attachmentsArray
      );
      setReplyMessage("");
      setReplyAttachments("");
    } catch (err: any) {
      setError("Failed to send response: " + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  // Insert standard reply templates into chat composer
  const handleInsertKBTemplate = (content: string) => {
    // Simple custom tag replacement for realistic workflow
    let processedContent = content
      .replace("{agent_name}", user?.name || " রাহুল")
      .replace("{customer_name}", selectedTicket?.customerName || "Customer");
    
    setReplyMessage(prev => prev + (prev ? "\n" : "") + processedContent);
  };

  // Update internal notes persistence
  const handleSaveInternalNote = async () => {
    if (!selectedTicket) return;
    setSavingNote(true);
    try {
      await supportService.addInternalNote(selectedTicket.id, internalNote);
    } catch (err: any) {
      setError("Failed to save private note: " + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  // Assign Ticket agent and priority adjustments
  const handleAssignTicket = async () => {
    if (!selectedTicket) return;
    try {
      const chosenAgent = agents.find(a => a.id === assigningAgentId);
      const agentName = chosenAgent ? chosenAgent.name : "Unassigned";
      
      await supportService.assignTicket(
        selectedTicket.id,
        assigningAgentId,
        agentName,
        assigningPriority,
        assigningDueDate
      );
    } catch (err: any) {
      setError("Failed to reassign ticket: " + err.message);
    }
  };

  // Quick Resolve trigger
  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    try {
      await supportService.updateTicketStatus(selectedTicket.id, "Resolved");
    } catch (err: any) {
      setError("Failed to resolve ticket: " + err.message);
    }
  };

  // Close with rating
  const handleCloseTicketWithRating = async (rating: number) => {
    if (!selectedTicket) return;
    try {
      await supportService.addSatisfactionRating(selectedTicket.id, rating);
    } catch (err: any) {
      setError("Failed to close ticket: " + err.message);
    }
  };

  // Create manual support ticket in Firestore
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketData.customerName || !newTicketData.subject || !newTicketData.message) return;

    setCreatingTicket(true);
    try {
      const id = await supportService.addTicket({
        customerId: newTicketData.customerId,
        customerName: newTicketData.customerName,
        customerEmail: newTicketData.customerEmail,
        customerPhone: newTicketData.customerPhone,
        subject: newTicketData.subject,
        category: newTicketData.category,
        priority: newTicketData.priority,
        status: "Open"
      });

      // Post the initial detailed description reply
      await supportService.addTicketReply(
        id,
        "customer",
        newTicketData.customerName,
        "customer",
        newTicketData.message
      );

      setIsNewTicketOpen(false);
      // Reset state
      setNewTicketData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerId: "cust_manual",
        subject: "",
        category: "General Inquiry",
        priority: "Medium",
        message: ""
      });
    } catch (err: any) {
      setError("Failed to create ticket: " + err.message);
    } finally {
      setCreatingTicket(false);
    }
  };

  // Create Knowledge Base FAQ or policy in Firestore
  const handleCreateKBItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKBData.title || !newKBData.content) return;

    setCreatingKB(true);
    try {
      await supportService.addKnowledgeBaseItem({
        itemId: `KB-${newKBData.type.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        category: newKBData.category,
        title: newKBData.title,
        content: newKBData.content,
        type: newKBData.type
      });
      setIsNewKBOpen(false);
      setNewKBData({
        title: "",
        category: "General Inquiry",
        content: "",
        type: "FAQ"
      });
    } catch (err: any) {
      setError("Failed to create KB item: " + err.message);
    } finally {
      setCreatingKB(false);
    }
  };

  // Process Quick Refund / Wallet compensation in Firestore
  const handleProcessRefund = async () => {
    if (!selectedTicket) return;
    setRefunding(true);
    try {
      await customerService.adjustWalletBalance(
        selectedTicket.customerId,
        refundAmount,
        "Wallet Credit",
        "Support Refund Action",
        user?.email || "admin@taazabites.in"
      );

      // Post in ticket conversation timeline
      await supportService.addTicketReply(
        selectedTicket.id,
        "system",
        "Refund Assistant",
        "system",
        `Processed a Wallet Compensation of ₹${refundAmount} for this customer. Reason: "${refundReason}". Updated balance immediately reflected.`
      );

      // Reload wallet balance in UI
      fetchCustomer360(selectedTicket.customerId);
      setIsRefundOpen(false);
    } catch (err: any) {
      setError("Failed to execute refund adjustments: " + err.message);
    } finally {
      setRefunding(false);
    }
  };

  // Manage Subscription state toggle
  const handleUpdateSubscriptionStatus = async () => {
    if (!selectedTicket || customerSubscriptions.length === 0) return;
    setUpdatingSub(true);
    try {
      // Find the active subscription
      const targetSub = customerSubscriptions[0];
      await subscriptionService.updateSubscriptionStatus(
        targetSub.id,
        subTargetStatus,
        user?.id || "admin_agent",
        user?.email || "admin@taazabites.in"
      );

      // Post reply log
      await supportService.addTicketReply(
        selectedTicket.id,
        "system",
        "Subscription Automator",
        "system",
        `Subscription (${targetSub.id.substring(0, 8)}) status changed to "${subTargetStatus}". Comment: "${subControlReason}"`
      );

      fetchCustomer360(selectedTicket.customerId);
      setIsSubControlOpen(false);
    } catch (err: any) {
      setError("Failed to adjust subscription status: " + err.message);
    } finally {
      setUpdatingSub(false);
    }
  };

  // Helper colors mapping for priorities
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "Critical":
        return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
      case "High":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      case "Medium":
        return "bg-sky-500/15 text-sky-400 border border-sky-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30";
    }
  };

  // Helper colors mapping for statuses
  const getStatusBadge = (s: string) => {
    switch (s) {
      case "Open":
        return "bg-red-500/15 text-red-400 border border-red-500/25";
      case "Pending":
        return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25";
      case "In Progress":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/25";
      case "Resolved":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25";
      default:
        return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/25";
    }
  };

  // -----------------------------------------------------------------
  // Analytics Pre-processing Data for Recharts
  // -----------------------------------------------------------------
  const categoryChartData = useMemo(() => {
    const counts: { [key: string]: number } = {
      "General Inquiry": 0,
      "Subscription": 0,
      "Payment": 0,
      "Delivery": 0,
      "Meal Quality": 0,
      "Refund": 0,
      "Technical Issue": 0,
      "Other": 0
    };
    tickets.forEach(t => {
      if (counts[t.category] !== undefined) {
        counts[t.category]++;
      } else {
        counts["Other"]++;
      }
    });
    return Object.keys(counts).map(k => ({ name: k, count: counts[k] }));
  }, [tickets]);

  const priorityChartData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    tickets.forEach(t => {
      if (counts[t.priority] !== undefined) {
        counts[t.priority]++;
      }
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [tickets]);

  const agentPerformanceData = useMemo(() => {
    return agents.map(agent => {
      const agentTickets = tickets.filter(t => t.assignedAgentId === agent.id);
      const resolved = agentTickets.filter(t => t.status === "Resolved" || t.status === "Closed").length;
      const pending = agentTickets.length - resolved;
      return {
        name: agent.name.split(" ")[0],
        Resolved: resolved,
        Pending: pending,
        rating: agent.rating
      };
    });
  }, [agents, tickets]);

  const weeklyTimelineData = [
    { name: "Mon", Incoming: 4, Resolved: 3 },
    { name: "Tue", Incoming: 6, Resolved: 5 },
    { name: "Wed", Incoming: 8, Resolved: 6 },
    { name: "Thu", Incoming: 5, Resolved: 6 },
    { name: "Fri", Incoming: 10, Resolved: 8 },
    { name: "Sat", Incoming: 3, Resolved: 4 },
    { name: "Sun", Incoming: 5, Resolved: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Customer Support & Helpdesk</h1>
            {seeding && (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 animate-pulse">
                Seeding Initial Data...
              </Badge>
            )}
          </div>
          <p className="text-zinc-500 mt-1">
            Realtime conversational ticket desk, customer 360 profiles, standard replies & analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={triggerSeeding}
            disabled={seeding}
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4 mr-1.5" />}
            Reset & Seed Database
          </Button>
          <Button 
            className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-medium"
            onClick={() => setIsNewTicketOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create Ticket
          </Button>
        </div>
      </div>

      {/* Global Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Open Tickets */}
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-600" /> : stats.open}</div>
          </CardContent>
        </Card>

        {/* High Priority */}
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">High Priority</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length}</div>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">45m</div>
          </CardContent>
        </Card>

        {/* Resolved Today */}
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Resolved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}</div>
          </CardContent>
        </Card>

        {/* Pending Refund Requests */}
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Refunds</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{tickets.filter(t => t.category === 'Refund').length}</div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">CSAT Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">4.8 <span className="text-sm font-medium text-zinc-500">/ 5.0</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === "tickets" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4" />
            Active Helpdesk WORKSTATION
          </div>
          {activeTab === "tickets" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("kb")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === "kb" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge Base & Standard Replies
          </div>
          {activeTab === "kb" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === "faq" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            FAQ Management
          </div>
          {activeTab === "faq" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === "analytics" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Helpdesk Analytics & Reports
          </div>
          {activeTab === "analytics" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-rose-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {error}
          </div>
          <button onClick={() => setError("")} className="hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB CONTENT: ACTIVE HELPDESK WORKSTATION */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Filters and Ticket List (col-span-4) */}
          <div className="xl:col-span-4 space-y-4">
            <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl">
              <CardContent className="p-4 space-y-4">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search ID, name, phone, email..."
                    className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-emerald-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Grid Filters */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Subscription">Subscription</option>
                      <option value="Payment">Payment</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Meal Quality">Meal Quality</option>
                      <option value="Refund">Refund</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Agent</label>
                    <select
                      value={filterAgent}
                      onChange={(e) => setFilterAgent(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="All">All Agents</option>
                      <option value="Unassigned">Unassigned</option>
                      {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name.split(" ")[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                  <span className="text-xs text-zinc-500">
                    Showing <strong>{filteredTickets.length}</strong> of {tickets.length} cases
                  </span>
                  {(searchQuery || filterCategory !== "All" || filterPriority !== "All" || filterStatus !== "All" || filterAgent !== "All") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-rose-400 hover:text-white hover:bg-zinc-900 px-2"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterCategory("All");
                        setFilterPriority("All");
                        setFilterStatus("All");
                        setFilterAgent("All");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Scrollable Ticket List */}
            <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl overflow-hidden">
              <div className="max-h-[550px] overflow-y-auto divide-y divide-zinc-900">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-sm">
                    No matching support tickets found.
                  </div>
                ) : (
                  filteredTickets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`w-full text-left p-4 hover:bg-zinc-900/40 transition-colors flex flex-col gap-2 relative ${
                        selectedTicket?.id === t.id ? "bg-zinc-900/60" : ""
                      }`}
                    >
                      {selectedTicket?.id === t.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-zinc-500">{t.ticketId}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {new Date(t.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })}
                        </span>
                      </div>

                      <div className="font-semibold text-white text-sm line-clamp-1">{t.subject}</div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-zinc-300 font-medium flex items-center gap-1">
                          <User className="h-3 w-3 text-zinc-500" />
                          {t.customerName}
                        </span>
                        <Badge className={`${getStatusBadge(t.status)} text-[9px] font-bold px-1.5 py-0.5`}>
                          {t.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge className={`${getPriorityBadge(t.priority)} text-[9px] font-semibold py-0`}>
                          {t.priority}
                        </Badge>
                        <Badge variant="secondary" className="bg-zinc-900 text-zinc-400 border border-zinc-800 text-[9px] font-medium py-0">
                          {t.category}
                        </Badge>
                        {t.assignedAgentName && (
                          <span className="text-[10px] text-zinc-500 ml-auto flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-emerald-500" />
                            {t.assignedAgentName.split(" ")[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL: SELECTED TICKET WORKSPACE WORKSTATION (col-span-8) */}
          <div className="xl:col-span-8">
            {!selectedTicket ? (
              <Card className="bg-zinc-950 border-zinc-800/80 p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[600px] border-dashed">
                <LifeBuoy className="h-16 w-16 text-zinc-700 animate-pulse mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Support Ticket Selected</h3>
                <p className="text-zinc-500 max-w-sm text-sm">
                  Choose a ticket from the left column to view the conversation log, adjust status, and examine customer order history.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                
                {/* Selected Case Workspace Header */}
                <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl overflow-hidden">
                  <div className="bg-zinc-900/30 px-6 py-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {selectedTicket.ticketId}
                        </span>
                        <Badge className={getPriorityBadge(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Badge>
                        <Badge variant="outline" className="border-zinc-800 text-zinc-400">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                      <h2 className="text-lg font-bold text-white mt-1.5">{selectedTicket.subject}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedTicket.status !== "Resolved" && selectedTicket.status !== "Closed" && (
                        <Button
                          onClick={handleResolveTicket}
                          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold text-xs h-9"
                        >
                          <Check className="h-4 w-4 mr-1.5" /> Mark Resolved
                        </Button>
                      )}

                      {selectedTicket.status === "Resolved" && (
                        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                          <span className="text-xs font-semibold text-zinc-400 pl-2 pr-1">Rate CSAT to Close:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleCloseTicketWithRating(star)}
                              className="p-1 hover:scale-125 transition-transform"
                            >
                              <Star className="h-4 w-4 text-yellow-500 hover:fill-yellow-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950 border-b border-zinc-900">
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider block">Customer</label>
                      <div className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-500" />
                        {selectedTicket.customerName}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider block">Case Status</label>
                      <div className="mt-1">
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => supportService.updateTicketStatus(selectedTicket.id, e.target.value as any)}
                          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Open">Open</option>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider block">Assigned Agent</label>
                      <div className="mt-1">
                        <select
                          value={assigningAgentId}
                          onChange={(e) => setAssigningAgentId(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="unassigned">Unassigned</option>
                          {agents.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        size="sm"
                        onClick={handleAssignTicket}
                        className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs h-8"
                      >
                        Apply Assignment
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Split workspace Tabs */}
                <div className="flex border-b border-zinc-800 gap-4 bg-zinc-950 p-1.5 rounded-lg border border-zinc-850">
                  <button
                    onClick={() => setSelectedTicketWorkspaceTab("conversation")}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-colors ${
                      selectedTicketWorkspaceTab === "conversation" 
                        ? "bg-zinc-900 text-white border border-zinc-800" 
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Active Chat Conversation ({replies.length})
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedTicketWorkspaceTab("customer_360")}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-colors ${
                      selectedTicketWorkspaceTab === "customer_360" 
                        ? "bg-zinc-900 text-white border border-zinc-800" 
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" />
                      Customer 360° Profile & Quick Controls
                    </div>
                  </button>
                </div>

                {/* WORKSPACE TAB: ACTIVE CONVERSATION CHAT */}
                {selectedTicketWorkspaceTab === "conversation" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT CHAT CORE (col-span-8) */}
                    <div className="lg:col-span-8 space-y-4">
                      <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl overflow-hidden flex flex-col h-[520px]">
                        
                        {/* Conversation Message Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {loadingReplies ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-2">
                              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                              <span className="text-xs text-zinc-500">Loading replies feed...</span>
                            </div>
                          ) : replies.length === 0 ? (
                            <div className="text-center text-zinc-500 text-sm py-12">
                              No conversation messages logged yet.
                            </div>
                          ) : (
                            replies.map((reply) => {
                              const isSystem = reply.senderRole === "system";
                              const isAgent = reply.senderRole === "agent";
                              
                              if (isSystem) {
                                return (
                                  <div key={reply.id} className="flex justify-center">
                                    <div className="bg-zinc-900/60 text-zinc-400 border border-zinc-800/60 text-[11px] font-mono rounded-full px-4 py-1 flex items-center gap-1.5 shadow-sm">
                                      <Activity className="h-3 w-3 text-zinc-500" />
                                      {reply.message}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={reply.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                                    isAgent 
                                      ? "bg-emerald-500/10 border border-emerald-500/20 text-white rounded-br-none" 
                                      : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-none"
                                  }`}>
                                    <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-1.5 mb-1.5 text-[10px]">
                                      <span className={`font-bold flex items-center gap-1 ${isAgent ? "text-emerald-400" : "text-sky-400"}`}>
                                        <User className="h-3 w-3" />
                                        {reply.senderName} ({isAgent ? "Staff" : "Customer"})
                                      </span>
                                      <span className="text-zinc-500">
                                        {new Date(reply.createdAt).toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit"
                                        })}
                                      </span>
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed select-text">
                                      {reply.message}
                                    </div>

                                    {/* Render attachments if any */}
                                    {reply.attachments && reply.attachments.length > 0 && (
                                      <div className="mt-3 pt-2 border-t border-zinc-800 flex flex-wrap gap-1.5">
                                        {reply.attachments.map((url, uidx) => (
                                          <a
                                            key={uidx}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded hover:text-emerald-400 hover:border-emerald-500/30 flex items-center gap-1 transition-all"
                                          >
                                            <FileText className="h-3 w-3" />
                                            Attachment {uidx + 1}
                                            <ExternalLink className="h-2 w-2" />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Conversational Reply Editor */}
                        <form onSubmit={handleSendReply} className="border-t border-zinc-900 p-4 bg-zinc-950 space-y-3">
                          
                          {/* Quick Insert Actions from KB templates */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-900/50">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <Bookmark className="h-3 w-3" /> Quick Replies:
                            </span>
                            {knowledgeBase.filter(k => k.type === "Standard Reply").slice(0, 3).map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className="text-[10px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded px-2.5 py-1 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 shrink-0 transition-all font-medium"
                                onClick={() => handleInsertKBTemplate(item.content)}
                              >
                                {item.title}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Message replies content..."
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              className="bg-zinc-900/40 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:ring-emerald-500 focus:ring-1"
                            />
                            <Button
                              type="submit"
                              disabled={sendingReply || (!replyMessage.trim() && !replyAttachments.trim())}
                              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold px-4 shrink-0"
                            >
                              {sendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Attachment URLs (comma separated, optional)"
                              value={replyAttachments}
                              onChange={(e) => setReplyAttachments(e.target.value)}
                              className="bg-zinc-950 border-zinc-900 text-[10px] h-7 text-zinc-400 placeholder-zinc-700 p-1 focus:ring-0 focus:border-zinc-800"
                            />
                            <span className="text-[9px] text-zinc-600 pl-4 shrink-0">Supports PDF / Images</span>
                          </div>
                        </form>

                      </Card>
                    </div>

                    {/* RIGHT INTERNAL NOTES & TICKET STATS (col-span-4) */}
                    <div className="lg:col-span-4 space-y-4">
                      
                      {/* Ticket private admin notes */}
                      <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-zinc-500" />
                            Internal Admin Notes
                          </h3>
                          <Button
                            size="sm"
                            className="h-7 text-[10px] bg-zinc-900 hover:bg-zinc-800 text-emerald-400 font-bold"
                            onClick={handleSaveInternalNote}
                            disabled={savingNote}
                          >
                            {savingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Notes"}
                          </Button>
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          These notes are kept strictly private for internal administrative handoffs and team reminders.
                        </p>
                        <textarea
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-28 resize-none placeholder-zinc-700"
                          placeholder="Type internal reminders or research details here..."
                          value={internalNote}
                          onChange={(e) => setInternalNote(e.target.value)}
                        />
                      </Card>

                      {/* Ticket audit history metadata card */}
                      <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                          <Activity className="h-3.5 w-3.5 text-zinc-500" />
                          Ticket Audit Details
                        </h3>
                        <div className="space-y-2 text-[11px] text-zinc-400">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Created:</span>
                            <span className="font-mono">{new Date(selectedTicket.createdAt).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Last Action:</span>
                            <span className="font-mono">{new Date(selectedTicket.updatedAt).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Customer Phone:</span>
                            <span className="font-mono text-zinc-300">{selectedTicket.customerPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Customer Email:</span>
                            <span className="font-mono text-zinc-300 line-clamp-1">{selectedTicket.customerEmail}</span>
                          </div>
                          {selectedTicket.dueDate && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Due Date Limit:</span>
                              <span className="font-mono text-amber-400 font-bold">{selectedTicket.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </Card>

                    </div>
                  </div>
                )}

                {/* WORKSPACE TAB: CUSTOMER 360-DEGREE PROFILE & CONTROLS */}
                {selectedTicketWorkspaceTab === "customer_360" && (
                  <div className="space-y-6">
                    
                    {/* Customer 360 Dynamic Metadata Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Customer Info Card */}
                      <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden">
                        <div className="p-3 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-zinc-500" />
                            Account Demographics
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 font-bold uppercase tracking-widest px-2"
                            onClick={() => navigate('/customers')}
                          >
                            Full Profile <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[10px]">FULL NAME</span>
                            <span className="font-semibold text-white">{selectedTicket.customerName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">REGISTERED EMAIL</span>
                            <span className="text-zinc-300 font-mono">{selectedTicket.customerEmail}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">PHONE NUMBER</span>
                            <span className="text-zinc-300 font-mono">{selectedTicket.customerPhone}</span>
                          </div>
                        </div>
                      </Card>

                      {/* Financial Balances Card */}
                      <Card className="bg-zinc-950 border-zinc-800 p-4 space-y-3 shadow-lg">
                        <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                          <DollarSign className="h-4 w-4 text-zinc-500" />
                          Wallet & Rewards Points
                        </h3>
                        {loadingCustomer360 ? (
                          <div className="flex justify-center p-4"><Loader2 className="h-4 w-4 animate-spin text-zinc-500" /></div>
                        ) : (
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-zinc-500 text-[10px] block">WALLET BALANCE</span>
                                <span className="text-xl font-black text-emerald-400">₹{customerWalletBalance}</span>
                              </div>
                              <Button 
                                size="sm" 
                                className="h-7 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                onClick={() => setIsRefundOpen(true)}
                              >
                                Adjust Credit
                              </Button>
                            </div>
                            <div className="flex items-center justify-between border-t border-zinc-900 pt-2">
                              <div>
                                <span className="text-zinc-500 text-[10px] block">REWARD POINTS</span>
                                <span className="text-md font-extrabold text-amber-400">{customerRewardPoints} pts</span>
                              </div>
                              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                                Platinum Status
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Card>

                      {/* Action Hub Panel */}
                      <Card className="bg-zinc-950 border-zinc-800 p-4 space-y-3 shadow-lg">
                        <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                          <Sliders className="h-4 w-4 text-zinc-500" />
                          Quick Channel Contacts
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`tel:${selectedTicket.customerPhone}`}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-center flex flex-col items-center justify-center hover:bg-zinc-800 transition-colors"
                          >
                            <Phone className="h-4 w-4 text-sky-400 mb-1" />
                            <span className="text-[10px] text-zinc-300 font-bold">Call Customer</span>
                          </a>

                          <a
                            href={`https://web.whatsapp.com/send?phone=${selectedTicket.customerPhone.replace(/[\s+]/g, "")}&text=Hello%20${selectedTicket.customerName},%20this%20is%20Taaza%20Bites%20Support...`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-center flex flex-col items-center justify-center hover:bg-zinc-800 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 text-emerald-400 mb-1" />
                            <span className="text-[10px] text-zinc-300 font-bold">WhatsApp Chat</span>
                          </a>

                          <a
                            href={`mailto:${selectedTicket.customerEmail}`}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-center flex flex-col items-center justify-center hover:bg-zinc-800 transition-colors col-span-2"
                          >
                            <Mail className="h-4 w-4 text-yellow-400 mb-1" />
                            <span className="text-[10px] text-zinc-300 font-bold">Send Support Email</span>
                          </a>
                        </div>
                      </Card>

                    </div>

                    {/* Customer Historical Subscriptions and Orders lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Subscriptions Grid list */}
                      <Card className="bg-zinc-950 border-zinc-800 p-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
                          <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                            <Sliders className="h-3.5 w-3.5 text-zinc-500" />
                            Registered Meal Subscriptions
                          </h4>
                          {customerSubscriptions.length > 0 && (
                            <Button 
                              size="sm" 
                              className="h-6 text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              onClick={() => setIsSubControlOpen(true)}
                            >
                              Subscription Controls
                            </Button>
                          )}
                        </div>

                        {loadingCustomer360 ? (
                          <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /></div>
                        ) : customerSubscriptions.length === 0 ? (
                          <p className="text-center text-zinc-600 text-xs py-8">No subscriptions registered for this customer profile.</p>
                        ) : (
                          <div className="space-y-3">
                            {customerSubscriptions.map((sub) => (
                              <div key={sub.id} className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-zinc-400 text-[10px]">ID: {sub.id.substring(0,10)}</span>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      className="h-5 p-0 text-[9px] text-zinc-500 hover:text-white"
                                      onClick={() => navigate('/subscriptions')}
                                    >
                                      View <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                                    </Button>
                                    <Badge className={
                                      sub.status === "Active" 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-zinc-800 text-zinc-400"
                                    }>
                                      {sub.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500">
                                  <div>
                                    <span>Plan Period:</span>
                                    <span className="block font-semibold text-zinc-300">{sub.startDate} to {sub.endDate}</span>
                                  </div>
                                  <div>
                                    <span>Next Billing:</span>
                                    <span className="block font-semibold text-zinc-300">{sub.nextBillingDate}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>

                      {/* Customer Recent Orders List */}
                      <Card className="bg-zinc-950 border-zinc-800 p-4 shadow-xl">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2.5 mb-3">
                          <Activity className="h-3.5 w-3.5 text-zinc-500" />
                          Recent Food Orders Delivery Logs
                        </h4>

                        {loadingCustomer360 ? (
                          <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /></div>
                        ) : customerOrders.length === 0 ? (
                          <p className="text-center text-zinc-600 text-xs py-8">No order logs found in database matching customer ID.</p>
                        ) : (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {customerOrders.map((order) => (
                              <div key={order.id} className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850 text-xs flex items-center justify-between hover:bg-zinc-900/80 group">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold text-zinc-500 block">{order.orderId || order.id.substring(0,8)}</span>
                                    <Button 
                                      variant="ghost" 
                                      className="h-4 p-0 text-[8px] text-zinc-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => navigate('/orders')}
                                    >
                                      Log <ExternalLink className="h-2 w-2 ml-0.5" />
                                    </Button>
                                  </div>
                                  <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">{order.mealName || "High-protein customized menu"}</span>
                                </div>
                                <div className="text-right">
                                  <Badge className="bg-zinc-900 text-zinc-300 text-[9px] py-0">{order.status || order.orderStatus}</Badge>
                                  <span className="block text-[9px] text-zinc-500 mt-0.5">{order.deliveryDate || "Today"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>

                    </div>

                    {/* Financial Transactions & Ticket History ledger */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Financial Transactions Ledger */}
                      <Card className="bg-zinc-950 border-zinc-800 p-4 shadow-xl">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2.5 mb-3">
                          <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                          Financial Ledger Transactions
                        </h4>

                        {loadingCustomer360 ? (
                          <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /></div>
                        ) : customerTransactions.length === 0 ? (
                          <p className="text-center text-zinc-600 text-xs py-8">No transaction records on file.</p>
                        ) : (
                          <div className="space-y-2">
                            {customerTransactions.map((tx) => (
                              <div key={tx.id} className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850 text-xs flex items-center justify-between">
                                <div>
                                  <span className="text-zinc-300 font-bold block">{tx.type}</span>
                                  <span className="text-[9px] text-zinc-500 font-mono">{tx.timestamp ? new Date(tx.timestamp).toLocaleString("en-IN") : ""}</span>
                                </div>
                                <div className="text-right">
                                  <span className={`font-mono font-bold text-xs ${tx.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                                  </span>
                                  <span className="block text-[8px] text-zinc-500">{tx.method}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>

                      {/* Other Historical Tickets by same customer */}
                      <Card className="bg-zinc-950 border-zinc-800 p-4 shadow-xl">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2.5 mb-3">
                          <LifeBuoy className="h-3.5 w-3.5 text-zinc-500" />
                          Other Associated Support History
                        </h4>

                        {loadingCustomer360 ? (
                          <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /></div>
                        ) : customerSupportHistory.filter(t => t.id !== selectedTicket.id).length === 0 ? (
                          <p className="text-center text-zinc-600 text-xs py-8">No secondary support history found.</p>
                        ) : (
                          <div className="space-y-2">
                            {customerSupportHistory.filter(t => t.id !== selectedTicket.id).map((t) => (
                              <button
                                key={t.id}
                                onClick={() => setSelectedTicket(t)}
                                className="w-full bg-zinc-900/40 hover:bg-zinc-900 p-2.5 rounded-lg border border-zinc-850 text-xs flex items-center justify-between text-left"
                              >
                                <div>
                                  <span className="font-mono text-[9px] font-bold text-zinc-500 block">{t.ticketId}</span>
                                  <span className="text-zinc-300 font-medium line-clamp-1">{t.subject}</span>
                                </div>
                                <div className="text-right shrink-0 pl-4">
                                  <Badge className={`${getStatusBadge(t.status)} text-[8px] py-0`}>{t.status}</Badge>
                                  <span className="block text-[9px] text-zinc-500 mt-0.5">{new Date(t.createdAt).toLocaleDateString("en-IN")}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </Card>

                    </div>

                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: KNOWLEDGE BASE & TEMPLATE REPLIES */}
      {activeTab === "kb" && (
        <div className="space-y-6">
          
          {/* KB Filtering & Header controllers */}
          <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search Knowledge Base content, FAQ topics, standard replies..."
                    value={kbSearchQuery}
                    onChange={(e) => setKbSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder-zinc-500"
                  />
                </div>
                
                <select
                  value={kbCategoryFilter}
                  onChange={(e) => setKbCategoryFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-56"
                >
                  <option value="All">All Categories</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Payment">Payment</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Meal Quality">Meal Quality</option>
                  <option value="Refund">Refund</option>
                  <option value="Technical Issue">Technical Issue</option>
                </select>
              </div>

              <Button 
                onClick={() => setIsNewKBOpen(true)}
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-medium shrink-0 w-full md:w-auto"
              >
                <Plus className="mr-1 h-4 w-4" /> Add KB Template
              </Button>
            </CardContent>
          </Card>

          {/* Grid list of FAQ / Policies / Replies */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredKB.length === 0 ? (
              <div className="col-span-full text-center py-20 text-zinc-500">
                No Knowledge Base items or FAQs match search constraints.
              </div>
            ) : (
              filteredKB.map((item) => (
                <Card key={item.id} className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden flex flex-col justify-between">
                  <CardHeader className="bg-zinc-900/30 border-b border-zinc-900 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Badge className={
                        item.type === "FAQ" 
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" 
                          : item.type === "Policy"
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      }>
                        {item.type}
                      </Badge>
                      <span className="font-mono text-[9px] text-zinc-600">{item.itemId}</span>
                    </div>
                    <CardTitle className="text-white text-base font-bold leading-snug line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-zinc-500 text-[10px] mt-1 uppercase font-semibold">
                      Category: {item.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1">
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap select-text">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

        </div>
      )}

      {/* Add FAQ Dialog */}
      <Dialog open={isNewFAQOpen} onOpenChange={setIsNewFAQOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input value={newFAQData.question} onChange={e => setNewFAQData({...newFAQData, question: e.target.value})} />
            </div>
            <div>
              <Label>Answer</Label>
              <Input value={newFAQData.answer} onChange={e => setNewFAQData({...newFAQData, answer: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setFaqs([...faqs, { ...newFAQData, id: Math.random().toString() }]);
              setIsNewFAQOpen(false);
              setNewFAQData({ question: "", answer: "" });
            }}>Add FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TAB CONTENT: FAQ MANAGEMENT */}
      {activeTab === "faq" && (
        <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>FAQ Management</CardTitle>
            <Button onClick={() => setIsNewFAQOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add FAQ
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map(faq => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium text-white">{faq.question}</TableCell>
                    <TableCell className="text-zinc-400">{faq.answer}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFAQ(faq.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: PERFORMANCE & REPORTING ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Case volume category distribution bar graph */}
          <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl p-6">
            <h3 className="text-white text-sm font-extrabold uppercase tracking-wider mb-4 text-zinc-400">
              Support Cases Category Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                    labelClassName="text-white font-bold"
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Daily incoming vs resolved case volume trend area chart */}
          <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl p-6">
            <h3 className="text-white text-sm font-extrabold uppercase tracking-wider mb-4 text-zinc-400">
              Weekly Ticket Flow (Incoming vs. Resolved)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                  <YAxis stroke="#52525b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="Incoming" stroke="#f43f5e" fillOpacity={0.1} fill="url(#incomingColor)" />
                  <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={0.1} fill="url(#resolvedColor)" />
                  <defs>
                    <linearGradient id="incomingColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="resolvedColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Agent stacked metrics */}
          <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl p-6">
            <h3 className="text-white text-sm font-extrabold uppercase tracking-wider mb-4 text-zinc-400">
              Agent Workload & Case Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                  <YAxis stroke="#52525b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Resolved" stackId="a" fill="#10b981" />
                  <Bar dataKey="Pending" stackId="a" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Priority PieChart breakdown */}
          <Card className="bg-zinc-950 border-zinc-800/80 shadow-xl p-6 flex flex-col justify-between">
            <h3 className="text-white text-sm font-extrabold uppercase tracking-wider mb-4 text-zinc-400">
              Incoming Incidents Priority Share
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" /> {/* Critical */}
                    <Cell fill="#f97316" /> {/* High */}
                    <Cell fill="#3b82f6" /> {/* Medium */}
                    <Cell fill="#a1a1aa" /> {/* Low */}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-4 text-center border-t border-zinc-900">
              <div>
                <span className="block w-2.5 h-2.5 bg-[#ef4444] rounded-full mx-auto" />
                <span className="text-[10px] text-zinc-400 font-semibold block mt-1">Critical</span>
              </div>
              <div>
                <span className="block w-2.5 h-2.5 bg-[#f97316] rounded-full mx-auto" />
                <span className="text-[10px] text-zinc-400 font-semibold block mt-1">High</span>
              </div>
              <div>
                <span className="block w-2.5 h-2.5 bg-[#3b82f6] rounded-full mx-auto" />
                <span className="text-[10px] text-zinc-400 font-semibold block mt-1">Medium</span>
              </div>
              <div>
                <span className="block w-2.5 h-2.5 bg-[#a1a1aa] rounded-full mx-auto" />
                <span className="text-[10px] text-zinc-400 font-semibold block mt-1">Low</span>
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIALOG: CREATE SUPPORT TICKET */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Log New Customer Support Incident</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Direct administrative registration of call center or email support ticket.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Customer Full Name *</Label>
                <Input
                  required
                  value={newTicketData.customerName}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Karan Grover"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Associated Customer ID</Label>
                <Input
                  value={newTicketData.customerId}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, customerId: e.target.value }))}
                  placeholder="cust_sub_101"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Phone Number</Label>
                <Input
                  value={newTicketData.customerPhone}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+91 99887 76655"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  value={newTicketData.customerEmail}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="karan@taazabites.in"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Category Topic</Label>
                <select
                  value={newTicketData.category}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Payment">Payment</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Meal Quality">Meal Quality</option>
                  <option value="Refund">Refund</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Urgency Priority</Label>
                <select
                  value={newTicketData.priority}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-semibold">Brief Subject *</Label>
              <Input
                required
                value={newTicketData.subject}
                onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Spillage of lunch container box"
                className="bg-zinc-900 border-zinc-800 text-zinc-200"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-semibold">Detailed Description of Issue *</Label>
              <textarea
                required
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Type customer's exact complain or situation..."
                value={newTicketData.message}
                onChange={(e) => setNewTicketData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsNewTicketOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                disabled={creatingTicket}
              >
                {creatingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Assign Case"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* DIALOG: CREATE KB ITEM */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isNewKBOpen} onOpenChange={setIsNewKBOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Create Knowledge Base Article</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Add a new FAQ, internal policy documentation, or pre-made conversational templates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateKBItem} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-semibold">Document Title *</Label>
              <Input
                required
                value={newKBData.title}
                onChange={(e) => setNewKBData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Refund policies for delivery delays"
                className="bg-zinc-900 border-zinc-800 text-zinc-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Topic Category</Label>
                <select
                  value={newKBData.category}
                  onChange={(e) => setNewKBData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Payment">Payment</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Meal Quality">Meal Quality</option>
                  <option value="Refund">Refund</option>
                  <option value="Technical Issue">Technical Issue</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-semibold">Document Template Type</Label>
                <select
                  value={newKBData.type}
                  onChange={(e) => setNewKBData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="FAQ">FAQ (Customer Facing)</option>
                  <option value="Policy">Company Policy (Internal)</option>
                  <option value="Standard Reply">Standard Reply (Quick Insert)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-zinc-400 text-xs font-semibold">Content / Response Template *</Label>
                {newKBData.type === "Standard Reply" && (
                  <span className="text-[9px] text-zinc-500 font-mono">Use {"{customer_name}"} or {"{agent_name}"} variables</span>
                )}
              </div>
              <textarea
                required
                rows={5}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Type response guideline or template..."
                value={newKBData.content}
                onChange={(e) => setNewKBData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsNewKBOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                disabled={creatingKB}
              >
                {creatingKB ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* DIALOG: QUICK COMPENSATIVE REFUND */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Wallet Refund Adjustment</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Issue immediate monetary compensation directly to customer's active wallet balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs font-semibold">Compensation Credit Amount (₹)</Label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                className="bg-zinc-900 border-zinc-800 text-zinc-200 font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs font-semibold">Justification Reason</Label>
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Spillage compensation for meals"
                className="bg-zinc-900 border-zinc-800 text-zinc-200"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsRefundOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                disabled={refunding || !refundAmount}
                onClick={handleProcessRefund}
              >
                {refunding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Credit Wallet"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* DIALOG: SUBSCRIPTION CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isSubControlOpen} onOpenChange={setIsSubControlOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Subscription Operations</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Direct override status controls of customer's active subscription plans.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs font-semibold">Select Target Status Action</Label>
              <select
                value={subTargetStatus}
                onChange={(e) => setSubTargetStatus(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Paused">Pause / Freeze Plan</option>
                <option value="Active">Unpause / Resume Plan</option>
                <option value="Cancelled">Cancel / Terminate Plan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs font-semibold">Operational Reason Notes</Label>
              <Input
                value={subControlReason}
                onChange={(e) => setSubControlReason(e.target.value)}
                placeholder="Temporary freezing at request of caller"
                className="bg-zinc-900 border-zinc-800 text-zinc-200"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsSubControlOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold"
                disabled={updatingSub}
                onClick={handleUpdateSubscriptionStatus}
              >
                {updatingSub ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Override"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
