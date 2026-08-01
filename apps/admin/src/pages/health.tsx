import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCcw, Search, Edit, Activity, CalendarClock } from "lucide-react"
import { customerService } from "../services/customers"
import { Customer } from "../types"
import { DataTableSkeleton } from "@/src/components/ui/data-table-skeleton"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function HealthPage({ embedded = false }: { embedded?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [goal, setGoal] = useState("")
  const [dietPreference, setDietPreference] = useState("")
  const [allergies, setAllergies] = useState("")
  const [medicalConditions, setMedicalConditions] = useState("")

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.getCustomers()
      setCustomers(data)
    } catch (err: any) {
      setError(err.message || "Failed to load customer profiles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const calculateBMI = (hCm: number, wKg: number) => {
    if (!hCm || !wKg) return "N/A"
    const hM = hCm / 100
    const bmi = wKg / (hM * hM)
    return bmi.toFixed(1)
  }

  const handleEditOpen = (customer: Customer) => {
    setSelectedCustomer(customer)
    setHeight(customer.health?.height?.toString() || "")
    setWeight(customer.health?.weight?.toString() || "")
    setGoal(customer.health?.goal || "")
    setDietPreference(customer.health?.dietPreference || "")
    setAllergies(customer.health?.allergies?.join(", ") || "")
    setMedicalConditions(customer.health?.medicalConditions?.join(", ") || "")
    setIsEditOpen(true)
  }

  const handleSaveHealth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return

    try {
      setLoading(true)
      const customerRef = doc(db, "customers", selectedCustomer.id)
      
      const allergyList = allergies.split(",").map(s => s.trim()).filter(Boolean)
      const medicalList = medicalConditions.split(",").map(s => s.trim()).filter(Boolean)
      
      const healthData = {
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        goal,
        dietPreference,
        allergies: allergyList,
        medicalConditions: medicalList,
        lastUpdated: new Date().toISOString()
      }

      await updateDoc(customerRef, {
        health: healthData
      })
      
      setIsEditOpen(false)
      await loadCustomers()
    } catch (err: any) {
      alert("Failed to save health profile: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Health Assessments</h1>
            <p className="text-zinc-500 mt-1">Manage customer health data, allergies, and diet preferences.</p>
          </div>
          <div className="flex gap-2">
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
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
            />
          </div>
        </div>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <DataTableSkeleton columnCount={6} rowCount={5} />
            </div>
          ) : error ? (
            <div className="text-center py-24 text-rose-500">
              <p>{error}</p>
              <Button onClick={loadCustomers} variant="outline" className="mt-4 border-zinc-800">Retry</Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
             <div className="text-center py-24 text-zinc-500">
              No profiles found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium pl-6">Customer</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Metrics (Ht / Wt / BMI)</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Diet / Goal</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Medical / Allergies</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Last Updated</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => {
                    const h = customer.health
                    const bmi = h?.height && h?.weight ? calculateBMI(h.height, h.weight) : "N/A"

                    return (
                      <TableRow key={customer.id} className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                        <TableCell className="pl-6 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300 border border-zinc-700">
                              {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || '?'}
                            </div>
                            <div className="flex flex-col">
                              <span>{customer.firstName} {customer.lastName}</span>
                              <span className="text-xs text-zinc-500 font-normal">{customer.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-4 text-sm text-zinc-300">
                            <div><span className="text-zinc-500 text-xs block">Height</span>{h?.height ? `${h.height} cm` : '--'}</div>
                            <div><span className="text-zinc-500 text-xs block">Weight</span>{h?.weight ? `${h.weight} kg` : '--'}</div>
                            <div>
                              <span className="text-zinc-500 text-xs block">BMI</span>
                              <Badge variant="outline" className={
                                bmi === "N/A" ? "bg-zinc-800/50 text-zinc-500" :
                                parseFloat(bmi) > 25 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                parseFloat(bmi) < 18.5 ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              }>{bmi}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1">
                              {h?.dietPreference ? (
                                <Badge variant="secondary" className="w-fit bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                                  {h.dietPreference}
                                </Badge>
                              ) : <span className="text-zinc-600 text-sm">--</span>}
                              {h?.goal ? (
                                <div className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                                  <Activity className="h-3 w-3 text-emerald-500" />
                                  {h.goal}
                                </div>
                              ) : null}
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 max-w-[200px]">
                            {h?.allergies && h.allergies.length > 0 ? (
                               <div className="flex flex-wrap gap-1">
                                 {h.allergies.map((a, i) => (
                                   <Badge key={i} variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                                     {a}
                                   </Badge>
                                 ))}
                               </div>
                            ) : <span className="text-zinc-600 text-sm">No allergies</span>}
                            {h?.medicalConditions && h.medicalConditions.length > 0 ? (
                               <div className="text-xs text-amber-400 mt-1 line-clamp-1" title={h.medicalConditions.join(", ")}>
                                 {h.medicalConditions.join(", ")}
                               </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                           {h?.lastUpdated ? (
                             <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                               <CalendarClock className="h-3.5 w-3.5 text-zinc-500" />
                               {new Date(h.lastUpdated).toLocaleDateString()}
                             </div>
                           ) : (
                             <span className="text-zinc-600 text-sm">Never</span>
                           )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditOpen(customer)}
                            className="text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!loading && !error && filteredCustomers.length > itemsPerPage && (
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

      {/* Edit Health Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Update Health Assessment
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveHealth} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider">Height (cm)</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider">Weight (kg)</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Goal</Label>
              <Input 
                placeholder="e.g. Weight Loss, Muscle Gain, Maintenance"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Diet Preference</Label>
              <Input 
                placeholder="e.g. Vegan, Keto, Balanced, Paleo"
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Allergies</Label>
              <Input 
                placeholder="e.g. Peanuts, Shellfish, Gluten"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Separate allergies with a comma.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Medical Conditions</Label>
              <Input 
                placeholder="e.g. Diabetes, Hypertension"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Separate conditions with a comma.</p>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-medium">
                Save Health Data
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
