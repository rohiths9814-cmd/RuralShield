import { useAuth } from '../../contexts/AuthContext';
import { Shield, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import messageService from '../../services/messageService';

export default function Navbar() {
  const { user, logout } = useAuth();
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
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-cyan-400" />
            <div className="absolute inset-0 h-8 w-8 text-cyan-400 blur-md opacity-50">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">QuantumMail</h1>
            <p className="text-[10px] text-slate-500 -mt-1 font-mono">POST-QUANTUM SECURE</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-700/50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-200">{user?.username}</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Logout"
              id="logout-btn"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
