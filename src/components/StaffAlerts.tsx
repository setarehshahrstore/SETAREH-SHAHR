import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppState } from '../AppContext';
import { useAuth } from '../AuthContext';
import { playChaChing, playPop, playRing } from '../utils/audio';
import { FloatingAdminChat } from './FloatingAdminChat';
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';

export const StaffAlerts: React.FC = () => {
  const { user } = useAuth();
  const { state } = useAppState();
  const location = useLocation();

  const totalUnreadChats = (state.chatSessions || []).reduce((sum, s) => sum + s.unreadByAdmin, 0);
  const totalPendingInquiries = (state.inquiries || []).filter(i => i.status === 'Pending').length;
  const newOrdersCount = (state.sales || []).filter(s => s.status !== 'Completed' && s.status !== 'Delivered' && s.status !== 'Cancelled').length;

  const [prevUnreadChats, setPrevUnreadChats] = useState(totalUnreadChats);
  const [prevPendingInquiries, setPrevPendingInquiries] = useState(totalPendingInquiries);
  const [prevNewOrdersCount, setPrevNewOrdersCount] = useState(newOrdersCount);

  // Floating Chat State
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [floatingChatSessionId, setFloatingChatSessionId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Only run for staff
  const isStaff = user && ['Owner', 'Manager', 'Cashier', 'Warehouse Staff'].includes(user.role);

  useEffect(() => {
    if (!isStaff) return;

    // 1. New Order (Cha-Ching)
    if (newOrdersCount > prevNewOrdersCount) {
      playChaChing();
      setToastMessage('یک سفارش جدید ثبت شد! (نیاز به بررسی)');
      setTimeout(() => setToastMessage(null), 6000);
    }

    // 2. New Live Chat Message (Pop sound + floating window)
    if (totalUnreadChats > prevUnreadChats) {
      playPop();
      const newlyUpdatedSession = state.chatSessions?.find(s => s.unreadByAdmin > 0);
      if (newlyUpdatedSession && location.pathname !== '/admin/live-chat') {
        setFloatingChatSessionId(newlyUpdatedSession.id);
        setIsFloatingChatOpen(true);
      }
    }

    // 3. New Call Inquiry (Desk phone ring)
    if (totalPendingInquiries > prevPendingInquiries) {
      playRing();
    }

    setPrevNewOrdersCount(newOrdersCount);
    setPrevUnreadChats(totalUnreadChats);
    setPrevPendingInquiries(totalPendingInquiries);
  }, [
    newOrdersCount, totalUnreadChats, totalPendingInquiries, 
    prevNewOrdersCount, prevUnreadChats, prevPendingInquiries, 
    state.chatSessions, location.pathname, isStaff
  ]);

  if (!isStaff) return null;

  return (
    <>
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '50%' }}
            exit={{ opacity: 0, y: -20, x: '50%' }}
            className="fixed top-6 right-1/2 translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl z-[9999] font-black flex items-center gap-3"
          >
            <Bell className="w-5 h-5 animate-bounce" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingAdminChat 
        isOpen={isFloatingChatOpen} 
        onClose={() => setIsFloatingChatOpen(false)} 
        defaultSessionId={floatingChatSessionId} 
      />
    </>
  );
};
