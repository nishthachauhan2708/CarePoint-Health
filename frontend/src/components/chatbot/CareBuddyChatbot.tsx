import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, Sparkles, ChevronRight, 
  PhoneCall, Clock, Calendar, ShieldAlert, ArrowRight, UserCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestedActions?: { label: string; url: string }[];
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  "What are the OPD timings?",
  "Is Dr. Priya Nair available?",
  "What are the consultation fees?",
  "How do I book an appointment?",
  "24/7 Emergency Helpline"
];

export const CareBuddyChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am **Care Buddy**, your virtual hospital assistant at CareHealth Point.\n\nI can answer questions regarding our **specialist doctors, OPD schedules, department services, consultation fees, and appointment bookings**.\n\nHow can I help you today?",
      suggestedActions: [
        { label: "OPD Timings", url: "/#services" },
        { label: "Find Specialist", url: "/doctors" },
        { label: "Emergency Helpline", url: "/#contact" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.chatbot.sendMessage(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply || "I am here to help. Could you please specify your query regarding hospital services or doctor schedules?",
        suggestedActions: res.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Our hospital information line is active. For direct appointments, you can browse our **[Doctor Directory](/doctors)**, or for urgent emergency care, call our 24/7 hotline at **+91-1800-CARE-NOW**.",
        suggestedActions: [
          { label: "Doctor Directory", url: "/doctors" },
          { label: "Emergency Contact", url: "/#contact" }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple Markdown renderer for bold, bullets and newlines
  const renderFormattedText = (raw: string) => {
    const paragraphs = raw.split('\n\n');
    return (
      <div className="space-y-2">
        {paragraphs.map((p, i) => {
          const lines = p.split('\n');
          return (
            <div key={i} className="space-y-1">
              {lines.map((line, j) => {
                const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                const cleanLine = isBullet ? line.replace(/^[\s•-]+/, '').trim() : line;
                
                // Parse bold **text**
                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                const content = parts.map((part, k) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={k} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });

                if (isBullet) {
                  return (
                    <div key={j} className="flex items-start gap-1.5 pl-1 text-[11px] leading-relaxed">
                      <span className="text-teal-600 font-bold shrink-0">•</span>
                      <span>{content}</span>
                    </div>
                  );
                }

                return <p key={j} className="text-[11px] leading-relaxed">{content}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-teal-600 text-white shadow-2xl hover:bg-teal-700 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-300"
            aria-label="Open Care Buddy Hospital Assistant"
          >
            {/* Pulsing ring indicator */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>

            <div className="flex items-center justify-center">
              <Bot className="w-7 h-7 text-white group-hover:rotate-6 transition-transform" />
            </div>

            {/* Hover Tooltip */}
            <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              Ask Care Buddy 👋
            </span>
          </button>
        ) : null}
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">Care Buddy</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-teal-100 font-medium">CareHealth Point Hospital Guide</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Safety Notice Banner */}
          <div className="bg-amber-50/90 border-b border-amber-200/70 px-3 py-1.5 text-[10px] text-amber-800 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Hospital Guide. Simulated Demo Hotline: <strong>+91-1800-CARE-NOW</strong> (For real emergencies call 112).</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  {m.sender === 'bot' ? renderFormattedText(m.text) : <p className="leading-relaxed">{m.text}</p>}

                  {/* Suggested actions inside bot reply */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.suggestedActions.map((action, i) => (
                        <Link
                          key={i}
                          to={action.url}
                          onClick={() => {
                            if (action.url.startsWith('/#')) {
                              // Allow jump
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[10px] font-bold border border-teal-200/60 transition-colors"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs pl-2">
                <Bot className="w-4 h-4 text-teal-600 animate-spin" />
                <span className="text-[11px] font-medium text-slate-500">Care Buddy is checking hospital records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips (when few messages) */}
          {messages.length <= 3 && !isTyping && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
              {INITIAL_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200 transition-colors shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about timings, doctors, fees, or appointments..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 pl-3.5 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="button"
                disabled={!inputText.trim() || isTyping}
                onClick={() => handleSendMessage()}
                className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
