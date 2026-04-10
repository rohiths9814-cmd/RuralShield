import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Trash2, Mail } from 'lucide-react';
import messageService from '../services/messageService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatRelativeTime, truncate } from '../utils/helpers';

export default function SentPage() {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSent = async (page = 1) => {
    setLoading(true);
    try {
      const response = await messageService.getSent(page);
      setMessages(response.data.messages);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch sent:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSent();
  }, []);

  const handleDelete = async (e, msgId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await messageService.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error('Failed to delete:', err);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Send className="h-7 w-7 text-emerald-400" />
          Sent Messages
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {pagination.total} message{pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <Send className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <p className="text-lg text-slate-400 font-medium">No sent messages</p>
            <p className="text-sm text-slate-500 mt-1">
              <Link to="/compose" className="text-cyan-400 hover:text-cyan-300">Compose</Link> your first message!
            </p>
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
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-all cursor-pointer group border-l-2 border-transparent">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {msg.recipient?.username?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">To:</span>
                        <span className="text-sm text-slate-300">{msg.recipient?.username}</span>
                        <span className="text-xs text-slate-600">&lt;{msg.recipient?.email}&gt;</span>
                      </div>
                      <p className="text-sm text-slate-400 truncate">{msg.subject}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{truncate(msg.body, 80)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-500">{formatRelativeTime(msg.createdAt)}</span>
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

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/30">
            <span className="text-sm text-slate-400">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => fetchSent(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-ghost text-sm disabled:opacity-30">Previous</button>
              <button onClick={() => fetchSent(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="btn-ghost text-sm disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
