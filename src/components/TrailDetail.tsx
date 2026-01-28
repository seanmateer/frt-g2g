'use client';

import { useState } from 'react';
import { TrailCenter, Trail, Trailhead, TrailReport, ConfidenceScore } from '@/types';
import { getStatusDisplay, getConfidenceLabel, getConfidenceColor } from '@/lib/confidence';
import { formatDistanceToNow, format } from 'date-fns';
import {
  X,
  MapPin,
  Mountain,
  Route,
  Clock,
  ExternalLink,
  Navigation,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  Car,
  Toilet,
} from 'lucide-react';

interface TrailDetailProps {
  center: TrailCenter;
  trails: Trail[];
  trailheads: Trailhead[];
  status: ConfidenceScore;
  reports: TrailReport[];
  onClose: () => void;
  onReportClick: () => void;
}

// Difficulty badge component
function DifficultyBadge({ difficulty }: { difficulty: Trail['difficulty'] }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    green: { bg: 'bg-green-100', text: 'text-green-700', label: 'Easy' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Intermediate' },
    black: { bg: 'bg-gray-800', text: 'text-white', label: 'Advanced' },
    'double-black': { bg: 'bg-purple-700', text: 'text-white', label: 'Expert' },
  };
  const style = colors[difficulty] || colors.green;

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export default function TrailDetail({
  center,
  trails,
  trailheads,
  status,
  reports,
  onClose,
  onReportClick,
}: TrailDetailProps) {
  const [showAllReports, setShowAllReports] = useState(false);
  const [expandedTrails, setExpandedTrails] = useState(false);

  const statusDisplay = getStatusDisplay(status.status);
  const displayedReports = showAllReports ? reports : reports.slice(0, 3);

  // Group trails by difficulty
  const trailsByDifficulty = trails.reduce(
    (acc, trail) => {
      if (!acc[trail.difficulty]) acc[trail.difficulty] = [];
      acc[trail.difficulty].push(trail);
      return acc;
    },
    {} as Record<string, Trail[]>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{center.name}</h2>
            <div className="flex items-center gap-1 text-blue-100 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{center.region}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Route className="w-4 h-4" />
            <span>{center.totalMiles} miles</span>
          </div>
          <div className="flex items-center gap-1">
            <Mountain className="w-4 h-4" />
            <span>{center.elevation.toLocaleString()} ft</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Current Status Banner */}
        <div className={`p-4 ${statusDisplay.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{statusDisplay.icon}</span>
              <div>
                <p className={`font-bold ${statusDisplay.color}`}>{statusDisplay.label}</p>
                {status.confidence > 0 && (
                  <p className="text-sm text-gray-600">
                    {getConfidenceLabel(status.confidence)} confidence • {status.reportCount} reports
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onReportClick}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Report
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-gray-600 text-sm">{center.description}</p>
          {center.website && (
            <a
              href={center.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Official website
            </a>
          )}
        </div>

        {/* Trailheads */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Trailheads</h3>
          <div className="space-y-2">
            {trailheads.map((th) => (
              <div
                key={th.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-sm">{th.name}</p>
                  <div className="flex gap-2 mt-1">
                    {th.hasParking && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Car className="w-3 h-3" /> Parking
                      </span>
                    )}
                    {th.hasRestrooms && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Toilet className="w-3 h-3" /> Restrooms
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${th.coordinates.lat},${th.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Trails */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => setExpandedTrails(!expandedTrails)}
            className="flex items-center justify-between w-full"
          >
            <h3 className="font-semibold text-gray-900">
              Trails ({trails.length})
            </h3>
            {expandedTrails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedTrails && (
            <div className="mt-3 space-y-4">
              {(['green', 'blue', 'black', 'double-black'] as const).map((difficulty) => {
                const difficultyTrails = trailsByDifficulty[difficulty];
                if (!difficultyTrails?.length) return null;

                return (
                  <div key={difficulty}>
                    <div className="flex items-center gap-2 mb-2">
                      <DifficultyBadge difficulty={difficulty} />
                      <span className="text-xs text-gray-500">
                        {difficultyTrails.length} trail{difficultyTrails.length !== 1 && 's'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {difficultyTrails.map((trail) => (
                        <div
                          key={trail.id}
                          className="bg-gray-50 rounded-lg p-2 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{trail.name}</span>
                            <span className="text-xs text-gray-500">
                              {trail.lengthMiles} mi • {trail.elevationGainFeet} ft
                            </span>
                          </div>
                          {trail.direction === 'one-way' && (
                            <span className="text-xs text-amber-600">One-way / Directional</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Reports</h3>

          {reports.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">No recent reports</p>
              <button
                onClick={onReportClick}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Be the first to report!
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedReports.map((report) => {
                const reportStatusDisplay = getStatusDisplay(report.status);
                return (
                  <div key={report.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${reportStatusDisplay.bgColor} ${reportStatusDisplay.color}`}
                      >
                        {reportStatusDisplay.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}
                      </span>
                    </div>

                    {report.comment && (
                      <p className="text-sm text-gray-600 mt-1">{report.comment}</p>
                    )}

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{report.reporterNickname || 'Anonymous'}</span>
                      {report.weatherTemp && (
                        <span>
                          {report.weatherTemp}°F • {report.weatherCondition}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {reports.length > 3 && (
                <button
                  onClick={() => setShowAllReports(!showAllReports)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                >
                  {showAllReports
                    ? 'Show less'
                    : `Show ${reports.length - 3} more reports`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={onReportClick}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <MessageSquarePlus className="w-5 h-5" />
          Submit Trail Report
        </button>
      </div>
    </div>
  );
}
