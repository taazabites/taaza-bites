import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Sparkles,
  Bot,
  Send,
  Volume2,
  VolumeX,
  Zap,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Circle,
  TrendingUp,
  Apple,
  Heart,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Utensils,
  BookOpen,
  MessageSquare,
  Play,
  Pause,
  Sun,
  Activity,
  Droplet,
  Coffee,
  Check
} from 'lucide-react';
import { Card, Button } from '@/src/components/ui/primitives';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { HealthService } from '@/src/firebase/services';
import { getCustomerAuthHeaders } from '@/src/lib/api-auth';
import { triggerHaptic } from '@/src/utils/haptics';
import { cn } from '@/src/lib/utils';
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";

type SectionTab = 'coach' | 'motivation' | 'meals' | 'weekly' | 'habits' | 'guidance';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  persona?: string;
}

interface MealSuggestion {
  id: string;
  slot: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  glycemicIndex: 'Low' | 'Medium';
  benefits: string[];
  recommendedTime: string;
}

interface HabitTip {
  id: string;
  title: string;
  category: 'Metabolism' | 'Digestion' | 'Hydration' | 'Recovery';
  impact: 'High Impact' | 'Essential';
  description: string;
  actionableStep: string;
  xpBonus: number;
  completed: boolean;
  iconName: string;
}

