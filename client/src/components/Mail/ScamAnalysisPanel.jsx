import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Brain,
  Crosshair,
  Eye,
} from 'lucide-react';
import messageService from '../../services/messageService';

// ─── Risk Config ──────────────────────────────────────────────

const RISK_COLORS = {
  safe:     { stroke: '#34d399', bg: 'rgba(52, 211, 153, 0.08)', text: 'text-emerald-400', label: 'Safe' },
  low:      { stroke: '#facc15', bg: 'rgba(250, 204, 21, 0.08)',  text: 'text-yellow-400',  label: 'Low Risk' },
  medium:   { stroke: '#fb923c', bg: 'rgba(251, 146, 60, 0.08)',  text: 'text-orange-400',  label: 'Medium Risk' },
  high:     { stroke: '#f87171', bg: 'rgba(248, 113, 113, 0.08)', text: 'text-red-400',     label: 'High Risk' },
  critical: { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)',   text: 'text-red-300',     label: 'Critical Threat' },
};

const SEVERITY_COLORS = {
  low:      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  medium:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  high:     'bg-red-500/20 text-red-400 border-red-500/30',
  critical: 'bg-red-600/25 text-red-300 border-red-500/40',
};

const CATEGORY_ICONS = {
  urgency:            '⏰',
  financial:          '💰',
  phishing:           '🎣',
  socialEngineering:  '🎭',
  suspiciousLinks:    '🔗',
  linguisticAnomalies:'📝',
};

// ─── Animated Circular Gauge ──────────────────────────────────

function RiskGauge({ score, riskLevel }) {
  const config = RISK_COLORS[riskLevel] || RISK_COLORS.safe;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="rgba(100, 116, 139, 0.15)"
          strokeWidth="10"
        />
        {/* Score arc */}
        <motion.circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={config.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Glow filter */}
        <defs>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={config.stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          filter="url(#glowFilter)"
          opacity="0.5"
        />
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-3xl font-bold ${config.text}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
          RISK SCORE
        </span>
      </div>
    </div>
  );
}

// ─── Threat Card ──────────────────────────────────────────────

function ThreatCard({ threat, index }) {
  const severityStyle = SEVERITY_COLORS[threat.severity] || SEVERITY_COLORS.low;
  const icon = CATEGORY_ICONS[threat.category] || '⚠️';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.06 }}
      className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-200">{threat.detail}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${severityStyle}`}>
            {threat.severity}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{threat.categoryLabel}</p>
        {threat.matches && threat.matches.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {threat.matches.map((match, i) => (
              <span
                key={i}
                className="inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-slate-700/50 text-slate-400 rounded border border-slate-600/30"
              >
                "{match}"
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────

/**
 * ScamAnalysisPanel — Detailed threat analysis view for MessageViewPage
 *
 * @param {Object}   scamAnalysis - The scamAnalysis object from the message
 * @param {string}   messageId    - Message ID for re-analysis
 * @param {Function} onReanalyze  - Callback after re-analysis completes
 */
export default function ScamAnalysisPanel({ scamAnalysis, messageId, onReanalyze }) {
  const [isExpanded, setIsExpanded] = useState(
    scamAnalysis?.riskLevel && scamAnalysis.riskLevel !== 'safe'
  );
  const [reanalyzing, setReanalyzing] = useState(false);

  if (!scamAnalysis) return null;

  const { riskScore = 0, riskLevel = 'safe', threats = [], summary = '' } = scamAnalysis;
  const config = RISK_COLORS[riskLevel] || RISK_COLORS.safe;
  const hasThreat = riskLevel !== 'safe';

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const response = await messageService.analyzeMessage(messageId);
      if (onReanalyze) onReanalyze(response.data.scamAnalysis);
    } catch (err) {
      console.error('Re-analysis failed:', err);
    } finally {
      setReanalyzing(false);
    }
  };

  // Group threats by category
  const groupedThreats = threats.reduce((acc, threat) => {
    const key = threat.category;
    if (!acc[key]) acc[key] = { label: threat.categoryLabel, threats: [] };
    acc[key].threats.push(threat);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card overflow-hidden"
      style={{ borderColor: hasThreat ? `${config.stroke}33` : undefined }}
    >
      {/* ── Collapse Header ─────────────────────────── */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: config.bg }}
          >
            <Brain size={18} className={config.text} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">AI Scam Analysis</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                hasThreat ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {config.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {threats.length} indicator{threats.length !== 1 ? 's' : ''} detected · Score: {riskScore}/100
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReanalyze();
            }}
            disabled={reanalyzing}
            className="p-1.5 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-700/50 transition-all disabled:opacity-40"
            title="Re-analyze message"
          >
            <RefreshCw size={14} className={reanalyzing ? 'animate-spin' : ''} />
          </button>
          {isExpanded ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </div>
      </button>

      {/* ── Expanded Content ────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-700/30 pt-5">
              {/* ── Top Row: Gauge + Summary ──────────── */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-5">
                <RiskGauge score={riskScore} riskLevel={riskLevel} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Summary</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>

                  {/* Category breakdown mini-bars */}
                  {Object.entries(groupedThreats).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(groupedThreats).map(([category, group]) => {
                        const maxSev = group.threats.reduce((max, t) => {
                          const order = ['low', 'medium', 'high', 'critical'];
                          return order.indexOf(t.severity) > order.indexOf(max) ? t.severity : max;
                        }, 'low');
                        const barWidth = Math.min(group.threats.length * 25, 100);
                        const barColor = RISK_COLORS[maxSev === 'critical' ? 'critical' : maxSev === 'high' ? 'high' : maxSev === 'medium' ? 'medium' : 'low']?.stroke || '#facc15';

                        return (
                          <div key={category} className="flex items-center gap-2">
                            <span className="text-xs w-4">{CATEGORY_ICONS[category] || '⚠️'}</span>
                            <span className="text-[11px] text-slate-500 w-28 flex-shrink-0 truncate">{group.label}</span>
                            <div className="flex-1 h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: barColor }}
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidth}%` }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-600 w-4 text-right">{group.threats.length}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Threat Detail Cards ───────────────── */}
              {threats.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Crosshair size={14} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Detected Threats ({threats.length})
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {threats.map((threat, i) => (
                      <ThreatCard key={`${threat.category}-${i}`} threat={threat} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* No threats */}
              {threats.length === 0 && (
                <div className="text-center py-4">
                  <ShieldCheck className="h-10 w-10 text-emerald-400/50 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No scam indicators detected</p>
                  <p className="text-xs text-slate-600 mt-0.5">This message appears to be safe</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
