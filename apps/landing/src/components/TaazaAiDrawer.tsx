/**
 * @file TaazaAiDrawer.tsx
 * @description A premium, side-sliding interactive AI Nutritionist Coach drawer.
 * Connects directly to the server-side Gemini endpoint under /api/faq-ai to provide
 * instant responses to user questions on macro goals, delivery slots, and diet subscriptions.
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, MessageSquare, ArrowRight, User } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface TaazaAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaazaAiDrawer: React.FC<TaazaAiDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Namaste! I am your dedicated nutrition & healthy meal concierge in Bengaluru. How can I help optimize your macros, suggest meal plans, or manage your daily subscription slots today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);

  // Auto-scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/faq-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend.trim() }),
      });

      if (!response.ok) {
        throw new Error("Gemini consultation failed");
      }

      const data = await response.json();

      const aiMsg: Message = {
        sender: "ai",
        text: data.answer || "I received your query but encountered a processing delay. How else can I assist?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI error:", error);
      const errorMsg: Message = {
        sender: "ai",
        text: "I'm sorry, my neural link is temporarily offline. Feel free to chat with our 24/7 WhatsApp concierge at +91 7975771457!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Swipe gestures on mobile to close the side drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartRef.current;

    // Swipe right to close (drawer slides out to the right)
    if (deltaX > 60) {
      onClose();
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const suggestionChips = [
    "Recommend a weight loss diet plan",
    "Do you deliver to Indiranagar & HSR Layout?",
    "Explain flexible pausing and credits",
    "What packaging materials are used?",
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Side Sliding Drawer Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-[#FFF8F0] z-[1002] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col will-change-transform ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        id="panel-taaza-ai-drawer"
      >
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-[#059669]/10 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center relative shadow-sm border border-[#059669]/10">
              <Bot className="w-5 h-5 text-[#059669]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">Support Concierge</h2>
                <span className="bg-[#059669]/10 text-[#059669] text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">Your 24/7 Digital Nutrition Concierge</p>
            </div>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-[#1A1A1A] hover:bg-emerald-50 hover:text-[#059669] transition-all active:scale-95 shadow-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Notification Banner */}
        <div className="bg-[#FFF8F0] border-b border-[#059669]/5 px-5 py-2.5 flex items-start gap-2">
          <span className="text-xs shrink-0 mt-0.5">💡</span>
          <p className="text-[11px] text-zinc-600 leading-normal">
            Ask about customized diets, Bengaluru delivery limits, sustainable packaging, or pausing plans. Swipe right on mobile to close!
          </p>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-gradient-to-b from-white/30 to-transparent">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs border ${
                  msg.sender === "user"
                    ? "bg-[#E6F4EA] border-[#059669]/10 text-[#059669]"
                    : "bg-white border-zinc-100 text-zinc-500"
                }`}
              >
                {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-[#059669] text-white rounded-tr-none font-medium"
                    : "bg-white border border-[#059669]/10 text-gray-800 rounded-tl-none font-light"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span
                  className={`text-[9px] mt-1.5 block text-right font-mono ${
                    msg.sender === "user" ? "text-emerald-100" : "text-zinc-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-white border border-zinc-100 text-zinc-400 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#059669]/10 text-gray-800 rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#059669]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2.5 h-2.5 bg-[#059669]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2.5 h-2.5 bg-[#059669]/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !isLoading && (
          <div className="px-5 py-3 border-t border-[#059669]/5 bg-white/40">
            <p className="text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-2">Try asking:</p>
            <div className="flex flex-col gap-2">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip)}
                  className="w-full text-left text-xs bg-white border border-[#059669]/10 hover:border-[#059669] text-gray-700 px-3 py-2 rounded-xl transition-all hover:bg-[#E6F4EA] flex items-center justify-between group active:scale-[0.99]"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#059669] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Input Area */}
        <form onSubmit={handleFormSubmit} className="p-4 border-t border-[#059669]/10 bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your nutrition query..."
            disabled={isLoading}
            className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-zinc-400 transition-all disabled:opacity-50"
            maxLength={200}
            required
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 bg-[#059669] hover:bg-[#047857] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shadow-md shadow-[#059669]/20"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};
