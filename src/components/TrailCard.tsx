'use client';

import { TrailCenter, ConfidenceScore } from '@/types';
import { getStatusDisplay, getConfidenceLabel, getConfidenceColor } from '@/lib/confidence';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Mountain, Route, Clock, ChevronRight } from 'lucide-react';

interface TrailCardProps {
  center: TrailCenter;
  status: ConfidenceScore;
  onClick: () => void;
}

export default function TrailCard({ center, status, onClick }: TrailCardProps) {
  const statusDisplay = getStatusDisplay(status.status);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all text-left"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{center.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
              {statusDisplay.label}
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{center.region}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Route className="w-3.5 h-3.5" />
              <span>{center.totalMiles} mi</span>
            </div>
            <div className="flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5" />
              <span>{center.elevation.toLocaleString()} ft</span>
            </div>
            {status.lastReportAge !== Infinity && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {status.lastReportAge < 1
                    ? 'Just now'
                    : formatDistanceToNow(new Date(status.recentReports[0]?.timestamp || Date.now()), {
                        addSuffix: true,
                      })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <ChevronRight className="w-5 h-5 text-gray-400" />
          {status.confidence > 0 && (
            <div className="text-right">
              <div className={`text-xs font-medium ${getConfidenceColor(status.confidence)}`}>
                {getConfidenceLabel(status.confidence)}
              </div>
              <div className="text-xs text-gray-400">{status.reportCount} reports</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent comment preview */}
      {status.recentReports[0]?.comment && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            &ldquo;{status.recentReports[0].comment}&rdquo;
          </p>
          {status.recentReports[0].reporterNickname && (
            <p className="text-xs text-gray-400 mt-1">
              — {status.recentReports[0].reporterNickname}
            </p>
          )}
        </div>
      )}
    </button>
  );
}
