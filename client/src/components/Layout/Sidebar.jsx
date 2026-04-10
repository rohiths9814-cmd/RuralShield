import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Inbox,
  Send,
  PenSquare,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import messageService from '../../services/messageService';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inbox', label: 'Inbox', icon: Inbox, showBadge: true },
  { path: '/sent', label: 'Sent', icon: Send },
  { path: '/compose', label: 'Compose', icon: PenSquare },
];

export default function Sidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await messageService.getUnreadCount();
        setUnreadCount(response.data.unreadCount);
      } catch (err) {
        // Silent fail
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 z-40 overflow-y-auto">
      <div className="p-4 space-y-1">
        {/* Compose button — prominent */}
        <NavLink to="/compose">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <PenSquare size={18} />
            Compose
          </motion.div>
        </NavLink>

        {/* Nav items */}
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path}>
                <div className={isActive ? 'nav-item-active' : 'nav-item'}>
                  <item.icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  {item.showBadge && unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Security info */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="px-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
              <ShieldCheck size={14} />
              Security Status
            </div>
            <div className="glass-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Encryption</span>
                <span className="text-xs text-emerald-400 font-medium">RSA-2048</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Key Status</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Protocol</span>
                <span className="text-xs text-cyan-400 font-mono">v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