export default function AICoachPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<SectionTab>('coach');
  const [selectedPersona, setSelectedPersona] = useState<'dr_ananya' | 'coach_marcus' | 'chef_jacques'>('dr_ananya');
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch Health Profile
  React.useEffect(() => {
    if (currentUser) {
      HealthService.getAssessment(currentUser.uid)
        .then(profile => {
          setHealthProfile(profile);
          if (profile) {
            // Update initial AI message based on profile
            setChatMessages(prev => [
              {
                id: 'm1-personalized',
                sender: 'ai',
                text: `Hello ${currentUser?.displayName || 'Friend'}! I'm Dr. Ananya Sen. I've reviewed your ${profile.goal || 'health'} protocol. Given your focus on ${profile.goals?.join(', ') || 'nutrition'}, we should prioritize ${profile.calculatedProtein || 120}g of protein today. Ready to optimize?`,
                timestamp: '10:00 AM',
                persona: 'Dr. Ananya Sen'
              }
            ]);
          }
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [currentUser]);
  
  // Voice Simulation State
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  
  // AI Chat States
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${currentUser?.displayName || 'Friend'}! I'm Dr. Ananya Sen, your AI Clinical Nutrition Director at TaazaBites. Based on your current metabolic protocol, you are on track for peak protein synthesis today. How can I fine-tune your nutrition or energy levels?`,
      timestamp: '10:00 AM',
      persona: 'Dr. Ananya Sen'
    }
  ]);

  // Audio briefing play/pause
  const [isPlayingAudioBriefing, setIsPlayingAudioBriefing] = useState(false);

  // Morning Ritual Checklist
  const [rituals, setRituals] = useState([
    { id: 'r1', title: '500ml Electrolyte Water on Waking', done: true },
    { id: 'r2', title: '10-Minute Morning Sunlight Exposure', done: true },
    { id: 'r3', title: 'Review Today’s Macro Target (140g Protein)', done: false },
    { id: 'r4', title: 'Mindful 5-Deep Breath Pause Before Meal', done: false }
  ]);

  // AI Meal Suggestions State
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestion[]>([
    {
      id: 'ms1',
      slot: 'Breakfast',
      name: 'Organic Avocuddle Protein Omelette',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fm=webp&fit=crop&q=80&w=500',
      calories: 420,
      protein: 32,
      carbs: 12,
      fats: 26,
      glycemicIndex: 'Low',
      benefits: ['Sustained Brain Energy', 'Zero Insulin Spike', 'Rich in Omega-9'],
      recommendedTime: '08:30 AM'
    },
    {
      id: 'ms2',
      slot: 'Lunch',
      name: 'Herbed Wild Salmon & Black Rice Bowl',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&fit=crop&q=80&w=500',
      calories: 580,
      protein: 44,
      carbs: 42,
      fats: 22,
      glycemicIndex: 'Low',
      benefits: ['Lean Muscle Recovery', 'Antioxidant Rich', 'High Fiber'],
      recommendedTime: '01:15 PM'
    },
    {
      id: 'ms3',
      slot: 'Snack',
      name: 'Greek Yogurt & Roasted Pumpkin Seed Parfait',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fm=webp&fit=crop&q=80&w=500',
      calories: 240,
      protein: 20,
      carbs: 18,
      fats: 8,
      glycemicIndex: 'Low',
      benefits: ['Gut Microbiome Boost', 'High Magnesium', 'Satiety Shield'],
      recommendedTime: '05:00 PM'
    },
    {
      id: 'ms4',
      slot: 'Dinner',
      name: 'Grilled Tofu Steak with Rosemary Asparagus',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&fit=crop&q=80&w=500',
      calories: 460,
      protein: 36,
      carbs: 22,
      fats: 20,
      glycemicIndex: 'Low',
      benefits: ['Easy Evening Digestion', 'Sleep Melatonin Precursor', 'Low Glycemic'],
      recommendedTime: '08:00 PM'
    }
  ]);

  // Habit Tips State
  const [habitTips, setHabitTips] = useState<HabitTip[]>([
    {
      id: 'h1',
      title: '10-Minute Post-Meal Stroll',
      category: 'Metabolism',
      impact: 'High Impact',
      description: 'Walking gently for 10 minutes immediately after lunch reduces blood glucose peak by up to 28%.',
      actionableStep: 'Take a short 10-min stroll after lunch today.',
      xpBonus: 30,
      completed: true,
      iconName: 'Activity'
    },
    {
      id: 'h2',
      title: '3-Hour Sleep-Digestion Buffer',
      category: 'Recovery',
      impact: 'Essential',
      description: 'Finishing your last meal 3 hours before sleep increases deep slow-wave sleep duration by 18%.',
      actionableStep: 'Finish dinner by 8:30 PM tonight.',
      xpBonus: 25,
      completed: false,
      iconName: 'Coffee'
    },
    {
      id: 'h3',
      title: 'Electrolyte Pacing Strategy',
      category: 'Hydration',
      impact: 'High Impact',
      description: 'Sip 250ml water with a pinch of Himalayan pink salt 20 minutes before meals to optimize gastric acid.',
      actionableStep: 'Drink electrolyte water before dinner.',
      xpBonus: 20,
      completed: false,
      iconName: 'Droplet'
    },
    {
      id: 'h4',
      title: 'Fiber-First Meal Sequence',
      category: 'Digestion',
      impact: 'Essential',
      description: 'Eat veggies and fiber before protein and carbs to coat the intestinal wall and blunt sugar spikes.',
      actionableStep: 'Eat greens/salad first during dinner.',
      xpBonus: 25,
      completed: true,
      iconName: 'Apple'
    }
  ]);

  // Handle Sending AI Prompt
  const handleSendPrompt = async (textToSend?: string) => {
    const promptText = textToSend || inputMessage;
    if (!promptText.trim()) return;

    triggerHaptic('light');

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsThinking(true);

    try {
      // Call backend AI route
      const res = await fetch('/api/ai/nutrition-advisory', {
        method: 'POST',
        headers: await getCustomerAuthHeaders(),
        body: JSON.stringify({
          question: promptText,
          healthMetrics: healthProfile ? {
            goal: healthProfile.goal || healthProfile.goals?.join(', '),
            currentStreak: 18,
            weightKg: healthProfile.weight || 72,
            targetCalories: healthProfile.calculatedCalories || 2100,
            targetProtein: healthProfile.calculatedProtein || 140,
            persona: selectedPersona
          } : {
            goal: 'High Protein Nutrition Target',
            currentStreak: 18,
            weightKg: 72,
            targetCalories: 2100,
            consumedCalories: 1420,
            persona: selectedPersona
          }
        })
      });

      const data = await res.json();
      const replyText = data.response || "Your nutrition plan is on track. Stay hydrated and enjoy your fresh meals!";

      const aiMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: selectedPersona === 'dr_ananya' ? 'Dr. Ananya Sen (Clinical Director)' : selectedPersona === 'coach_marcus' ? 'Coach Marcus (Performance)' : 'Chef Jacques (Culinary)'
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: "For best health results, aim for a balanced protein intake, drink plenty of water, and get good restful sleep.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: 'Dr. Ananya Sen'
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Toggle Habit Completion
  const toggleHabit = (habitId: string) => {
    triggerHaptic('medium');
    setHabitTips(prev => prev.map(h => {
      if (h.id === habitId) {
        const nextState = !h.completed;
        if (nextState) {
          showToast(`Completed habit: "${h.title}"! +${h.xpBonus} XP earned! 🎉`, "success");
        }
        return { ...h, completed: nextState };
      }
      return h;
    }));
  };

  // Toggle Morning Ritual
  const toggleRitual = (ritualId: string) => {
    triggerHaptic('light');
    setRituals(prev => prev.map(r => r.id === ritualId ? { ...r, done: !r.done } : r));
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">

          {/* Master AI Coach Header */}
          <PageHeader 
            title="AI Health & Nutrition Advisor"
            description="Get real-time answers, custom meal suggestions, daily motivational tips, habit tracking, and easy nutrition advice."
            badge="Personalized AI Health Coach"
            icon={BrainCircuit}
            gradient="from-zinc-950 via-zinc-900 to-emerald-950"
          >
            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Active Streak</p>
                <p className="text-lg font-black text-white">18 Days Active</p>
              </div>
            </div>
          </PageHeader>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2">
            {[
              { id: 'coach', label: 'AI Coach Chat', icon: Bot, color: 'emerald' },
              { id: 'motivation', label: 'Daily Motivation', icon: Sun, color: 'amber' },
              { id: 'meals', label: 'Meal Suggestions', icon: Utensils, color: 'sky' },
              { id: 'weekly', label: 'Weekly Summary', icon: TrendingUp, color: 'indigo' },
              { id: 'habits', label: 'Habit Tips', icon: Activity, color: 'rose' },
              { id: 'guidance', label: 'Nutrition Guidance', icon: BookOpen, color: 'purple' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as SectionTab); triggerHaptic('light'); }}
                className={cn(
                  "relative px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-white dark:text-zinc-950"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="aiCoachActiveTabPill"
                    className="absolute inset-0 bg-zinc-950 dark:bg-white rounded-2xl shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >

        {/* SECTION 1: AI COACH CHAT */}
        {activeTab === 'coach' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Chat Interface */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex flex-col h-[620px] justify-between">
                
                {/* Chat Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                        {selectedPersona === 'dr_ananya' ? 'Dr. Ananya Sen' : selectedPersona === 'coach_marcus' ? 'Coach Marcus' : 'Chef Jacques'}
                      </h3>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        Online • AI Health & Nutrition Advisor
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsVoicePlaying(!isVoicePlaying)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer",
                      isVoicePlaying ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {isVoicePlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    {isVoicePlaying ? 'Voice Active' : 'Mute Voice'}
                  </button>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%] space-y-1",
                        msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {msg.persona && (
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-2">
                          {msg.persona}
                        </span>
                      )}
                      <div
                        className={cn(
                          "p-4 rounded-3xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm",
                          msg.sender === 'user'
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none"
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-zinc-400 font-bold px-2">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isThinking && (
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit animate-pulse">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                      Analyzing metabolic parameters & generating response...
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {/* Quick Prompts */}
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {[
                      "Adjust macros for heavy workout",
                      "Suggest low-carb dinner swap",
                      "How to avoid afternoon energy slumps?",
                      "What is my protein target today?"
                    ].map(p => (
                      <button
                        key={p}
                        onClick={() => handleSendPrompt(p)}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-500/10 hover:text-emerald-600 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        ⚡ {p}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask Dr. Ananya about your meal protocol, macros, or energy..."
                      className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500"
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || isThinking}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-5 font-black text-xs uppercase tracking-widest shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            {/* Persona Selector & Bio Controls */}
            <div className="space-y-6">
              <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-4">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Select AI Coach Persona
                </h4>

                <div className="space-y-3">
                  {[
                    { id: 'dr_ananya', name: 'Dr. Ananya Sen', title: 'Clinical Nutrition Director', icon: '🩺', desc: 'Focuses on biometrics, gut health & glycemic control' },
                    { id: 'coach_marcus', name: 'Coach Marcus', title: 'High-Performance Trainer', icon: '⚡', desc: 'Optimized for muscle synthesis, stamina & workout fuel' },
                    { id: 'chef_jacques', name: 'Chef Jacques', title: 'Executive Gourmet Director', icon: '👨‍🍳', desc: 'Specializes in flavor pairing & artisanal low-carb substitutes' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPersona(p.id as any); triggerHaptic('light'); }}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer",
                        selectedPersona === p.id
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <h5 className="text-xs font-black text-zinc-900 dark:text-white">{p.name}</h5>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{p.title}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Today's Target Summary Box */}
              <Card className="p-6 bg-gradient-to-br from-emerald-900 via-zinc-900 to-teal-950 text-white rounded-[2.5rem] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Target Metrics</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Protein Consumed</span>
                    <span className="text-emerald-400">112g / 140g</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[80%]" />
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* SECTION 2: DAILY MOTIVATION */}
        {activeTab === 'motivation' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Daily Quote Hero Banner */}
            <Card className="p-8 sm:p-12 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="relative z-10 space-y-6 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-white/20 border border-white/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-100" />
                    Daily Mindset & Focus
                  </span>
                  <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">
                    July 22, 2026
                  </span>
                </div>

                <blockquote className="text-2xl sm:text-4xl font-black leading-tight italic tracking-tight">
                  "Consistency is not about perfection. It’s about fueling your body with intention every single day."
                </blockquote>

                <div className="flex items-center gap-4 pt-2">
                  <Button
                    onClick={() => {
                      setIsPlayingAudioBriefing(!isPlayingAudioBriefing);
                      showToast(isPlayingAudioBriefing ? "Audio briefing paused" : "Playing 60-second AI Mindset Briefing 🎧", "info");
                    }}
                    className="bg-white text-zinc-950 hover:bg-zinc-100 font-black text-xs uppercase tracking-widest px-6 h-12 rounded-2xl shadow-xl flex items-center gap-2"
                  >
                    {isPlayingAudioBriefing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlayingAudioBriefing ? "Pause Audio Briefing" : "Listen to Morning Audio (1 min)"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Morning Ritual Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">Morning Metabolic Rituals</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Complete your 4 daily foundational actions</p>
                </div>

                <div className="space-y-3">
                  {rituals.map(r => (
                    <button
                      key={r.id}
                      onClick={() => toggleRitual(r.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer",
                        r.done
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-zinc-900 dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                      )}
                    >
                      <span className={cn("text-xs font-black", r.done && "line-through opacity-80")}>{r.title}</span>
                      {r.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Streak & Fuel Energy Display */}
              <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Energy Momentum
                  </span>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">18-Day Active Subscription Streak</h3>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    You have maintained continuous protein compliance for 18 days! You are in the top 5% of TaazaBites subscribers for metabolic consistency.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="w-8 h-8 text-amber-500 animate-bounce" />
                    <div>
                      <p className="text-xs font-black text-amber-900 dark:text-amber-200">Next Streak Reward</p>
                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Reach Day 21 to claim +500 XP & ₹150 Wallet Bonus</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* SECTION 3: MEAL SUGGESTIONS */}
        {activeTab === 'meals' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">AI Tailored Meal Recommendations</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Calibrated specifically for your 2,100 kcal & 140g protein daily goal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mealSuggestions.map(meal => (
                <Card key={meal.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between space-y-5 group hover:border-sky-500/50 transition-all">
                  <div className="space-y-4">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" loading="lazy" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-zinc-950/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                        {meal.slot} • {meal.recommendedTime}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-zinc-900 dark:text-white leading-tight">{meal.name}</h3>
                      
                      {/* Macro Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">Calories</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white">{meal.calories}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase">Protein</p>
                          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{meal.protein}g</p>
                        </div>
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">Carbs</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white">{meal.carbs}g</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {meal.benefits.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      triggerHaptic('medium');
                      showToast(`Added "${meal.name}" to your upcoming meal slot! 🎉`, "success");
                    }}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-widest rounded-xl h-11 shadow-lg shadow-sky-500/20"
                  >
                    Select for Today
                  </Button>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* SECTION 4: WEEKLY SUMMARY */}
        {activeTab === 'weekly' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Macro Compliance Score */}
              <Card className="p-8 bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 text-white rounded-[2.5rem] shadow-2xl space-y-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Weekly Performance</span>
                  <Award className="w-6 h-6 text-indigo-400" />
                </div>

                <div className="text-center space-y-2 py-4">
                  <span className="text-6xl font-black tracking-tight text-indigo-400">94%</span>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-300">Macro Compliance Index</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10 text-xs font-bold text-zinc-300">
                  <div className="flex justify-between">
                    <span>Target Protein</span>
                    <span className="text-emerald-400">980g / 980g (100%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calorie Accuracy</span>
                    <span className="text-indigo-300">92% Precision</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber Standard</span>
                    <span className="text-amber-400">28g / 30g Avg</span>
                  </div>
                </div>
              </Card>

              {/* Weekly AI Verdict & Key Wins */}
              <Card className="lg:col-span-2 p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">AI Clinical Nutritionist Verdict</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Summary for Week 29, 2026</p>
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                  "Your metabolic response over the last 7 days shows exceptional insulin sensitivity. Maintaining high protein during lunch prevented late-afternoon cortisol spikes. For next week, increase hydration prior to 6:00 PM."
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">🏆 Top Weekly Win</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">Metabolic protein threshold met on 7 out of 7 days!</p>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">💡 Optimization Target</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">Increase evening magnesium & fiber by 5g.</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* SECTION 5: HABIT TIPS */}
        {activeTab === 'habits' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Metabolic & Lifestyle Habit Tips</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Bite-sized micro-habits backed by clinical bio-hacking research</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {habitTips.map(h => (
                <Card
                  key={h.id}
                  className={cn(
                    "p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between space-y-6",
                    h.completed
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50"
                      : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-sm"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {h.category}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        +{h.xpBonus} XP
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white">{h.title}</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mt-2">{h.description}</p>
                    </div>

                    <div className="p-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      🎯 Step: {h.actionableStep}
                    </div>
                  </div>

                  <Button
                    onClick={() => toggleHabit(h.id)}
                    className={cn(
                      "w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      h.completed
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950"
                    )}
                  >
                    {h.completed ? "Completed Today ✓" : "Mark Done Today"}
                  </Button>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* SECTION 6: NUTRITION GUIDANCE */}
        {activeTab === 'guidance' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Glycemic Index Guide */}
              <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xl">
                  🩸
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Glycemic Load Control</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  All TaazaBites meals maintain a Glycemic Index under 45. This prevents insulin spikes, protecting long-term pancreatic health and maintaining stable mental clarity.
                </p>
              </Card>

              {/* Protein Bioavailability */}
              <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xl">
                  🥩
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Protein Bioavailability</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  We prioritize complete amino acid profiles (PDCAAS score = 1.0) using grass-fed whey, wild salmon, organic tofu, and cage-free eggs for maximum muscle absorption.
                </p>
              </Card>

              {/* Allergy Safeguard */}
              <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-xl">
                  🛡️
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Allergy & Intolerance Safeguard</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Your profile excludes gluten, lactose, and refined seed oils. Kitchen protocols ensure 100% zero cross-contamination for maximum gut peace of mind.
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        </motion.div>
      </AnimatePresence>
      </div>
      </PageTransition>
    </DashboardLayout>
  );
}
