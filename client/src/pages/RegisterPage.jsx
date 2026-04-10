import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, Download, AlertTriangle, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { downloadFile } from '../utils/helpers';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Private key modal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyDownloaded, setKeyDownloaded] = useState(false);

  const { register, completeRegistration } = useAuth();
  const navigate = useNavigate();
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register({ username, email, password });
      setRegisteredUser(result.user);
      setPrivateKey(result.privateKey);
      setShowKeyModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(privateKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleDownloadKey = () => {
    downloadFile(privateKey, `quantum-mail-private-key-${username}.pem`, 'application/x-pem-file');
    setKeyDownloaded(true);
  };

  const handleContinue = () => {
    setShowKeyModal(false);
    if (registeredUser) {
      completeRegistration(registeredUser);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-teal-500/5 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4"
          >
            <Shield className="h-10 w-10 text-cyan-400" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Join the quantum-secure network</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <Input
              id="register-username"
              label="Username"
              icon={User}
              placeholder="quantum_user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
            />

            <Input
              id="register-email"
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="register-password"
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Input
              id="register-confirm-password"
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              icon={ArrowRight}
              id="register-submit"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Private Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card p-6 space-y-5"
            >
              {/* Warning header */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-400">Save Your Private Key</h3>
                  <p className="text-xs text-yellow-400/70">This is the ONLY time your private key will be shown. If you lose it, you cannot recover your encrypted messages.</p>
                </div>
              </div>

              {/* Key display */}
              <div className="relative">
                <pre className="p-4 bg-slate-900/80 rounded-lg text-xs text-slate-300 font-mono overflow-x-auto max-h-48 border border-slate-700/50">
                  {privateKey}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCopyKey}
                  icon={keyCopied ? Check : Copy}
                  className="flex-1"
                  id="copy-key-btn"
                >
                  {keyCopied ? 'Copied!' : 'Copy Key'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDownloadKey}
                  icon={Download}
                  className="flex-1"
                  id="download-key-btn"
                >
                  {keyDownloaded ? 'Downloaded!' : 'Download .pem'}
                </Button>
              </div>

              {/* Continue */}
              <Button
                onClick={handleContinue}
                disabled={!keyDownloaded && !keyCopied}
                className="w-full"
                icon={ArrowRight}
                id="continue-btn"
              >
                I've Saved My Key — Continue
              </Button>
              {!keyDownloaded && !keyCopied && (
                <p className="text-xs text-slate-500 text-center">
                  Please copy or download your key before continuing
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
