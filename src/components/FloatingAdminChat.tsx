import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../AppContext';
import { MessageCircle, X, Send, User as UserIcon } from 'lucide-react';

export const FloatingAdminChat: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultSessionId: string | null;
}> = ({ isOpen, onClose, defaultSessionId }) => {
  const { state, addChatMessage, markChatReadByAdmin } = useAppState();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(defaultSessionId);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessions = state.chatSessions || [];
  
  useEffect(() => {
    if (defaultSessionId) {
      setActiveSessionId(defaultSessionId);
    } else if (!activeSessionId && sessions.length > 0) {
      const unread = sessions.find(s => s.unreadByAdmin > 0);
      setActiveSessionId(unread ? unread.id : sessions[0].id);
    }
  }, [defaultSessionId, sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (isOpen && activeSession && activeSession.unreadByAdmin > 0) {
      markChatReadByAdmin(activeSession.id);
    }
  }, [isOpen, activeSession, markChatReadByAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeSessionId) return;

    addChatMessage(activeSessionId, {
      id: Date.now().toString(),
      sender: 'Admin',
      text: messageText,
      timestamp: new Date().toISOString()
    });
    setMessageText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-[100] overflow-hidden" style={{ height: '400px' }}>
      {/* Header */}
      <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-bold text-sm">پشتیبانی زنده</span>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        {activeSession ? (
          <div className="flex-1 flex flex-col bg-slate-50 relative">
            <div className="p-2 border-b bg-white flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">{activeSession.customerName}</span>
              <span className="text-[10px] text-slate-500">{activeSession.customerPhone}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeSession.messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'Admin' ? 'items-start' : 'items-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] ${
                    msg.sender === 'Admin' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : msg.sender === 'AI'
                      ? 'bg-emerald-100 text-emerald-800 rounded-tl-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-2 bg-white border-t flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="پاسخ شما..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            گفتگویی انتخاب نشده است.
          </div>
        )}
      </div>
    </div>
  );
};
