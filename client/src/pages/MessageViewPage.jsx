import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Trash2, Reply, Shield, Clock, AlertTriangle } from 'lucide-react';
import messageService from '../services/messageService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ScamAnalysisPanel from '../components/Mail/ScamAnalysisPanel';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

export default function MessageViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await messageService.getMessage(id);
        setMessage(response.data.message);

        // Auto-mark as read if recipient
        if (
          response.data.message.recipient?._id === user?.id &&
          !response.data.message.read
        ) {
          await messageService.markAsRead(id);
        }
      } catch (err) {
        console.error('Failed to fetch message:', err);
        navigate('/inbox');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleToggleStar = async () => {
    try {
      await messageService.toggleStar(id);
      setMessage((prev) => ({ ...prev, starred: !prev.starred }));
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await messageService.deleteMessage(id);
      navigate('/inbox');
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

  if (!message) return null;

  const isSender = message.sender?._id === user?.id;
  const otherUser = isSender ? message.recipient : message.sender;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStar}
            className={`p-2 rounded-lg transition-all ${
              message.starred
                ? 'text-yellow-400 bg-yellow-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Star size={18} fill={message.starred ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={18} />
          </button>
          {!isSender && (
            <Link to={`/compose?to=${message.sender?.email}&subject=Re: ${message.subject}`}>
              <Button variant="secondary" size="sm" icon={Reply}>
                Reply
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30">
          <h1 className="text-xl font-bold text-slate-100 mb-4">{message.subject}</h1>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                {(isSender ? message.recipient : message.sender)?.username?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100">
                    {isSender ? `To: ${message.recipient?.username}` : message.sender?.username}
                  </span>
                  <span className="badge-green text-[10px]">
                    <Shield size={10} />
                    Encrypted
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isSender ? message.recipient?.email : message.sender?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={13} />
              {formatDate(message.createdAt)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="prose prose-invert max-w-none">
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {message.body}
            </div>
          </div>
        </div>

        {/* Footer — security info */}
        <div className="px-6 py-3 bg-slate-900/40 border-t border-slate-700/30 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Shield size={13} className="text-emerald-400" />
            <span>RSA-2048 Encrypted</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Verified Delivery</span>
          </div>
        </div>
      </motion.div>

      {/* Scam Analysis Panel */}
      {message.scamAnalysis && (
        <ScamAnalysisPanel
          scamAnalysis={message.scamAnalysis}
          messageId={id}
          onReanalyze={(updated) => setMessage((prev) => ({ ...prev, scamAnalysis: updated }))}
        />
      )}
    </div>
  );
}
