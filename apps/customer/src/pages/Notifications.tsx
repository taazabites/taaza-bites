import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { db } from '../firebase/db';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Notification } from "../firebase/collections";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Trash2, 
  Zap, 
  ShoppingBag, 
  MessageSquare,
  Mail,
  Search,
  Truck,
  Gift,
  Clock,
  CheckCircle2,
  Info,
  Sliders
} from "lucide-react";
import { Card, Button } from "@/src/components/ui/primitives";
import { format } from "date-fns";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/context/ToastContext";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!currentUser) {
        setLoading(false);
        return;
    }

    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (val instanceof Date) return val.getTime();
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return new Date(val).getTime() || 0;
          return 0;
        };
        notifs.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
        setNotifications(notifs);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    if (!currentUser) return;
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
      showToast("All caught up!", "success");
    } catch (err) {
      showToast("Failed to mark all as read", "error");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      showToast("Notification deleted", "success");
    } catch (err) {
      showToast("Failed to delete", "error");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || n.type === filter;
    const matchesSearch = (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (n.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'order': return <ShoppingBag className="h-5 w-5 text-emerald-600" />;
      case 'payment': return <Zap className="h-5 w-5 text-blue-600" />;
      case 'support': return <MessageSquare className="h-5 w-5 text-amber-600" />;
      case 'delivery': return <Truck className="h-5 w-5 text-purple-600" />;
      case 'wallet': return <Zap className="h-5 w-5 text-indigo-600" />;
      case 'offer': return <Gift className="h-5 w-5 text-pink-600" />;
      default: return <Bell className="h-5 w-5 text-zinc-600" />;
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem] mb-10" />
        {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-[32px]" />)}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          <div className="hidden md:block">
            <PageHeader 
              title="Intelligence Inbox"
              description="Stay synchronized with your metabolic protocol updates, logistics logs, and precision meal dispatch alerts."
              badge="Communication Node"
              icon={Bell}
              gradient="from-zinc-950 via-zinc-900 to-zinc-950"
            >
              <div className="flex items-center gap-3">
                <Button 
                  onClick={markAllRead}
                  className="bg-white/5 backdrop-blur-md hover:bg-white/10 text-white border border-white/10 rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest"
                >
                  Sync All as Read
                </Button>
                <Link
                  to="/dashboard/settings?tab=settings&sub=notifications"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Sliders className="w-3.5 h-3.5" /> Preference Controls
                </Link>
              </div>
            </PageHeader>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Notifications</h1>
              <button 
                onClick={markAllRead}
                className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              {['all', 'order', 'payment', 'delivery', 'subscription', 'offer', 'support'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                    filter === f ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <Card className="p-20 border-dashed border-2 border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center rounded-[48px] bg-white dark:bg-zinc-900">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-300 dark:text-zinc-700">
                 <Mail className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Inbox Zero</h3>
              <p className="text-zinc-500 font-medium mt-2 max-w-xs leading-relaxed">
                {searchTerm || filter !== 'all' ? "No matches found for your current filter/search. Try broadening your criteria." : "You're all caught up! Your intelligence hub is synchronized and clear."}
              </p>
            </Card>
          ) : (
            <div className="max-w-4xl space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <Card 
                      onClick={() => !note.read && markAsRead(note.id)}
                      className={cn(
                        "p-6 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer group flex items-start gap-6 relative",
                        !note.read && "border-l-4 border-l-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform",
                        !note.read ? "bg-white dark:bg-zinc-800 border-emerald-100 dark:border-emerald-900" : "bg-zinc-50 dark:bg-zinc-800/50"
                      )}>
                         {getIcon(note.type)}
                      </div>

                      <div className="flex-1 min-w-0 pr-10">
                         <div className="flex items-center gap-2 mb-1.5">
                            <h4 className={cn(
                              "text-base font-black truncate",
                              !note.read ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"
                            )}>
                              {note.title}
                            </h4>
                            {!note.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                         </div>
                         <p className={cn(
                           "text-sm font-medium leading-relaxed",
                           !note.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-500"
                         )}>
                           {note.message}
                         </p>
                         <div className="flex items-center gap-3 mt-3">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                             {format(note.createdAt.toDate(), 'dd MMM • hh:mm a')}
                           </p>
                           {note.type && (
                             <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[8px] font-black uppercase tracking-widest text-zinc-500">
                               {note.type}
                             </span>
                           )}
                         </div>
                      </div>

                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(note.id);
                          }}
                          className="p-2.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all"
                         >
                           <Trash2 className="h-4.5 w-4.5" />
                         </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {notifications.length > 5 && (
            <div className="flex items-center justify-center pt-8">
               <Button variant="outline" className="text-xs font-black uppercase tracking-widest text-zinc-500 h-12 px-10 rounded-2xl">
                 Load More History
               </Button>
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}

