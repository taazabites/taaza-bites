import { cn } from "@/src/lib/utils";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Activity, Database, ShieldCheck, 
  Sparkles, Stethoscope, LineChart, Bell, 
  Workflow, Zap, Lock, Users, Apple, HeartPulse, Target
} from 'lucide-react';
import { Card } from '../components/ui/primitives';
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";

export default function AIEnginePage() {
  const [activeTab, setActiveTab] = useState('architecture');

  const tabs = [
    { id: 'architecture', label: 'Architecture', icon: BrainCircuit },
    { id: 'logic', label: 'Recommendation', icon: Zap },
    { id: 'datamodel', label: 'Data Model', icon: Database },
    { id: 'workflow', label: 'Workflow', icon: Stethoscope },
    { id: 'notifications', label: 'Strategy', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'roadmap', label: 'Roadmap', icon: Target },
    { id: 'security', label: 'Security', icon: ShieldCheck }
  ];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          
          <PageHeader 
            title="AI Nutrition Engine"
            description="The personalized brain powering adaptive meal protocols, dynamic macro-calibration, and predictive health insights for 500,000+ subscribers."
            badge="Core Intelligence"
            icon={BrainCircuit}
            gradient="from-emerald-950 via-zinc-900 to-emerald-950"
          />

          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar border-b border-zinc-200 dark:border-zinc-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.main
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'architecture' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-8 shadow-sm">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                        <BrainCircuit className="w-8 h-8" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">System Architecture</h3>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                          A multi-layered intelligence system connecting biometric data, meal telemetry, and clinical thresholds.
                        </p>
                      </div>
                      <ul className="space-y-4 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        <li className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <span className="text-zinc-900 dark:text-white block mb-1">Ingestion Layer</span>
                            <span className="text-zinc-500 dark:text-zinc-500 font-medium">Apple HealthKit, Oura, Wearables, User Inputs</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <span className="text-zinc-900 dark:text-white block mb-1">Processing Core (Gemini AI)</span>
                            <span className="text-zinc-500 dark:text-zinc-500 font-medium">Macro-calibration, pattern recognition, symptom tracking</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <span className="text-zinc-900 dark:text-white block mb-1">Output Layer</span>
                            <span className="text-zinc-500 dark:text-zinc-500 font-medium">Personalized Menus, Predictive Insights, Coach Chat</span>
                          </div>
                        </li>
                      </ul>
                    </Card>

                    <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-8 shadow-sm">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500/10 text-orange-600 flex items-center justify-center shadow-inner">
                        <Workflow className="w-8 h-8" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Personalization Flow</h3>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                          Dynamic pipeline transforming raw metadata into precision nutrition protocols.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {[
                          { step: 1, title: 'Intake Assessment', desc: 'Baseline biometrics & lifestyle data' },
                          { step: 2, title: 'Macro Formulation', desc: 'Calculate exact BMR and target macros' },
                          { step: 3, title: 'Menu Generation', desc: 'Select dishes avoiding allergens & dislikes' },
                          { step: 4, title: 'Daily Telemetry', desc: 'Adjust next day based on sleep/activity' }
                        ].map(s => (
                          <div key={s.step} className="flex gap-5 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group hover:border-emerald-500/30 transition-all">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center text-xs font-black text-zinc-500 shrink-0 transition-all">
                              {s.step}
                            </div>
                            <div>
                              <p className="text-sm font-black text-zinc-900 dark:text-white">{s.title}</p>
                              <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                 </div>
              )}

              {activeTab === 'logic' && (
                <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-8">Dynamic Recommendation Logic</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: "Caloric Needs", formula: "Mifflin-St Jeor + Activity Multiplier", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/5" },
                      { title: "Protein Target", formula: "1.6g - 2.2g per kg (based on goals)", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/5" },
                      { title: "Carb Cycling", formula: "Higher carbs on high activity days", icon: Apple, color: "text-orange-500", bg: "bg-orange-500/5" }
                    ].map(item => (
                      <div key={item.title} className={cn("p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800", item.bg)}>
                        <item.icon className={cn("w-10 h-10 mb-6", item.color)} />
                        <h4 className="text-lg font-black text-zinc-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed">{item.formula}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeTab === 'datamodel' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Firestore Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { coll: 'users', fields: ['biometrics', 'goals', 'allergies', 'lifestyle_tags'] },
                      { coll: 'health_logs', fields: ['date', 'weight', 'calories_consumed', 'water_ml', 'hrv', 'sleep_score'] },
                      { coll: 'ai_recommendations', fields: ['timestamp', 'suggested_menu', 'macro_targets', 'rationale'] },
                      { coll: 'meal_telemetry', fields: ['meal_id', 'completion_rate', 'customer_rating', 'glucose_spike_estimated'] }
                    ].map(doc => (
                      <Card key={doc.coll} className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                            <Database className="w-5 h-5" />
                          </div>
                          <h4 className="font-black text-zinc-900 dark:text-white font-mono text-sm">{doc.coll}</h4>
                        </div>
                        <ul className="space-y-3">
                          {doc.fields.map(f => (
                            <li key={f} className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                              {f}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'workflow' && (
                <Card className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-950 via-zinc-900 to-indigo-950 border border-zinc-800 space-y-8 text-white">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <Stethoscope className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black">Clinical Workspace</h3>
                      <p className="text-sm text-zinc-400 font-medium">Human-in-the-loop oversight for high-risk profiles.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <h4 className="text-base font-black mb-3">Flagged Profiles Queue</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed font-medium">AI flags customers with conflicting conditions (e.g., Keto + Thyroid issues) for manual expert review.</p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <h4 className="text-base font-black mb-3">Protocol Overrides</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed font-medium">Nutritionists can lock specific macro ratios or ban ingredients globally for a user, overriding AI suggestions.</p>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'analytics' && (
                <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                   <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-8">Population Health Analytics</h3>
                   <div className="h-80 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center flex-col gap-4 text-center p-10">
                      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                        <LineChart className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-zinc-900 dark:text-white">Aggregate Macro Adherence vs Retention</p>
                        <p className="text-sm text-zinc-500 font-medium max-w-lg mt-2">Tracking how precise protein fulfillment correlates with 90-day subscription renewals across global cohorts.</p>
                      </div>
                   </div>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                   <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-8">Proactive Notification Strategy</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {[
                       { type: 'Meal Reminders', timing: '90m before meal', desc: 'Hydration and meal prep anticipation.' },
                       { type: 'Weekly Report', timing: 'Sunday 9:00 AM', desc: 'Progress visualization and next week protocol.' },
                       { type: 'Macro Alert', timing: 'Post-Meal', desc: 'Real-time adjustments for dinner if lunch missed targets.' },
                       { type: 'Subscription', timing: '3 Days Before Renewal', desc: 'Menu preview and AI-suggested swaps.' }
                     ].map(n => (
                       <div key={n.type} className="p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex gap-6 hover:translate-y-[-2px] transition-all">
                         <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm text-emerald-500 shrink-0">
                           <Bell className="w-6 h-6" />
                         </div>
                         <div>
                           <p className="text-base font-black text-zinc-900 dark:text-white mb-1">{n.type}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">{n.timing}</p>
                           <p className="text-sm text-zinc-500 font-medium leading-relaxed">{n.desc}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </Card>
              )}

              {activeTab === 'roadmap' && (
                <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                   <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-10">Future AI Roadmap</h3>
                   <div className="space-y-6">
                     {[
                       { q: 'Q3 2026', f: 'Continuous Glucose Monitor (CGM) API Integration', status: 'In Design' },
                       { q: 'Q4 2026', f: 'Predictive Fatigue Modeling via Oura Ring Data', status: 'Planned' },
                       { q: 'Q1 2027', f: 'Microbiome-Specific Menu Generation', status: 'Research' },
                       { q: 'Q2 2027', f: 'Hyper-local Sourcing AI Supply Chain Optimization', status: 'Backlog' }
                     ].map(r => (
                       <div key={r.q} className="flex flex-col sm:flex-row sm:items-center gap-6 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 group hover:border-emerald-500/20 transition-all">
                         <div className="flex items-center justify-between w-full sm:w-auto">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-full whitespace-nowrap">{r.q}</span>
                            <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-zinc-400">{r.status}</span>
                         </div>
                         <span className="text-base font-black text-zinc-900 dark:text-white flex-1">{r.f}</span>
                         <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-4 py-2 rounded-full">{r.status}</span>
                       </div>
                     ))}
                   </div>
                </Card>
              )}

              {activeTab === 'security' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6 shadow-sm">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 text-rose-600 flex items-center justify-center shadow-inner">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Data Privacy</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        Health data (weight, conditions) is encrypted at rest using AES-256. PII is decoupled from biometric telemetry in all population-level analytics views.
                      </p>
                    </div>
                  </Card>
                  <Card className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6 shadow-sm">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Ethical AI Guardrails</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        The AI is strictly programmed to never diagnose diseases. Any query regarding severe symptoms triggers an immediate fallback to a human clinician.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

            </motion.main>
          </AnimatePresence>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
