import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LottieLoader } from "@/src/components/common/LottieLoader";

interface AiNutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  healthScore: number;
  nutrition: any;
  weightGoal: any;
}

export default function AiNutritionModal({
  isOpen,
  onClose,
  user,
  healthScore,
  nutrition,
  weightGoal
}: AiNutritionModalProps) {
  const navigate = useNavigate();
  const [aiInput, setAiInput] = React.useState("");
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [aiChatHistory, setAiChatHistory] = React.useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'Friend'}! I'm Dr. Ananya Sen, your AI Clinical Nutrition Director. I've adjusted your dinner to include 15g more protein based on your afternoon activity. How can I fine-tune your meal protocol or energy targets today?`
    }
  ]);

  const handleAskAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput.trim();
    setAiInput("");
    setAiChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/nutrition-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          healthMetrics: {
            user: user?.name,
            healthScore,
            caloriesConsumed: nutrition.calories.consumed,
            proteinConsumed: nutrition.protein.consumed,
            weightGoal
          }
        })
      });
      const data = await res.json();
      const reply = data.response || "Based on your current metabolic health score, we recommend maintaining a 1.8g/kg protein ratio with hydration pacing.";
      setAiChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch {
      setAiChatHistory(prev => [...prev, {
        sender: 'ai',
        text: "For optimal metabolic performance, maintain a consistent protein pacing, drink 500ml water before meals, and allow 3 hours between dinner and sleep."
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Dr. Ananya Sen (AI Nutritionist)</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Clinical Metabolic Intelligence</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 no-scrollbar min-h-[220px]">
              {aiChatHistory.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700/60'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-2xl border border-zinc-700/60">
                    <LottieLoader
                      type="ai"
                      size="sm"
                      text="Analyzing metabolic parameters & macros..."
                    />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAskAiSubmit} className="space-y-3 shrink-0">
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-2 rounded-2xl">
                <input 
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask about protein, recovery, evening snacks..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-zinc-500 px-3 focus:outline-none"
                />
                <button 
                  type="submit" 
                  disabled={isAiLoading || !aiInput.trim()}
                  className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-zinc-950 rounded-xl font-bold transition-all shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold">
                <span>Quick Prompts: "How much protein for dinner?", "Late night craving?"</span>
                <button 
                  type="button"
                  onClick={() => { onClose(); navigate('/dashboard/ai-coach'); }}
                  className="text-emerald-400 hover:underline uppercase tracking-wider"
                >
                  Open Full AI Room &rarr;
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
