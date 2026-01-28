import { TrailReport, TrailStatus, ConfidenceScore } from '@/types';
import { differenceInHours, parseISO } from 'date-fns';

// Configuration for confidence scoring
const CONFIG = {
  // Time decay: reports lose value over time
  HOURS_FOR_FULL_DECAY: 72, // Reports older than 72 hours have minimal weight
  HOURS_FOR_HALF_DECAY: 24, // Reports lose half their weight after 24 hours

  // Minimum reports for high confidence
  MIN_REPORTS_HIGH_CONFIDENCE: 3,
  MIN_REPORTS_MEDIUM_CONFIDENCE: 2,

  // Weights
  RECENT_REPORT_BONUS: 20, // Bonus for having a report in last 4 hours
  AGREEMENT_BONUS: 15, // Bonus when multiple reports agree

  // Thresholds
  HIGH_CONFIDENCE_THRESHOLD: 70,
  MEDIUM_CONFIDENCE_THRESHOLD: 40,
};

/**
 * Calculate the weight of a report based on its age
 * Newer reports have more weight
 */
function calculateTimeWeight(reportDate: string, now: Date = new Date()): number {
  const reportTime = parseISO(reportDate);
  const hoursAgo = differenceInHours(now, reportTime);

  if (hoursAgo < 0) return 0; // Future reports are invalid
  if (hoursAgo <= 4) return 1.0; // Very recent - full weight
  if (hoursAgo <= 12) return 0.9; // Same day - high weight
  if (hoursAgo <= 24) return 0.7; // Within a day - good weight
  if (hoursAgo <= 48) return 0.4; // 1-2 days - reduced weight
  if (hoursAgo <= 72) return 0.2; // 2-3 days - low weight
  return 0.1; // Older than 3 days - minimal weight
}

/**
 * Calculate confidence score for a set of reports
 * Returns the most likely status and a confidence level
 */
export function calculateConfidence(
  reports: TrailReport[],
  now: Date = new Date()
): ConfidenceScore {
  if (reports.length === 0) {
    return {
      status: 'unknown',
      confidence: 0,
      reportCount: 0,
      lastReportAge: Infinity,
      recentReports: [],
    };
  }

  // Sort reports by timestamp (newest first)
  const sortedReports = [...reports].sort(
    (a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
  );

  // Calculate weighted votes for each status
  const statusVotes: Record<TrailStatus, number> = {
    open: 0,
    muddy: 0,
    snowy: 0,
    closed: 0,
    unknown: 0,
  };

  let totalWeight = 0;

  for (const report of sortedReports) {
    const weight = calculateTimeWeight(report.timestamp, now);
    statusVotes[report.status] += weight;
    totalWeight += weight;
  }

  // Find the winning status
  let winningStatus: TrailStatus = 'unknown';
  let maxVotes = 0;

  for (const [status, votes] of Object.entries(statusVotes)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      winningStatus = status as TrailStatus;
    }
  }

  // Calculate base confidence from vote agreement
  const voteRatio = totalWeight > 0 ? maxVotes / totalWeight : 0;
  let confidence = voteRatio * 60; // Base: up to 60 points from agreement

  // Bonus for number of reports
  if (reports.length >= CONFIG.MIN_REPORTS_HIGH_CONFIDENCE) {
    confidence += 20;
  } else if (reports.length >= CONFIG.MIN_REPORTS_MEDIUM_CONFIDENCE) {
    confidence += 10;
  }

  // Bonus for recent reports
  const lastReportAge = differenceInHours(now, parseISO(sortedReports[0].timestamp));
  if (lastReportAge <= 4) {
    confidence += CONFIG.RECENT_REPORT_BONUS;
  } else if (lastReportAge <= 12) {
    confidence += CONFIG.RECENT_REPORT_BONUS / 2;
  }

  // Penalty for old reports
  if (lastReportAge > 48) {
    confidence *= 0.7;
  } else if (lastReportAge > 24) {
    confidence *= 0.85;
  }

  // Cap confidence at 100
  confidence = Math.min(100, Math.round(confidence));

  // Get recent reports (last 5)
  const recentReports = sortedReports.slice(0, 5);

  return {
    status: winningStatus,
    confidence,
    reportCount: reports.length,
    lastReportAge,
    recentReports,
  };
}

/**
 * Get a human-readable confidence label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= CONFIG.HIGH_CONFIDENCE_THRESHOLD) return 'High';
  if (confidence >= CONFIG.MEDIUM_CONFIDENCE_THRESHOLD) return 'Medium';
  if (confidence > 0) return 'Low';
  return 'Unknown';
}

/**
 * Get a color class for the confidence level
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= CONFIG.HIGH_CONFIDENCE_THRESHOLD) return 'text-green-600';
  if (confidence >= CONFIG.MEDIUM_CONFIDENCE_THRESHOLD) return 'text-yellow-600';
  if (confidence > 0) return 'text-orange-600';
  return 'text-gray-400';
}

/**
 * Get status display properties
 */
export function getStatusDisplay(status: TrailStatus): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (status) {
    case 'open':
      return {
        label: 'Open / Dry',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✓',
      };
    case 'muddy':
      return {
        label: 'Muddy',
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
        icon: '💧',
      };
    case 'snowy':
      return {
        label: 'Snow/Ice',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '❄',
      };
    case 'closed':
      return {
        label: 'Closed',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '✕',
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '?',
      };
  }
}
