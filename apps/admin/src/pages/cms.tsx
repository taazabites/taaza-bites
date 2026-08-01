import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCcw, Search, Plus, Trash2, BookOpen, Scale, HelpCircle } from "lucide-react"
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function CMSPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [faqSearch, setFaqSearch] = useState("")

  // Compose state
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [category, setCategory] = useState("Meal Plans")

  const loadFAQs = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'faqs'), orderBy('category', 'asc'))
      const snap = await getDocs(q)
      setFaqs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FAQItem[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFAQs()
  }, [])

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    try {
      setLoading(true)
      await addDoc(collection(db, 'faqs'), {
        question,
        answer,
        category
      })
      setQuestion("")
      setAnswer("")
      await loadFAQs()
    } catch (err: any) {
      alert("Failed to save FAQ: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ entry?")) return
    try {
      setLoading(true)
      await deleteDoc(doc(db, 'faqs', id))
      await loadFAQs()
    } catch (err: any) {
      alert("Failed to delete FAQ: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQs = faqs.filter(f => 
    f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Content Management</h1>
          <p className="text-zinc-500 mt-1">Manage app-wide informational copies, customer FAQs, and static company agreements.</p>
        </div>
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800 p-1">
          <TabsTrigger value="faqs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Customer FAQs</TabsTrigger>
          <TabsTrigger value="legal" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Legal Agreements</TabsTrigger>
        </TabsList>

        {/* FAQs TAB */}
        <TabsContent value="faqs" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* COMPOSE FAQ */}
            <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg md:col-span-1">
              <CardHeader>
                <CardTitle className="text-white">Create FAQ Entry</CardTitle>
                <CardDescription className="text-zinc-500">Provide clean, helpful answers to user questions.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFAQ} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="faq-category" className="text-zinc-300">Category Group</Label>
                    <select 
                      id="faq-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 focus:border-emerald-500 focus:outline-none text-sm"
                    >
                      <option value="Meal Plans">Meal Plans & Nutrition</option>
                      <option value="Deliveries">Deliveries & Routes</option>
                      <option value="Payments">Payments & Wallet</option>
                      <option value="Health Goals">Dietary Exclusion Plans</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="faq-question" className="text-zinc-300">Question</Label>
                    <Input 
                      id="faq-question"
                      placeholder="e.g. Can I pause my meal delivery?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="faq-answer" className="text-zinc-300">Answer Body</Label>
                    <textarea 
                      id="faq-answer"
                      rows={5}
                      placeholder="e.g. Yes, you can freeze or pause your active schedule from the dashboard up to 24 hours in advance."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 focus:border-emerald-500 focus:outline-none text-sm"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-medium">
                    Publish FAQ Entry
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* LIST FAQ */}
            <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg md:col-span-2 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="Search published answers..." 
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500 text-sm"
                  />
                </div>
                <Button size="icon" variant="ghost" onClick={loadFAQs} disabled={loading} className="text-zinc-400 hover:text-white">
                  <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
                {loading && faqs.length === 0 ? (
                  <div className="flex justify-center items-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : filteredFAQs.length === 0 ? (
                  <div className="text-center py-24 text-zinc-500 text-sm">
                    No FAQs registered in the Firestore database.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 pl-6 w-[120px]">Category</TableHead>
                        <TableHead className="text-zinc-400">Content</TableHead>
                        <TableHead className="text-zinc-400 text-right pr-6 w-[80px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFAQs.map((faq) => (
                        <TableRow key={faq.id} className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                          <TableCell className="pl-6">
                            <Badge className="bg-zinc-900 text-zinc-400 border-zinc-800 whitespace-nowrap">{faq.category}</Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-semibold text-white">{faq.question}</div>
                            <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{faq.answer}</div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
                              onClick={() => handleDeleteFAQ(faq.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LEGAL TAB */}
        <TabsContent value="legal" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zinc-950/50 border-zinc-800/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-white">Terms of Service</CardTitle>
                </div>
                <CardDescription className="text-zinc-500">Legal contracts for client onboarding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea 
                  rows={10}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md p-3 text-xs focus:border-emerald-500 focus:outline-none"
                  defaultValue={`Taaza Bites Agreement Terms

1. Acceptance of Services: By subscribing, customers authorize recurring, daily bio-nutritional meal dispatches.
2. Kitchen Health Norms: All therapeutic recipes are prepared in audited FSSAI facilities.
3. Cancellations: Pausing or rescheduling active subscription dates requires a minimum 24-hour advance calendar request.`}
                />
                <div className="flex justify-end">
                  <Button className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs">Save Terms Document</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950/50 border-zinc-800/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-white">Privacy Policy</CardTitle>
                </div>
                <CardDescription className="text-zinc-500">Exclusions, safety, and health data storage norms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea 
                  rows={10}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md p-3 text-xs focus:border-emerald-500 focus:outline-none"
                  defaultValue={`Taaza Bites Privacy Protections

1. Health & Therapeutic Logs: Custom exclusion profiles (allergies, diabetic logs) are kept highly encrypted.
2. Location Coordinates: PIN code areas and active dispatch routes are cached only for live dispatch coordination.
3. Financial ledger tracking: Personal wallet credits and Razorpay transaction IDs are securely stored under standard PCI norms.`}
                />
                <div className="flex justify-end">
                  <Button className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs">Save Privacy Policy</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
