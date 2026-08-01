import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Loader2, RefreshCcw, Search, MapPin, Edit, Trash2 } from "lucide-react"
import { customerService } from "../services/customers"
import { Customer } from "../types"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"


const API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  '';

import { PlaceAutocomplete } from '../components/PlaceAutocomplete';
import { MapPicker } from '../components/MapPicker';
import { DataTableSkeleton } from "@/src/components/ui/data-table-skeleton"

export default function CustomerAddressesPage({ embedded = false }: { embedded?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', line1: '', line2: '', landmark: '', area: '', city: '', state: '', pincode: '', lat: '', lng: '', instructions: '', isDefault: false })
  const itemsPerPage = 20

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await customerService.getCustomers(500)
      setCustomers(data)
    } catch (err: any) {
      setError(err.message || "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filteredCustomers = customers.filter(c =>
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  )
  
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Delivery Addresses</h1>
            <p className="text-zinc-500 mt-1">Manage customer addresses, delivery zones, and availability.</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium" onClick={() => { setSelectedCustomer(null); setEditingAddressId(null); setNewAddress({ name: '', phone: '', line1: '', line2: '', landmark: '', area: '', city: '', state: '', pincode: '', lat: '', lng: '', instructions: '', isDefault: false }); setIsAddOpen(true); }}>
              <MapPin className="mr-2 h-4 w-4" /> Add Address
            </Button>
            <Button
              variant="outline"
              onClick={loadCustomers}
              disabled={loading}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      )}

      <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
            />
          </div>
          {embedded && (
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium" onClick={() => { setSelectedCustomer(null); setEditingAddressId(null); setNewAddress({ name: '', phone: '', line1: '', line2: '', landmark: '', area: '', city: '', state: '', pincode: '', lat: '', lng: '', instructions: '', isDefault: false }); setIsAddOpen(true); }}>
              <MapPin className="mr-2 h-4 w-4" /> Add Address
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <DataTableSkeleton columnCount={3} rowCount={5} />
            </div>
          ) : error ? (
            <div className="text-center py-24 text-rose-500">
              <p>{error}</p>
              <Button onClick={loadCustomers} variant="outline" className="mt-4 border-zinc-800">Retry</Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-24 text-zinc-500">
              No customers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium pl-6">Customer</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Saved Addresses</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300 border border-zinc-700">
                            {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-xs text-zinc-500">{customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-3 py-2">
                          {customer.addresses && customer.addresses.length > 0 ? (
                            customer.addresses.map((addr: any, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                                <MapPin className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-zinc-200">
                                      {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                                    </span>
                                    {addr.isDefault && (
                                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0 h-4">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-zinc-400">
                                    {addr.city}, {addr.state} - {addr.pincode}
                                  </div>
                                  <div className="text-xs text-zinc-500">
                                    Area: <span className="text-zinc-300">{addr.area || 'Not specified'}</span> | 
                                    Availability: <span className={addr.isDeliverable === false ? 'text-rose-400' : 'text-emerald-400'}>
                                      {addr.isDeliverable === false ? 'Out of Range' : 'Deliverable'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    onClick={() => {
                                      setSelectedCustomer(customer);
                                      setEditingAddressId(addr.id);
                                      setNewAddress({
                                        name: addr.name || '',
                                        phone: addr.phone || '',
                                        line1: addr.addressLine1 || addr.line1 || '',
                                        line2: addr.addressLine2 || addr.line2 || '',
                                        landmark: addr.landmark || '',
                                        area: addr.area || '',
                                        city: addr.city || '',
                                        state: addr.state || '',
                                        pincode: addr.pincode || '',
                                        lat: addr.lat || '',
                                        lng: addr.lng || '',
                                        instructions: addr.instructions || '',
                                        isDefault: !!addr.isDefault
                                      });
                                      setIsAddOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                                    onClick={async () => {
                                      if (confirm("Are you sure you want to delete this address?")) {
                                        setLoading(true);
                                        try {
                                          await customerService.deleteCustomerAddress(customer.id, addr.id);
                                          loadCustomers();
                                        } catch (err) {
                                          console.error("Failed to delete address", err);
                                        } finally {
                                          setLoading(false);
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-zinc-500 italic">No addresses saved</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 align-top pt-5">
                        <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => { setSelectedCustomer(customer); setEditingAddressId(null); setNewAddress({ name: '', phone: '', line1: '', line2: '', landmark: '', area: '', city: '', state: '', pincode: '', lat: '', lng: '', instructions: '', isDefault: false }); setIsAddOpen(true); }}>
                          Add Address
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredCustomers.length > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
              <div className="text-sm text-zinc-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if(!open) { setEditingAddressId(null); } }}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-400">Customer</label>
              <select 
                value={selectedCustomer?.id || ''} 
                onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                className="w-full h-10 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.phone || c.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Name</label>
                <Input
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                  placeholder="e.g. Home"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Phone</label>
                <Input
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>
            
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-400">Search Address</label>
              <PlaceAutocomplete onPlaceSelect={(place: any) => {
                let city = '';
                let state = '';
                let pincode = '';
                let area = '';

                // Handle both old and new Place object structures
                const components = place.addressComponents || place.address_components;

                components?.forEach((c: any) => {
                  const types = c.types;
                  const name = c.longText || c.long_name;
                  const shortName = c.shortText || c.short_name;

                  if (types.includes('locality')) city = name;
                  if (types.includes('administrative_area_level_1')) state = shortName;
                  if (types.includes('postal_code')) pincode = name;
                  if (types.includes('sublocality')) area = name;
                });

                const location = place.location || place.geometry?.location;
                const lat = typeof location?.lat === 'function' ? location.lat() : location?.lat;
                const lng = typeof location?.lng === 'function' ? location.lng() : location?.lng;

                setNewAddress(prev => ({
                  ...prev,
                  line1: place.formattedAddress || place.name || '',
                  area: area || prev.area,
                  city: city || prev.city,
                  state: state || prev.state,
                  pincode: pincode || prev.pincode,
                  lat: lat?.toString() || '',
                  lng: lng?.toString() || ''
                }));
              }} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-400">Pick on Map</label>
              <MapPicker 
                initialLocation={newAddress.lat && newAddress.lng ? { lat: parseFloat(newAddress.lat), lng: parseFloat(newAddress.lng) } : undefined}
                onLocationSelect={(loc) => {
                  setNewAddress(prev => ({
                    ...prev,
                    lat: loc.lat.toString(),
                    lng: loc.lng.toString()
                  }));
                }}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-400">Address Line 1</label>
              <Input
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                className="bg-zinc-900/50 border-zinc-800"
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-400">Address Line 2 (Optional)</label>
              <Input
                value={newAddress.line2}
                onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                className="bg-zinc-900/50 border-zinc-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Landmark</label>
                <Input
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Area/Locality</label>
                <Input
                  value={newAddress.area}
                  onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">City</label>
                <Input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">State</label>
                <Input
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">PIN Code</label>
                <Input
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Latitude (Optional)</label>
                <Input
                  value={newAddress.lat}
                  onChange={(e) => setNewAddress({ ...newAddress, lat: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Longitude (Optional)</label>
                <Input
                  value={newAddress.lng}
                  onChange={(e) => setNewAddress({ ...newAddress, lng: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-400">Delivery Instructions</label>
              <Textarea
                value={newAddress.instructions}
                onChange={(e) => setNewAddress({ ...newAddress, instructions: e.target.value })}
                className="bg-zinc-900/50 border-zinc-800 min-h-[80px]"
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="isDefault" 
                checked={newAddress.isDefault}
                onCheckedChange={(checked) => setNewAddress({ ...newAddress, isDefault: !!checked })}
                className="border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-zinc-950"
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300"
              >
                Set as default delivery address
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditingAddressId(null); }} className="border-zinc-800 text-white hover:bg-zinc-800">
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!selectedCustomer) {
                  alert("Please select a customer first.");
                  return;
                }
                setLoading(true);
                try {
                  if (editingAddressId) {
                    await customerService.updateCustomerAddress(selectedCustomer.id, editingAddressId, newAddress);
                  } else {
                    await customerService.addCustomerAddress(selectedCustomer.id, newAddress);
                  }
                  setIsAddOpen(false);
                  setEditingAddressId(null);
                  setNewAddress({ name: '', phone: '', line1: '', line2: '', landmark: '', area: '', city: '', state: '', pincode: '', lat: '', lng: '', instructions: '', isDefault: false });
                  loadCustomers();
                } catch (err: any) {
                  alert("Failed to save address: " + err.message);
                } finally {
                  setLoading(false);
                }
              }} 
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
            >
              {editingAddressId ? 'Update Address' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

