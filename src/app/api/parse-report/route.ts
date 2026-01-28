import { NextRequest, NextResponse } from 'next/server';
import { TrailStatus } from '@/types';
import { withCors, handleOptions } from '@/lib/cors';

// OPTIONS handler for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return handleOptions();
}

// Trail centers for matching
const TRAIL_CENTERS = [
  { id: 'north-table', names: ['north table', 'ntm', 'north table mountain'] },
  { id: 'south-table', names: ['south table', 'stm', 'south table mountain'] },
  { id: 'apex', names: ['apex', 'apex park'] },
  { id: 'white-ranch', names: ['white ranch', 'white ranch park'] },
  { id: 'green-mountain', names: ['green mountain', 'green mtn', 'hayden', 'gm trails'] },
  { id: 'bear-creek', names: ['bear creek lake', 'bear creek park'] },
  { id: 'matthews-winters', names: ['matthews winters', 'matthews/winters', 'dakota ridge', 'red rocks trail', 'm/w'] },
  { id: 'lair-o-bear', names: ["lair o' the bear", 'lair o the bear', 'lair of the bear', 'lotb'] },
  { id: 'betasso', names: ['betasso', 'betasso preserve'] },
  { id: 'walker-ranch', names: ['walker ranch', 'walker loop'] },
  { id: 'hall-ranch', names: ['hall ranch', 'nelson loop', 'bitterbrush'] },
  { id: 'heil-valley', names: ['heil valley', 'heil ranch', 'picture rock'] },
  { id: 'buffalo-creek', names: ['buffalo creek', 'buff creek', 'sandy wash', 'charlie loves amber', 'cla', 'bc trails'] },
  { id: 'elk-meadow', names: ['elk meadow', 'bergen peak'] },
  { id: 'chimney-gulch', names: ['chimney gulch', 'windy saddle'] },
];

// Status keywords for parsing
const STATUS_PATTERNS: Record<TrailStatus, string[]> = {
  open: [
    'dry', 'good', 'great', 'perfect', 'hero dirt', 'tacky', 'prime', 'excellent',
    'rideable', 'open', 'g2g', 'good to go', 'send it', 'buff', 'hero', 'mint',
    'dialed', 'flowy', 'fast', 'firm', 'hardpack', 'no issues', 'all clear',
    'in great shape', 'in good shape', 'good condition', 'no mud', 'dried out',
    'dried up', 'ready to ride', 'ripping'
  ],
  muddy: [
    'muddy', 'wet', 'mud', 'sloppy', 'saturated', 'soft', 'damp', 'moist',
    'standing water', 'puddles', 'sticky', 'gooey', 'slop', 'soupy', 'boggy',
    'waterlogged', 'still wet', 'needs time', 'stay off', 'let dry', 'peanut butter',
    'chocolate', 'post-holing', 'rutted', 'tire tracks', 'damaged'
  ],
  snowy: [
    'snow', 'snowy', 'ice', 'icy', 'frozen', 'frost', 'slick', 'packed snow',
    'drifts', 'fatbike', 'fat bike', 'studs', 'studded', 'winter conditions',
    'north facing', 'shaded', 'ice patches', 'snowpack', 'crusty'
  ],
  closed: [
    'closed', 'closure', 'shut down', 'not rideable', 'stay off', 'do not ride',
    'damaged', 'washed out', 'fallen trees', 'hazard', 'dangerous', 'trail work',
    'maintenance', 'seasonal closure', 'wildlife closure', 'raptor closure'
  ],
  unknown: []
};

// Negative modifiers that can flip the meaning
const NEGATIVE_MODIFIERS = ['no', 'not', "isn't", "aren't", "wasn't", "weren't", 'without', 'zero', 'none'];

interface ParsedReport {
  trailCenter: string | null;
  trailCenterConfidence: number;
  status: TrailStatus;
  statusConfidence: number;
  summary: string;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  detectedKeywords: {
    trails: string[];
    conditions: string[];
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return withCors(NextResponse.json(
        { error: 'Missing or invalid text field' },
        { status: 400 }
      ));
    }

    const result = parseTrailReport(text);

    return withCors(NextResponse.json(result));
  } catch (error) {
    console.error('Parse error:', error);
    return withCors(NextResponse.json(
      { error: 'Failed to parse report' },
      { status: 500 }
    ));
  }
}

