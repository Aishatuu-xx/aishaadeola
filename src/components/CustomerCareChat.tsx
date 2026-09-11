import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

interface CustomerCareChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectDrink?: (drinkId: string) => void;
  theme?: 'light' | 'dark';
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: "Warm greetings! Welcome to Shatu's Cozy Cup ☕✨\n\nI'm Shatu's virtual barista & customer care concierge. We are an online-only artisan coffee & boba studio with express doorstep delivery! How can I brighten your day? I can help you explore our menu, customize ingredients, explain our spill-proof thermal delivery, or recommend the perfect blend!",
    timestamp: 'Just now',
    suggestions: [
      'Recommend a warm cozy drink',
      'Tell me about your Boba & Matcha teas',
      'How does spill-proof doorstep delivery work?',
      'What is the difference between Latte & Cappuccino?',
      'Can I customize sweetness and oat milk?',
    ],
  },
];

export const CustomerCareChat: React.FC<CustomerCareChatProps> = ({
  isOpen,
  onToggle,
  onSelectDrink,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('API response failed');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Thank you for asking! Shatu's Cozy Cup is always here to make your day wonderful.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [
          'Order a drink',
          'Explore 3D drink studio',
          'Delivery guarantee',
        ],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Intelligent fallback if backend API is not yet reachable or missing key
      let fallbackReply = "Thank you for reaching out to Shatu's Cozy Cup customer care! ☕✨";
      const qLower = query.toLowerCase();

      if (qLower.includes('latte') && qLower.includes('cappuccino')) {
        fallbackReply =
          "Great question! Both start with rich espresso, but here is the secret:\n\n• Velvet Cappuccino (₦4,200) has equal parts espresso, steamed milk, and a thick airy dome of microfoam dusted with Belgian cocoa.\n• Artisan Vanilla Latte (₦4,500) has more silky textured milk and a delicate top foam layer with hand-poured rosetta or heart latte art.\n\nYou can inspect both in 3D in our Drink Studio right now!";
      } else if (qLower.includes('boba') || qLower.includes('bubble tea') || qLower.includes('pearl')) {
        fallbackReply =
          "Our Boba teas are a customer favorite! 🧋 We slow-cook our cassava tapioca pearls in authentic Okinawa brown sugar every 3 hours for the chewiest bounce. Try the Tiger Brown Sugar Boba (₦4,800) or our Strawberry Cloud Matcha Boba (₦5,200)!";
      } else if (qLower.includes('matcha')) {
        fallbackReply =
          "We use 100% Ceremonial Grade Uji Matcha from Kyoto (from ₦4,600)! It is stone-ground and whisked with bamboo chasen for high L-theanine calm energy without coffee jitters. Delicious with oat milk and brown sugar!";
      } else if (qLower.includes('hour') || qLower.includes('open') || qLower.includes('time')) {
        fallbackReply =
          "Shatu's Cozy Cup online kitchen dispatches daily:\n• Mon - Fri: 7:00 AM - 9:30 PM\n• Sat: 8:00 AM - 10:30 PM\n• Sun: 8:00 AM - 9:00 PM\nAverage doorstep delivery time is 25–35 minutes across the metro area!";
      } else if (qLower.includes('reserve') || qLower.includes('table') || qLower.includes('book') || qLower.includes('visit') || qLower.includes('physical') || qLower.includes('store')) {
        fallbackReply =
          "Notice: Shatu's Cozy Cup is an online-only artisan coffee & boba studio! We do not have a physical walk-in store or table reservations yet. You can order online directly through this app for rapid doorstep delivery in insulated, spill-proof carriers!";
      } else if (qLower.includes('deliver') || qLower.includes('shipping') || qLower.includes('pack')) {
        fallbackReply =
          "All online orders are packaged in double-walled insulated thermal pouches with airtight tamper-evident seals. Hot drinks arrive steaming with intact latte art, and cold boba drinks arrive icy cold!";
      } else if (qLower.includes('recommend') || qLower.includes('mood') || qLower.includes('best') || qLower.includes('price')) {
        fallbackReply =
          "If you want something warm and comforting, try our Velvet Golden Cappuccino (₦4,200) or Vanilla Bean Latte (₦4,500). If you want something refreshing and sweet, go with the Tiger Brown Sugar Boba (₦4,800) or Kyoto Ceremonial Matcha (₦4,600)! 🍵✨";
      }

      const fallbackMsg: ChatMessage = {
        id: `bot-fb-${Date.now()}`,
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Order a drink', 'Explore 3D drink studio', 'Delivery guarantee'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        id="open-customer-care-chat-btn"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] shadow-2xl shadow-[#2B1B16]/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#C28E5C]/50"
        title="Chat with Shatu's Cozy Cup Customer Care"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-[#FFFFFF]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C28E5C] rounded-full ring-2 ring-[#6F4E37] animate-pulse" />
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Customer Care 💬
        </span>
      </button>

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div
          id="customer-care-chat-window"
          className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[520px] rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200 border transition-colors ${
            isDark
              ? 'bg-[#231612] border-[#C28E5C]/40 text-[#F7F0E3]'
              : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
          }`}
        >
          {/* Header - Dark Espresso */}
          <div className="p-4 bg-[#2B1B16] border-b border-[#C28E5C]/20 flex items-center justify-between text-[#FFFFFF]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-[#6F4E37] border border-[#C28E5C]/40 flex items-center justify-center text-xl text-[#FFFFFF]">
                ☕
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#C28E5C] rounded-full ring-2 ring-[#2B1B16]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF] flex items-center gap-1.5">
                  Shatu's Customer Care
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C28E5C] text-[#FFFFFF] font-sans font-bold">
                    Online
                  </span>
                </h4>
                <p className="text-[11px] text-[#F7F0E3]/75 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#C28E5C] rounded-full animate-ping" />
                  Barista concierge on standby
                </p>
              </div>
            </div>

            <button
              id="close-chat-btn"
              onClick={onToggle}
              className="p-1.5 rounded-xl text-[#F7F0E3]/75 hover:text-[#FFFFFF] hover:bg-[#6F4E37]/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin transition-colors ${
              isDark ? 'bg-[#180F0C]' : 'bg-[#F7F0E3]'
            }`}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#6F4E37] text-[#FFFFFF] rounded-br-none shadow-md'
                      : isDark
                      ? 'bg-[#2B1B16] text-[#F7F0E3] border border-[#C28E5C]/35 rounded-bl-none shadow-sm'
                      : 'bg-[#FFFFFF] text-[#2B1B16] border border-[#C28E5C]/30 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] opacity-60 mt-1 px-1">{msg.timestamp}</span>

                {/* Suggestions chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all text-left shadow-sm border ${
                          isDark
                            ? 'bg-[#2B1B16] hover:bg-[#34201A] border-[#C28E5C]/40 text-[#C28E5C]'
                            : 'bg-[#FFFFFF] hover:bg-[#F7F0E3] hover:border-[#6F4E37] border-[#C28E5C]/40 text-[#6F4E37]'
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                className={`flex items-center gap-2 p-3 rounded-2xl border w-fit shadow-sm ${
                  isDark
                    ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3]'
                    : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-[#6F4E37] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#6F4E37] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#6F4E37] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] opacity-70 ml-1">Shatu's barista is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div
            className={`p-3 border-t transition-colors ${
              isDark ? 'bg-[#231612] border-[#C28E5C]/30' : 'bg-[#FFFFFF] border-[#C28E5C]/30'
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about coffee, boba, delivery..."
                className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs placeholder:opacity-50 focus:outline-none focus:border-[#6F4E37] ${
                  isDark
                    ? 'bg-[#180F0C] border-[#C28E5C]/40 text-[#FFFFFF]'
                    : 'bg-[#F7F0E3] border-[#C28E5C]/40 text-[#2B1B16]'
                }`}
              />
              <button
                id="send-customer-care-chat-btn"
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] disabled:opacity-40 text-[#FFFFFF] transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
