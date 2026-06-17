import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../AppContext';
import { useAuth } from '../AuthContext';
import { MessageCircle, Search, Send, User as UserIcon, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { AdminPasswordPrompt } from './AdminPasswordPrompt';

export const LiveChatAdmin: React.FC = () => {
  const { state, addChatMessage, updateChatStatus, markChatReadByAdmin, deleteChatSession } = useAppState();
  const { user } = useAuth();
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [adminPrompt, setAdminPrompt] = useState<{isOpen: boolean; action: () => void; title: string}>({
    isOpen: false, action: () => {}, title: ''
  });

  const sessions = state.chatSessions || [];
  
  const filteredSessions = sessions.filter(s => 
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.customerPhone && s.customerPhone.includes(searchQuery))
  ).sort((a, b) => {
    // Sort by unread first, then by last message timestamp
    if (a.unreadByAdmin > 0 && b.unreadByAdmin === 0) return -1;
    if (a.unreadByAdmin === 0 && b.unreadByAdmin > 0) return 1;
    
    const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0;
    const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0;
    return bTime - aTime;
  });

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (activeSession && activeSession.unreadByAdmin > 0) {
      markChatReadByAdmin(activeSession.id);
    }
  }, [activeSession, markChatReadByAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeSessionId) return;

    addChatMessage(activeSessionId, {
      id: Date.now().toString(),
      sender: 'Admin',
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    });

    setMessageText('');
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // prevent selecting the chat
    setAdminPrompt({
      isOpen: true,
      title: 'حذف گفتگو',
      action: () => {
        deleteChatSession(sessionId);
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
        }
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden font-sans" dir="rtl">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-l border-slate-100 flex flex-col bg-slate-50 shrink-0">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-black text-[#0B1F3A] mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#D4AF37]" /> پشتیبانی زنده
          </h2>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="جستجوی مشتری..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center text-slate-400 p-6 text-sm font-bold">گفتگویی یافت نشد.</div>
          ) : (
            filteredSessions.map(session => {
              const lastMsg = session.messages.length > 0 ? session.messages[session.messages.length - 1] : null;
              const isActive = activeSessionId === session.id;
              
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-right p-3 rounded-xl transition-all flex items-start gap-3 ${
                    isActive ? 'bg-[#0B1F3A] text-white shadow-md' : 'hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
                      <UserIcon className="w-5 h-5" />
                    </div>
                    {session.unreadByAdmin > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white">
                        {session.unreadByAdmin}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm truncate">{session.customerName}</h4>
                      <div className="flex items-center gap-2">
                        {lastMsg && (
                          <span className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                            {new Date(lastMsg.timestamp).toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        <button 
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className={`p-1 rounded-md transition-colors ${isActive ? 'text-rose-300 hover:bg-rose-900/30' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                          title="حذف گفتگو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {lastMsg && (
                      <p className={`text-xs truncate ${isActive ? 'text-slate-300' : 'text-slate-500'} ${session.unreadByAdmin > 0 ? 'font-bold text-slate-800' : ''}`}>
                        {lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-[#0B1F3A]">{activeSession.customerName}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold mt-1">
                    {activeSession.customerPhone && (
                      <span>تماس: {activeSession.customerPhone}</span>
                    )}
                    <span className="flex items-center gap-1">
                      وضعیت: 
                      <select 
                        value={activeSession.status}
                        onChange={(e) => updateChatStatus(activeSession.id, e.target.value as any)}
                        className="bg-transparent border-none text-indigo-600 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="Active">فعال</option>
                        <option value="Waiting">در انتظار</option>
                        <option value="Closed">بسته شده</option>
                      </select>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {activeSession.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'Customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                    msg.sender === 'Customer' 
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-none' 
                      : msg.sender === 'AI' 
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-tl-none' 
                        : 'bg-[#0B1F3A] text-white rounded-tl-none'
                  }`}>
                    {msg.sender !== 'Customer' && (
                      <div className="flex items-center gap-1 mb-2 text-[10px] font-bold opacity-70">
                        {msg.sender === 'AI' ? 'ربات هوشمند' : 'شما (ادمین)'}
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.text}</p>
                    <div className={`text-[10px] mt-2 text-right ${msg.sender === 'Customer' ? 'text-slate-400' : 'opacity-60'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
              <button 
                type="submit" 
                disabled={!messageText.trim()}
                className="bg-[#D4AF37] text-[#0B1F3A] px-6 rounded-xl font-black hover:bg-[#B8942E] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span>ارسال</span>
                <Send className="w-5 h-5 rtl:-scale-x-100" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <MessageCircle className="w-20 h-20 mb-6 text-slate-200" />
            <p className="text-lg font-bold text-slate-500">یک گفتگو را از لیست انتخاب کنید.</p>
          </div>
        )}
      </div>
      
      <AdminPasswordPrompt 
        isOpen={adminPrompt.isOpen} 
        onClose={() => setAdminPrompt({ ...adminPrompt, isOpen: false })} 
        onSuccess={() => {
          adminPrompt.action();
          setAdminPrompt({ ...adminPrompt, isOpen: false });
        }}
        title={adminPrompt.title}
      />
    </div>
  );
};