function parseTrailReport(text: string): ParsedReport {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // Detect trail center
  let detectedCenter: string | null = null;
  let centerConfidence = 0;
  const detectedTrailKeywords: string[] = [];

  for (const center of TRAIL_CENTERS) {
    for (const name of center.names) {
      if (lowerText.includes(name)) {
        if (!detectedCenter || name.length > (detectedTrailKeywords[0]?.length || 0)) {
          detectedCenter = center.id;
          centerConfidence = name.length > 8 ? 0.95 : name.length > 5 ? 0.85 : 0.7;
          detectedTrailKeywords.unshift(name);
        } else {
          detectedTrailKeywords.push(name);
        }
      }
    }
  }

  // Detect status with context awareness
  const statusScores: Record<TrailStatus, number> = {
    open: 0,
    muddy: 0,
    snowy: 0,
    closed: 0,
    unknown: 0
  };

  const detectedConditionKeywords: string[] = [];

  for (const [status, keywords] of Object.entries(STATUS_PATTERNS) as [TrailStatus, string[]][]) {
    for (const keyword of keywords) {
      const keywordIndex = lowerText.indexOf(keyword);
      if (keywordIndex !== -1) {
        // Check for negative modifiers before the keyword
        const textBefore = lowerText.substring(Math.max(0, keywordIndex - 20), keywordIndex);
        const isNegated = NEGATIVE_MODIFIERS.some(mod => textBefore.includes(mod));

        if (isNegated) {
          // "no mud" means it's open, "not dry" means it's probably muddy
          if (status === 'muddy' || status === 'snowy') {
            statusScores.open += 1;
          } else if (status === 'open') {
            statusScores.muddy += 0.5;
          }
        } else {
          statusScores[status] += keyword.length > 5 ? 1.5 : 1;
          detectedConditionKeywords.push(keyword);
        }
      }
    }
  }

  // Determine winning status
  let detectedStatus: TrailStatus = 'open';
  let maxScore = 0;

  for (const [status, score] of Object.entries(statusScores) as [TrailStatus, number][]) {
    if (score > maxScore) {
      maxScore = score;
      detectedStatus = status;
    }
  }

  // Calculate status confidence
  const totalScore = Object.values(statusScores).reduce((a, b) => a + b, 0);
  let statusConfidence = totalScore > 0 ? maxScore / totalScore : 0.3;

  // Boost confidence if there are multiple matching keywords
  if (detectedConditionKeywords.length >= 3) {
    statusConfidence = Math.min(0.95, statusConfidence + 0.15);
  } else if (detectedConditionKeywords.length >= 2) {
    statusConfidence = Math.min(0.9, statusConfidence + 0.1);
  }

  // If no conditions detected, default to open with low confidence
  if (maxScore === 0) {
    detectedStatus = 'open';
    statusConfidence = 0.3;
  }

  // Extract summary
  const summary = extractSummary(text);

  // Calculate overall confidence
  const overallConfidence = detectedCenter
    ? (centerConfidence * 0.4 + statusConfidence * 0.6)
    : statusConfidence * 0.5;

  const confidenceLevel: 'high' | 'medium' | 'low' =
    overallConfidence > 0.7 ? 'high' :
    overallConfidence > 0.45 ? 'medium' : 'low';

  return {
    trailCenter: detectedCenter,
    trailCenterConfidence: centerConfidence,
    status: detectedStatus,
    statusConfidence,
    summary,
    confidence: overallConfidence,
    confidenceLevel,
    detectedKeywords: {
      trails: [...new Set(detectedTrailKeywords)],
      conditions: [...new Set(detectedConditionKeywords.slice(0, 5))]
    }
  };
}

function extractSummary(text: string): string {
  // Remove common FB noise
  const cleaned = text
    .replace(/^(trail\s*report|conditions?\s*report|update)[:\s]*/i, '')
    .replace(/\n{2,}/g, '\n')
    .trim();

  // Take first 2-3 sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
  let summary = sentences.slice(0, 2).join(' ').trim();

  // Truncate if too long
  if (summary.length > 250) {
    summary = summary.substring(0, 247) + '...';
  }

  return summary || cleaned.substring(0, 200);
}
