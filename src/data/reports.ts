import { TrailReport, TrailStatus } from '@/types';

// Sample reports to seed the app with realistic data
// In a real app, these would come from a database
export const sampleReports: TrailReport[] = [
  // North Table - recent reports showing good conditions
  {
    id: 'r1',
    trailCenterId: 'north-table',
    trailId: 'nt-north-table-loop',
    status: 'open',
    comment: 'Trails are dry and in great shape. Some ice in shaded areas early morning.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    reporterNickname: 'MtBiker42',
    weatherTemp: 45,
    weatherCondition: 'Sunny',
  },
  {
    id: 'r2',
    trailCenterId: 'north-table',
    status: 'open',
    comment: 'Rode yesterday evening, perfect conditions.',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    reporterNickname: 'TrailDog',
  },
  {
    id: 'r3',
    trailCenterId: 'north-table',
    trailId: 'nt-tilting-mesa',
    status: 'open',
    comment: 'Technical sections are all rideable. Watch for loose rocks.',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
  },

  // Apex - mixed conditions
  {
    id: 'r4',
    trailCenterId: 'apex',
    status: 'muddy',
    comment: 'Lower trails are muddy from yesterday\'s rain. Upper trails draining.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    reporterNickname: 'ApexLocal',
    weatherTemp: 52,
    weatherCondition: 'Cloudy',
  },
  {
    id: 'r5',
    trailCenterId: 'apex',
    trailId: 'apex-enchanted',
    status: 'muddy',
    comment: 'Enchanted Forest has some wet spots. Avoidable if you\'re careful.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: 'r6',
    trailCenterId: 'apex',
    status: 'open',
    comment: 'Rode the upper trails, conditions were fine.',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    reporterNickname: 'SendIt',
  },

  // Green Mountain - good conditions
  {
    id: 'r7',
    trailCenterId: 'green-mountain',
    status: 'open',
    comment: 'All trails open and dry. Busy on the weekend!',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    reporterNickname: 'GreenMtnRider',
    weatherTemp: 58,
    weatherCondition: 'Partly Cloudy',
  },
  {
    id: 'r8',
    trailCenterId: 'green-mountain',
    trailId: 'gm-box-o-rox',
    status: 'open',
    comment: 'Box O\' Rox in great shape. Had a blast!',
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
  },

  // Walker Ranch - snowy/icy
  {
    id: 'r9',
    trailCenterId: 'walker-ranch',
    status: 'snowy',
    comment: 'Snow patches on north-facing slopes. Icy in spots. Bring studs.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    reporterNickname: 'BoulderBiker',
    weatherTemp: 38,
    weatherCondition: 'Clear',
  },
  {
    id: 'r10',
    trailCenterId: 'walker-ranch',
    status: 'snowy',
    comment: 'Postholed through some drifts. Fatbike recommended.',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // 28 hours ago
  },

  // Buffalo Creek - excellent
  {
    id: 'r11',
    trailCenterId: 'buffalo-creek',
    status: 'open',
    comment: 'Sandy Wash and CLA are hero dirt right now. Make the drive!',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    reporterNickname: 'BCFan',
    weatherTemp: 62,
    weatherCondition: 'Sunny',
  },
  {
    id: 'r12',
    trailCenterId: 'buffalo-creek',
    status: 'open',
    comment: 'Best conditions of the year. Go now!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    reporterNickname: 'TrailBuilder',
  },
  {
    id: 'r13',
    trailCenterId: 'buffalo-creek',
    trailId: 'bc-charlie-loves-amber',
    status: 'open',
    comment: 'CLA is mint. Fast and flowy.',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
  },

  // Hall Ranch - good but tech
  {
    id: 'r14',
    trailCenterId: 'hall-ranch',
    status: 'open',
    comment: 'Nelson Loop is riding great. Some loose rocks on Bitterbrush.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    reporterNickname: 'NelsonNinja',
  },
  {
    id: 'r15',
    trailCenterId: 'hall-ranch',
    trailId: 'hall-nelson-loop',
    status: 'open',
    comment: 'Did 3 laps of Nelson. Perfect.',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
  },

  // White Ranch - older reports
  {
    id: 'r16',
    trailCenterId: 'white-ranch',
    status: 'open',
    comment: 'Long ride up to the top. Trails in good shape.',
    timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(), // 50 hours ago
    reporterNickname: 'EpicRider',
  },

  // Betasso - closed days note
  {
    id: 'r17',
    trailCenterId: 'betasso',
    status: 'open',
    comment: 'Benjamin Loop is flowy perfection. Remember: closed to bikes Wed/Sat!',
    timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    reporterNickname: 'FlowStateBiker',
    weatherTemp: 55,
    weatherCondition: 'Clear',
  },

  // Elk Meadow
  {
    id: 'r18',
    trailCenterId: 'elk-meadow',
    status: 'open',
    comment: 'Saw a herd of elk! Trails are good, some mud in meadow areas.',
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
    reporterNickname: 'ElkSpotter',
  },

  // Matthews/Winters
  {
    id: 'r19',
    trailCenterId: 'matthews-winters',
    status: 'open',
    comment: 'Red Rocks Trail is great. Dakota Ridge is challenging as always.',
    timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(), // 40 hours ago
  },

  // South Table
  {
    id: 'r20',
    trailCenterId: 'south-table',
    status: 'open',
    comment: 'Quick after-work ride. Trails dry and fast.',
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    reporterNickname: 'GoldenLocal',
  },

  // Bear Creek - family friendly
  {
    id: 'r21',
    trailCenterId: 'bear-creek',
    status: 'open',
    comment: 'Took the kids out. Easy trails are perfect for beginners.',
    timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(), // 32 hours ago
    reporterNickname: 'FamilyRider',
  },

  // Lair o' the Bear
  {
    id: 'r22',
    trailCenterId: 'lair-o-bear',
    status: 'muddy',
    comment: 'Creek is high, some trail sections flooded. Use caution.',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    reporterNickname: 'BearCreekFan',
  },

  // Heil Valley
  {
    id: 'r23',
    trailCenterId: 'heil-valley',
    status: 'open',
    comment: 'Ponderosa Loop is beautiful this time of year. All clear.',
    timestamp: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(), // 44 hours ago
  },

  // Chimney Gulch
  {
    id: 'r24',
    trailCenterId: 'chimney-gulch',
    status: 'open',
    comment: 'Legs still burning from the climb. Worth it for the views!',
    timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), // 60 hours ago
    reporterNickname: 'ClimbKing',
  },
];

// In-memory store for reports (would be replaced by database in production)
let reports: TrailReport[] = [...sampleReports];

export const getAllReports = (): TrailReport[] => {
  return [...reports];
};

export const getReportsByCenter = (centerId: string): TrailReport[] => {
  return reports.filter((r) => r.trailCenterId === centerId);
};

export const getReportsByTrail = (trailId: string): TrailReport[] => {
  return reports.filter((r) => r.trailId === trailId);
};

export const getRecentReports = (hoursAgo: number = 72): TrailReport[] => {
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return reports.filter((r) => new Date(r.timestamp) > cutoff);
};

export const addReport = (report: Omit<TrailReport, 'id'>): TrailReport => {
  const newReport: TrailReport = {
    ...report,
    id: `r${Date.now()}`,
  };
  reports = [newReport, ...reports];
  return newReport;
};

export const getStatusCounts = (): Record<TrailStatus, number> => {
  const counts: Record<TrailStatus, number> = {
    open: 0,
    muddy: 0,
    snowy: 0,
    closed: 0,
    unknown: 0,
  };

  for (const report of getRecentReports(48)) {
    counts[report.status]++;
  }

  return counts;
};
