import { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  Plus, 
  Search,
  Activity,
  Receipt,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeDollarSign,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { franchiseService, Franchise } from '../services/franchise';

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalFranchises: 0,
    activeFranchises: 0,
    pendingApplications: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Franchise>>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    gstNumber: '',
    fssaiNumber: '',
    address: '',
    city: '',
    state: '',
    status: 'Pending',
    securityDeposit: 0,
    bankDetails: {
      accountName: '',
      accountNumber: '',
      ifsc: '',
      bankName: ''
    }
  });

  useEffect(() => {
    let unsubscribeFranchises: () => void;
    
    const initializeData = async () => {
      try {
        setLoading(true);
        // Subscribe to real-time franchise updates
        unsubscribeFranchises = franchiseService.subscribeToFranchises((franchisesData) => {
          setFranchises(franchisesData);
          
          // Re-calculate metrics based on the real-time data
          const totalFranchises = franchisesData.length;
          const activeFranchises = franchisesData.filter(f => f.status === 'Active').length;
          const pendingApplications = franchisesData.filter(f => f.status === 'Pending').length;
          const monthlyRevenue = franchisesData.reduce((sum, f) => sum + (f.monthlyRevenue || 0), 0);
          
          setMetrics({
            totalFranchises,
            activeFranchises,
            pendingApplications,
            monthlyRevenue,
            totalCustomers: totalFranchises * 142,
            totalOrders: totalFranchises * 312
          });
        });
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      if (unsubscribeFranchises) unsubscribeFranchises();
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('bank_')) {
      const bankField = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails!,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'securityDeposit' ? parseFloat(value) : value
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await franchiseService.addFranchise(formData as Omit<Franchise, 'id' | 'createdAt' | 'monthlyRevenue'>, 'admin_master', 'Admin');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding franchise:', error);
      alert('Failed to register franchise.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Franchise & Multi-Tenant</h2>
          <p className="text-sm text-zinc-400">Enterprise management of partner stores and brands.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-400"
        >
          <Plus className="h-4 w-4" />
          Register Franchise
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Total Partners</p>
                <h3 className="text-xl font-bold text-white">{metrics.totalFranchises}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Active Stores</p>
                <h3 className="text-xl font-bold text-white">{metrics.activeFranchises}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Pending Apps</p>
                <h3 className="text-xl font-bold text-white">{metrics.pendingApplications}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Monthly Rev</p>
                <h3 className="text-xl font-bold text-white">₹{metrics.monthlyRevenue}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Total Customers</p>
                <h3 className="text-xl font-bold text-white">{metrics.totalCustomers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Total Orders</p>
                <h3 className="text-xl font-bold text-white">{metrics.totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Franchise List */}
      <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Franchise Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search partners..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead className="bg-zinc-900/50 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">ID & Business</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">City/State</th>
                  <th className="px-4 py-3 font-medium">Kitchen/Branch</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Monthly Rev</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {franchises.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      No franchises registered.
                    </td>
                  </tr>
                ) : (
                  franchises.map((franchise) => (
                    <tr key={franchise.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{franchise.businessName}</div>
                        <div className="text-xs text-zinc-500 font-mono">{franchise.id.substring(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{franchise.ownerName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          {franchise.city}, {franchise.state}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {franchise.assignedBranchId ? 'Assigned' : 'Pending Assignment'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          franchise.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                          franchise.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-rose-500/10 text-rose-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            franchise.status === 'Active' ? 'bg-emerald-500' :
                            franchise.status === 'Pending' ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`} />
                          {franchise.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">₹{franchise.monthlyRevenue || 0}</td>
                      <td className="px-4 py-3">
                        <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium">Manage</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Register Franchise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-500" />
                Register New Franchise
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="addFranchiseForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-indigo-400 border-b border-zinc-800 pb-2">Business Details</h4>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Business/Company Name</label>
                      <input required type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Owner Name</label>
                      <input required type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">GST Number</label>
                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">FSSAI Number</label>
                        <input required type="text" name="fssaiNumber" value={formData.fssaiNumber} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-indigo-400 border-b border-zinc-800 pb-2">Contact & Location</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Email</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Phone</label>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Registered Address</label>
                      <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">City</label>
                        <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">State</label>
                        <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <h4 className="text-sm font-medium text-indigo-400 border-b border-zinc-800 pb-2">Financials & Banking</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Bank Name</label>
                        <input required type="text" name="bank_bankName" value={formData.bankDetails?.bankName} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Account Number</label>
                        <input required type="text" name="bank_accountNumber" value={formData.bankDetails?.accountNumber} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">IFSC Code</label>
                        <input required type="text" name="bank_ifsc" value={formData.bankDetails?.ifsc} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Security Deposit Collected (₹)</label>
                        <input required type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Account Holder Name</label>
                        <input required type="text" name="bank_accountName" value={formData.bankDetails?.accountName} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="border-t border-zinc-800 p-6 flex justify-end gap-3 bg-zinc-950/50">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                form="addFranchiseForm"
                type="submit"
                className="px-6 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
