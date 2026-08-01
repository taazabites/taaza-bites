import { getAdminEmail } from '../utils/admin';
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw, Search, MessageSquare, Plus, Clock, User, Trash2, Pin, Edit2 } from "lucide-react"
import { customerService } from "../services/customers"
import { Customer } from "../types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "../contexts/auth-context"

export default function CustomerNotesPage({ embedded = false }: { embedded?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editingNote, setEditingNote] = useState<any | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [notePriority, setNotePriority] = useState("Normal")
  const [noteType, setNoteType] = useState("Admin Note")

  // Custom Deletion Confirmation Dialog States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)

  const handleOpenAddNote = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditingNote(null)
    setNoteContent("")
    setNotePriority("Normal")
    setNoteType("Admin Note")
    setIsNoteDialogOpen(true)
  }

  const handleOpenEditNote = (customer: Customer, note: any) => {
    setSelectedCustomer(customer)
    setEditingNote(note)
    setNoteContent(note.content)
    setNotePriority(note.priority || "Normal")
    setNoteType(note.type || "Admin Note")
    setIsNoteDialogOpen(true)
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    setLoading(true)
    try {
      if (editingNote) {
        await customerService.updateCustomerNote(selectedCustomer.id, editingNote.id, {
          content: noteContent,
          priority: notePriority,
          type: noteType,
        })
      } else {
        await customerService.addCustomerNote(
          selectedCustomer.id, 
          noteContent, 
          user?.id || '', 
          getAdminEmail(user), 
          notePriority, 
          noteType
        );
      }
      setIsNoteDialogOpen(false)
      loadCustomers()
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteNote = (customerId: string, noteId: string) => {
    setDeleteCustomerId(customerId)
    setDeleteNoteId(noteId)
    setDeleteConfirmOpen(true)
  }

  const executeDeleteNote = async () => {
    setDeleteConfirmOpen(false)
    if (!deleteCustomerId || !deleteNoteId) return
    setLoading(true);
    try {
      await customerService.deleteCustomerNote(deleteCustomerId, deleteNoteId);
      loadCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setDeleteCustomerId(null);
      setDeleteNoteId(null);
    }
  }
  
  const handleTogglePin = async (customerId: string, noteId: string, currentPin: boolean) => {
    setLoading(true);
    try {
      await customerService.updateCustomerNote(customerId, noteId, { isPinned: !currentPin });
      loadCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
    ((c.firstName || '') + ' ' + (c.lastName || '')).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Customer Notes & Instructions</h1>
            <p className="text-zinc-500 text-sm">Internal notes management</p>
          </div>
          <Button variant="outline" onClick={loadCustomers} disabled={loading} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search customers to add or manage notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-zinc-500">Loading...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">No customers found.</div>
        ) : (
          filteredCustomers.map((customer) => {
            const sortedNotes = customer.notes && customer.notes.length > 0
              ? [...customer.notes].sort((a: any, b: any) => {
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
                  const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
                  return dateB - dateA;
                })
              : [];

            return (
              <Card key={customer.id} className="bg-zinc-950 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                        {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {((customer.firstName || '') + ' ' + (customer.lastName || '')).trim() || 'Unnamed Customer'}
                        </h3>
                        <p className="text-xs text-zinc-500">{customer.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenAddNote(customer)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
                    </Button>
                  </div>

                  {sortedNotes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {sortedNotes.map((note: any, index: number) => (
                        <div 
                          key={note.id || index} 
                          className={`flex gap-3 p-3 rounded-lg border transition-all ${
                            note.isPinned 
                              ? 'bg-amber-500/5 border-amber-500/30 shadow-sm shadow-amber-500/5' 
                              : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-800'
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={note.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-500' : note.priority === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-400'}>{note.priority || 'Normal'}</Badge>
                              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{note.type || 'Admin'}</Badge>
                              {note.isPinned && (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pinned</Badge>
                              )}
                            </div>
                            <p className="text-sm text-zinc-300">{note.content}</p>
                            <p className="text-[10px] text-zinc-600 pt-1">
                              {note.authorName || 'Admin'} • {note.createdAt || note.timestamp ? new Date(note.createdAt || note.timestamp).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button onClick={() => handleTogglePin(customer.id, note.id || note.content, note.isPinned)} variant="ghost" size="icon" className={`h-6 w-6 ${note.isPinned ? 'text-amber-500 hover:text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}><Pin className="h-3.5 w-3.5" /></Button>
                            <Button onClick={() => handleOpenEditNote(customer, note)} variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-emerald-400"><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button onClick={() => handleDeleteNote(customer.id, note.id || note.content)} variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit' : 'Add'} Note for {selectedCustomer?.firstName} {selectedCustomer?.lastName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="space-y-2">
              <Label>Note Content</Label>
              <Textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Enter internal note..." required className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={notePriority} onValueChange={setNotePriority}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="Admin Note">Admin Note</SelectItem>
                    <SelectItem value="Internal Alert">Internal Alert</SelectItem>
                    <SelectItem value="Dietary Note">Dietary Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsNoteDialogOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingNote ? 'Save Changes' : 'Save Note'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Deletion Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-300">
            Are you sure you want to delete this internal note? This action cannot be undone.
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              Cancel
            </Button>
            <Button onClick={executeDeleteNote} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
