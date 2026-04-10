import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox, Star, StarOff, Trash2, Mail } from 'lucide-react';
import messageService from '../services/messageService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScamBadge from '../components/Mail/ScamBadge';
import { formatRelativeTime, truncate } from '../utils/helpers';

export default function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchInbox = async (page = 1) => {
    setLoading(true);
    try {
      const response = await messageService.getInbox(page);
      setMessages(response.data.messages);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleToggleStar = async (e, msgId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await messageService.toggleStar(msgId);
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, starred: !m.starred } : m))
      );
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleDelete = async (e, msgId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await messageService.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Inbox className="h-7 w-7 text-cyan-400" />
            Inbox
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {pagination.total} message{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="glass-card overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <p className="text-lg text-slate-400 font-medium">Your inbox is empty</p>
            <p className="text-sm text-slate-500 mt-1">New messages will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {messages.map((msg, i) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/message/${msg._id}`}>
                  <div className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-all cursor-pointer group ${
                    !msg.read ? 'bg-cyan-500/[0.03] border-l-2 border-cyan-400' : 'border-l-2 border-transparent'
                  } ${
                    msg.scamAnalysis?.riskLevel === 'critical' ? 'bg-red-500/[0.04]' :
                    msg.scamAnalysis?.riskLevel === 'high' ? 'bg-red-500/[0.02]' : ''
                  }`}>
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {msg.sender?.username?.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${!msg.read ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
                          {msg.sender?.username}
                        </span>
                        <span className="text-xs text-slate-600">
                          &lt;{msg.sender?.email}&gt;
                        </span>
                        {msg.scamAnalysis && msg.scamAnalysis.riskLevel !== 'safe' && (
                          <ScamBadge
                            riskLevel={msg.scamAnalysis.riskLevel}
                            riskScore={msg.scamAnalysis.riskScore}
                            compact
                          />
                        )}
                      </div>
                      <p className={`text-sm truncate ${!msg.read ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {truncate(msg.body, 80)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-500">{formatRelativeTime(msg.createdAt)}</span>
                      <button
                        onClick={(e) => handleToggleStar(e, msg._id)}
                        className={`p-1.5 rounded-md transition-all ${
                          msg.starred
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {msg.starred ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, msg._id)}
                        className="p-1.5 rounded-md text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/30">
            <span className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchInbox(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-ghost text-sm disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => fetchInbox(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="btn-ghost text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
