'use client';

import { useState } from 'react';
import { TrailCenter, Trail, TrailStatus, TrailReport } from '@/types';
import { getStatusDisplay } from '@/lib/confidence';
import { X, Send, CheckCircle } from 'lucide-react';

interface ReportFormProps {
  center: TrailCenter;
  trails: Trail[];
  onSubmit: (report: Omit<TrailReport, 'id'>) => void;
  onClose: () => void;
}

export default function ReportForm({ center, trails, onSubmit, onClose }: ReportFormProps) {
  const [status, setStatus] = useState<TrailStatus>('open');
  const [selectedTrail, setSelectedTrail] = useState<string>('');
  const [comment, setComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  type ReportableStatus = Exclude<TrailStatus, 'unknown'>;
  const statusOptions: { value: ReportableStatus; label: string; description: string }[] = [
    { value: 'open', label: 'Open / Dry', description: 'Trails are in good condition' },
    { value: 'muddy', label: 'Muddy', description: 'Wet spots, potential trail damage' },
    { value: 'snowy', label: 'Snow/Ice', description: 'Snow or ice on trails' },
    { value: 'closed', label: 'Closed', description: 'Trails are officially closed' },
  ];

  const statusColors: Record<ReportableStatus, string> = {
    open: '#22c55e',
    muddy: '#f59e0b',
    snowy: '#3b82f6',
    closed: '#ef4444',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate a brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const report: Omit<TrailReport, 'id'> = {
      trailCenterId: center.id,
      trailId: selectedTrail || undefined,
      status,
      comment: comment.trim() || undefined,
      timestamp: new Date().toISOString(),
      reporterNickname: nickname.trim() || undefined,
    };

    onSubmit(report);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thanks for your report!</h2>
          <p className="text-gray-600 mb-4">
            Your contribution helps other riders know what to expect on the trails.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submit Report</h2>
            <p className="text-sm text-gray-500">{center.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Status selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Conditions *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => {
                const display = getStatusDisplay(option.value);
                const isSelected = status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full`}
                        style={{
                          backgroundColor: statusColors[option.value],
                        }}
                      />
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific trail selection (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Trail (optional)
            </label>
            <select
              value={selectedTrail}
              onChange={(e) => setSelectedTrail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All trails at {center.name}</option>
              {trails.map((trail) => (
                <option key={trail.id} value={trail.id}>
                  {trail.name}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Details (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional info? E.g., 'North-facing slopes still icy' or 'Great conditions after morning dry-out'"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nickname (optional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="E.g., MtBiker42"
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            No account needed. Your report helps the community!
          </p>
        </form>
      </div>
    </div>
  );
}
