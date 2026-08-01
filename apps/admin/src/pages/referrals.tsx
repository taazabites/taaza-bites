import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { 
  Loader2, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Gift, 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  DollarSign, 
  Award,
  Edit2,
  CheckCheck,
  UserCheck
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Referral, Customer } from "../types"
import { referralService } from "../services/referrals"
import { customerService } from "../services/customers"
import { useAuth } from "../contexts/auth-context"
import { toast } from "sonner"

export default function ReferralsPage({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("logs")
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [codeSearchQuery, setCodeSearchQuery] = useState("")
  
  // Clipboard/Copy feedback tracking
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  // Batch processing state
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [isProcessingAllPending, setIsProcessingAllPending] = useState(false)

  // Custom code edit state
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [customCodeInput, setCustomCodeInput] = useState("")

  // Quick Manual Redemption Form State
  const [newReferredId, setNewReferredId] = useState("")
  const [enteredReferralCode, setEnteredReferralCode] = useState("")
  const [customRewardAmount, setCustomRewardAmount] = useState("150")
  const [isSubmittingRedeem, setIsSubmittingRedeem] = useState(false)

  useEffect(() => {
    const unsubReferrals = referralService.getReferrals((data) => {
      setReferrals(data)
      setLoading(false)
    })
    
    const unsubCustomers = customerService.subscribeCustomers((data) => {
      setCustomers(data)
    })

    return () => {
      unsubReferrals()
      unsubCustomers()
    }
  }, [])

  // Helper: Get customer info
  const getCustomerInfo = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return { name: "Unknown", phone: "No phone", email: "No email", referralCode: "" };
    return { 
      name: customer.name || customer.firstName || "Unknown", 
      phone: customer.phone || "No phone", 
      email: customer.email || "No email",
      referralCode: customer.referralCode || ""
    };
  }

  // Generate a premium referral code
  const generateReferralCode = (customer: Customer) => {
    const namePart = (customer.name || customer.firstName || "TB")
      .trim()
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 5)
      .toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TB-${namePart}-${randomPart}`;
  }

  // Handle single customer code generation
  const handleGenerateCode = async (customer: Customer) => {
    try {
      const code = generateReferralCode(customer);
      await customerService.updateCustomer(customer.id, { referralCode: code });
      toast.success(`Generated referral code: ${code} for ${customer.name || 'customer'}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate referral code.");
    }
  }

  // Handle batch generation for all customers missing a referral code
  const handleGenerateAllMissingCodes = async () => {
    const missing = customers.filter(c => !c.referralCode);
    if (missing.length === 0) {
      toast.info("All current customers already have referral codes!");
      return;
    }

    setIsGeneratingAll(true);
    let successCount = 0;
    try {
      for (const customer of missing) {
        const code = generateReferralCode(customer);
        await customerService.updateCustomer(customer.id, { referralCode: code });
        successCount++;
      }
      toast.success(`Successfully generated referral codes for ${successCount} customers!`);
    } catch (e) {
      console.error(e);
      toast.error(`Processed ${successCount} codes before an error occurred.`);
    } finally {
      setIsGeneratingAll(false);
    }
  }

  // Save custom edited referral code
  const handleSaveCustomCode = async (customerId: string) => {
    const formattedCode = customCodeInput.trim().toUpperCase().replace(/\s+/g, "-");
    if (!formattedCode) {
      toast.error("Referral code cannot be empty!");
      return;
    }

    try {
      // Check for duplicates
      const isDuplicate = customers.some(c => c.id !== customerId && c.referralCode?.toUpperCase() === formattedCode);
      if (isDuplicate) {
        toast.error("This referral code is already assigned to another customer!");
        return;
      }

      await customerService.updateCustomer(customerId, { referralCode: formattedCode });
      toast.success(`Referral code updated to: ${formattedCode}`);
      setEditingCustomerId(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save custom referral code.");
    }
  }

  // Handle status update of a referral (Approval logs)
  const handleStatusUpdate = async (referral: Referral, status: 'Completed' | 'Rejected') => {
    try {
      await referralService.updateReferralStatus(referral.id, status);
      
      if (status === 'Completed') {
        const reward = referral.rewardAmount || 150;
        
        // 1. Credit referrer's wallet balance
        await customerService.adjustWalletBalance(
          referral.referrerCustomerId,
          reward,
          'Wallet Credit',
          'Referral Reward Credit',
          user?.email || 'System Admin'
        );
        
        // 2. Increment referrer's referrals count
        const referrer = customers.find(c => c.id === referral.referrerCustomerId);
        const currentCount = referrer?.referralsCount || 0;
        await customerService.updateCustomer(referral.referrerCustomerId, {
          referralsCount: currentCount + 1
        });
        
        toast.success(`Referral approved! Credited ₹${reward} to ${getCustomerInfo(referral.referrerCustomerId).name}'s wallet.`);
      } else {
        toast.info("Referral claim rejected.");
      }
    } catch (e) {
      console.error("Error updating referral status:", e);
      toast.error("Failed to update referral status.");
    }
  }

  // Batch approve all pending referrals
  const handleApproveAllPending = async () => {
    const pendings = referrals.filter(r => r.status === 'Pending');
    if (pendings.length === 0) {
      toast.info("No pending referrals to process.");
      return;
    }

    setIsProcessingAllPending(true);
    let count = 0;
    try {
      for (const referral of pendings) {
        await handleStatusUpdate(referral, 'Completed');
        count++;
      }
      toast.success(`Successfully approved and processed reward credit for ${count} referrals!`);
    } catch (e) {
      console.error(e);
      toast.error("Error occurred while processing some referrals.");
    } finally {
      setIsProcessingAllPending(false);
    }
  }

  // Dynamic Referrer Lookup for manual redemption form
  const matchedReferrer = useMemo(() => {
    if (!enteredReferralCode) return null;
    const cleanCode = enteredReferralCode.trim().toUpperCase();
    return customers.find(c => c.referralCode?.toUpperCase() === cleanCode) || null;
  }, [enteredReferralCode, customers]);

  // Handle manual redemption submission
  const handleManualRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferredId) {
      toast.error("Please select or enter the referred customer.");
      return;
    }
    if (!matchedReferrer) {
      toast.error("Please enter a valid active referral code.");
      return;
    }
    if (newReferredId === matchedReferrer.id) {
      toast.error("A customer cannot refer themselves!");
      return;
    }

    setIsSubmittingRedeem(true);
    try {
      const rewardAmt = Number(customRewardAmount) || 150;
      
      // 1. Create a Completed Referral log directly
      const referralId = await referralService.addReferral({
        referrerCustomerId: matchedReferrer.id,
        referredCustomerId: newReferredId,
        rewardAmount: rewardAmt,
        status: 'Completed'
      });

      // 2. Automatically credit the Referrer's wallet
      await customerService.adjustWalletBalance(
        matchedReferrer.id,
        rewardAmt,
        'Wallet Credit',
        `Referral Reward (Code: ${matchedReferrer.referralCode})`,
        user?.email || 'System Admin'
      );

      // 3. Increment referrer's referrals count
      const currentCount = matchedReferrer.referralsCount || 0;
      await customerService.updateCustomer(matchedReferrer.id, {
        referralsCount: currentCount + 1
      });

      // 4. Record referredByCode on the new customer document
      await customerService.updateCustomer(newReferredId, {
        referredByCode: matchedReferrer.referralCode
      });

      toast.success(`Referral redeemed & processed! ₹${rewardAmt} credited to ${matchedReferrer.name || 'Referrer'}'s wallet.`);
      
      // Reset form
      setNewReferredId("");
      setEnteredReferralCode("");
      setCustomRewardAmount("150");
    } catch (e) {
      console.error(e);
      toast.error("Failed to record and redeem referral.");
    } finally {
      setIsSubmittingRedeem(false);
    }
  }

  // Copy code to clipboard helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  // Filtered lists
  const filteredReferrals = useMemo(() => {
    return referrals.filter(ref => {
      if (statusFilter !== "all" && ref.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const referrer = getCustomerInfo(ref.referrerCustomerId);
        const referred = getCustomerInfo(ref.referredCustomerId);
        if (!referrer.name.toLowerCase().includes(q) && 
            !referrer.phone.includes(q) &&
            !referred.name.toLowerCase().includes(q) &&
            !referred.phone.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [referrals, customers, searchQuery, statusFilter]);

  const filteredCustomersForCodes = useMemo(() => {
    return customers.filter(cust => {
      const q = codeSearchQuery.toLowerCase();
      return (
        cust.name?.toLowerCase().includes(q) ||
        cust.firstName?.toLowerCase().includes(q) ||
        cust.phone?.includes(q) ||
        cust.email?.toLowerCase().includes(q) ||
        cust.referralCode?.toLowerCase().includes(q)
      );
    });
  }, [customers, codeSearchQuery]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-emerald-500 animate-pulse" />
              Referral Hub & Reward Management
            </h1>
            <p className="text-zinc-400">Configure customer promo loops, auto-generate referral codes, and handle direct wallet credits.</p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-950/40 border-zinc-800/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-500" /> Total Referred Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{referrals.length}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Total registered system invites</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-800/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" /> Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-500">
              {referrals.filter(r => r.status === 'Pending').length}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Awaiting manual credit trigger</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-800/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Active Promoters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-500">
              {customers.filter(c => (c.referralsCount || 0) > 0).length}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Customers with successful shares</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-800/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Rewards Disbursed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">
              ₹{referrals.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.rewardAmount || 0), 0)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Total auto credited to wallets</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Workspace */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-950 border border-zinc-850 p-1 rounded-xl flex overflow-x-auto gap-1 self-start shrink-0 mb-6 w-full max-w-lg">
          <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all text-xs flex-1 py-2">
            <Award className="h-3.5 w-3.5 mr-2" /> Operations & Logs
          </TabsTrigger>
          <TabsTrigger value="codes" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all text-xs flex-1 py-2">
            <Sparkles className="h-3.5 w-3.5 mr-2" /> Promo Codes
          </TabsTrigger>
          <TabsTrigger value="redeem" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all text-xs flex-1 py-2">
            <Gift className="h-3.5 w-3.5 mr-2" /> Quick Redeem
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Operations Logs */}
        <TabsContent value="logs" className="m-0 outline-none space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
              <div>
                <CardTitle className="text-white">Referral Verification Claims</CardTitle>
                <CardDescription className="text-zinc-400">Approve pending logs to automatically execute wallet cashbacks</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleApproveAllPending} 
                  disabled={isProcessingAllPending || referrals.filter(r => r.status === 'Pending').length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 h-8"
                >
                  {isProcessingAllPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Approve All Pending
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search by promoter, email or invitee..."
                    className="pl-9 bg-zinc-950 border-zinc-850 text-white text-sm focus-visible:ring-emerald-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 whitespace-nowrap">Status:</span>
                  <select
                    className="bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-300 px-3 py-1.5 h-9 focus:outline-none focus:border-emerald-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Logs</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Table wrapper with min-w-0 and overflow-x-auto to ensure robust side scrolling */}
              <div className="overflow-x-auto rounded-lg border border-zinc-800 min-w-0 w-full max-w-full">
                <Table className="min-w-[650px] w-full">
                  <TableHeader className="bg-zinc-950">
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400 font-semibold py-3">Promoter (Referrer)</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Invited Customer (New)</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Reward Amount</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Registered Date</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Status</TableHead>
                      <TableHead className="text-right text-zinc-400 font-semibold py-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-36 text-center text-zinc-500">
                          <EmptyState
                            icon="search"
                            title="No referral claims found"
                            description="There are currently no referral transactions matching the criteria."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReferrals.map((referral) => {
                        const referrerInfo = getCustomerInfo(referral.referrerCustomerId);
                        const referredInfo = getCustomerInfo(referral.referredCustomerId);
                        
                        return (
                          <TableRow key={referral.id} className="border-zinc-800 hover:bg-zinc-900/40">
                            <TableCell>
                              <div className="font-semibold text-white">{referrerInfo.name}</div>
                              <div className="text-xs text-zinc-500">{referrerInfo.phone}</div>
                              {referrerInfo.referralCode && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] mt-1 hover:bg-emerald-500/20">
                                  Code: {referrerInfo.referralCode}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-white">{referredInfo.name}</div>
                              <div className="text-xs text-zinc-500">{referredInfo.phone}</div>
                            </TableCell>
                            <TableCell className="text-white font-bold text-sm">
                              ₹{referral.rewardAmount || 150}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-xs">
                              {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  referral.status === "Completed"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : referral.status === "Rejected"
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                }
                              >
                                {referral.status || "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                  <DropdownMenuLabel className="text-white text-xs">Manage Claim</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-zinc-800" />
                                  {referral.status === 'Pending' && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusUpdate(referral, 'Completed')} 
                                        className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs"
                                      >
                                        <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-500" /> Approve & Credit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusUpdate(referral, 'Rejected')} 
                                        className="focus:bg-zinc-900 focus:text-rose-500 cursor-pointer text-xs"
                                      >
                                        <XCircle className="mr-2 h-3.5 w-3.5 text-rose-500" /> Reject Claim
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      navigator.clipboard.writeText(referrerInfo.phone);
                                      toast.success("Referrer phone copied.");
                                    }}
                                    className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs"
                                  >
                                    Copy Promoter Contact
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Promo Codes Directory */}
        <TabsContent value="codes" className="m-0 outline-none space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
              <div>
                <CardTitle className="text-white">Customer Referral Code Directory</CardTitle>
                <CardDescription className="text-zinc-400">View customer unique invitation codes or batch generate codes for all promoters</CardDescription>
              </div>
              <Button 
                onClick={handleGenerateAllMissingCodes}
                disabled={isGeneratingAll || customers.filter(c => !c.referralCode).length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 py-2"
              >
                {isGeneratingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1.5 animate-pulse" />
                )}
                Auto-Generate For All Missing
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Directory search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search customer name, code or contact info..."
                  className="pl-9 bg-zinc-950 border-zinc-850 text-white text-sm focus-visible:ring-emerald-500"
                  value={codeSearchQuery}
                  onChange={(e) => setCodeSearchQuery(e.target.value)}
                />
              </div>

              {/* Table with side-scrolling support */}
              <div className="overflow-x-auto rounded-lg border border-zinc-800 min-w-0 w-full max-w-full">
                <Table className="min-w-[700px] w-full">
                  <TableHeader className="bg-zinc-950">
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400 font-semibold py-3">Customer</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Referral Code</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Successful Invites</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Wallet Balance</TableHead>
                      <TableHead className="text-zinc-400 font-semibold py-3">Loyalty Points</TableHead>
                      <TableHead className="text-right text-zinc-400 font-semibold py-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomersForCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                          <EmptyState
                            icon="search"
                            title="No customers found"
                            description="Try adjusting your query in the code directory search box."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomersForCodes.map((cust) => {
                        const isEditing = editingCustomerId === cust.id;
                        
                        return (
                          <TableRow key={cust.id} className="border-zinc-800 hover:bg-zinc-900/40">
                            <TableCell>
                              <div className="font-semibold text-white">{cust.name || `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'No Name'}</div>
                              <div className="text-xs text-zinc-500">{cust.phone || cust.email || 'No contact'}</div>
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={customCodeInput}
                                    onChange={(e) => setCustomCodeInput(e.target.value)}
                                    placeholder="CUSTOM-CODE"
                                    className="h-8 w-40 text-xs bg-zinc-950 border-zinc-700 uppercase"
                                  />
                                  <Button 
                                    size="sm"
                                    onClick={() => handleSaveCustomCode(cust.id)} 
                                    className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2 text-white text-xs"
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setEditingCustomerId(null)} 
                                    className="h-8 px-2 text-zinc-400 hover:text-white text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : cust.referralCode ? (
                                <div className="flex items-center gap-2">
                                  <code className="text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded text-xs font-semibold border border-emerald-500/10">
                                    {cust.referralCode}
                                  </code>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-zinc-400 hover:text-white"
                                    onClick={() => handleCopyCode(cust.referralCode!)}
                                  >
                                    {copiedCode === cust.referralCode ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-zinc-950 text-zinc-500 border-zinc-800 text-[10px]">
                                    No Active Code
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleGenerateCode(cust)}
                                    className="h-7 px-2 border-zinc-800 hover:bg-zinc-950 text-[10px] text-emerald-500 hover:text-emerald-400"
                                  >
                                    <Sparkles className="h-3 w-3 mr-1" /> Generate
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-white font-medium pl-6">
                              {(cust.referralsCount || 0) > 0 ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold">
                                  {cust.referralsCount} invites
                                </Badge>
                              ) : (
                                <span className="text-zinc-600 text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-white font-semibold text-xs">
                              ₹{cust.walletBalance || 0}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-xs">
                              {cust.rewardPoints || 0} pts
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                  <DropdownMenuLabel className="text-white text-xs">Code Settings</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-zinc-800" />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setEditingCustomerId(cust.id);
                                      setCustomCodeInput(cust.referralCode || "");
                                    }}
                                    className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs"
                                  >
                                    <Edit2 className="h-3 w-3 mr-2" /> Custom Vanity Code
                                  </DropdownMenuItem>
                                  {!cust.referralCode && (
                                    <DropdownMenuItem 
                                      onClick={() => handleGenerateCode(cust)}
                                      className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs"
                                    >
                                      <Sparkles className="h-3 w-3 mr-2 text-emerald-400" /> Auto-Generate Code
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Quick Manual Redemption */}
        <TabsContent value="redeem" className="m-0 outline-none space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Redemption Form */}
            <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Log & Instant-Credit Referral</CardTitle>
                <CardDescription className="text-zinc-400">Apply a referral code to record an invitation, automatically credit the promoter wallet, and update stats</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualRedeem} className="space-y-4">
                  {/* Referred Customer Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                      Who is Joining? (Referred / New Customer)
                    </label>
                    <select
                      required
                      value={newReferredId}
                      onChange={(e) => setNewReferredId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-zinc-200 p-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Choose New Joined Customer --</option>
                      {customers.map((cust) => (
                        <option key={cust.id} value={cust.id}>
                          {cust.name || `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'No Name'} ({cust.phone || cust.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Referral Code input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                      Referral Code Used
                    </label>
                    <div className="relative">
                      <Input
                        required
                        placeholder="e.g. TB-ALOK-XF2R"
                        className="bg-zinc-950 border-zinc-850 text-white uppercase tracking-wider focus-visible:ring-emerald-500"
                        value={enteredReferralCode}
                        onChange={(e) => setEnteredReferralCode(e.target.value)}
                      />
                      {enteredReferralCode && (
                        <div className="absolute right-3 top-2.5">
                          {matchedReferrer ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                              Valid Code
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                              Invalid
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Matched Referrer Info Display */}
                    {matchedReferrer && (
                      <div className="mt-2 p-3 bg-zinc-950/40 rounded-lg border border-emerald-500/10 flex items-center gap-3 animate-fade-in">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest text-[9px]">Promoter Found</p>
                          <p className="text-sm text-white font-bold">{matchedReferrer.name || matchedReferrer.firstName}</p>
                          <p className="text-[11px] text-zinc-500">Wallet Credit upon submission: ₹{customRewardAmount}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cashback settings */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                      Cashback Credit Amount (₹)
                    </label>
                    <Input
                      type="number"
                      required
                      placeholder="150"
                      className="bg-zinc-950 border-zinc-850 text-white focus-visible:ring-emerald-500"
                      value={customRewardAmount}
                      onChange={(e) => setCustomRewardAmount(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingRedeem || !matchedReferrer || !newReferredId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 h-11"
                  >
                    {isSubmittingRedeem ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Gift className="h-4 w-4 mr-2" />
                    )}
                    Verify & Credit Wallet Instantly
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Config & Rules Panel */}
            <div className="space-y-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base">Referral Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 space-y-1">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">Global Cashback Code</p>
                    <p className="text-sm font-extrabold text-white">TB-WELCOME150</p>
                    <p className="text-xs text-zinc-400">Used for first signups and triggers custom wallet adjustments of ₹150 for promoter and ₹100 for newly referred invitee.</p>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 space-y-1">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">Active Verification Mode</p>
                    <p className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Automatic Real-time Update
                    </p>
                    <p className="text-xs text-zinc-400">Approval instantly synchronizes balance values with Firestore database triggers for secure tracking.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
