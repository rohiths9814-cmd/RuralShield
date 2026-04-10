/**
 * ═══════════════════════════════════════════════════════════════
 *  AI Scam Detection Engine — Quantum-Secure Mail
 * ═══════════════════════════════════════════════════════════════
 *
 *  Multi-layered NLP analysis engine that scores emails across
 *  6 threat dimensions to detect phishing, scams, and social
 *  engineering attacks.
 *
 *  Threat Dimensions:
 *    1. Urgency Patterns       — Pressure/fear tactics
 *    2. Financial Signals      — Money/payment requests
 *    3. Phishing Indicators    — Credential harvesting
 *    4. Social Engineering     — Identity deception
 *    5. Suspicious Links       — Malicious URL patterns
 *    6. Linguistic Anomalies   — Unusual writing patterns
 */

// ─── Threat Pattern Definitions ───────────────────────────────

const THREAT_PATTERNS = {
  urgency: {
    weight: 0.18,
    label: 'Urgency & Pressure',
    patterns: [
      { regex: /\b(act\s+now|action\s+required|immediate(ly)?|urgent(ly)?)\b/gi, severity: 'high', detail: 'Urgent action language detected' },
      { regex: /\b(final\s+(warning|notice|reminder)|last\s+chance|expires?\s+(today|soon|immediately))\b/gi, severity: 'high', detail: 'Deadline pressure tactics' },
      { regex: /\b(account\s+(will\s+be\s+)?(suspend|clos|terminat|delet|deactivat)(ed|ion)?)\b/gi, severity: 'critical', detail: 'Account threat language' },
      { regex: /\b(within\s+\d+\s+(hours?|minutes?|days?)|time\s+(is\s+)?running\s+out)\b/gi, severity: 'medium', detail: 'Artificial time constraint' },
      { regex: /\b(don'?t\s+(delay|wait|ignore)|respond\s+(asap|immediately|now))\b/gi, severity: 'medium', detail: 'Pressure to respond quickly' },
      { regex: /\b(failure\s+to\s+(comply|respond|act)|consequences\s+will)\b/gi, severity: 'high', detail: 'Threatening consequences' },
      { regex: /\b(limited\s+(time\s+)?offer|only\s+\d+\s+(left|remaining|available))\b/gi, severity: 'low', detail: 'Scarcity tactics' },
    ],
  },

  financial: {
    weight: 0.22,
    label: 'Financial Signals',
    patterns: [
      { regex: /\b(wire\s+transfer|bank\s+transfer|money\s+transfer|western\s+union|moneygram)\b/gi, severity: 'critical', detail: 'Wire transfer request' },
      { regex: /\b(bitcoin|btc|ethereum|eth|crypto(currency)?|usdt|tether)\b/gi, severity: 'high', detail: 'Cryptocurrency mention' },
      { regex: /\b(gift\s+card|itunes\s+card|google\s+play\s+card|amazon\s+card|prepaid\s+card)\b/gi, severity: 'critical', detail: 'Gift card payment request' },
      { regex: /\b(bank\s+(account|details|information)|routing\s+number|swift\s+code|iban)\b/gi, severity: 'high', detail: 'Banking information request' },
      { regex: /\b(send\s+(me\s+)?money|pay(ment)?\s+(of|for)\s+\$?\d+|transfer\s+\$?\d+)\b/gi, severity: 'high', detail: 'Direct payment request' },
      { regex: /\b(credit\s+card\s+(number|info|details)|cvv|card\s+number|expir(y|ation)\s+date)\b/gi, severity: 'critical', detail: 'Credit card information request' },
      { regex: /\$\s?\d{1,3}(,\d{3})*(\.\d{2})?\s*(million|thousand|USD|usd)?/gi, severity: 'medium', detail: 'Large monetary amount mentioned' },
      { regex: /\b(inheritance|beneficiary|unclaimed\s+(funds?|money|asset))\b/gi, severity: 'critical', detail: 'Inheritance/unclaimed funds scam' },
      { regex: /\b(processing\s+fee|advance\s+fee|upfront\s+(payment|fee|cost))\b/gi, severity: 'high', detail: 'Advance fee request' },
    ],
  },

  phishing: {
    weight: 0.20,
    label: 'Phishing Indicators',
    patterns: [
      { regex: /\b(verify\s+your\s+(account|identity|email|information)|confirm\s+your\s+(identity|account))\b/gi, severity: 'high', detail: 'Account verification request' },
      { regex: /\b(click\s+(here|below|this\s+link)\s+(to\s+)?(login|log\s+in|sign\s+in|verify|confirm|update))\b/gi, severity: 'critical', detail: 'Suspicious login link' },
      { regex: /\b(update\s+your\s+(password|credentials|payment|billing)|reset\s+your\s+password)\b/gi, severity: 'high', detail: 'Credential update request' },
      { regex: /\b(ssn|social\s+security|tax\s+id|passport\s+number|driver'?s?\s+licen[sc]e)\b/gi, severity: 'critical', detail: 'Personal identity document request' },
      { regex: /\b(unusual\s+(activity|sign[\s-]?in|login)|suspicious\s+activity|security\s+alert)\b/gi, severity: 'medium', detail: 'Fake security alert' },
      { regex: /\b(your\s+(account|password)\s+(has\s+been|was)\s+(compromis|hack|breach))\b/gi, severity: 'high', detail: 'False compromise claim' },
      { regex: /\b(login\s+credentials|username\s+and\s+password|enter\s+your\s+(password|pin))\b/gi, severity: 'high', detail: 'Credential harvesting attempt' },
    ],
  },

  socialEngineering: {
    weight: 0.18,
    label: 'Social Engineering',
    patterns: [
      { regex: /\b(nigerian?\s+prince|foreign\s+(dignitary|official|minister))\b/gi, severity: 'critical', detail: '419 advance-fee scam indicator' },
      { regex: /\b(lottery\s+(winner|winning)|you('ve)?\s+(won|been\s+selected)|prize\s+(winner|claim))\b/gi, severity: 'critical', detail: 'Lottery/prize scam' },
      { regex: /\b(irs|internal\s+revenue|tax\s+(refund|return)|government\s+grant)\b/gi, severity: 'high', detail: 'Government impersonation' },
      { regex: /\b(dear\s+(friend|sir|madam|beloved|customer|user|account\s+holder))\b/gi, severity: 'medium', detail: 'Generic impersonal greeting' },
      { regex: /\b(confidential|private\s+and\s+confidential|do\s+not\s+share|strictly\s+private)\b/gi, severity: 'medium', detail: 'False confidentiality claims' },
      { regex: /\b(i\s+am\s+(a\s+)?(prince|minister|doctor|officer|barrister|attorney|widow))\b/gi, severity: 'high', detail: 'Title-based authority claim' },
      { regex: /\b(god\s+(bless|willing)|please\s+help\s+me|i\s+need\s+your\s+help)\b/gi, severity: 'low', detail: 'Emotional manipulation' },
      { regex: /\b(dying\s+(wish|request)|terminal(ly)?\s+(ill|sick)|cancer\s+patient)\b/gi, severity: 'high', detail: 'Sympathy-based manipulation' },
      { regex: /\b(i\s+got\s+your\s+(contact|email)\s+(from|through))\b/gi, severity: 'medium', detail: 'Unsolicited contact claim' },
    ],
  },

  suspiciousLinks: {
    weight: 0.12,
    label: 'Suspicious Links',
    patterns: [
      { regex: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/gi, severity: 'critical', detail: 'IP-based URL detected' },
      { regex: /https?:\/\/(bit\.ly|tinyurl|goo\.gl|t\.co|is\.gd|buff\.ly|ow\.ly|rebrand\.ly|short\.io)/gi, severity: 'high', detail: 'URL shortener detected' },
      { regex: /https?:\/\/[^\s]*@[^\s]+/gi, severity: 'critical', detail: 'URL with embedded credentials' },
      { regex: /https?:\/\/[^\s]*(login|signin|verify|account|secure|update|confirm)[^\s]*\.(php|asp|html)/gi, severity: 'high', detail: 'Suspicious login page URL' },
      { regex: /https?:\/\/[^\s]*[0-9a-f]{8,}\.[^\s]+/gi, severity: 'medium', detail: 'URL with random hash pattern' },
      { regex: /(paypal|apple|google|microsoft|amazon|facebook|netflix|instagram)[\w-]*\.((?!com|org|net)\w{2,})/gi, severity: 'high', detail: 'Brand lookalike domain' },
    ],
  },

  linguisticAnomalies: {
    weight: 0.10,
    label: 'Linguistic Anomalies',
    patterns: [
      { regex: /[A-Z\s]{20,}/g, severity: 'medium', detail: 'Excessive capitalization' },
      { regex: /[!]{3,}/g, severity: 'medium', detail: 'Excessive exclamation marks' },
      { regex: /[?!]{2,}[?!]*/g, severity: 'low', detail: 'Excessive punctuation' },
      { regex: /\b(kindly|humbly|hereby|forthwith|herewith|therein)\b/gi, severity: 'low', detail: 'Overly formal/archaic language' },
      { regex: /(.)\1{4,}/g, severity: 'medium', detail: 'Repeated character manipulation' },
      { regex: /[^\x00-\x7F]{5,}/g, severity: 'low', detail: 'Non-ASCII character sequences' },
    ],
  },
};

// ─── Severity Score Map ───────────────────────────────────────

const SEVERITY_SCORES = {
  low: 8,
  medium: 18,
  high: 30,
  critical: 45,
};

// ─── Risk Level Thresholds ────────────────────────────────────

const getRiskLevel = (score) => {
  if (score <= 20) return 'safe';
  if (score <= 40) return 'low';
  if (score <= 60) return 'medium';
  if (score <= 80) return 'high';
  return 'critical';
};

// ─── Summary Generator ───────────────────────────────────────

const generateSummary = (threats, riskLevel, riskScore) => {
  if (threats.length === 0) {
    return 'No scam indicators detected. This message appears to be safe.';
  }

  const categories = [...new Set(threats.map((t) => t.category))];
  const maxSeverity = threats.reduce((max, t) => {
    const order = ['low', 'medium', 'high', 'critical'];
    return order.indexOf(t.severity) > order.indexOf(max) ? t.severity : max;
  }, 'low');

  const summaries = {
    safe: `Minor indicators detected but the overall risk is low. Risk score: ${riskScore}/100.`,
    low: `Some low-risk patterns detected in ${categories.length} category(ies): ${categories.join(', ')}. Exercise normal caution.`,
    medium: `Moderate risk detected across ${categories.length} category(ies): ${categories.join(', ')}. This email contains patterns commonly associated with suspicious messages. Review carefully before taking any action.`,
    high: `High risk detected! This email exhibits characteristics commonly associated with scam/phishing attempts across ${categories.length} category(ies): ${categories.join(', ')}. Do NOT click any links or share personal information.`,
    critical: `⚠️ CRITICAL THREAT DETECTED! This email is highly likely a scam or phishing attempt with ${maxSeverity}-severity threats across ${categories.length} category(ies): ${categories.join(', ')}. Do NOT respond, click links, or share any information. Consider reporting this email.`,
  };

  return summaries[riskLevel] || summaries.medium;
};

// ─── Main Analysis Engine ─────────────────────────────────────

const scamDetectorService = {
  /**
   * Analyze an email for scam indicators
   * @param {string} subject - Email subject line
   * @param {string} body    - Email body text
   * @returns {Object} Analysis result with riskScore, riskLevel, threats, summary
   */
  analyze(subject, body) {
    const fullText = `${subject} ${body}`;
    const threats = [];
    let rawScore = 0;

    // Run each threat dimension
    for (const [category, dimension] of Object.entries(THREAT_PATTERNS)) {
      for (const pattern of dimension.patterns) {
        const matches = fullText.match(pattern.regex);

        if (matches && matches.length > 0) {
          // Deduplicate matched strings
          const uniqueMatches = [...new Set(matches.map((m) => m.toLowerCase().trim()))];

          const severityScore = SEVERITY_SCORES[pattern.severity] || 10;
          // Multiple matches of the same pattern amplify the score (diminishing returns)
          const matchMultiplier = 1 + Math.min(uniqueMatches.length - 1, 3) * 0.25;
          const weightedScore = severityScore * dimension.weight * matchMultiplier;

          rawScore += weightedScore;

          threats.push({
            category,
            categoryLabel: dimension.label,
            severity: pattern.severity,
            detail: pattern.detail,
            matches: uniqueMatches.slice(0, 5), // Cap displayed matches
          });
        }
      }
    }

    // Compound risk: multiple categories amplify the total score
    const uniqueCategories = [...new Set(threats.map((t) => t.category))];
    const compoundMultiplier = 1 + Math.max(uniqueCategories.length - 1, 0) * 0.15;
    rawScore *= compoundMultiplier;

    // Clamp to 0–100
    const riskScore = Math.min(Math.round(rawScore), 100);
    const riskLevel = getRiskLevel(riskScore);

    // Sort threats by severity (critical first)
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    threats.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));

    const summary = generateSummary(threats, riskLevel, riskScore);

    return {
      riskScore,
      riskLevel,
      threats,
      summary,
      safe: riskLevel === 'safe',
      analyzedAt: new Date(),
    };
  },
};

export default scamDetectorService;
