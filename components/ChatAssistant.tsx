import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import { chatWithCustomsAgent } from '../services/geminiService';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  destinationCountry: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose, destinationCountry }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', text: `Hi there! I'm your customs expert. Ask me anything about bringing food items, bans, or declarations!` }
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithCustomsAgent(history, userMsg, destinationCountry);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Chat Container */}
      <div className="relative bg-white w-full sm:max-w-lg h-[100dvh] sm:h-[80vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-20 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center shadow-sm border border-brand-100">
                <Bot className="w-7 h-7 text-brand-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">Customs Expert</h3>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Online • {destinationCountry}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ChevronDown className="w-6 h-6 sm:hidden" />
            <X className="w-6 h-6 hidden sm:block" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 border
                ${msg.role === 'user' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-brand-500 border-slate-200'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl shadow-sm text-base leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-brand-500 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                 <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200 flex items-center gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 pb-8 sm:pb-4">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about bans, fines, or rules..."
              className="w-full pl-6 pr-14 py-4 rounded-full bg-slate-100 text-slate-900 font-medium text-base placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-200 border border-transparent outline-none transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChatAssistant;