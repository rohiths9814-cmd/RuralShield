import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Inbox,
  Send,
  Shield,
  KeyRound,
  Mail,
  ArrowRight,
  TrendingUp,
  Lock,
  Brain,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import messageService from '../services/messageService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatRelativeTime, truncate } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ inbox: 0, sent: 0, unread: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inboxRes, sentRes, unreadRes] = await Promise.all([
          messageService.getInbox(1, 5),
          messageService.getSent(1, 1),
          messageService.getUnreadCount(),
        ]);

        setStats({
          inbox: inboxRes.data.pagination.total,
          sent: sentRes.data.pagination.total,
          unread: unreadRes.data.unreadCount,
        });

        setRecentMessages(inboxRes.data.messages.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Inbox',
      value: stats.inbox,
      icon: Inbox,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/10',
      link: '/inbox',
    },
    {
      label: 'Unread',
      value: stats.unread,
      icon: Mail,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      link: '/inbox',
    },
    {
      label: 'Sent',
      value: stats.sent,
      icon: Send,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      link: '/sent',
    },
    {
      label: 'Encryption',
      value: 'Active',
      icon: Lock,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      link: null,
    },
    {
      label: 'AI Threat Scan',
      value: 'Active',
      icon: Brain,
      color: 'from-rose-500 to-orange-500',
      bgColor: 'bg-rose-500/10',
      link: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, <span className="gradient-text">{user?.username}</span>
          </h1>
          <p className="text-slate-400 mt-1">Your quantum-secure messaging dashboard</p>
        </div>
        <Link to="/compose">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-2"
          >
            <Mail size={18} />
            New Message
          </motion.button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="glass-card-hover p-5 group cursor-pointer">
              {stat.link ? (
                <Link to={stat.link} className="block">
                  <StatContent stat={stat} />
                </Link>
              ) : (
                <StatContent stat={stat} />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100">Recent Messages</h2>
              <Link to="/inbox" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No messages yet</p>
                <p className="text-sm text-slate-500 mt-1">Send your first secure message!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMessages.map((msg, i) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/message/${msg._id}`}>
                      <div className={`flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer ${!msg.read ? 'bg-slate-800/20 border-l-2 border-cyan-400' : ''}`}>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {msg.sender?.username?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
                              {msg.sender?.username}
                            </p>
                            <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                              {formatRelativeTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 truncate">{msg.subject}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Panel */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              Security Overview
            </h2>
            <div className="space-y-4">
              <SecurityItem label="Encryption Algorithm" value="RSA-2048" status="active" />
              <SecurityItem label="Key Pair" value="Generated" status="active" />
              <SecurityItem label="Session" value="JWT Active" status="active" />
              <SecurityItem label="AI Scam Detection" value="Enabled" status="active" />
              <SecurityItem label="Post-Quantum" value="Phase 2" status="pending" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/compose" className="block">
                <div className="nav-item">
                  <Mail size={18} className="text-cyan-400" />
                  <span>Compose Message</span>
                </div>
              </Link>
              <Link to="/inbox" className="block">
                <div className="nav-item">
                  <Inbox size={18} className="text-emerald-400" />
                  <span>Check Inbox</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatContent({ stat }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
          <stat.icon size={20} className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: undefined }} />
        </div>
        <TrendingUp size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{stat.label}</p>
    </>
  );
}

function SecurityItem({ label, value, status }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${status === 'active' ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {value}
        </span>
        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400' : 'bg-yellow-400'} ${status === 'active' ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  );
}
