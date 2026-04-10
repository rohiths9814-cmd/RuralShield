import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle } from 'lucide-react';

const RISK_CONFIG = {
  safe: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: ShieldCheck,
    label: 'Safe',
    glow: '',
  },
  low: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: ShieldQuestion,
    label: 'Low',
    glow: '',
  },
  medium: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: ShieldAlert,
    label: 'Medium',
    glow: '',
  },
  high: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: AlertTriangle,
    label: 'High',
    glow: 'scam-badge-glow-red',
  },
  critical: {
    color: 'text-red-300',
    bg: 'bg-red-600/15',
    border: 'border-red-500/40',
    icon: AlertTriangle,
    label: 'Critical',
    glow: 'scam-badge-pulse',
  },
};

/**
 * ScamBadge — Compact risk indicator for inbox message list
 *
 * @param {string}  riskLevel - safe | low | medium | high | critical
 * @param {number}  riskScore - 0–100
 * @param {boolean} compact   - Show mini version (score only)
 */
export default function ScamBadge({ riskLevel = 'safe', riskScore = 0, compact = false }) {
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.safe;
  const Icon = config.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.color} ${config.border} border ${config.glow}`}
        title={`Risk: ${config.label} (${riskScore}/100)`}
      >
        <Icon size={10} />
        {riskScore}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color} ${config.border} border ${config.glow}`}
      title={`AI Risk Score: ${riskScore}/100`}
    >
      <Icon size={12} />
      <span>{config.label}</span>
      <span className="opacity-60">·</span>
      <span className="font-mono text-[10px]">{riskScore}</span>
    </motion.div>
  );
}
