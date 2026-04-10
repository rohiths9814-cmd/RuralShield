import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Mail, FileText, X, Check, Search } from 'lucide-react';
import messageService from '../services/messageService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ComposePage() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // User search
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  const navigate = useNavigate();

  // Search users as they type
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (recipientEmail.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Don't search if it looks like a complete email was selected
    if (searchResults.some((u) => u.email === recipientEmail)) {
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await messageService.searchUsers(recipientEmail);
        setSearchResults(response.data.users);
        setShowDropdown(response.data.users.length > 0);
      } catch (err) {
        // Silent fail
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [recipientEmail]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user) => {
    setRecipientEmail(user.email);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await messageService.sendMessage({ recipientEmail, subject, body });
      setSuccess(true);
      setTimeout(() => navigate('/sent'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Send className="h-7 w-7 text-cyan-400" />
          Compose Message
        </h1>
        <p className="text-sm text-slate-400 mt-1">Send a quantum-secure message</p>
      </div>

      {/* Success */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Message sent successfully! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Recipient with autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <Input
              id="compose-to"
              label="To"
              type="email"
              icon={User}
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              autoComplete="off"
            />

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-20 top-full mt-1 w-full glass-card overflow-hidden"
                >
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/40 transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{user.username}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Input
            id="compose-subject"
            label="Subject"
            icon={FileText}
            placeholder="Message subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Message</label>
            <textarea
              id="compose-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={12}
              placeholder="Type your secure message here..."
              className="input-field resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              End-to-end encryption active
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={Send}
                disabled={success}
                id="send-message-btn"
              >
                Send Message
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
