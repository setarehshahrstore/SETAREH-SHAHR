import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../AppContext';
import { useAuth } from '../AuthContext';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSession, ChatMessage } from '../types';

export const CustomerChat: React.FC = () => {
  const { state, addChatSession, addChatMessage, markChatReadByCustomer, updateChatStatus } = useAppState();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or find session
  useEffect(() => {
    if (isOpen && !sessionId) {
      // Find existing session for logged in user or based on localStorage
      const savedSessionId = localStorage.getItem('STC_GUEST_CHAT_ID');
      let existingSession = state.chatSessions?.find(s => 
        (user && s.customerId === user.id) || 
        (!user && savedSessionId && s.id === savedSessionId)
      );

      if (existingSession) {
        setSessionId(existingSession.id);
      } else {
        // Create new session
        const newId = Date.now().toString();
        if (!user) {
          localStorage.setItem('STC_GUEST_CHAT_ID', newId);
        }
        
        const newSession: ChatSession = {
          id: newId,
          customerId: user?.id,
          customerName: user ? user.fullName : 'مشتری جدید',
          status: 'Active',
          unreadByAdmin: 0,
          unreadByCustomer: 0,
          messages: [
            {
              id: Date.now().toString() + '-init',
              sender: 'AI',
              text: 'سلام! به فروشگاه ستاره شهر خوش آمدید. چطور می‌توانم کمکتان کنم؟',
              timestamp: new Date().toISOString()
            }
          ]
        };
        addChatSession(newSession);
        setSessionId(newId);
      }
    }
  }, [isOpen, user, sessionId, state.chatSessions, addChatSession]);

  const currentSession = state.chatSessions?.find(s => s.id === sessionId);

  useEffect(() => {
    if (isOpen && currentSession && currentSession.unreadByCustomer > 0) {
      markChatReadByCustomer(currentSession.id);
    }
  }, [isOpen, currentSession, markChatReadByCustomer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !sessionId) return;

    const userMsg = messageText.trim();

    addChatMessage(sessionId, {
      id: Date.now().toString(),
      sender: 'Customer',
      text: userMsg,
      timestamp: new Date().toISOString()
    });

    setMessageText('');

    // --- AI BOT LOGIC ---
    const hasAdminReplied = currentSession?.messages.some(m => m.sender === 'Admin');
    if (hasAdminReplied) return; // Stop bot if human took over

    setTimeout(() => {
      const lowerMsg = userMsg.toLowerCase();
      let aiResponse = '';
      let escalate = false;

      const lastAiMsg = currentSession?.messages.filter(m => m.sender === 'AI').pop();

      if (lowerMsg.includes('مدیر') || lowerMsg.includes('ادمین') || lowerMsg.includes('پشتیبانی') || lowerMsg.includes('انسان') || lowerMsg.includes('مشکل') || lowerMsg.includes('admin') || lowerMsg.includes('support')) {
        aiResponse = 'لطفاً نام، شماره تماس و دلیل دقیق ارتباط خود را بنویسید تا به مدیریت هشدار دهم و شما را مستقیماً به ایشان وصل کنم.';
      } 
      else if (lastAiMsg?.text.includes('لطفاً نام، شماره تماس')) {
        aiResponse = 'مشخصات و درخواست شما ثبت شد! هشدار برای مدیریت ارسال گردید. لطفاً همینجا منتظر بمانید تا پاسخ دهند.';
        escalate = true;
      }
      else if (lowerMsg.includes('سلام') || lowerMsg.includes('درود')) {
        aiResponse = 'سلام! چطور می‌توانم در خرید از فروشگاه ستاره شهر به شما کمک کنم؟ برای ارتباط با پشتیبانی کلمه "ادمین" را ارسال کنید.';
      }
      else if (lowerMsg.includes('سفارش') || lowerMsg.includes('پیگیری') || lowerMsg.includes('رسید')) {
        aiResponse = 'برای پیگیری سفارش خود می‌توانید روی دکمه «پیگیری سفارش» در بالای سایت کلیک کنید. اگر مشکل خاصی هست، کلمه "پشتیبانی" را بفرستید.';
      }
      else {
        aiResponse = 'من ربات هوشمند فروشگاه هستم. برای راهنمایی در خدمتم. اگر نیاز به گفتگو با انسان دارید، لطفاً کلمه «ادمین» یا «پشتیبانی» را بفرستید.';
      }

      addChatMessage(sessionId, {
        id: Date.now().toString() + '-ai',
        sender: 'AI',
        text: aiResponse,
        timestamp: new Date().toISOString()
      });

      if (escalate || aiResponse.includes('هشدار برای مدیریت')) {
        setTimeout(() => {
          updateChatStatus(sessionId, 'Waiting');
        }, 100);
      }
    }, 1000);
  };

  const unreadCount = state.chatSessions?.find(s => 
    (user && s.customerId === user.id) || 
    (localStorage.getItem('STC_GUEST_CHAT_ID') === s.id)
  )?.unreadByCustomer || 0;

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans print:hidden" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white w-[320px] sm:w-[380px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4"
            style={{ height: '450px' }}
          >
            {/* Header */}
            <div className="bg-[#0B1F3A] text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">پشتیبانی ستاره شهر</h3>
                  <p className="text-[10px] text-emerald-400">آنلاین و آماده پاسخگویی</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {currentSession?.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'Customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.sender === 'Customer' 
                      ? 'bg-indigo-600 text-white rounded-bl-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-br-none'
                  }`}>
                    {msg.sender !== 'Customer' && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-slate-400">
                        {msg.sender === 'AI' ? <Bot className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {msg.sender === 'AI' ? 'ربات هوشمند' : 'اپراتور فروشگاه'}
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className={`text-[9px] mt-1 text-right ${msg.sender === 'Customer' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit" 
                disabled={!messageText.trim()}
                className="bg-[#0B1F3A] text-white p-2.5 rounded-xl hover:bg-[#123B66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                <Send className="w-5 h-5 rtl:-scale-x-100" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-[#0B1F3A] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-7 h-7" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
