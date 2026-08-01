import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCcw, Search, Plus, Trash2, Edit2, Link, Image, Star, Eye } from "lucide-react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "../lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

import { dbSeedService } from "../services/db-seed"

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  displayOrder: number;
  isActive: boolean;
}

export default function MarketingPage() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Add banner dialog
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    link: "/plans",
    displayOrder: 1,
    isActive: true,
  })

  const loadBanners = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'banners'), orderBy('displayOrder', 'asc'))
      const snap = await getDocs(q)
      setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BannerItem[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await addDoc(collection(db, 'banners'), formData)
      setIsOpen(false)
      await loadBanners()
    } catch (err: any) {
      alert("Failed to create banner: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return
    try {
      setLoading(true)
      await deleteDoc(doc(db, 'banners', id))
      await loadBanners()
    } catch (err: any) {
      alert("Failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      const nextActive = !banner.isActive
      await updateDoc(doc(db, 'banners', banner.id), { isActive: nextActive })
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: nextActive } : b))
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message)
    }
  }

  const filteredBanners = banners.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Campaigns & Banners</h1>
          <p className="text-zinc-500 mt-1">Configure active promotional assets, manage priority slides, and set app-wide navigation pathways.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadBanners}
            disabled={loading}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
          <Button onClick={() => setIsOpen(true)} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Add Banner
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search active promotional campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {loading && banners.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-24 text-zinc-500 text-sm">
              No promotional banners found. Click "Add Banner" to upload an asset.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 pl-6 w-[100px]">Asset</TableHead>
                    <TableHead className="text-zinc-400">Campaign Title</TableHead>
                    <TableHead className="text-zinc-400">Redirect Link</TableHead>
                    <TableHead className="text-zinc-400">Sequence Order</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner) => (
                    <TableRow key={banner.id} className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                      <TableCell className="pl-6 py-3">
                        <div className="relative h-10 w-20 rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback on load failure
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <Image className="h-4 w-4 text-zinc-600 absolute" />
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-white group-hover:text-emerald-500 transition-colors">
                        {banner.title}
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono text-xs">
                        <span className="flex items-center gap-1">
                          <Link className="h-3 w-3 text-zinc-500" />
                          {banner.link}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-400 font-bold">
                        <Badge variant="outline" className="border-zinc-800 text-zinc-400">
                          Order: {banner.displayOrder}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => handleToggleActive(banner)} className="focus:outline-none">
                          {banner.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-pointer">Live</Badge>
                          ) : (
                            <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 cursor-pointer">Hidden</Badge>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
                          onClick={() => handleDeleteBanner(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-950/30 border border-dashed border-zinc-800 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-white font-bold flex items-center justify-center md:justify-start gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              System Maintenance & Demo Mode
            </h3>
            <p className="text-zinc-500 text-sm max-w-xl">
              Populate the platform with comprehensive demo data including customers, subscriptions, financial transactions, and marketing assets.
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={async () => {
              if (confirm("This will force-seed the database with demo records. Continue?")) {
                setLoading(true)
                await dbSeedService.ensureSeeded(true)
                loadBanners()
                alert("Database comprehensive seeding completed successfully.")
              }
            }}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 min-w-[200px]"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Run Comprehensive Seed
          </Button>
        </div>
      </Card>

      {/* ADD DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold">Add Promotional Banner</DialogTitle>
            <DialogDescription className="text-zinc-500">Configure visual slider slides for the mobile customer application.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBanner} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="banner-title" className="text-zinc-300">Campaign / Slide Title</Label>
              <Input 
                id="banner-title"
                placeholder="e.g. 30% Off Keto Longevity Subscription" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="banner-image" className="text-zinc-300">Banner Asset Image URL</Label>
              <Input 
                id="banner-image"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="banner-link" className="text-zinc-300">Redirect Route Link</Label>
                <Input 
                  id="banner-link"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="banner-order" className="text-zinc-300">Sequence Rank</Label>
                <Input 
                  id="banner-order"
                  type="number"
                  min="1"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-medium">
                Add Campaign Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
