import { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  ChefHat, 
  Plus, 
  MoreVertical, 
  Search,
  Activity,
  Receipt,
  Phone,
  Clock,
  Navigation,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { branchService, Branch } from '../services/branches';
import { PlaceAutocomplete } from '../components/PlaceAutocomplete';
import { MapPicker } from '../components/MapPicker';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalBranches: 0,
    activeBranches: 0,
    totalKitchens: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    activeStaff: 0
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    kitchenName: '',
    gstNumber: '',
    fssaiNumber: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    email: '',
    openingHours: '09:00',
    closingHours: '22:00',
    deliveryRadius: 5,
    status: 'Active'
  });

  useEffect(() => {
    loadData(true);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      loadData(false);
    }, 10000); // 10 seconds refresh
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [branchesData, metricsData] = await Promise.all([
        branchService.getBranches(),
        branchService.getDashboardMetrics()
      ]);
      setBranches(branchesData);
      
      // Add slight randomness to simulate live data
      setMetrics({
        ...metricsData,
        todaysOrders: metricsData.todaysOrders + Math.floor(Math.random() * 5),
        todaysRevenue: metricsData.todaysRevenue + Math.floor(Math.random() * 500)
      });
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' || name === 'deliveryRadius' 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await branchService.addBranch(formData as Omit<Branch, 'id' | 'createdAt'>, 'admin_master', 'Admin');
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error adding branch:', error);
      alert('Failed to add branch. See console for details.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Branch Management</h2>
          <p className="text-sm text-zinc-400">Manage multiple kitchens and delivery hubs.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Total Branches</p>
                <h3 className="text-xl font-bold text-white">{metrics.totalBranches}</h3>
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
                <p className="text-xs font-medium text-zinc-400">Active Branches</p>
                <h3 className="text-xl font-bold text-white">{metrics.activeBranches}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Total Kitchens</p>
                <h3 className="text-xl font-bold text-white">{metrics.totalKitchens}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-500">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Today's Orders</p>
                <h3 className="text-xl font-bold text-white">{metrics.todaysOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Today's Revenue</p>
                <h3 className="text-xl font-bold text-white">₹{metrics.todaysRevenue}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Active Staff</p>
                <h3 className="text-xl font-bold text-white">{metrics.activeStaff}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch List */}
      <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Branches</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search branches..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead className="bg-zinc-900/50 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Branch Name</th>
                  <th className="px-4 py-3 font-medium">Kitchen Name</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Manager</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Today's Orders</th>
                  <th className="px-4 py-3 font-medium">Today's Revenue</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {branches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-zinc-500">
                      No branches found. Add a branch to get started.
                    </td>
                  </tr>
                ) : (
                  branches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{branch.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <ChefHat className="h-4 w-4 text-amber-500" />
                          {branch.kitchenName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          {branch.city}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Users className="h-4 w-4 text-zinc-500" />
                          {branch.managerId || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Phone className="h-4 w-4 text-zinc-500" />
                          {branch.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          branch.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                          branch.status === 'Inactive' ? 'bg-zinc-800 text-zinc-400' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            branch.status === 'Active' ? 'bg-emerald-500' :
                            branch.status === 'Inactive' ? 'bg-zinc-400' :
                            'bg-amber-500'
                          }`} />
                          {branch.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{branch.todaysOrders || 0}</td>
                      <td className="px-4 py-3 text-zinc-300">₹{branch.todaysRevenue || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-zinc-400 hover:text-emerald-500 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                Add New Branch
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="addBranchForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-emerald-500 border-b border-zinc-800 pb-2">Basic Info</h4>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Branch Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. South Mumbai Hub" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Branch Code</label>
                      <input required type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. MUB-01" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Kitchen Name</label>
                      <input required type="text" name="kitchenName" value={formData.kitchenName} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. TaazaKitchen SoBo" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">GST Number</label>
                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">FSSAI Number</label>
                        <input required type="text" name="fssaiNumber" value={formData.fssaiNumber} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-emerald-500 border-b border-zinc-800 pb-2">Location</h4>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Search Address</label>
                      <PlaceAutocomplete onPlaceSelect={(place: any) => {
                        let city = '';
                        let state = '';
                        let pincode = '';

                        const components = place.addressComponents || place.address_components;
                        components?.forEach((c: any) => {
                          const types = c.types;
                          const name = c.longText || c.long_name;
                          const shortName = c.shortText || c.short_name;

                          if (types.includes('locality')) city = name;
                          if (types.includes('administrative_area_level_1')) state = shortName;
                          if (types.includes('postal_code')) pincode = name;
                        });

                        const location = place.location || place.geometry?.location;
                        const lat = typeof location?.lat === 'function' ? location.lat() : location?.lat;
                        const lng = typeof location?.lng === 'function' ? location.lng() : location?.lng;

                        setFormData(prev => ({
                          ...prev,
                          address: place.formattedAddress || place.name || prev.address,
                          city: city || prev.city,
                          state: state || prev.state,
                          pinCode: pincode || prev.pinCode,
                          latitude: lat || prev.latitude,
                          longitude: lng || prev.longitude
                        }));
                      }} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Full Address</label>
                      <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="mb-1 block text-xs text-zinc-400">City</label>
                        <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="mb-1 block text-xs text-zinc-400">State</label>
                        <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="mb-1 block text-xs text-zinc-400">PIN Code</label>
                        <input required type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Latitude</label>
                        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Longitude</label>
                        <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Pick on Map</label>
                      <MapPicker 
                        initialLocation={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
                        onLocationSelect={(loc) => {
                          setFormData(prev => ({
                            ...prev,
                            latitude: loc.lat,
                            longitude: loc.lng
                          }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-emerald-500 border-b border-zinc-800 pb-2">Contact & Operations</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Phone</label>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Email</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Opening Time</label>
                        <input required type="time" name="openingHours" value={formData.openingHours} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Closing Time</label>
                        <input required type="time" name="closingHours" value={formData.closingHours} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Timezone</label>
                        <input required type="text" name="timezone" value={formData.timezone} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. Asia/Kolkata" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">Radius (km)</label>
                        <input required type="number" name="deliveryRadius" value={formData.deliveryRadius} onChange={handleInputChange} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
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
                form="addBranchForm"
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-500 text-zinc-950 text-sm font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Save Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
